<?php

namespace Database\Seeders;

use App\Models\AgriResource;
use App\Models\FarmerProfile;
use App\Models\ProcessorProfile;
use App\Models\ProcessorProfileTransaction;
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
        $resourceIds = AgriResource::query()->pluck('id', 'name');

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

        $processorProfile = ProcessorProfile::query()->updateOrCreate(
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
        $this->seedProcessorDemandListings($processor, $processorProfile, $resourceIds, [
            [
                'resource' => 'Tomato',
                'quantity' => 150,
                'price' => 42,
                'remarks' => 'Needed for demo sauce production run.',
            ],
            [
                'resource' => 'Squash',
                'quantity' => 90,
                'price' => 30,
                'remarks' => 'Accepts slightly mature surplus squash.',
            ],
        ]);

        $manufacturer = User::query()->updateOrCreate(
            ['email' => 'manufacturer@agrikonek.test'],
            [
                'name' => 'Green Harvest Foods',
                'email_verified_at' => now(),
                'password' => $password,
                'role' => 'processor',
            ],
        );

        $manufacturerProfile = ProcessorProfile::query()->updateOrCreate(
            ['user_id' => $manufacturer->id],
            [
                'business_name' => 'Green Harvest Foods Manufacturing',
                'business_type' => 'Food Manufacturing',
                'complete_address' => 'Calamba, Laguna, Philippines',
                'latitude' => '14.2117',
                'longitude' => '121.1653',
                'contact_number' => '09171234569',
            ],
        );
        $this->seedProcessorDemandListings($manufacturer, $manufacturerProfile, $resourceIds, [
            [
                'resource' => 'Carrots',
                'quantity' => 220,
                'price' => 75,
                'remarks' => 'For mixed vegetable packs.',
            ],
            [
                'resource' => 'Bell Pepper (Red)',
                'quantity' => 70,
                'price' => 150,
                'remarks' => 'Can accept assorted sizes for slicing.',
            ],
        ]);

        $processorBusinesses = [
            [
                'email' => 'processor.maria@agrikonek.test',
                'name' => 'Maria Santos',
                'business_name' => 'Santos Veggie Chips',
                'business_type' => 'Snack Manufacturing',
                'complete_address' => 'Lipa City, Batangas, Philippines',
                'latitude' => '13.9411',
                'longitude' => '121.1631',
                'contact_number' => '09171234570',
                'demands' => [
                    [
                        'resource' => 'White Potato',
                        'quantity' => 180,
                        'price' => 88,
                        'remarks' => 'For veggie chips, medium to large sizes preferred.',
                    ],
                    [
                        'resource' => 'Chili (Red)',
                        'quantity' => 25,
                        'price' => 125,
                        'remarks' => 'For spicy snack seasoning batches.',
                    ],
                ],
            ],
            [
                'email' => 'processor.juan@agrikonek.test',
                'name' => 'Juan Dela Cruz',
                'business_name' => 'Dela Cruz Pickled Produce',
                'business_type' => 'Food Preservation',
                'complete_address' => 'San Pablo City, Laguna, Philippines',
                'latitude' => '14.0683',
                'longitude' => '121.3256',
                'contact_number' => '09171234571',
                'demands' => [
                    [
                        'resource' => 'Red Onion',
                        'quantity' => 120,
                        'price' => 85,
                        'remarks' => 'For pickled onion production.',
                    ],
                    [
                        'resource' => 'Garlic(Native)',
                        'quantity' => 40,
                        'price' => 210,
                        'remarks' => 'Native garlic preferred for stronger flavor.',
                    ],
                ],
            ],
            [
                'email' => 'processor.sunrise@agrikonek.test',
                'name' => 'Sunrise Canning Co.',
                'business_name' => 'Sunrise Canning Co.',
                'business_type' => 'Canning and Bottling',
                'complete_address' => 'Trece Martires, Cavite, Philippines',
                'latitude' => '14.2822',
                'longitude' => '120.8677',
                'contact_number' => '09171234572',
                'demands' => [
                    [
                        'resource' => 'Tomato',
                        'quantity' => 300,
                        'price' => 38,
                        'remarks' => 'Ripe tomatoes accepted for canned sauce.',
                    ],
                    [
                        'resource' => 'Bell Pepper (Green)',
                        'quantity' => 80,
                        'price' => 135,
                        'remarks' => 'For canned vegetable mix.',
                    ],
                ],
            ],
            [
                'email' => 'processor.bayan@agrikonek.test',
                'name' => 'Bayanihan Foods',
                'business_name' => 'Bayanihan Foods Processing',
                'business_type' => 'Frozen Food Processing',
                'complete_address' => 'Malolos, Bulacan, Philippines',
                'latitude' => '14.8527',
                'longitude' => '120.8160',
                'contact_number' => '09171234573',
                'demands' => [
                    [
                        'resource' => 'Broccoli',
                        'quantity' => 60,
                        'price' => 120,
                        'remarks' => 'For frozen vegetable packs.',
                    ],
                    [
                        'resource' => 'Cauliflower',
                        'quantity' => 75,
                        'price' => 115,
                        'remarks' => 'Can accept trimmed heads.',
                    ],
                ],
            ],
            [
                'email' => 'processor.luzon@agrikonek.test',
                'name' => 'Luzon Fresh Processors',
                'business_name' => 'Luzon Fresh Processors Inc.',
                'business_type' => 'Vegetable Processing',
                'complete_address' => 'Mabalacat, Pampanga, Philippines',
                'latitude' => '15.2230',
                'longitude' => '120.5736',
                'contact_number' => '09171234574',
                'demands' => [
                    [
                        'resource' => 'Pechay (Baguio)',
                        'quantity' => 140,
                        'price' => 58,
                        'remarks' => 'For washed and packed leafy vegetable lines.',
                    ],
                    [
                        'resource' => 'Cabbage (Wonder Ball)',
                        'quantity' => 160,
                        'price' => 52,
                        'remarks' => 'Surplus heads accepted if still firm.',
                    ],
                ],
            ],
        ];

        foreach ($processorBusinesses as $processorBusiness) {
            $processorUser = User::query()->updateOrCreate(
                ['email' => $processorBusiness['email']],
                [
                    'name' => $processorBusiness['name'],
                    'email_verified_at' => now(),
                    'password' => $password,
                    'role' => 'processor',
                ],
            );

            $processorProfile = ProcessorProfile::query()->updateOrCreate(
                ['user_id' => $processorUser->id],
                [
                    'business_name' => $processorBusiness['business_name'],
                    'business_type' => $processorBusiness['business_type'],
                    'complete_address' => $processorBusiness['complete_address'],
                    'latitude' => $processorBusiness['latitude'],
                    'longitude' => $processorBusiness['longitude'],
                    'contact_number' => $processorBusiness['contact_number'],
                ],
            );

            $this->seedProcessorDemandListings(
                $processorUser,
                $processorProfile,
                $resourceIds,
                $processorBusiness['demands'],
            );
        }

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

    /**
     * @param  array<string, int>  $resourceIds
     * @param  array<int, array{resource: string, quantity: float|int, price: float|int, remarks: string}>  $demands
     */
    private function seedProcessorDemandListings(
        User $processor,
        ProcessorProfile $processorProfile,
        $resourceIds,
        array $demands,
    ): void {
        foreach ($demands as $demand) {
            $resourceId = $resourceIds[$demand['resource']] ?? null;

            if ($resourceId === null) {
                continue;
            }

            ProcessorProfileTransaction::query()->updateOrCreate(
                [
                    'user_id' => $processor->id,
                    'processor_profile_id' => $processorProfile->id,
                    'agri_resource_id' => $resourceId,
                ],
                [
                    'quantity' => $demand['quantity'],
                    'price' => $demand['price'],
                    'remarks' => $demand['remarks'],
                ],
            );
        }
    }
}
