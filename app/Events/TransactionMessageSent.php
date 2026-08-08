<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class TransactionMessageSent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public int $transactionId,
        public int $messageId,
        public string $message,
        public int $senderId,
        public string $senderName,
        public string $createdAt,
    ) {}

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, PrivateChannel>
     */
    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('transaction.'.$this->transactionId),
        ];
    }

    public function broadcastAs(): string
    {
        return 'transaction-message-sent';
    }

    /**
     * @return array{transaction_id: int, id: int, message: string, sender_id: int, sender_name: string, created_at: string}
     */
    public function broadcastWith(): array
    {
        return [
            'transaction_id' => $this->transactionId,
            'id' => $this->messageId,
            'message' => $this->message,
            'sender_id' => $this->senderId,
            'sender_name' => $this->senderName,
            'created_at' => $this->createdAt,
        ];
    }
}
