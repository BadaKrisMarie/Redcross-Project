<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\SentEmail;
use App\Models\User;
use Illuminate\Http\Request;
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

        return Inertia::render('Admin/Communication', [
            'messages'      => $messages,
            'announcements' => $announcements,
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
            'title' => 'required|string|max:255',
            'body'  => 'required|string',
        ]);

        Announcement::create([
            'admin_id' => auth()->id(),
            'title'    => $request->title,
            'body'     => $request->body,
        ]);

        return back()->with('success', 'Announcement posted!');
    }

    public function deleteAnnouncement(Announcement $announcement)
    {
        $announcement->delete();
        return back()->with('success', 'Announcement deleted!');
    }
}