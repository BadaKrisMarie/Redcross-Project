<?php

namespace App\Http\Controllers\Volunteer;

use App\Events\ChatMessageSent;
use App\Http\Controllers\Controller;
use App\Models\ChatMessage;
use Illuminate\Http\Request;

class ChatController extends Controller
{
    /**
     * Isang thread lang ang volunteer — laging kausap ang admin,
     * kaya ang volunteer_id ay laging sarili niyang user id.
     */
    public function index(Request $request)
    {
        $volunteerId = $request->user()->id;

        $messages = ChatMessage::where('volunteer_id', $volunteerId)
            ->orderBy('created_at')
            ->get();

        ChatMessage::where('volunteer_id', $volunteerId)
            ->where('sender_role', 'admin')
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return response()->json(['messages' => $messages]);
    }

    public function send(Request $request)
    {
        $request->validate(['body' => 'required|string|max:2000']);

        $message = ChatMessage::create([
            'volunteer_id' => $request->user()->id,
            'sender_id'    => $request->user()->id,
            'sender_role'  => 'volunteer',
            'body'         => $request->body,
        ]);

        broadcast(new ChatMessageSent($message))->toOthers();

        return response()->json(['message' => $message]);
    }
}
