<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Document;
use App\Models\User;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function markRead(Request $request)
    {
        Document::where('status', 'pending')
            ->whereNull('admin_viewed_at')
            ->update(['admin_viewed_at' => now()]);

        User::role('volunteer')
            ->where('status', 'pending')
            ->whereNull('admin_viewed_at')
            ->update(['admin_viewed_at' => now()]);

        return back();
    }
}