<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

// Private channel per volunteer conversation — admin and that specific
// volunteer are both allowed to listen (used by LiveChatPanel.jsx and
// the volunteer-side chat widget).
//
// 🔧 FIX: gamit kayo ng Spatie Laravel-Permission (nasa stack niyo), kaya
// walang plain `role` column sa `users` table — kailangan ng ->hasRole()
// method, hindi simpleng property comparison. Dating $user->role === 'admin'
// ay palaging false (kasi walang `role` attribute/column), kaya palaging
// fine-fail ang authorization at hindi nakaka-subscribe si admin dito.
Broadcast::channel('chat.{volunteerId}', function ($user, $volunteerId) {
    return $user->hasRole('admin') || (int) $user->id === (int) $volunteerId;
});

// Global admin channel — every admin listens here for new-message sound
// + unread badge updates across all conversations (AdminLayout.jsx).
//
// 🔧 FIX: same ->hasRole('admin') fix as above.
Broadcast::channel('admin.chat', function ($user) {
    return $user->hasRole('admin');
});