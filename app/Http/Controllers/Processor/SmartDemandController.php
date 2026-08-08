<?php

namespace App\Http\Controllers\Processor;

use App\Http\Controllers\Controller;
use App\Models\AgriResource;
use App\Models\ProcessorProfile;
use App\Models\ResourceListing;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class SmartDemandController extends Controller
{
    public function index(Request $request): Response
    {
        $processorProfile = $request->user()->processorProfile()->first();
        $demandContext = $this->demandContext($processorProfile);

        return Inertia::render('Processor/SmartDemand/SmartDemandIndex', [
            'processorProfile' => $processorProfile?->only([
                'business_name',
                'complete_address',
            ]),
            'resources' => AgriResource::query()
                ->select(['id', 'name'])
                ->orderBy('name')
                ->get(),
            'listings' => $this->farmerListings($processorProfile, $demandContext),
            'summary' => [
                'posted_resources' => ResourceListing::query()->count(),
                'matched_resources' => $demandContext['resource_ids']->count(),
            ],
        ]);
    }

    /**
     * @return array{resource_ids: Collection<int, int>, target_prices: Collection<int, float>}
     */
    private function demandContext(?ProcessorProfile $processorProfile): array
    {
        $demands = $processorProfile
            ? $processorProfile->resourceDemands()
                ->select(['agri_resource_id', 'price'])
                ->get()
            : collect();

        return [
            'resource_ids' => $demands->pluck('agri_resource_id')->unique()->values(),
            'target_prices' => $demands
                ->groupBy('agri_resource_id')
                ->map(fn ($items): float => (float) $items->max('price')),
        ];
    }

    /**
     * @param  array{resource_ids: Collection<int, int>, target_prices: Collection<int, float>}  $demandContext
     */
    private function farmerListings(?ProcessorProfile $processorProfile, array $demandContext): Collection
    {
        return ResourceListing::query()
            ->select([
                'id',
                'farmer_profile_id',
                'agri_resource_id',
                'quantity',
                'havested_at',
                'preservation_method',
                'price',
                'estimated_price',
                'fresh_until',
                'freshness_status',
                'created_at',
            ])
            ->with([
                'agriResource:id,name',
                'farmerProfile:id,farm_name,latitude,longitude',
            ])
            ->latest()
            ->limit(30)
            ->get()
            ->map(function (ResourceListing $listing) use ($processorProfile, $demandContext): array {
                $distance = $this->distanceInKilometers(
                    $processorProfile?->latitude,
                    $processorProfile?->longitude,
                    $listing->farmerProfile?->latitude,
                    $listing->farmerProfile?->longitude,
                );
                $targetPrice = $demandContext['target_prices']->get($listing->agri_resource_id);
                $isDemandMatch = $demandContext['resource_ids']->contains($listing->agri_resource_id);

                return [
                    'id' => $listing->getKey(),
                    'resource_id' => $listing->agri_resource_id,
                    'resource' => $listing->agriResource?->name ?? 'Unknown resource',
                    'farmer' => $listing->farmerProfile?->farm_name ?? 'Farmer listing',
                    'quantity' => $listing->quantity,
                    'price' => $listing->price,
                    'estimated_price' => $listing->estimated_price,
                    'target_price' => $targetPrice,
                    'distance_km' => $distance,
                    'harvested_at' => $listing->havested_at?->toFormattedDateString(),
                    'fresh_until' => $listing->fresh_until?->toFormattedDateString(),
                    'freshness_status' => $listing->freshness_status,
                    'preservation_method' => $listing->preservation_method,
                    'is_demand_match' => $isDemandMatch,
                    'match_score' => $this->matchScore($isDemandMatch, $targetPrice, $listing->price, $distance, $listing->fresh_until),
                    'posted_at' => $listing->created_at?->diffForHumans(),
                ];
            })
            ->sortByDesc('match_score')
            ->values();
    }

    private function matchScore(
        bool $isDemandMatch,
        mixed $targetPrice,
        mixed $listingPrice,
        ?float $distance,
        mixed $freshUntil,
    ): int {
        $score = $isDemandMatch ? 55 : 20;

        if (is_numeric($targetPrice) && is_numeric($listingPrice) && (float) $listingPrice <= (float) $targetPrice) {
            $score += 20;
        }

        if ($freshUntil && $freshUntil->isFuture()) {
            $score += 15;
        }

        if ($distance !== null && $distance <= 25) {
            $score += 10;
        }

        return min($score, 100);
    }

    private function distanceInKilometers(
        mixed $originLatitude,
        mixed $originLongitude,
        mixed $destinationLatitude,
        mixed $destinationLongitude,
    ): ?float {
        if (! is_numeric($originLatitude)
            || ! is_numeric($originLongitude)
            || ! is_numeric($destinationLatitude)
            || ! is_numeric($destinationLongitude)) {
            return null;
        }

        $earthRadius = 6371;
        $latitudeDifference = deg2rad((float) $destinationLatitude - (float) $originLatitude);
        $longitudeDifference = deg2rad((float) $destinationLongitude - (float) $originLongitude);
        $originLatitudeRadians = deg2rad((float) $originLatitude);
        $destinationLatitudeRadians = deg2rad((float) $destinationLatitude);
        $haversine = sin($latitudeDifference / 2) ** 2
            + cos($originLatitudeRadians)
            * cos($destinationLatitudeRadians)
            * sin($longitudeDifference / 2) ** 2;

        return round($earthRadius * 2 * atan2(sqrt($haversine), sqrt(1 - $haversine)), 1);
    }
}
