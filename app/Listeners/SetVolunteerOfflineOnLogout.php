<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Logout;

class SetVolunteerOfflineOnLogout
{
    public function handle(Logout $event): void
    {
        $user = $event->user;

        if ($user && $user->hasRole('volunteer')) {
            $user->update([
                'is_online' => false,
            ]);
        }
    }
}