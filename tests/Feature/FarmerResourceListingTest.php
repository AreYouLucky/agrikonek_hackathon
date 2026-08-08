<?php

namespace Tests\Feature;

use App\Models\AgriResource;
use App\Models\FarmerProfile;
use App\Models\MarketPrice;
use App\Models\ProcessorProfile;
use App\Models\ResourceListing;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Http\Client\Request as ClientRequest;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class FarmerResourceListingTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_farmer_can_view_all_agricultural_resources(): void
    {
        [$farmer] = $this->createFarmer();
        $rice = AgriResource::query()->create(['name' => 'Rice']);
        $banana = AgriResource::query()->create(['name' => 'Banana']);

        $response = $this->actingAs($farmer)->get(route('create-agri-resource-listing'));

        $response->assertOk()->assertInertia(fn (Assert $page): Assert => $page
            ->component('Farmer/CreateAgriResourceListing')
            ->has('resources', 2)
            ->where('resources.0.id', $banana->getKey())
            ->where('resources.0.name', 'Banana')
            ->where('resources.1.id', $rice->getKey())
            ->where('resources.1.name', 'Rice'));
    }

    public function test_farmer_can_view_their_profile_page(): void
    {
        [$farmer, $farmerProfile] = $this->createFarmer();

        $response = $this->actingAs($farmer)->get(route('farmer.profile'));

        $response->assertOk()->assertInertia(fn (Assert $page): Assert => $page
            ->component('Farmer/Profile')
            ->where('farmerProfile.farm_name', $farmerProfile->farm_name)
            ->where('farmerProfile.contact_number', $farmerProfile->contact_number));
    }

    public function test_ai_price_recommendation_uses_location_matched_market_prices(): void
    {
        Http::preventStrayRequests();
        Http::fake([
            'api.openai.com/*' => Http::response([
                'output' => [
                    [
                        'type' => 'message',
                        'content' => [
                            [
                                'type' => 'output_text',
                                'text' => json_encode([
                                    'recommended_price' => 110,
                                    'message' => 'Suggested from verified NCR markets near your farm location.',
                                ]),
                            ],
                        ],
                    ],
                ],
            ]),
        ]);

        [$farmer, $farmerProfile] = $this->createFarmer();
        $farmerProfile->update([
            'farm_complete_address' => 'Quezon City, Metro Manila',
        ]);
        $resource = AgriResource::query()->create(['name' => 'Tomato']);
        MarketPrice::query()->create([
            'agri_resource_id' => $resource->getKey(),
            'region' => 'NCR',
            'market' => 'COMMONWEALTH MARKET',
            'price' => 100,
        ]);
        MarketPrice::query()->create([
            'agri_resource_id' => $resource->getKey(),
            'region' => 'NCR',
            'market' => 'MARIKINA PUBLIC MARKET',
            'price' => 140,
        ]);

        $response = $this->actingAs($farmer)->postJson(
            route('farmer.resource-price-recommendation'),
            ['agri_resource_id' => $resource->getKey()],
        );

        $response->assertOk()->assertJson([
            'recommended_price' => 110,
            'average_price' => 120,
            'minimum_price' => 100,
            'maximum_price' => 140,
            'farmer_location' => 'Quezon City, Metro Manila',
            'market_area' => 'NCR',
            'market_count' => 2,
            'match_type' => 'location_match',
        ]);

        Http::assertSent(fn (ClientRequest $request): bool => str_contains(
            $request->body(),
            'Quezon City, Metro Manila',
        ) && str_contains($request->body(), 'COMMONWEALTH MARKET'));
    }

    public function test_price_recommendation_does_not_guess_without_market_data(): void
    {
        Http::preventStrayRequests();
        [$farmer] = $this->createFarmer();
        $resource = AgriResource::query()->create(['name' => 'Rice Husk']);

        $response = $this->actingAs($farmer)->postJson(
            route('farmer.resource-price-recommendation'),
            ['agri_resource_id' => $resource->getKey()],
        );

        $response->assertOk()->assertJson([
            'recommended_price' => null,
            'market_count' => 0,
            'match_type' => 'no_market_data',
        ]);
        Http::assertNothingSent();
    }

    public function test_farmer_receives_processor_suggestions_ranked_by_buying_history_and_distance(): void
    {
        [$farmer, $farmerProfile] = $this->createFarmer();
        $farmerProfile->update([
            'latitude' => 14.6760,
            'longitude' => 121.0437,
        ]);
        $resource = AgriResource::query()->create(['name' => 'Rice Husk']);
        $listing = ResourceListing::query()->create([
            'farmer_profile_id' => $farmerProfile->getKey(),
            'agri_resource_id' => $resource->getKey(),
            'quantity' => 50,
            'havested_at' => now(),
            'preservation_method' => 'dried',
            'price' => 10,
        ]);
        $pastBuyer = $this->createProcessor('Circular Mill', 14.5995, 120.9842);
        $nearbyProspect = $this->createProcessor('Nearby Recycler', 14.6765, 121.0440);
        Transaction::query()->create([
            'processor_profile_id' => $pastBuyer->getKey(),
            'resource_listing_id' => $listing->getKey(),
            'quantity' => 10,
            'price' => 10,
            'status' => 'completed',
        ]);

        $response = $this->actingAs($farmer)->postJson(
            route('farmer.resource-buyer-suggestions'),
            ['agri_resource_id' => $resource->getKey()],
        );

        $response->assertOk()
            ->assertJsonPath('farmer_location', 'Test Farm Address')
            ->assertJsonPath('processors.0.id', $pastBuyer->getKey())
            ->assertJsonPath('processors.0.has_bought_resource', true)
            ->assertJsonPath('processors.1.id', $nearbyProspect->getKey())
            ->assertJsonPath('processors.1.has_bought_resource', false);
    }

    public function test_farmer_can_store_a_resource_listing(): void
    {
        Storage::fake('public');
        [$farmer, $farmerProfile] = $this->createFarmer();
        $resource = AgriResource::query()->create(['name' => 'Rice']);

        $response = $this->actingAs($farmer)->post(route('farmer.resource-listings.store'), [
            'agri_resource_id' => $resource->getKey(),
            'quantity' => 25.5,
            'harvested_at' => now()->toDateString(),
            'preservation_method' => 'refrigerated',
            'img' => UploadedFile::fake()->image('rice.jpg'),
            'price' => 45.75,
        ]);

        $response->assertRedirect(route('create-agri-resource-listing'));
        $response->assertSessionHasNoErrors();

        $listing = $farmerProfile->resourceListings()->sole();

        $this->assertSame($resource->getKey(), $listing->agri_resource_id);
        $this->assertSame(25.5, $listing->quantity);
        $this->assertSame('refrigerated', $listing->preservation_method);
        $this->assertSame(45.75, $listing->price);
        Storage::disk('public')->assertExists($listing->img);
    }

    public function test_resource_listing_requires_valid_listing_details(): void
    {
        [$farmer] = $this->createFarmer();

        $response = $this->actingAs($farmer)->post(route('farmer.resource-listings.store'), [
            'agri_resource_id' => 999999,
            'quantity' => 0,
            'harvested_at' => now()->addDay()->toDateString(),
            'preservation_method' => 'unsupported',
            'img' => UploadedFile::fake()->create('crop.txt', 10, 'text/plain'),
            'price' => 0,
        ]);

        $response->assertSessionHasErrors([
            'agri_resource_id',
            'quantity',
            'harvested_at',
            'preservation_method',
            'img',
            'price',
        ]);
        $this->assertDatabaseCount('resource_listings', 0);
    }

    /** @return array{User, FarmerProfile} */
    private function createFarmer(): array
    {
        $farmer = User::factory()->create(['role' => 'farmer']);
        $farmerProfile = FarmerProfile::query()->create([
            'user_id' => $farmer->getKey(),
            'farm_name' => 'Test Farm',
            'farm_complete_address' => 'Test Farm Address',
            'contact_number' => '09170000000',
        ]);

        return [$farmer, $farmerProfile];
    }

    private function createProcessor(string $businessName, float $latitude, float $longitude): ProcessorProfile
    {
        $user = User::factory()->create(['role' => 'processor']);

        return ProcessorProfile::query()->create([
            'user_id' => $user->getKey(),
            'business_name' => $businessName,
            'business_type' => 'Agricultural recycling',
            'complete_address' => $businessName.' Address',
            'latitude' => $latitude,
            'longitude' => $longitude,
            'contact_number' => '09171234567',
        ]);
    }
}
