<?php

namespace App\Http\Controllers\Farmer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Farmer\RecommendResourcePriceRequest;
use App\Http\Requests\Farmer\StoreResourceListingRequest;
use App\Http\Requests\Farmer\SuggestResourceBuyersRequest;
use App\Models\AgriResource;
use App\Services\MarketPriceRecommendationService;
use App\Services\NearbyProcessorSuggestionService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class FarmersController extends Controller
{
    public function createResourceListing(): Response
    {
        return Inertia::render('Farmer/CreateAgriResourceListing', [
            'resources' => AgriResource::query()
                ->select(['id', 'name'])
                ->orderBy('name')
                ->get(),
        ]);
    }

    public function storeResourceListing(StoreResourceListingRequest $request): RedirectResponse
    {
        $validated = $request->validated();
        $imagePath = $request->file('img')->store('resource-listings', 'public');

        $request->user()->farmerProfile()->firstOrFail()->resourceListings()->create([
            'agri_resource_id' => $validated['agri_resource_id'],
            'quantity' => $validated['quantity'],
            'havested_at' => $validated['harvested_at'],
            'preservation_method' => $validated['preservation_method'],
            'img' => $imagePath,
            'price' => $validated['price'],
        ]);

        return to_route('create-agri-resource-listing')
            ->with('success', 'Surplus resource listing posted successfully.');
    }

    public function recommendResourcePrice(
        RecommendResourcePriceRequest $request,
        MarketPriceRecommendationService $recommendationService,
    ): JsonResponse {
        $resource = AgriResource::query()->findOrFail(
            $request->integer('agri_resource_id'),
        );
        $farmerProfile = $request->user()->farmerProfile()->firstOrFail();

        return response()->json(
            $recommendationService->recommend($resource, $farmerProfile),
        );
    }

    public function suggestResourceBuyers(
        SuggestResourceBuyersRequest $request,
        NearbyProcessorSuggestionService $suggestionService,
    ): JsonResponse {
        $resource = AgriResource::query()->findOrFail(
            $request->integer('agri_resource_id'),
        );
        $farmerProfile = $request->user()->farmerProfile()->firstOrFail();

        return response()->json(
            $suggestionService->suggest($resource, $farmerProfile),
        );
    }
}
