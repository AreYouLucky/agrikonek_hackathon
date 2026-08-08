<?php

namespace Tests\Feature;

use App\Models\AgriResource;
use App\Models\FarmerProfile;
use App\Models\ProcessorProfile;
use App\Models\ResourceListing;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ProcessorTransactionPageTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_processor_can_start_or_reopen_a_listing_conversation(): void
    {
        [$processor, $processorProfile] = $this->createProcessor('Circular Mill');
        $listing = $this->createListing('Rice Straw');

        $this->actingAs($processor)
            ->post(route('processors.transactions.start', $listing))
            ->assertRedirect();

        $transaction = Transaction::query()->sole();

        $this->assertSame($processorProfile->getKey(), $transaction->processor_profile_id);
        $this->assertSame($listing->getKey(), $transaction->resource_listing_id);
        $this->assertSame($listing->quantity, $transaction->quantity);
        $this->assertSame($listing->price, $transaction->price);

        $this->actingAs($processor)
            ->post(route('processors.transactions.start', $listing))
            ->assertRedirect(route('processors.transactions', [
                'transaction' => $transaction->getKey(),
            ]));

        $this->assertSame(1, Transaction::query()->count());
    }

    public function test_processor_only_sees_their_farmer_conversations(): void
    {
        [$processor, $processorProfile] = $this->createProcessor('Circular Mill');
        [, $otherProcessorProfile] = $this->createProcessor('Other Processor');
        $listing = $this->createListing('Banana Peels');
        $transaction = $this->createTransaction($processorProfile, $listing);
        $otherTransaction = $this->createTransaction($otherProcessorProfile, $listing);
        $message = $transaction->messages()->create([
            'sender_id' => $listing->farmerProfile->user_id,
            'message' => 'The resource is available tomorrow.',
            'is_img' => false,
            'is_read' => false,
        ]);

        $this->actingAs($processor)
            ->get(route('processors.transactions', ['transaction' => $transaction]))
            ->assertOk()
            ->assertInertia(fn (Assert $page): Assert => $page
                ->component('Processor/SearchAgriResources')
                ->where('currentUserId', $processor->getKey())
                ->has('transactions', 1)
                ->where('transactions.0.id', $transaction->getKey())
                ->where('transactions.0.listing.resource_name', 'Banana Peels')
                ->where('transactions.0.farmer.farm_name', 'Banana Peels Farm')
                ->where('transactions.0.unread_messages_count', 1)
                ->where('selectedTransactionId', $transaction->getKey())
                ->where('selectedMessages.0.id', $message->getKey())
                ->where('selectedMessages.0.message', 'The resource is available tomorrow.'));

        $this->assertNotSame($transaction->getKey(), $otherTransaction->getKey());
    }

    public function test_processor_can_mark_farmer_messages_as_read(): void
    {
        [$processor, $processorProfile] = $this->createProcessor('Circular Mill');
        $listing = $this->createListing('Coconut Husks');
        $transaction = $this->createTransaction($processorProfile, $listing);
        $incomingMessage = $transaction->messages()->create([
            'sender_id' => $listing->farmerProfile->user_id,
            'message' => 'Ready for collection.',
            'is_img' => false,
            'is_read' => false,
        ]);
        $ownMessage = $transaction->messages()->create([
            'sender_id' => $processor->getKey(),
            'message' => 'Thank you.',
            'is_img' => false,
            'is_read' => false,
        ]);

        $this->actingAs($processor)
            ->post(route('processors.transactions.read', $transaction))
            ->assertNoContent();

        $this->assertTrue($incomingMessage->fresh()->is_read);
        $this->assertFalse($ownMessage->fresh()->is_read);
    }

    public function test_processor_cannot_read_another_processors_messages(): void
    {
        [$processor] = $this->createProcessor('Circular Mill');
        [, $otherProcessorProfile] = $this->createProcessor('Other Processor');
        $transaction = $this->createTransaction(
            $otherProcessorProfile,
            $this->createListing('Vegetable Trimmings'),
        );

        $this->actingAs($processor)
            ->post(route('processors.transactions.read', $transaction))
            ->assertForbidden();
    }

    public function test_processor_can_purchase_the_resource_at_the_transaction_price(): void
    {
        [$processor, $processorProfile] = $this->createProcessor('Circular Mill');
        $transaction = $this->createTransaction(
            $processorProfile,
            $this->createListing('Rice Straw'),
        );
        $transaction->update(['price' => 29.50, 'status' => 'price_updated']);

        $this->actingAs($processor)
            ->post(route('processors.transactions.purchase', $transaction))
            ->assertRedirect();

        $this->assertSame('purchased', $transaction->fresh()->status);
        $this->assertSame(29.5, $transaction->fresh()->price);
    }

    public function test_processor_cannot_purchase_another_processors_transaction(): void
    {
        [$processor] = $this->createProcessor('Circular Mill');
        [, $otherProcessorProfile] = $this->createProcessor('Other Processor');
        $transaction = $this->createTransaction(
            $otherProcessorProfile,
            $this->createListing('Rice Straw'),
        );

        $this->actingAs($processor)
            ->post(route('processors.transactions.purchase', $transaction))
            ->assertForbidden();

        $this->assertSame('pending', $transaction->fresh()->status);
    }

    public function test_processor_cannot_purchase_without_a_transaction_price(): void
    {
        [$processor, $processorProfile] = $this->createProcessor('Circular Mill');
        $transaction = $this->createTransaction(
            $processorProfile,
            $this->createListing('Rice Straw'),
        );
        $transaction->update(['price' => null]);

        $this->actingAs($processor)
            ->from(route('processors.transactions', ['transaction' => $transaction]))
            ->post(route('processors.transactions.purchase', $transaction))
            ->assertRedirect()
            ->assertSessionHasErrors('purchase');

        $this->assertSame('pending', $transaction->fresh()->status);
    }

    /** @return array{User, ProcessorProfile} */
    private function createProcessor(string $businessName): array
    {
        $user = User::factory()->create(['role' => 'processor']);
        $profile = ProcessorProfile::query()->create([
            'user_id' => $user->getKey(),
            'business_name' => $businessName,
            'business_type' => 'Recycling',
            'complete_address' => 'Manila',
            'contact_number' => '09171234567',
        ]);

        return [$user, $profile];
    }

    private function createListing(string $resourceName): ResourceListing
    {
        $farmer = User::factory()->create(['role' => 'farmer']);
        $farmerProfile = FarmerProfile::query()->create([
            'user_id' => $farmer->getKey(),
            'farm_name' => $resourceName.' Farm',
            'farm_complete_address' => 'Quezon City',
            'contact_number' => '09170000000',
        ]);
        $resource = AgriResource::query()->create(['name' => $resourceName]);

        return ResourceListing::query()->create([
            'farmer_profile_id' => $farmerProfile->getKey(),
            'agri_resource_id' => $resource->getKey(),
            'quantity' => 20,
            'havested_at' => now(),
            'preservation_method' => 'dried',
            'price' => 25,
            'fresh_until' => now()->addDays(5),
            'freshness_status' => 'fresh',
        ]);
    }

    private function createTransaction(
        ProcessorProfile $processorProfile,
        ResourceListing $listing,
    ): Transaction {
        return Transaction::query()->create([
            'processor_profile_id' => $processorProfile->getKey(),
            'resource_listing_id' => $listing->getKey(),
            'quantity' => 10,
            'price' => 25,
            'status' => 'pending',
        ]);
    }
}
