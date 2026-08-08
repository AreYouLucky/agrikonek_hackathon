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

class FarmerTransactionPageTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_farmer_only_sees_transactions_for_their_own_listings(): void
    {
        [$farmer, $transaction] = $this->createTransaction('Rice Straw');
        [, $otherTransaction] = $this->createTransaction('Corn Cobs');
        $unmatchedResource = AgriResource::query()->create(['name' => 'Rice Bran']);
        $unmatchedListing = ResourceListing::query()->create([
            'farmer_profile_id' => $farmer->farmerProfile()->value('id'),
            'agri_resource_id' => $unmatchedResource->getKey(),
            'quantity' => 35,
            'havested_at' => now(),
            'preservation_method' => 'sun_dried',
            'price' => 18,
        ]);
        $transaction->messages()->create([
            'sender_id' => $transaction->processorProfile->user_id,
            'message' => 'Can I collect this tomorrow?',
            'is_img' => false,
        ]);

        $response = $this->actingAs($farmer)->get(route('farmer.transactions', [
            'transaction' => $transaction->getKey(),
        ]));

        $response->assertOk()->assertInertia(fn (Assert $page): Assert => $page
            ->component('Farmer/Transactions')
            ->where('currentUserId', $farmer->getKey())
            ->has('listings', 2)
            ->where('listings.0.id', $unmatchedListing->getKey())
            ->where('listings.0.resource_name', 'Rice Bran')
            ->where('listings.0.transactions_count', 0)
            ->where('listings.1.id', $transaction->resource_listing_id)
            ->where('listings.1.transactions_count', 1)
            ->has('transactions', 1)
            ->where('transactions.0.id', $transaction->getKey())
            ->where('transactions.0.listing.resource_name', 'Rice Straw')
            ->where('transactions.0.listing.quantity', 20)
            ->where('transactions.0.listing.preservation_method', 'dried')
            ->where('transactions.0.listing.estimated_price', 23.5)
            ->where('transactions.0.listing.fresh_until', now()->addDays(5)->toDateString())
            ->where('transactions.0.listing.freshness_status', 'fresh')
            ->where('transactions.0.listing.ai_analysis_message', 'Listing remains usable and is fairly priced.')
            ->where('selectedMessages.0.message', 'Can I collect this tomorrow?'));

        $this->assertNotSame($transaction->getKey(), $otherTransaction->getKey());
    }

    public function test_farmer_can_mark_incoming_transaction_messages_as_read(): void
    {
        [$farmer, $transaction] = $this->createTransaction('Banana Peels');
        $incomingMessage = $transaction->messages()->create([
            'sender_id' => $transaction->processorProfile->user_id,
            'message' => 'We are interested.',
            'is_img' => false,
            'is_read' => false,
        ]);
        $ownMessage = $transaction->messages()->create([
            'sender_id' => $farmer->getKey(),
            'message' => 'Thank you.',
            'is_img' => false,
            'is_read' => false,
        ]);

        $this->actingAs($farmer)
            ->post(route('farmer.transactions.read', $transaction))
            ->assertNoContent();

        $this->assertTrue($incomingMessage->fresh()->is_read);
        $this->assertFalse($ownMessage->fresh()->is_read);
    }

    public function test_farmer_cannot_read_another_farmers_transaction_messages(): void
    {
        [, $transaction] = $this->createTransaction('Coconut Husks');
        [$otherFarmer] = $this->createTransaction('Vegetable Trimmings');

        $this->actingAs($otherFarmer)
            ->post(route('farmer.transactions.read', $transaction))
            ->assertForbidden();
    }

    public function test_farmer_can_update_the_chat_transaction_price(): void
    {
        [$farmer, $transaction] = $this->createTransaction('Rice Hulls');

        $this->actingAs($farmer)
            ->patch(route('farmer.transactions.price.update', $transaction), [
                'price' => 31.50,
            ])
            ->assertRedirect();

        $this->assertSame(31.5, $transaction->fresh()->price);
        $this->assertSame('price_updated', $transaction->fresh()->status);
    }

    public function test_farmer_cannot_update_another_farmers_transaction_price(): void
    {
        [, $transaction] = $this->createTransaction('Rice Hulls');
        [$otherFarmer] = $this->createTransaction('Coffee Husks');

        $this->actingAs($otherFarmer)
            ->patch(route('farmer.transactions.price.update', $transaction), [
                'price' => 31.50,
            ])
            ->assertForbidden();

        $this->assertSame(25.0, $transaction->fresh()->price);
    }

    public function test_farmer_cannot_change_price_after_purchase(): void
    {
        [$farmer, $transaction] = $this->createTransaction('Cassava Peels');
        $transaction->update(['status' => 'purchased']);

        $this->actingAs($farmer)
            ->from(route('farmer.transactions', ['transaction' => $transaction]))
            ->patch(route('farmer.transactions.price.update', $transaction), [
                'price' => 31.50,
            ])
            ->assertRedirect()
            ->assertSessionHasErrors('price');

        $this->assertSame(25.0, $transaction->fresh()->price);
    }

    /** @return array{User, Transaction} */
    private function createTransaction(string $resourceName): array
    {
        $farmer = User::factory()->create(['role' => 'farmer']);
        $farmerProfile = FarmerProfile::query()->create([
            'user_id' => $farmer->getKey(),
            'farm_name' => $resourceName.' Farm',
            'farm_complete_address' => 'Quezon City',
            'contact_number' => '09170000000',
        ]);
        $resource = AgriResource::query()->create(['name' => $resourceName]);
        $listing = ResourceListing::query()->create([
            'farmer_profile_id' => $farmerProfile->getKey(),
            'agri_resource_id' => $resource->getKey(),
            'quantity' => 20,
            'havested_at' => now(),
            'preservation_method' => 'dried',
            'price' => 25,
            'img' => 'resource-listings/sample.jpg',
            'estimated_price' => 23.5,
            'fresh_until' => now()->addDays(5),
            'freshness_status' => 'fresh',
            'ai_analysis_message' => 'Listing remains usable and is fairly priced.',
        ]);
        $processorUser = User::factory()->create(['role' => 'processor']);
        $processor = ProcessorProfile::query()->create([
            'user_id' => $processorUser->getKey(),
            'business_name' => $resourceName.' Processor',
            'business_type' => 'Recycling',
            'complete_address' => 'Manila',
            'contact_number' => '09171234567',
        ]);
        $transaction = Transaction::query()->create([
            'processor_profile_id' => $processor->getKey(),
            'resource_listing_id' => $listing->getKey(),
            'quantity' => 10,
            'price' => 25,
            'status' => 'pending',
        ]);

        return [$farmer, $transaction];
    }
}
