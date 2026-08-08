<?php

namespace Database\Seeders;

use App\Models\AgriResource;
use App\Models\FarmerProfile;
use App\Models\ProcessorProfile;
use App\Models\ProcessorProfileTransaction;
use App\Models\ResourceListing;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
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

        $farmers = [
            [
                'email' => 'farmer@agrikonek.test',
                'name' => 'Demo Farmer',
                'farm_name' => 'Demo Sustainable Farm',
                'farm_complete_address' => 'Barangay Demo, Philippines',
                'latitude' => '14.5995',
                'longitude' => '120.9842',
                'contact_number' => '09171234567',
                'listings' => [
                    [
                        'resource' => 'Tomato',
                        'quantity' => 180,
                        'harvested_at' => now()->subHours(8),
                        'preservation_method' => 'Fresh crates',
                        'price' => 35,
                        'estimated_price' => 38,
                        'fresh_until' => now()->addDays(3),
                        'freshness_status' => 'Fresh',
                        'ai_analysis_message' => 'Good for sauce processing or same-week market resale.',
                    ],
                    [
                        'resource' => 'Squash',
                        'quantity' => 120,
                        'harvested_at' => now()->subDay(),
                        'preservation_method' => 'Cleaned and sorted',
                        'price' => 24,
                        'estimated_price' => 28,
                        'fresh_until' => now()->addDays(8),
                        'freshness_status' => 'Stable',
                        'ai_analysis_message' => 'Suitable for puree, soup packs, and livestock feed recovery if overstocked.',
                    ],
                ],
            ],
            [
                'email' => 'farmer.ana@agrikonek.test',
                'name' => 'Ana Reyes',
                'farm_name' => 'Reyes Highland Vegetables',
                'farm_complete_address' => 'La Trinidad, Benguet, Philippines',
                'latitude' => '16.4556',
                'longitude' => '120.5878',
                'contact_number' => '09171234580',
                'listings' => [
                    [
                        'resource' => 'Carrots',
                        'quantity' => 95,
                        'harvested_at' => now()->subHours(12),
                        'preservation_method' => 'Washed and packed',
                        'price' => 62,
                        'estimated_price' => 68,
                        'fresh_until' => now()->addDays(6),
                        'freshness_status' => 'Fresh',
                        'ai_analysis_message' => 'Strong match for processors making frozen vegetable mixes.',
                    ],
                    [
                        'resource' => 'Pechay (Baguio)',
                        'quantity' => 70,
                        'harvested_at' => now()->subHours(5),
                        'preservation_method' => 'Bundled and shaded',
                        'price' => 42,
                        'estimated_price' => 48,
                        'fresh_until' => now()->addDays(2),
                        'freshness_status' => 'Very fresh',
                        'ai_analysis_message' => 'Best moved quickly to processors needing leafy vegetable packs.',
                    ],
                ],
            ],
            [
                'email' => 'farmer.mang-ben@agrikonek.test',
                'name' => 'Benjamin Cruz',
                'farm_name' => 'Cruz Lowland Produce Farm',
                'farm_complete_address' => 'San Jose City, Nueva Ecija, Philippines',
                'latitude' => '15.7901',
                'longitude' => '120.9919',
                'contact_number' => '09171234581',
                'listings' => [
                    [
                        'resource' => 'Red Onion',
                        'quantity' => 150,
                        'harvested_at' => now()->subDays(2),
                        'preservation_method' => 'Cured and netted sacks',
                        'price' => 72,
                        'estimated_price' => 80,
                        'fresh_until' => now()->addDays(20),
                        'freshness_status' => 'Cured',
                        'ai_analysis_message' => 'Good candidate for pickling, dehydration, and seasoning processors.',
                    ],
                    [
                        'resource' => 'Eggplant',
                        'quantity' => 110,
                        'harvested_at' => now()->subHours(10),
                        'preservation_method' => 'Ventilated baskets',
                        'price' => 30,
                        'estimated_price' => 35,
                        'fresh_until' => now()->addDays(3),
                        'freshness_status' => 'Fresh',
                        'ai_analysis_message' => 'Can be matched with processors making vegetable mixes or preserved products.',
                    ],
                ],
            ],
        ];

        foreach ($farmers as $farmerData) {
            $farmer = User::query()->updateOrCreate(
                ['email' => $farmerData['email']],
                [
                    'name' => $farmerData['name'],
                    'email_verified_at' => now(),
                    'password' => $password,
                    'role' => 'farmer',
                ],
            );

            FarmerProfile::query()->updateOrCreate(
                ['user_id' => $farmer->id],
                [
                    'farm_name' => $farmerData['farm_name'],
                    'farm_complete_address' => $farmerData['farm_complete_address'],
                    'latitude' => $farmerData['latitude'],
                    'longitude' => $farmerData['longitude'],
                    'contact_number' => $farmerData['contact_number'],
                ],
            );

            $farmerProfile = $farmer->farmerProfile()->firstOrFail();

            $this->seedFarmerResourceListings(
                $farmerProfile,
                $resourceIds,
                $farmerData['listings'],
            );
        }

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

    /**
     * @param  array<string, int>  $resourceIds
     * @param  array<int, array{resource: string, quantity: float|int, harvested_at: Carbon, preservation_method: string, price: float|int, estimated_price: float|int, fresh_until: Carbon, freshness_status: string, ai_analysis_message: string}>  $listings
     */
    private function seedFarmerResourceListings(
        FarmerProfile $farmerProfile,
        $resourceIds,
        array $listings,
    ): void {
        foreach ($listings as $listing) {
            $resourceId = $resourceIds[$listing['resource']] ?? null;

            if ($resourceId === null) {
                continue;
            }

            ResourceListing::query()->updateOrCreate(
                [
                    'farmer_profile_id' => $farmerProfile->id,
                    'agri_resource_id' => $resourceId,
                ],
                [
                    'quantity' => $listing['quantity'],
                    'havested_at' => $listing['harvested_at'],
                    'preservation_method' => $listing['preservation_method'],
                    'price' => $listing['price'],
                    'estimated_price' => $listing['estimated_price'],
                    'fresh_until' => $listing['fresh_until'],
                    'freshness_status' => $listing['freshness_status'],
                    'ai_analysis_message' => $listing['ai_analysis_message'],
                ],
            );
        }
    }
}
