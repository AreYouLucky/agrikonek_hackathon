<?php

namespace App\Services;

use App\Models\AgriResource;
use App\Models\FarmerProfile;
use App\Models\MarketPrice;
use Illuminate\Support\Collection;
use Illuminate\Support\Str;
use Throwable;

class MarketPriceRecommendationService
{
    public function __construct(private OpenAIService $openAI) {}

    /**
     * @return array{
     *     recommended_price: float|null,
     *     average_price: float|null,
     *     minimum_price: float|null,
     *     maximum_price: float|null,
     *     farmer_location: string,
     *     market_area: string|null,
     *     market_count: int,
     *     match_type: string,
     *     message: string
     * }
     */
    public function recommend(AgriResource $resource, FarmerProfile $farmerProfile): array
    {
        $marketPrices = MarketPrice::query()
            ->whereBelongsTo($resource)
            ->select([
                'market',
                'province',
                'region',
                'latitude',
                'longitude',
                'price',
            ])
            ->get();

        if ($marketPrices->isEmpty()) {
            return $this->withoutMarketData($farmerProfile);
        }

        [$comparablePrices, $matchType] = $this->matchPricesToLocation(
            $marketPrices,
            $farmerProfile,
        );

        $minimumPrice = round((float) $comparablePrices->min('price'), 2);
        $maximumPrice = round((float) $comparablePrices->max('price'), 2);
        $averagePrice = round((float) $comparablePrices->avg('price'), 2);
        $marketArea = $this->marketArea($comparablePrices);

        $context = [
            'resource' => $resource->name,
            'farmer_location' => $farmerProfile->farm_complete_address,
            'location_match' => $matchType,
            'market_area' => $marketArea,
            'market_price_per_kg' => [
                'minimum' => $minimumPrice,
                'average' => $averagePrice,
                'maximum' => $maximumPrice,
            ],
            'sample_markets' => $comparablePrices
                ->sortBy(fn (MarketPrice $price): float => abs($price->price - $averagePrice))
                ->take(6)
                ->map(fn (MarketPrice $price): array => [
                    'market' => $price->market,
                    'price' => $price->price,
                ])
                ->values()
                ->all(),
        ];

        try {
            $aiRecommendation = $this->openAI->recommendMarketPrice($context);
        } catch (Throwable $exception) {
            report($exception);
            $aiRecommendation = [
                'recommended_price' => null,
                'message' => null,
            ];
        }

        $recommendedPrice = $aiRecommendation['recommended_price'];

        if (
            $recommendedPrice === null
            || $recommendedPrice < $minimumPrice
            || $recommendedPrice > $maximumPrice
        ) {
            $recommendedPrice = $averagePrice;
        }

        $message = $aiRecommendation['message']
            ?? $this->fallbackMessage($matchType, $marketArea);

        return [
            'recommended_price' => round($recommendedPrice, 2),
            'average_price' => $averagePrice,
            'minimum_price' => $minimumPrice,
            'maximum_price' => $maximumPrice,
            'farmer_location' => $farmerProfile->farm_complete_address,
            'market_area' => $marketArea,
            'market_count' => $comparablePrices->count(),
            'match_type' => $matchType,
            'message' => $message,
        ];
    }

    /**
     * @param  Collection<int, MarketPrice>  $marketPrices
     * @return array{Collection<int, MarketPrice>, string}
     */
    private function matchPricesToLocation(
        Collection $marketPrices,
        FarmerProfile $farmerProfile,
    ): array {
        $nearestPrices = $this->nearestCoordinatePrices($marketPrices, $farmerProfile);

        if ($nearestPrices->isNotEmpty()) {
            return [$nearestPrices, 'nearest_location'];
        }

        $address = Str::lower($farmerProfile->farm_complete_address);
        $locationMatches = $marketPrices
            ->filter(fn (MarketPrice $price): bool => $this->matchesAddress($price, $address))
            ->values();

        if ($locationMatches->isNotEmpty()) {
            return [$locationMatches, 'location_match'];
        }

        return [$marketPrices->values(), 'regional_fallback'];
    }

