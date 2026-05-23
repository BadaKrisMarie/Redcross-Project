<?php

namespace App\Http\Controllers;

use App\Mail\ContactMessageReceived;
use App\Models\ContactMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class ContactController extends Controller
{
    // ── PUBLIC: Show Contact Page ──
    public function index()
    {
        return Inertia::render('Contact');
    }

    // ── PUBLIC: Submit Contact Form ──
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'    => 'required|string|max:255',
            'email'   => 'required|email|max:255',
            'message' => 'required|string|max:2000',
        ]);

        // Save to database
        $contactMessage = ContactMessage::create($validated);

        // Send email to admin
        Mail::to(config('mail.admin_email', 'rizalmuntinlupa@redcross.org.ph'))
            ->send(new ContactMessageReceived($contactMessage));

        return back()->with('success', 'Message sent! We will get back to you soon.');
    }

    // ── ADMIN: View all messages ──
    public function adminIndex()
    {
        $messages = ContactMessage::latest()->paginate(20);
        return Inertia::render('Admin/ContactMessages', ['messages' => $messages]);
    }

    // ── ADMIN: Mark as read ──
    public function markRead(ContactMessage $message)
    {
        $message->update(['is_read' => true]);
        return back()->with('success', 'Marked as read.');
    }

    // ── ADMIN: Delete message ──
    public function destroy(ContactMessage $message)
    {
        $message->delete();
        return back()->with('success', 'Message deleted.');
    }
}