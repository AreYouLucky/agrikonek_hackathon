<?php

namespace Database\Seeders;

use App\Models\AgriResource;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class AgriResourceSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $resources = [
            'Ampalaya',
            'Squash',
            'Pechay (Native)',
            'Sitao',
            'Eggplant',
            'Tomato',
            'Cabbage (Scorpio)',
            'Carrots',
            'Habichuelas (Baguio Bean)',
            'White Potato',
            'Pechay (Baguio)',
            'Chayote',
            'Broccoli',
            'Cauliflower',
            'Bell Pepper (Green)',
            'Bell Pepper (Red)',
            'Celery',
            'Cabbage (Rare Ball)',
            'Cabbage (Wonder Ball)',
            'Lettuce (Green Ice)',
            'Lettuce (Iceberg)',
            'Lettuce (Romaine)',
            'Garlic(Imported)',
            'Garlic(Native)',
            'Ginger',
            'Red Onion',
            'Red Onion (Imported)',
            'White Onion',
            'White Onion (Imported)',
            'Chili (Red)',
        ];

        foreach ($resources as $resource) {
            AgriResource::updateOrCreate(
                ['name' => $resource],
                ['img' => null],
            );
        }
    }
}
