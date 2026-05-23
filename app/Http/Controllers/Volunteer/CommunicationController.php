<?php

namespace App\Http\Controllers\Volunteer;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\SentEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;

class CommunicationController extends Controller
{
    public function index()
    {
        // ✅ FIXED: fresh() + avatar_url/photo_url para consistent sa middleware
        $user = auth()->user()->fresh();

        $sentEmails = SentEmail::where('user_id', $user->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $announcements = Announcement::with('admin')
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('Volunteer/Communication', [
            'auth' => [
                'user' => array_merge(
                    $user->toArray(),
                    [
                        'avatar_url' => $user->avatar_url,
                        'photo_url'  => $user->avatar_url, // ✅ same as HandleInertiaRequests
                    ]
                ),
            ],
            'sentEmails'    => $sentEmails,
            'announcements' => $announcements,
        ]);
    }

    public function send(Request $request)
    {
        $validated = $request->validate([
            'to'      => 'required|email',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        $user = auth()->user();

        SentEmail::create([
            'user_id' => $user->id,
            'to'      => $validated['to'],
            'subject' => $validated['subject'],
            'message' => $validated['message'],
        ]);

        try {
            Mail::raw($validated['message'], function ($mail) use ($validated, $user) {
                $mail->to($validated['to'])
                     ->subject($validated['subject'])
                     ->from(config('mail.from.address'), $user->name);
            });
        } catch (\Exception $e) {
            // Email sending failed but saved to DB
        }

        return back()->with('success', 'Email sent successfully!');
    }
}
