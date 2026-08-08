<?php

namespace Tests\Feature;

use App\Events\TransactionAlert;
use App\Events\TransactionMessageSent;
use App\Events\TransactionPinged;
use App\Models\AgriResource;
use App\Models\FarmerProfile;
use App\Models\ProcessorProfile;
use App\Models\ResourceListing;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Event;
use Tests\TestCase;

class TransactionRealtimeTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_transaction_owner_can_send_and_broadcast_a_message(): void
    {
        [$owner, $transaction] = $this->createTransaction();
        Event::fake([TransactionMessageSent::class]);

        $response = $this->actingAs($owner)->postJson('/api/transactions/messages', [
            'transaction_id' => $transaction->getKey(),
            'message' => 'Sample message',
        ], [
            'X-Socket-ID' => '123.456',
        ]);

        $response->assertCreated()->assertExactJson([
            'transaction_id' => $transaction->getKey(),
            'message' => 'Sample message',
        ]);

        $this->assertDatabaseHas('messages', [
            'transaction_id' => $transaction->getKey(),
            'sender_id' => $owner->getKey(),
            'message' => 'Sample message',
        ]);

        Event::assertDispatched(
            TransactionMessageSent::class,
            fn (TransactionMessageSent $event): bool => $event->transactionId === $transaction->getKey()
                && $event->message === 'Sample message'
                && $event->broadcastOn()[0]->name === 'transaction.'.$transaction->getKey()
                && $event->broadcastAs() === 'transaction-message-sent'
                && $event->socket === '123.456',
        );
    }

    public function test_anonymous_user_can_send_a_demo_message_for_an_existing_transaction(): void
    {
        [, $transaction] = $this->createTransaction();
        Event::fake([TransactionMessageSent::class]);

        $this->postJson('/api/transactions/messages', [
            'transaction_id' => $transaction->getKey(),
            'message' => 'Anonymous demo message',
        ])->assertCreated()->assertExactJson([
            'transaction_id' => $transaction->getKey(),
            'message' => 'Anonymous demo message',
        ]);

        Event::assertDispatched(TransactionMessageSent::class);
        $this->assertDatabaseMissing('messages', [
            'transaction_id' => $transaction->getKey(),
            'message' => 'Anonymous demo message',
        ]);
    }

    public function test_ping_and_alert_broadcast_to_their_expected_channels(): void
    {
        [, $transaction] = $this->createTransaction();
        Event::fake([TransactionAlert::class, TransactionPinged::class]);

        $this->postJson('/api/transactions/alert', [
            'transaction_id' => $transaction->getKey(),
        ])->assertOk()->assertExactJson(['success' => true]);

        $this->postJson('/api/transactions/ping', [
            'transaction_id' => $transaction->getKey(),
        ], [
            'X-Socket-ID' => '789.123',
        ])->assertOk()->assertExactJson(['success' => true]);

        Event::assertDispatched(
            TransactionAlert::class,
            fn (TransactionAlert $event): bool => $event->broadcastOn()[0]->name === 'transaction.'.$transaction->getKey()
                && $event->broadcastAs() === 'transaction-alert',
        );
        Event::assertDispatched(
            TransactionPinged::class,
            fn (TransactionPinged $event): bool => $event->broadcastOn()[0]->name === 'transaction-ping.'.$transaction->getKey()
                && $event->broadcastAs() === 'transaction-pinged'
                && $event->socket === '789.123',
        );
    }

    public function test_realtime_endpoints_reject_an_unknown_transaction_id(): void
    {
        $this->postJson('/api/transactions/ping', [
            'transaction_id' => 999999,
        ])->assertUnprocessable()->assertJsonValidationErrors('transaction_id');

        $this->postJson('/api/transactions/messages', [
            'transaction_id' => 999999,
            'message' => 'Invalid transaction',
        ])->assertUnprocessable()->assertJsonValidationErrors('transaction_id');
    }

    /**
     * @return array{User, Transaction}
     */
    private function createTransaction(): array
    {
        $owner = User::factory()->create(['role' => 'processor']);
        $processorProfile = ProcessorProfile::query()->create([
            'user_id' => $owner->getKey(),
            'business_name' => 'Test Processor',
            'business_type' => 'Food processing',
            'complete_address' => 'Test Address',
            'contact_number' => '09171234567',
        ]);
        $resource = AgriResource::query()->create(['name' => 'Rice']);
        $farmer = User::factory()->create(['role' => 'farmer']);
        $farmerProfile = FarmerProfile::query()->create([
            'user_id' => $farmer->getKey(),
            'farm_name' => 'Test Farm',
            'farm_complete_address' => 'Test Farm Address',
            'contact_number' => '09170000000',
        ]);
        $resourceListing = ResourceListing::query()->create([
            'farmer_profile_id' => $farmerProfile->getKey(),
            'agri_resource_id' => $resource->getKey(),
            'quantity' => 10,
            'havested_at' => now(),
            'preservation_method' => 'Fresh',
            'price' => 100,
        ]);
        $transaction = Transaction::query()->forceCreate([
            'processor_profile_id' => $processorProfile->getKey(),
            'resource_listing_id' => $resourceListing->getKey(),
            'quantity' => '10',
            'price' => 100,
            'status' => 'pending',
        ]);

        return [$owner, $transaction];
    }
}
