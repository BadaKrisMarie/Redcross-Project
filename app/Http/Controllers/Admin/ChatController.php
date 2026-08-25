<?php

namespace App\Http\Controllers\Admin;

use App\Events\ChatMessageSent;
use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use App\Models\User;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    /**
     * Volunteer list para sa Live Chat sidebar, kasama ang last message
     * preview at unread count ng bawat thread.
     */
    public function volunteers()
    {
        $volunteers = User::where('role', 'volunteer')
            ->orderBy('name')
            ->get(['id', 'name', 'email'])
            ->map(function ($v) {
                $last = ChatMessage::where('volunteer_id', $v->id)
                    ->latest('created_at')
                    ->first();

                $unread = ChatMessage::where('volunteer_id', $v->id)
                    ->where('sender_role', 'volunteer')
                    ->whereNull('read_at')
                    ->count();

                return [
                    'id'           => $v->id,
                    'name'         => $v->name,
                    'email'        => $v->email,
                    'last_message' => $last?->body,
                    'last_time'    => $last?->created_at,
                    'unread_count' => $unread,
                ];
            });

        return response()->json(['volunteers' => $volunteers]);
    }

    /**
     * Full message history ng thread na ito, at mina-mark as read
     * ang mga messages na galing sa volunteer (dahil binuksan na ng admin).
     */
    public function messages(int $volunteerId)
    {
        $messages = ChatMessage::where('volunteer_id', $volunteerId)
            ->orderBy('created_at')
            ->get();

        ChatMessage::where('volunteer_id', $volunteerId)
            ->where('sender_role', 'volunteer')
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['messages' => $messages]);
    }

    public function send(Request $request, int $volunteerId)
    {
        $request->validate(['body' => 'required|string|max:2000']);

        $message = ChatMessage::create([
            'volunteer_id' => $volunteerId,
            'sender_id'    => $request->user()->id,
            'sender_role'  => 'admin',
            'body'         => $request->body,
        ]);

        broadcast(new ChatMessageSent($message))->toOthers();

        return response()->json(['message' => $message]);
    }
}
