<?php

namespace App\Services;

use App\Models\AgriResource;
use App\Models\FarmerProfile;
use App\Models\ProcessorProfile;
use Illuminate\Support\Collection;

class NearbyProcessorSuggestionService
{
    /**
     * @return array{farmer_location: string, processors: Collection<int, array{id: int, business_name: string, business_type: string, complete_address: string, contact_number: string, distance_km: float|null, has_bought_resource: bool, matching_transactions_count: int}>}
     */
    public function suggest(AgriResource $resource, FarmerProfile $farmerProfile): array
    {
        $processors = ProcessorProfile::query()
            ->select([
                'id',
                'business_name',
                'business_type',
                'complete_address',
                'contact_number',
                'latitude',
                'longitude',
            ])
            ->withCount(['transactions as matching_transactions_count' => fn ($query) => $query
                ->whereHas('resourceListing', fn ($listingQuery) => $listingQuery
                    ->where('agri_resource_id', $resource->getKey()))])
            ->get()
            ->map(function (ProcessorProfile $processor) use ($farmerProfile): array {
                $distance = $this->distanceInKilometers(
                    $farmerProfile->latitude,
                    $farmerProfile->longitude,
                    $processor->latitude,
                    $processor->longitude,
                );

                return [
                    'id' => $processor->getKey(),
                    'business_name' => $processor->business_name,
                    'business_type' => $processor->business_type,
                    'complete_address' => $processor->complete_address,
                    'contact_number' => $processor->contact_number,
                    'distance_km' => $distance,
                    'has_bought_resource' => $processor->matching_transactions_count > 0,
                    'matching_transactions_count' => $processor->matching_transactions_count,
                ];
            })
            ->sort(function (array $first, array $second): int {
                $historyComparison = $second['matching_transactions_count'] <=> $first['matching_transactions_count'];

                if ($historyComparison !== 0) {
                    return $historyComparison;
                }

                return ($first['distance_km'] ?? PHP_FLOAT_MAX)
                    <=> ($second['distance_km'] ?? PHP_FLOAT_MAX);
            })
            ->take(8)
            ->values();

        return [
            'farmer_location' => $farmerProfile->farm_complete_address,
            'processors' => $processors,
        ];
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
