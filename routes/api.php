<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;

function notFound(string $message = 'Record not found.')
{
    return response()->json(['message' => $message], 404);
}

function avatarUrl(?string $path): ?string
{
    return $path ? Storage::disk('public')->url($path) : null;
}

function formatUser(object $user): array
{
    return [
        'id'         => $user->id,
        'name'       => $user->name,
        'email'      => $user->email,
        'branch'     => $user->branch ?? null,
        'role'       => $user->role ?? 'volunteer',
        'avatar_url' => avatarUrl($user->photo ?? null),
    ];
}

Route::middleware('auth')->group(function () {

    // ── Profile ──────────────────────────────────────────────────────

    Route::get('profile', function (Request $request) {
        return response()->json(formatUser($request->user()));
    });

    Route::post('profile/avatar', function (Request $request) {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:2048'],
        ]);

        $user = $request->user();

        if ($user->photo && Storage::disk('public')->exists($user->photo)) {
            Storage::disk('public')->delete($user->photo);
        }

        $path = $request->file('avatar')->store('avatars', 'public');
        $user->update(['photo' => $path]);

        return response()->json([
            'message'    => 'Avatar updated successfully.',
            'avatar_url' => avatarUrl($path),
        ]);
    });

    Route::put('profile/password', function (Request $request) {
        $request->validate([
            'current_password' => ['required', 'string'],
            'password'         => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Current password is incorrect.'], 422);
        }

        $user->update(['password' => Hash::make($request->password)]);

        return response()->json(['message' => 'Password updated successfully.']);
    });

    // ── Notifications ─────────────────────────────────────────────────

    Route::get('notifications', function (Request $request) {
        $notifications = DB::table('user_notifications')
            ->where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->get()
            ->map(fn($n) => [
                'id'         => $n->id,
                'title'      => $n->title,
                'message'    => $n->message,
                'is_read'    => (bool) $n->is_read,
                'created_at' => \Carbon\Carbon::parse($n->created_at)->diffForHumans(),
            ]);

        $unread_count = DB::table('user_notifications')
            ->where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->count();

        return response()->json([
            'notifications' => $notifications,
            'unread_count'  => $unread_count,
        ]);
    });

    Route::patch('notifications/read-all', function (Request $request) {
        DB::table('user_notifications')
            ->where('user_id', $request->user()->id)
            ->where('is_read', false)
            ->update(['is_read' => true, 'updated_at' => now()]);

        return response()->json(['message' => 'All notifications marked as read.']);
    });

    Route::patch('notifications/{id}/read', function (Request $request, int $id) {
        $notif = DB::table('user_notifications')
            ->where('id', $id)
            ->where('user_id', $request->user()->id)
            ->first();

        if (!$notif) return notFound('Notification not found.');

        DB::table('user_notifications')
            ->where('id', $id)
            ->update(['is_read' => true, 'updated_at' => now()]);

        return response()->json(['message' => 'Notification marked as read.']);
    });


});