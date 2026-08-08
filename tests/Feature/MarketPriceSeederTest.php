<?php

namespace Tests\Feature;

use App\Models\AgriResource;
use App\Models\MarketPrice;
use Database\Seeders\AgriResourceSeeder;
use Database\Seeders\MarketPriceSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MarketPriceSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_market_price_seeders_import_sheet_two_data(): void
    {
        $this->seed(AgriResourceSeeder::class);
        $this->seed(MarketPriceSeeder::class);

        $this->assertDatabaseHas('agri_resources', [
            'name' => 'Ampalaya',
            'img' => null,
        ]);

        $this->assertDatabaseHas('market_prices', [
            'agri_resource_id' => AgriResource::where('name', 'Ampalaya')->value('id'),
            'specifications' => '4-5 PCS/KG',
            'province' => null,
            'region' => 'NCR',
            'market' => 'COMMONWEALTH MARKET',
            'price' => 140,
        ]);

        $this->assertDatabaseHas('market_prices', [
            'agri_resource_id' => AgriResource::where('name', 'Ginger')->value('id'),
            'specifications' => 'FAIRLY WELL-MATURED, MEDIUM (150-300 GM)',
            'province' => null,
            'region' => 'NCR',
            'market' => 'NEW LAS PINAS CITY PUBLIC MARKET',
            'price' => 190,
        ]);

        $this->assertSame(30, AgriResource::count());
        $this->assertSame(768, MarketPrice::count());
    }
}
