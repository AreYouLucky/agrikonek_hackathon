<?php

namespace Tests\Feature;

use App\Models\ProcessorProfileTransaction;
use App\Models\User;
use Database\Seeders\AgriResourceSeeder;
use Database\Seeders\DemoUserSeeder;
use Database\Seeders\ProcessorProfileTransactionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DemoUserSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_demo_user_seeder_creates_processor_profiles_and_demands(): void
    {
        $this->seed(AgriResourceSeeder::class);
        $this->seed(DemoUserSeeder::class);
        $this->seed(ProcessorProfileTransactionSeeder::class);

        $processors = User::query()
            ->where('role', 'processor')
            ->with('processorProfile')
            ->get();

        $this->assertCount(7, $processors);

        foreach ($processors as $processor) {
            $this->assertNotNull($processor->processorProfile);

            $this->assertGreaterThanOrEqual(
                2,
                ProcessorProfileTransaction::query()
                    ->where('user_id', $processor->getKey())
                    ->where('processor_profile_id', $processor->processorProfile->getKey())
                    ->count(),
            );
        }

        $this->assertSame(15, ProcessorProfileTransaction::query()->count());
    }
}
