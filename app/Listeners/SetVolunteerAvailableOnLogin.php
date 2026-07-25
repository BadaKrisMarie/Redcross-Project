<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;

class SetVolunteerAvailableOnLogin
{
    public function handle(Login $event): void
    {
        $user = $event->user;

        if ($user->hasRole('volunteer')) {
            $user->update([
                'is_available'   => true,
                'is_online'      => true, // ✅ NEW — magiging "Online" sa dashboard hanggang mag-logout
                'last_active_at' => now(),
            ]);
        }
    }
}