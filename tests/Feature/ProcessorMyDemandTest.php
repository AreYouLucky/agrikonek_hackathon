<?php

namespace Tests\Feature;

use App\Models\AgriResource;
use App\Models\FarmerProfile;
use App\Models\ProcessorProfile;
use App\Models\ProcessorProfileTransaction;
use App\Models\ResourceListing;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ProcessorMyDemandTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_processor_can_get_only_their_demand_records(): void
    {
        [$processor, $processorProfile] = $this->createProcessor();
        [$otherProcessor, $otherProcessorProfile] = $this->createProcessor();
        $tomato = AgriResource::query()->create(['name' => 'Tomato']);
        $squash = AgriResource::query()->create(['name' => 'Squash']);

        ProcessorProfileTransaction::query()->create([
            'user_id' => $processor->getKey(),
            'processor_profile_id' => $processorProfile->getKey(),
            'agri_resource_id' => $tomato->getKey(),
            'quantity' => 120.5,
            'price' => 45.75,
            'remarks' => 'For sauce production',
        ]);

        ProcessorProfileTransaction::query()->create([
            'user_id' => $otherProcessor->getKey(),
            'processor_profile_id' => $otherProcessorProfile->getKey(),
            'agri_resource_id' => $squash->getKey(),
            'quantity' => 80,
            'price' => 32,
            'remarks' => 'Other processor record',
        ]);

        $response = $this->actingAs($processor)
            ->getJson(route('processors.agri-resources.my-demands.getdata'));

        $response->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.resource', 'Tomato')
            ->assertJsonPath('0.quantity', 120.5)
            ->assertJsonPath('0.price', 45.75)
            ->assertJsonPath('0.remarks', 'For sauce production');
    }

    public function test_processor_dashboard_is_wired_to_profile_and_demand_data(): void
    {
        [$processor, $processorProfile] = $this->createProcessor();
        [$otherProcessor, $otherProcessorProfile] = $this->createProcessor();
        $tomato = AgriResource::query()->create(['name' => 'Tomato']);
        $squash = AgriResource::query()->create(['name' => 'Squash']);

        ProcessorProfileTransaction::query()->create([
            'user_id' => $processor->getKey(),
            'processor_profile_id' => $processorProfile->getKey(),
            'agri_resource_id' => $tomato->getKey(),
            'quantity' => 120,
            'price' => 40,
            'remarks' => 'For sauce production',
        ]);

        ProcessorProfileTransaction::query()->create([
            'user_id' => $processor->getKey(),
            'processor_profile_id' => $processorProfile->getKey(),
            'agri_resource_id' => $squash->getKey(),
            'quantity' => 80,
            'price' => 30,
            'remarks' => 'For soup packs',
        ]);

        ProcessorProfileTransaction::query()->create([
            'user_id' => $otherProcessor->getKey(),
            'processor_profile_id' => $otherProcessorProfile->getKey(),
            'agri_resource_id' => $squash->getKey(),
            'quantity' => 999,
            'price' => 1,
            'remarks' => 'Other processor record',
        ]);

        $response = $this->actingAs($processor)
            ->get(route('processors.dashboard'));

        $response->assertOk()->assertInertia(fn (Assert $page): Assert => $page
            ->component('Processor/DashboardIndex')
            ->where('processorProfile.business_name', $processorProfile->business_name)
            ->where('stats.total_demands', 2)
            ->where('stats.total_quantity', 200)
            ->where('stats.average_price', 35)
            ->has('recentDemands', 2)
            ->where('recentDemands.0.resource', 'Squash')
            ->where('recentDemands.1.resource', 'Tomato'));
    }

    public function test_processor_smart_demand_page_shows_ranked_farmer_resource_suggestions(): void
    {
        [$processor, $processorProfile] = $this->createProcessor();
        $farmer = User::factory()->create(['role' => 'farmer']);
        $tomato = AgriResource::query()->create(['name' => 'Tomato']);
        $cassava = AgriResource::query()->create(['name' => 'Cassava']);
        $farmerProfile = FarmerProfile::query()->create([
            'user_id' => $farmer->getKey(),
            'farm_name' => 'Green Valley Farm',
            'farm_complete_address' => 'Private Farm Address',
            'latitude' => 10.3157,
            'longitude' => 123.8854,
            'contact_number' => '09170000000',
        ]);

        ProcessorProfileTransaction::query()->create([
            'user_id' => $processor->getKey(),
            'processor_profile_id' => $processorProfile->getKey(),
            'agri_resource_id' => $tomato->getKey(),
            'quantity' => 100,
            'price' => 50,
            'remarks' => 'For sauce production',
        ]);

        ResourceListing::query()->create([
            'farmer_profile_id' => $farmerProfile->getKey(),
            'agri_resource_id' => $cassava->getKey(),
            'quantity' => 75,
            'havested_at' => now()->subDay(),
            'preservation_method' => 'Cleaned and packed',
            'price' => 25,
        ]);

        ResourceListing::query()->create([
            'farmer_profile_id' => $farmerProfile->getKey(),
            'agri_resource_id' => $tomato->getKey(),
            'quantity' => 125,
            'havested_at' => now()->subHours(6),
            'preservation_method' => 'Fresh crates',
            'price' => 45,
            'fresh_until' => now()->addDays(3),
            'freshness_status' => 'Fresh',
        ]);

        $response = $this->actingAs($processor)
            ->get(route('processors.smart-demands'));

        $response->assertOk()->assertInertia(fn (Assert $page): Assert => $page
            ->component('Processor/SmartDemand/SmartDemandIndex')
            ->where('processorProfile.business_name', $processorProfile->business_name)
            ->where('summary.posted_resources', 2)
            ->where('summary.matched_resources', 1)
            ->has('resources', 2)
            ->has('listings', 2)
            ->where('listings.0.resource', 'Tomato')
            ->where('listings.0.is_demand_match', true)
            ->where('listings.0.target_price', 50)
            ->missing('listings.0.contact_number')
            ->missing('listings.0.location')
            ->missing('listings.0.image_url'));
    }

    /** @return array{User, ProcessorProfile} */
    private function createProcessor(): array
    {
        $processor = User::factory()->create(['role' => 'processor']);
        $processorProfile = ProcessorProfile::query()->create([
            'user_id' => $processor->getKey(),
            'business_name' => 'Test Processing Center',
            'business_type' => 'Food processing',
            'complete_address' => 'Test Address',
            'contact_number' => '09171234567',
        ]);

        return [$processor, $processorProfile];
    }
}
