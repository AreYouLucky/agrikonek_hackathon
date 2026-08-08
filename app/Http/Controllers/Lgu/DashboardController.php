<?php

namespace App\Http\Controllers\Lgu;

use App\Http\Controllers\Controller;
use App\Models\AgriResource;
use App\Models\FarmerProfile;
use App\Models\MarketPrice;
use App\Models\ProcessorProfile;
use App\Models\ProcessorProfileTransaction;
use App\Models\ResourceListing;
use App\Models\Transaction;
use App\Services\OpenAIService;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class DashboardController extends Controller
{
    public function index(OpenAIService $openAI): Response
    {
        $resourceNames = AgriResource::query()
            ->orderBy('name')
            ->pluck('name', 'id');
        $supplyListings = $this->supplyListings();
        $processorDemands = $this->processorDemands();
        $utilizedTransactions = $this->utilizedTransactions();
        $marketPrices = $this->marketPrices();

        $supplyByResource = $this->supplyByResource($supplyListings);
        $demandByResource = $this->demandByResource($processorDemands);
        $utilizedByResource = $this->utilizedByResource($utilizedTransactions);
        $gapRows = $this->gapRows($resourceNames, $supplyByResource, $demandByResource);
        $topResources = $this->topResources($resourceNames, $supplyByResource, $demandByResource, $utilizedByResource);
        $overview = $this->overview($supplyListings, $processorDemands, $utilizedTransactions, $gapRows);
        $analysisContext = [
            'overview' => $overview,
            'top_gaps' => $gapRows->take(5)->values(),
            'top_resources' => $topResources->take(5)->values(),
        ];

        return Inertia::render('Lgu/Dashboard', [
            'overview' => $overview,
            'supplyDemandGaps' => $gapRows->take(8)->values(),
            'topResources' => $topResources->take(8)->values(),
            'marketPrices' => $this->marketPriceRows($marketPrices)->take(8)->values(),
            'geoDistribution' => $this->geoDistribution(),
            'recentListings' => $this->recentListings(),
            'recentTransactions' => $this->recentTransactions(),
            'aiInsight' => $this->aiInsight($analysisContext, $openAI),
        ]);
    }

    private function supplyListings(): Collection
    {
        return ResourceListing::query()
            ->select([
                'id',
                'farmer_profile_id',
                'agri_resource_id',
                'quantity',
                'price',
                'fresh_until',
                'freshness_status',
                'created_at',
            ])
            ->with([
                'agriResource:id,name',
                'farmerProfile:id,farm_name,farm_complete_address,latitude,longitude',
            ])
            ->get();
    }

    private function processorDemands(): Collection
    {
        return ProcessorProfileTransaction::query()
            ->select([
                'id',
                'processor_profile_id',
                'agri_resource_id',
                'quantity',
                'price',
                'created_at',
            ])
            ->with([
                'agriResource:id,name',
                'processorProfile:id,business_name,business_type,complete_address,latitude,longitude',
            ])
            ->get();
    }

    private function utilizedTransactions(): Collection
    {
        return Transaction::query()
            ->select([
                'id',
                'processor_profile_id',
                'resource_listing_id',
                'quantity',
                'price',
                'status',
                'created_at',
                'updated_at',
            ])
            ->whereIn('status', ['accepted', 'completed', 'delivered', 'fulfilled'])
            ->with([
                'processorProfile:id,business_name,business_type',
                'resourceListing:id,agri_resource_id,farmer_profile_id',
                'resourceListing.agriResource:id,name',
                'resourceListing.farmerProfile:id,farm_name',
            ])
            ->get();
    }

    private function marketPrices(): Collection
    {
        return MarketPrice::query()
            ->select([
                'id',
                'agri_resource_id',
                'market',
                'province',
                'region',
                'price',
            ])
            ->with('agriResource:id,name')
            ->get();
    }

    private function supplyByResource(Collection $supplyListings): Collection
    {
        return $supplyListings
            ->groupBy('agri_resource_id')
            ->map(fn ($items): array => [
                'quantity' => round((float) $items->sum('quantity'), 2),
                'estimated_value' => round((float) $items->sum(fn ($item): float => (float) $item->quantity * (float) $item->price), 2),
                'listings_count' => $items->count(),
            ]);
    }

    private function demandByResource(Collection $processorDemands): Collection
    {
        return $processorDemands
            ->groupBy('agri_resource_id')
            ->map(fn ($items): array => [
                'quantity' => round((float) $items->sum('quantity'), 2),
                'average_price' => round((float) $items->avg('price'), 2),
                'demand_count' => $items->count(),
            ]);
    }

    private function utilizedByResource(Collection $utilizedTransactions): Collection
    {
        return $utilizedTransactions
            ->groupBy(fn (Transaction $transaction): ?int => $transaction->resourceListing?->agri_resource_id)
            ->filter(fn ($items, $resourceId): bool => $resourceId !== null)
            ->map(fn ($items): array => [
                'quantity' => round((float) $items->sum('quantity'), 2),
                'income' => round((float) $items->sum(fn ($transaction): float => (float) $transaction->quantity * (float) $transaction->price), 2),
                'transaction_count' => $items->count(),
            ]);
    }

    private function gapRows(Collection $resourceNames, Collection $supplyByResource, Collection $demandByResource): Collection
    {
        return $resourceNames
            ->map(function (string $resourceName, int $resourceId) use ($supplyByResource, $demandByResource): array {
                $supplyQuantity = $supplyByResource->get($resourceId)['quantity'] ?? 0;
                $demandQuantity = $demandByResource->get($resourceId)['quantity'] ?? 0;
                $gap = round($supplyQuantity - $demandQuantity, 2);

                return [
                    'resource' => $resourceName,
                    'supply_quantity' => $supplyQuantity,
                    'demand_quantity' => $demandQuantity,
                    'gap_quantity' => $gap,
                    'status' => $gap < 0 ? 'Shortage' : ($gap > 0 ? 'Surplus' : 'Balanced'),
                ];
            })
            ->filter(fn (array $row): bool => $row['supply_quantity'] > 0 || $row['demand_quantity'] > 0)
            ->sort(function (array $first, array $second): int {
                $firstPriority = $first['gap_quantity'] < 0 ? 0 : 1;
                $secondPriority = $second['gap_quantity'] < 0 ? 0 : 1;

                if ($firstPriority !== $secondPriority) {
                    return $firstPriority <=> $secondPriority;
                }

                return abs($second['gap_quantity']) <=> abs($first['gap_quantity']);
            })
            ->values();
    }

    private function topResources(Collection $resourceNames, Collection $supplyByResource, Collection $demandByResource, Collection $utilizedByResource): Collection
    {
        return $resourceNames
            ->map(function (string $resourceName, int $resourceId) use ($supplyByResource, $demandByResource, $utilizedByResource): array {
                $supplyQuantity = $supplyByResource->get($resourceId)['quantity'] ?? 0;
                $demandQuantity = $demandByResource->get($resourceId)['quantity'] ?? 0;
                $utilizedQuantity = $utilizedByResource->get($resourceId)['quantity'] ?? 0;

                return [
                    'resource' => $resourceName,
                    'supply_quantity' => $supplyQuantity,
                    'demand_quantity' => $demandQuantity,
                    'utilized_quantity' => $utilizedQuantity,
                    'activity_score' => round($supplyQuantity + $demandQuantity + $utilizedQuantity, 2),
                ];
            })
            ->filter(fn (array $row): bool => $row['activity_score'] > 0)
            ->sortByDesc('activity_score')
            ->values();
    }

    private function overview(Collection $supplyListings, Collection $processorDemands, Collection $utilizedTransactions, Collection $gapRows): array
    {
        $availableSupply = round((float) $supplyListings->sum('quantity'), 2);
        $currentDemand = round((float) $processorDemands->sum('quantity'), 2);
        $utilizedQuantity = round((float) $utilizedTransactions->sum('quantity'), 2);
        $generatedIncome = round((float) $utilizedTransactions->sum(fn (Transaction $transaction): float => (float) $transaction->quantity * (float) $transaction->price), 2);
        $potentialSupplyValue = round((float) $supplyListings->sum(fn (ResourceListing $listing): float => (float) $listing->quantity * (float) $listing->price), 2);
        $totalCircularQuantity = $availableSupply + $utilizedQuantity;

        return [
            'surplus_utilized_kg' => $utilizedQuantity,
            'estimated_income' => $generatedIncome,
            'available_supply_kg' => $availableSupply,
            'processor_demand_kg' => $currentDemand,
            'supply_gap_kg' => round($availableSupply - $currentDemand, 2),
            'waste_diverted_kg' => $utilizedQuantity,
            'potential_waste_diversion_kg' => $availableSupply,
            'potential_supply_value' => $potentialSupplyValue,
            'utilization_rate' => $totalCircularQuantity > 0
                ? round(($utilizedQuantity / $totalCircularQuantity) * 100, 1)
                : 0,
            'active_supply_listings' => $supplyListings->count(),
            'active_processor_demands' => $processorDemands->count(),
            'resource_shortages' => $gapRows->where('status', 'Shortage')->count(),
            'resource_surpluses' => $gapRows->where('status', 'Surplus')->count(),
        ];
    }

    private function marketPriceRows(Collection $marketPrices): Collection
    {
        return $marketPrices
            ->groupBy('agri_resource_id')
            ->map(fn ($items): array => [
                'resource' => $items->first()->agriResource?->name ?? 'Unknown resource',
                'average_price' => round((float) $items->avg('price'), 2),
                'minimum_price' => round((float) $items->min('price'), 2),
                'maximum_price' => round((float) $items->max('price'), 2),
                'markets_count' => $items->count(),
                'area' => $items->pluck('province')->filter()->first()
                    ?? $items->pluck('region')->filter()->first()
                    ?? 'Market data',
            ])
            ->sortBy('resource')
            ->values();
    }

    private function geoDistribution(): array
    {
        $farmerLocations = FarmerProfile::query()
            ->select(['id', 'farm_name', 'farm_complete_address', 'latitude', 'longitude'])
            ->with('resourceListings:id,farmer_profile_id,quantity')
            ->get()
            ->map(fn (FarmerProfile $profile): array => [
                'type' => 'Supply',
                'name' => $profile->farm_name,
                'address' => $profile->farm_complete_address,
                'latitude' => $profile->latitude,
                'longitude' => $profile->longitude,
                'quantity_kg' => round((float) $profile->resourceListings->sum('quantity'), 2),
                'records_count' => $profile->resourceListings->count(),
            ]);

        $processorLocations = ProcessorProfile::query()
            ->select(['id', 'business_name', 'complete_address', 'latitude', 'longitude'])
            ->with('resourceDemands:id,processor_profile_id,quantity')
            ->get()
            ->map(fn (ProcessorProfile $profile): array => [
                'type' => 'Demand',
                'name' => $profile->business_name,
                'address' => $profile->complete_address,
                'latitude' => $profile->latitude,
                'longitude' => $profile->longitude,
                'quantity_kg' => round((float) $profile->resourceDemands->sum('quantity'), 2),
                'records_count' => $profile->resourceDemands->count(),
            ]);

        return [
            'supply' => $farmerLocations->values(),
            'demand' => $processorLocations->values(),
        ];
    }

    private function recentListings(): Collection
    {
        return ResourceListing::query()
            ->select(['id', 'farmer_profile_id', 'agri_resource_id', 'quantity', 'price', 'freshness_status', 'created_at'])
            ->with([
                'agriResource:id,name',
                'farmerProfile:id,farm_name',
            ])
            ->latest()
            ->limit(6)
            ->get()
            ->map(fn (ResourceListing $listing): array => [
                'id' => $listing->getKey(),
                'resource' => $listing->agriResource?->name ?? 'Unknown resource',
                'source' => $listing->farmerProfile?->farm_name ?? 'Farmer listing',
                'quantity' => $listing->quantity,
                'price' => $listing->price,
                'status' => $listing->freshness_status ?? 'Available',
                'posted_at' => $listing->created_at?->diffForHumans(),
            ]);
    }

    private function recentTransactions(): Collection
    {
        return Transaction::query()
            ->select(['id', 'processor_profile_id', 'resource_listing_id', 'quantity', 'price', 'status', 'updated_at'])
            ->with([
                'processorProfile:id,business_name',
                'resourceListing:id,agri_resource_id,farmer_profile_id',
                'resourceListing.agriResource:id,name',
                'resourceListing.farmerProfile:id,farm_name',
            ])
            ->latest('updated_at')
            ->limit(6)
            ->get()
            ->map(fn (Transaction $transaction): array => [
                'id' => $transaction->getKey(),
                'resource' => $transaction->resourceListing?->agriResource?->name ?? 'Unknown resource',
                'farmer' => $transaction->resourceListing?->farmerProfile?->farm_name ?? 'Farmer',
                'processor' => $transaction->processorProfile?->business_name ?? 'Processor',
                'quantity' => $transaction->quantity,
                'price' => $transaction->price,
                'status' => $transaction->status,
                'updated_at' => $transaction->updated_at?->diffForHumans(),
            ]);
    }

    private function aiInsight(array $analysisContext, OpenAIService $openAI): array
    {
        if (blank(config('services.openai.key'))) {
            return $this->computedInsight($analysisContext);
        }

        $cacheKey = 'lgu-dashboard-ai-insight-'.md5(json_encode($analysisContext));

        try {
            return Cache::remember($cacheKey, now()->addMinutes(10), function () use ($analysisContext, $openAI): array {
                $answer = $openAI->prompt($this->aiPrompt($analysisContext));
                $decoded = json_decode($answer, true);

                if (! is_array($decoded)) {
                    return [
                        'source' => 'AI',
                        'summary' => trim($answer) ?: 'AI analysis is unavailable right now.',
                        'actions' => [],
                    ];
                }

                return [
                    'source' => 'AI',
                    'summary' => $decoded['summary'] ?? 'AI analysis is available.',
                    'actions' => collect($decoded['actions'] ?? [])->take(3)->values(),
                ];
            });
        } catch (Throwable) {
            return $this->computedInsight($analysisContext);
        }
    }

    private function computedInsight(array $analysisContext): array
    {
        $overview = $analysisContext['overview'];
        $topGap = collect($analysisContext['top_gaps'])->first();
        $summary = $overview['supply_gap_kg'] >= 0
            ? 'Current posted supply is higher than processor demand, so LGU coordination should prioritize matching and spoilage prevention.'
            : 'Processor demand is higher than posted supply, so LGU coordination should encourage farmers to list matching surplus.';

        return [
            'source' => 'Computed',
            'summary' => $summary,
            'actions' => [
                $topGap
                    ? "Prioritize {$topGap['resource']} because it has the largest visible supply-demand gap."
                    : 'Encourage more farmers and processors to post live supply and demand.',
                'Use market price averages to flag listings that may need price guidance.',
                'Track completed transactions to improve waste-diversion and income reporting.',
            ],
        ];
    }

    private function aiPrompt(array $analysisContext): string
    {
        return 'You are an LGU agricultural circular-economy analyst. '
            .'Use the dashboard JSON to provide a concise operational analysis. '
            .'Return only valid JSON with this shape: {"summary":"", "actions":["", "", ""]}. '
            .'Focus on surplus utilization, supply-demand gaps, landfill diversion, and farmer income. '
            .'Dashboard JSON: '.json_encode($analysisContext);
    }
}
