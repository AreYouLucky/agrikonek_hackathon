<?php

namespace Database\Seeders;

use App\Models\AgriResource;
use App\Models\ProcessorProfileTransaction;
use App\Models\User;
use Illuminate\Database\Seeder;

class ProcessorProfileTransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $resourceIds = AgriResource::query()->pluck('id', 'name');

        foreach ($this->demandRows() as $email => $demands) {
            $processor = User::query()
                ->where('email', $email)
                ->where('role', 'processor')
                ->with('processorProfile')
                ->first();

            if (! $processor?->processorProfile) {
                continue;
            }

            foreach ($demands as $demand) {
                $resourceId = $resourceIds[$demand['resource']] ?? null;

                if ($resourceId === null) {
                    continue;
                }

                ProcessorProfileTransaction::query()->updateOrCreate(
                    [
                        'user_id' => $processor->getKey(),
                        'processor_profile_id' => $processor->processorProfile->getKey(),
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

    /**
     * @return array<string, array<int, array{resource: string, quantity: float|int, price: float|int, remarks: string}>>
     */
    private function demandRows(): array
    {
        return [
            'processor@agrikonek.test' => [
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
                [
                    'resource' => 'Eggplant',
                    'quantity' => 75,
                    'price' => 55,
                    'remarks' => 'For grilled vegetable processing trials.',
                ],
            ],
            'manufacturer@agrikonek.test' => [
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
            ],
            'processor.maria@agrikonek.test' => [
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
            'processor.juan@agrikonek.test' => [
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
            'processor.sunrise@agrikonek.test' => [
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
            'processor.bayan@agrikonek.test' => [
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
            'processor.luzon@agrikonek.test' => [
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
        ];
    }
}
