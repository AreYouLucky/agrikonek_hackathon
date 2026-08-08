<?php

namespace App\Http\Controllers\Api;

use App\Events\TransactionAlert;
use App\Events\TransactionMessageSent;
use App\Events\TransactionPinged;
use App\Http\Controllers\Controller;
use App\Http\Requests\AccessTransactionRequest;
use App\Http\Requests\SendTransactionMessageRequest;
use App\Models\Transaction;
use Illuminate\Http\JsonResponse;

class TransactionRealtimeController extends Controller
{
    public function message(SendTransactionMessageRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $transaction = $this->transaction($validated['transaction_id']);
        $user = $request->user();
        $message = $transaction->messages()->create([
            'sender_id' => $user->getKey(),
            'message' => $validated['message'],
            'is_img' => false,
        ]);

        $payload = [
            'transaction_id' => $transaction->getKey(),
            'id' => $message->getKey(),
            'message' => $message->message,
            'sender_id' => $user->getKey(),
            'sender_name' => $user->name,
            'created_at' => $message->created_at->toIso8601String(),
        ];

        broadcast(new TransactionMessageSent(
            transactionId: $transaction->getKey(),
            messageId: $message->getKey(),
            message: $message->message,
            senderId: $user->getKey(),
            senderName: $user->name,
            createdAt: $message->created_at->toIso8601String(),
        ))->toOthers();

        return response()->json($payload, 201);
    }

    public function alert(AccessTransactionRequest $request): JsonResponse
    {
        $transaction = $this->transaction($request->integer('transaction_id'));

        broadcast(new TransactionAlert($transaction->getKey()))->toOthers();

        return response()->json(['success' => true]);
    }

    public function ping(AccessTransactionRequest $request): JsonResponse
    {
        $transaction = $this->transaction($request->integer('transaction_id'));

        broadcast(new TransactionPinged($transaction->getKey()))->toOthers();

        return response()->json(['success' => true]);
    }

    private function transaction(int $transactionId): Transaction
    {
        return Transaction::query()->findOrFail($transactionId);
    }
}