    /**
     * @param  Collection<int, MarketPrice>  $marketPrices
     * @return Collection<int, MarketPrice>
     */
    private function nearestCoordinatePrices(
        Collection $marketPrices,
        FarmerProfile $farmerProfile,
    ): Collection {
        if (! is_numeric($farmerProfile->latitude) || ! is_numeric($farmerProfile->longitude)) {
            return collect();
        }

        return $marketPrices
            ->filter(fn (MarketPrice $price): bool => is_numeric($price->latitude)
                && is_numeric($price->longitude))
            ->sortBy(fn (MarketPrice $price): float => $this->distanceInKilometers(
                (float) $farmerProfile->latitude,
                (float) $farmerProfile->longitude,
                (float) $price->latitude,
                (float) $price->longitude,
            ))
            ->take(5)
            ->values();
    }

    private function matchesAddress(MarketPrice $marketPrice, string $address): bool
    {
        foreach ([$marketPrice->province, $marketPrice->region] as $location) {
            if ($location !== null && Str::contains($address, Str::lower($location))) {
                return true;
            }
        }

        if ($marketPrice->region !== 'NCR') {
            return false;
        }

        return Str::contains($address, [
            'ncr',
            'metro manila',
            'manila',
            'quezon city',
            'caloocan',
            'las pinas',
            'las piñas',
            'makati',
            'malabon',
            'mandaluyong',
            'marikina',
            'muntinlupa',
            'navotas',
            'paranaque',
            'parañaque',
            'pasay',
            'pasig',
            'pateros',
            'san juan',
            'taguig',
            'valenzuela',
        ]);
    }

    /** @param Collection<int, MarketPrice> $marketPrices */
    private function marketArea(Collection $marketPrices): ?string
    {
        return $marketPrices->pluck('province')->filter()->first()
            ?? $marketPrices->pluck('region')->filter()->first()
            ?? $marketPrices->pluck('market')->filter()->first();
    }

    private function fallbackMessage(string $matchType, ?string $marketArea): string
    {
        $area = $marketArea ?? 'available regional';

        if ($matchType === 'regional_fallback') {
            return "No exact local match was found, so this uses {$area} market prices.";
        }

        return "Recommended from market prices matched to your location in {$area}.";
    }

    /**
     * @return array{
     *     recommended_price: null,
     *     average_price: null,
     *     minimum_price: null,
     *     maximum_price: null,
     *     farmer_location: string,
     *     market_area: null,
     *     market_count: int,
     *     match_type: string,
     *     message: string
     * }
     */
    private function withoutMarketData(FarmerProfile $farmerProfile): array
    {
        return [
            'recommended_price' => null,
            'average_price' => null,
            'minimum_price' => null,
            'maximum_price' => null,
            'farmer_location' => $farmerProfile->farm_complete_address,
            'market_area' => null,
            'market_count' => 0,
            'match_type' => 'no_market_data',
            'message' => 'No verified market prices are available for this resource yet.',
        ];
    }

    private function distanceInKilometers(
        float $fromLatitude,
        float $fromLongitude,
        float $toLatitude,
        float $toLongitude,
    ): float {
        $latitudeDistance = deg2rad($toLatitude - $fromLatitude);
        $longitudeDistance = deg2rad($toLongitude - $fromLongitude);
        $fromLatitudeRadians = deg2rad($fromLatitude);
        $toLatitudeRadians = deg2rad($toLatitude);

        $haversine = sin($latitudeDistance / 2) ** 2
            + cos($fromLatitudeRadians)
            * cos($toLatitudeRadians)
            * sin($longitudeDistance / 2) ** 2;

        return 6371 * 2 * asin(min(1, sqrt($haversine)));
    }
}
