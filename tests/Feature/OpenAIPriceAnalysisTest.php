<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Http\Client\Request as ClientRequest;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class OpenAIPriceAnalysisTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_farmer_can_analyze_listing_price_with_market_context(): void
    {
        Http::preventStrayRequests();
        Http::fake([
            'api.openai.com/*' => Http::response([
                'output' => [[
                    'type' => 'message',
                    'content' => [[
                        'type' => 'output_text',
                        'text' => json_encode([
                            'estimated_price' => 42.5,
                            'fresh_until' => '2026-08-15',
                            'freshness_status' => 'fresh',
                            'message' => 'Price aligns with nearby verified market data.',
                        ]),
                    ]],
                ]],
            ]),
        ]);
        $farmer = User::factory()->create(['role' => 'farmer']);

        $response = $this->actingAs($farmer)->postJson(
            route('ai.analyze-crop-price'),
            [
                'name' => 'Rice Husk',
                'weight' => 50,
                'harvested_at' => '2026-08-08',
                'preservation_method' => 'dried',
                'price' => 45,
                'farmer_location' => 'Quezon City, Metro Manila',
                'market_area' => 'NCR',
                'market_average' => 42,
                'market_minimum' => 38,
                'market_maximum' => 48,
            ],
        );

        $response->assertOk()->assertExactJson([
            'estimated_price' => 42.5,
            'fresh_until' => '2026-08-15',
            'freshness_status' => 'fresh',
            'message' => 'Price aligns with nearby verified market data.',
        ]);

        Http::assertSent(fn (ClientRequest $request): bool => str_contains(
            $request->body(),
            'Quezon City, Metro Manila',
        ) && str_contains($request->body(), 'market_average'));
    }

    public function test_price_analysis_requires_an_authenticated_farmer_and_valid_listing_data(): void
    {
        $payload = [
            'name' => 'Rice Husk',
            'weight' => 0,
            'harvested_at' => 'invalid-date',
            'preservation_method' => 'dried',
            'price' => 0,
        ];

        $this->postJson(route('ai.analyze-crop-price'), $payload)
            ->assertUnauthorized();

        $farmer = User::factory()->create(['role' => 'farmer']);

        $this->actingAs($farmer)
            ->postJson(route('ai.analyze-crop-price'), $payload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['weight', 'harvested_at', 'price']);
    }
}
