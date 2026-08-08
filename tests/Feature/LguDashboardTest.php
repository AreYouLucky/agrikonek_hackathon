<?php

namespace Tests\Feature;

use App\Models\AgriResource;
use App\Models\FarmerProfile;
use App\Models\MarketPrice;
use App\Models\ProcessorProfile;
use App\Models\ProcessorProfileTransaction;
use App\Models\ResourceListing;
use App\Models\Transaction;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class LguDashboardTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_lgu_dashboard_displays_circular_economy_metrics(): void
    {
        config(['services.openai.key' => null]);

        $lgu = User::factory()->create(['role' => 'lgu']);
        $farmer = User::factory()->create(['role' => 'farmer']);
        $processor = User::factory()->create(['role' => 'processor']);
        $tomato = AgriResource::query()->create(['name' => 'Tomato']);
        $squash = AgriResource::query()->create(['name' => 'Squash']);
        $farmerProfile = FarmerProfile::query()->create([
            'user_id' => $farmer->getKey(),
            'farm_name' => 'Demo Farm',
            'farm_complete_address' => 'Demo Farm Address',
            'latitude' => '14.5995',
            'longitude' => '120.9842',
            'contact_number' => '09170000000',
        ]);
        $processorProfile = ProcessorProfile::query()->create([
            'user_id' => $processor->getKey(),
            'business_name' => 'Demo Processor',
            'business_type' => 'Food Processing',
            'complete_address' => 'Demo Processor Address',
            'latitude' => '14.6091',
            'longitude' => '121.0223',
            'contact_number' => '09170000001',
        ]);
        $listing = ResourceListing::query()->create([
            'farmer_profile_id' => $farmerProfile->getKey(),
            'agri_resource_id' => $tomato->getKey(),
            'quantity' => 100,
            'havested_at' => now()->subDay(),
            'preservation_method' => 'Fresh crates',
            'price' => 30,
            'fresh_until' => now()->addDays(3),
            'freshness_status' => 'Fresh',
        ]);

        ProcessorProfileTransaction::query()->create([
            'user_id' => $processor->getKey(),
            'processor_profile_id' => $processorProfile->getKey(),
            'agri_resource_id' => $tomato->getKey(),
            'quantity' => 150,
            'price' => 35,
            'remarks' => 'For sauce processing',
        ]);
        ProcessorProfileTransaction::query()->create([
            'user_id' => $processor->getKey(),
            'processor_profile_id' => $processorProfile->getKey(),
            'agri_resource_id' => $squash->getKey(),
            'quantity' => 20,
            'price' => 25,
            'remarks' => 'For soup packs',
        ]);
        Transaction::query()->create([
            'processor_profile_id' => $processorProfile->getKey(),
            'resource_listing_id' => $listing->getKey(),
            'quantity' => 40,
            'price' => 32,
            'status' => 'completed',
        ]);
        MarketPrice::query()->create([
            'agri_resource_id' => $tomato->getKey(),
            'market' => 'Demo Market',
            'region' => 'NCR',
            'price' => 50,
        ]);

        $response = $this->actingAs($lgu)->get(route('lgu.dashboard'));

        $response->assertOk()->assertInertia(fn (Assert $page): Assert => $page
            ->component('Lgu/Dashboard')
            ->where('overview.available_supply_kg', 100)
            ->where('overview.processor_demand_kg', 170)
            ->where('overview.surplus_utilized_kg', 40)
            ->where('overview.estimated_income', 1280)
            ->where('overview.waste_diverted_kg', 40)
            ->where('aiInsight.source', 'Computed')
            ->has('supplyDemandGaps', 2)
            ->where('supplyDemandGaps.0.status', 'Shortage')
            ->has('topResources', 2)
            ->has('marketPrices', 1)
            ->has('geoDistribution.supply', 1)
            ->has('geoDistribution.demand', 1)
            ->has('recentListings', 1)
            ->has('recentTransactions', 1));
    }
}
