<?php
namespace App\Http\Controllers\Auth;
use App\Http\Controllers\Controller;
use App\Mail\VolunteerRegistered;
use App\Models\User;
use App\Models\Notification;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    /**
     * Real-time email availability check used by the register form
     * while the user is typing (debounced axios.post from Register.jsx).
     */
    public function checkEmail(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|string|email|max:255',
        ]);

        $exists = User::where('email', $request->email)->exists();

        return response()->json(['exists' => $exists]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'first_name'            => 'required|string|max:255',
            'last_name'             => 'required|string|max:255',
            'email'                 => 'required|string|lowercase|email|max:255|unique:'.User::class,
            'phone'                 => 'required|string|max:20',
            'address'               => 'required|string|max:255',
            'password'              => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        // Combine first + last name into the existing single `name` column.
        $fullName = trim($request->first_name.' '.$request->last_name);

        $user = User::create([
            'name'      => $fullName,
            'full_name' => $fullName,
            'email'     => $request->email,
            'phone'     => $request->phone,
            'address'   => $request->address,
            'password'  => Hash::make($request->password),
            'status'    => 'pending',
        ]);

        // Automatically assign volunteer role
        $user->assignRole('volunteer');

        // Notify admins of the new volunteer registration
        Notification::create([
            'type'    => 'volunteer_registration',
            'message' => "New volunteer registered: {$user->name}",
            'link'    => route('admin.volunteers.show', $user->id),
        ]);

        event(new Registered($user));

        // Send registration confirmation email
        Mail::to($user->email)->send(new VolunteerRegistered($user));

        // Do NOT log them in — send to pending page
        return redirect()->route('login')->with('status', 'Your account has been submitted for approval. Please wait for the admin to approve your account before logging in.');
    }

}
