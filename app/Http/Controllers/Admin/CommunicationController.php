<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\SentEmail;
use App\Models\User;
use App\Models\UserNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CommunicationController extends Controller
{
    public function index()
    {
        $messages = SentEmail::with('user')
            ->orderBy('created_at', 'desc')
            ->get();

        $announcements = Announcement::with('admin')
            ->orderBy('created_at', 'desc')
            ->get();

        // ✅ list of volunteers used to power @mention autocomplete
        // in the announcement composer. Adjust the where() below if your
        // "volunteer" role is stored differently (e.g. user_type, is_volunteer).
        $volunteers = User::where('role', 'volunteer')
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('Admin/Communication', [
            'messages'      => $messages,
            'announcements' => $announcements,
            'volunteers'    => $volunteers,
        ]);
    }

    public function reply(Request $request, SentEmail $sentEmail)
    {
        $request->validate([
            'reply' => 'required|string',
        ]);

        $sentEmail->update([
            'reply'      => $request->reply,
            'replied_at' => now(),
        ]);

        return back()->with('success', 'Reply sent!');
    }

    public function announce(Request $request)
    {
        $request->validate([
            'title'           => 'required|string|max:255',
            'body'            => 'required|string',
            'mentioned_ids'   => 'array',
            'mentioned_ids.*' => 'exists:users,id',
        ]);

        Announcement::create([
            'admin_id' => auth()->id(),
            'title'    => $request->title,
            'body'     => $request->body,
        ]);

        // ✅ notify each mentioned volunteer that they were tagged in this announcement
        if (!empty($request->mentioned_ids)) {
            foreach (array_unique($request->mentioned_ids) as $userId) {
                UserNotification::create([
                    'user_id' => $userId,
                    'title'   => 'You were mentioned in an announcement',
                    'message' => $request->title . ': ' . Str::limit($request->body, 100),
                    'is_read' => false,
                ]);
            }
        }

        return back()->with('success', 'Announcement posted!');
    }

    public function deleteAnnouncement(Announcement $announcement)
    {
        $announcement->delete();
        return back()->with('success', 'Announcement deleted!');
    }
}
