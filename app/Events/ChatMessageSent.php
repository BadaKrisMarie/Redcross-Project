<?php

namespace App\Events;

use App\Models\ChatMessage;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatMessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public ChatMessage $message;

    public function __construct(ChatMessage $message)
    {
        $this->message = $message;
    }

    /**
     * Dalawang channel:
     * 1. 'chat.{volunteerId}' — parehong pinapakinggan ng LiveChatPanel.jsx
     *    (admin habang bukas ang specific thread na yun, at ng volunteer
     *    mismo) para sa live message bubbles.
     * 2. 'admin.chat' — GLOBAL channel na laging naka-listen ang AdminLayout
     *    (kahit anong admin page, kahit sarado ang chat widget) para lang
     *    malaman kung may bagong message na dumating — sound + badge lang,
     *    hindi ito nagpapakita ng buong thread.
     *
     * ⚠️ Kailangan ng authorization dito sa routes/channels.php:
     *   Broadcast::channel('chat.{volunteerId}', fn ($user, $volunteerId) => ...);
     *   Broadcast::channel('admin.chat', fn ($user) => $user->hasRole('admin'));
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('chat.' . $this->message->volunteer_id),
            new PrivateChannel('admin.chat'),
        ];
    }

    public function broadcastAs(): string
    {
        return 'message.sent';
    }

    public function broadcastWith(): array
    {
        return [
            'id'           => $this->message->id,
            'volunteer_id' => $this->message->volunteer_id,
            'sender_id'    => $this->message->sender_id,
            'sender_role'  => $this->message->sender_role,
            'body'         => $this->message->body,
            'created_at'   => $this->message->created_at,
        ];
    }
}
