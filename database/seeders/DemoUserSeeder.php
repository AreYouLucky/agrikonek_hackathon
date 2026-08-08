<?php

namespace Database\Seeders;

use App\Models\FarmerProfile;
use App\Models\ProcessorProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $password = Hash::make('aaaaaaaa');

        $farmer = User::query()->updateOrCreate(
            ['email' => 'farmer@agrikonek.test'],
            [
                'name' => 'Demo Farmer',
                'email_verified_at' => now(),
                'password' => $password,
                'role' => 'farmer',
            ],
        );

        FarmerProfile::query()->updateOrCreate(
            ['user_id' => $farmer->id],
            [
                'farm_name' => 'Demo Sustainable Farm',
                'farm_complete_address' => 'Barangay Demo, Philippines',
                'latitude' => '14.5995',
                'longitude' => '120.9842',
                'contact_number' => '09171234567',
            ],
        );

        $processor = User::query()->updateOrCreate(
            ['email' => 'processor@agrikonek.test'],
            [
                'name' => 'Demo Processor',
                'email_verified_at' => now(),
                'password' => $password,
                'role' => 'processor',
            ],
        );

        ProcessorProfile::query()->updateOrCreate(
            ['user_id' => $processor->id],
            [
                'business_name' => 'Demo Processing Center',
                'business_type' => 'Agricultural Processing',
                'complete_address' => 'Barangay Demo, Philippines',
                'latitude' => '14.6091',
                'longitude' => '121.0223',
                'contact_number' => '09171234568',
            ],
        );

        User::query()->updateOrCreate(
            ['email' => 'lgu@agrikonek.test'],
            [
                'name' => 'Demo LGU',
                'email_verified_at' => now(),
                'password' => $password,
                'role' => 'lgu',
            ],
        );
    }
}
