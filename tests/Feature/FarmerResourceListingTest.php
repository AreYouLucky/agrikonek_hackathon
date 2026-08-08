<?php

namespace Tests\Feature;

use App\Models\AgriResource;
use App\Models\FarmerProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Http\UploadedFile;
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
}
