<?php

namespace Tests\Feature;

use App\Models\AgriResource;
use App\Models\ProcessorProfile;
use App\Models\ProcessorProfileTransaction;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
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
