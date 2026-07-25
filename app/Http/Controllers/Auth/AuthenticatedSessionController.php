<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Models\Attendance;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     */
    public function create(): Response
    {
        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();
        $request->session()->regenerate();

        $user = $request->user();

        // Check if volunteer is approved
        if ($user->hasRole('volunteer') && $user->status !== 'approved') {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->withErrors([
                'email' => 'Your account is pending approval. Please wait for the admin to approve your account.',
            ]);
        }

        if ($user->hasRole('admin')) {
            // ✅ Mark online on successful login
            $user->is_online = true;
            $user->last_active_at = now();
            $user->save();

            return redirect()->route('admin.dashboard');
        }

        if ($user->hasRole('volunteer')) {
            // ✅ Mark online on successful login
            $user->is_online = true;
            $user->last_active_at = now();
            $user->save();

            return redirect()->route('volunteer.dashboard');
        }

        // No role assigned
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login')->withErrors([
            'email' => 'Your account has no role assigned. Please contact the administrator.',
        ]);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        // ✅ Mark offline BEFORE logging out (kailangan habang meron pang authenticated user)
        $user = Auth::user();
        if ($user) {
            // Kung may bukas na attendance record ngayong araw (naka-time-in pero
            // walang time-out), isara na ito ngayon — para tama ang "Not checked in"
            // status sa dashboard sa susunod na pag-login, hindi na nakabase lang
            // sa manual face-scan time-out.
            $openRecords = Attendance::where('user_id', $user->id)
                ->whereDate('date', today())
                ->whereNotNull('time_in')
                ->whereNull('time_out')
                ->get();

            foreach ($openRecords as $record) {
                $timeOut = now();
                $record->update([
                    'time_out'       => $timeOut,
                    'hours_rendered' => round($record->time_in->diffInMinutes($timeOut) / 60, 2),
                ]);
            }

            $user->is_online = false;
            $user->is_available = false; // hindi na dapat "Available" kung naka-logout na
            $user->last_active_at = now();
            $user->save();
        }

        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}