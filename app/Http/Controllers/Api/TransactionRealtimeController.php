<?php

namespace App\Http\Controllers\Api;

use App\Events\TransactionAlert;
use App\Events\TransactionMessageSent;
use App\Events\TransactionPinged;
use App\Http\Controllers\Controller;
use App\Http\Requests\AccessTransactionRequest;
use App\Http\Requests\SendTransactionMessageRequest;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class TransactionRealtimeController extends Controller
{
    public function message(SendTransactionMessageRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $transaction = $this->transaction($validated['transaction_id']);
        $messageText = $validated['message'];
        $user = $request->user();

        if ($user instanceof User) {
            $message = $transaction->messages()->create([
                'sender_id' => $user->getKey(),
                'message' => $messageText,
                'is_img' => false,
            ]);
            $messageText = $message->message;
        }

        broadcast(new TransactionMessageSent(
            transactionId: $transaction->getKey(),
            message: $messageText,
        ))->toOthers();

        return response()->json([
            'transaction_id' => $transaction->getKey(),
            'message' => $messageText,
        ], 201);
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
