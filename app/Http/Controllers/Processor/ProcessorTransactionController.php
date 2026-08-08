<?php

namespace App\Http\Controllers\Processor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Processor\PurchaseTransactionRequest;
use App\Http\Requests\Processor\ReadTransactionMessagesRequest;
use App\Models\ResourceListing;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response as HttpResponse;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ProcessorTransactionController extends Controller
{
    public function index(Request $request): Response
    {
        /** @var User $user */
        $user = $request->user();
        $processorProfile = $user->processorProfile()->firstOrFail();

        $transactions = Transaction::query()
            ->where('processor_profile_id', $processorProfile->getKey())
            ->with([
                'resourceListing:id,farmer_profile_id,agri_resource_id,quantity,havested_at,preservation_method,price,img,fresh_until,freshness_status',
                'resourceListing.agriResource:id,name',
                'resourceListing.farmerProfile:id,user_id,farm_name,farm_complete_address',
                'resourceListing.farmerProfile.user:id,name',
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

        return Inertia::render('Processor/SearchAgriResources', [
            'currentUserId' => $user->getKey(),
            'transactions' => $transactions->map(fn (Transaction $transaction): array => [
                'id' => $transaction->getKey(),
                'status' => $transaction->status,
                'quantity' => $transaction->quantity,
                'price' => $transaction->price,
                'updated_at' => $transaction->updated_at->toIso8601String(),
                'unread_messages_count' => $transaction->unread_messages_count,
                'farmer' => [
                    'name' => $transaction->resourceListing->farmerProfile->user->name,
                    'farm_name' => $transaction->resourceListing->farmerProfile->farm_name,
                    'complete_address' => $transaction->resourceListing->farmerProfile->farm_complete_address,
                ],
                'listing' => [
                    'id' => $transaction->resourceListing->getKey(),
                    'resource_name' => $transaction->resourceListing->agriResource->name,
                    'quantity' => $transaction->resourceListing->quantity,
                    'price' => $transaction->resourceListing->price,
                    'img' => $transaction->resourceListing->img,
                    'harvested_at' => $transaction->resourceListing->havested_at->toDateString(),
                    'preservation_method' => $transaction->resourceListing->preservation_method,
                    'fresh_until' => $transaction->resourceListing->fresh_until?->toDateString(),
                    'freshness_status' => $transaction->resourceListing->freshness_status,
                ],
            ])->values(),
            'selectedTransactionId' => $selectedTransaction?->getKey(),
            'selectedMessages' => $selectedMessages,
        ]);
    }

    public function start(Request $request, ResourceListing $resourceListing): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        $processorProfile = $user->processorProfile()->firstOrFail();

        $transaction = Transaction::query()->firstOrCreate(
            [
                'processor_profile_id' => $processorProfile->getKey(),
                'resource_listing_id' => $resourceListing->getKey(),
            ],
            [
                'quantity' => $resourceListing->quantity,
                'price' => $resourceListing->price,
                'status' => 'pending',
            ],
        );

        return redirect()->route('processors.transactions', [
            'transaction' => $transaction->getKey(),
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

    public function purchase(
        PurchaseTransactionRequest $request,
        Transaction $transaction,
    ): RedirectResponse {
        if ($transaction->price === null || $transaction->price <= 0) {
            throw ValidationException::withMessages([
                'purchase' => 'Ask the farmer to set a transaction price before buying.',
            ]);
        }

        if ($transaction->status !== 'purchased') {
            $transaction->update(['status' => 'purchased']);
        }

        return back();
    }
}
