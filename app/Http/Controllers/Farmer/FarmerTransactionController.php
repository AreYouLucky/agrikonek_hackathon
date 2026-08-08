<?php

namespace App\Http\Controllers\Farmer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Farmer\ReadTransactionMessagesRequest;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Inertia\Inertia;
use Inertia\Response;

class FarmerTransactionController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();
        $farmerProfileId = $user->farmerProfile()->value('id');

        $transactions = Transaction::query()
            ->whereHas('resourceListing', fn ($query) => $query
                ->where('farmer_profile_id', $farmerProfileId))
            ->with([
                'processorProfile:id,business_name,business_type,complete_address',
                'resourceListing:id,agri_resource_id,quantity,price,img',
                'resourceListing.agriResource:id,name',
            ])
            ->withCount(['messages as unread_messages_count' => fn ($query) => $query
                ->where('sender_id', '!=', $user->getKey())
                ->where('is_read', false)])
            ->latest('updated_at')
            ->get();

        $requestedTransactionId = $request->integer('transaction');
        $selectedTransaction = $transactions->firstWhere(
            'id',
            $requestedTransactionId ?: $transactions->first()?->getKey(),
        );

        $selectedMessages = $selectedTransaction
            ? $selectedTransaction->messages()
                ->with('sender:id,name')
                ->oldest()
                ->get()
                ->map(fn ($message): array => [
                    'transaction_id' => $selectedTransaction->getKey(),
                    'id' => $message->getKey(),
                    'message' => $message->message,
                    'sender_id' => $message->sender_id,
                    'sender_name' => $message->sender->name,
                    'created_at' => $message->created_at->toIso8601String(),
                ])
                ->values()
            : collect();

        return Inertia::render('Farmer/Transactions', [
            'currentUserId' => $user->getKey(),
            'transactions' => $transactions->map(fn (Transaction $transaction): array => [
                'id' => $transaction->getKey(),
                'status' => $transaction->status,
                'quantity' => $transaction->quantity,
                'price' => $transaction->price,
                'updated_at' => $transaction->updated_at->toIso8601String(),
                'unread_messages_count' => $transaction->unread_messages_count,
                'processor' => [
                    'business_name' => $transaction->processorProfile->business_name,
                    'business_type' => $transaction->processorProfile->business_type,
                    'complete_address' => $transaction->processorProfile->complete_address,
                ],
                'listing' => [
                    'resource_name' => $transaction->resourceListing->agriResource->name,
                    'quantity' => $transaction->resourceListing->quantity,
                    'price' => $transaction->resourceListing->price,
                    'img' => $transaction->resourceListing->img,
                ],
            ])->values(),
            'selectedTransactionId' => $selectedTransaction?->getKey(),
            'selectedMessages' => $selectedMessages,
        ]);
    }

    public function read(
        ReadTransactionMessagesRequest $request,
        Transaction $transaction,
    ): HttpResponse {
        $transaction->messages()
            ->where('sender_id', '!=', $request->user()->getKey())
            ->where('is_read', false)
            ->update(['is_read' => true]);

        return response()->noContent();
    }
}
