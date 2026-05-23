<?php
namespace App\Http\Controllers\Volunteer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProfileController extends Controller
{
    public function edit()
    {
        $user = Auth::user();
        return Inertia::render('Volunteer/Profile', [
            'user' => $user,
        ]);
    }

    public function update(Request $request)
    {
        $request->validate([
            'phone'                   => ['nullable', 'string', 'max:20'],
            'birthdate'               => ['nullable', 'date'],
            'gender'                  => ['nullable', 'in:Male,Female,Other'],
            'address'                 => ['nullable', 'string', 'max:255'],
            'emergency_contact_name'  => ['nullable', 'string', 'max:100'],
            'emergency_contact_phone' => ['nullable', 'string', 'max:20'],
            'photo'                   => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $user = Auth::user();
        if (! $user instanceof User) {
            abort(403);
        }

        $data = $request->only([
            'phone',
            'birthdate',
            'gender',
            'address',
            'emergency_contact_name',
            'emergency_contact_phone',
        ]);

        // Handle photo upload
        if ($request->hasFile('photo')) {
            // Delete old photo if exists
            if ($user->photo && Storage::disk('public')->exists($user->photo)) {
                Storage::disk('public')->delete($user->photo);
            }
            // Store new photo under storage/app/public/avatars/
            $data['photo'] = $request->file('photo')->store('avatars', 'public');
        }

        $user->update($data);

        return redirect()->route('volunteer.profile')
            ->with('success', 'Profile updated successfully!');
    }
}