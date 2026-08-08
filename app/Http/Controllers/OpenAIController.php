<?php

namespace App\Http\Controllers;

use App\Http\Requests\AnalyzeCropPriceRequest;
use App\Models\AgriResource;
use App\Services\OpenAIService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OpenAIController extends Controller
{
    public function chat(
        Request $request,
        OpenAIService $openAI
    ): JsonResponse {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:5000'],
        ]);

        $answer = $openAI->prompt($validated['message']);

        return response()->json([
            'message' => $answer,
        ]);
    }

    public function analyzeCropPrice(
        AnalyzeCropPriceRequest $request,
        OpenAIService $openAI
    ): JsonResponse {
        $analysisData = $request->validated();
        $analysisData['farmer_location'] = $request->user()
            ->farmerProfile()
            ->value('farm_complete_address');

        $marketPrices = AgriResource::query()
            ->where('name', $analysisData['name'])
            ->first()
            ?->marketPrices()
            ->get(['market', 'province', 'region', 'price']);

        if ($marketPrices?->isNotEmpty()) {
            $analysisData['market_area'] = $marketPrices->pluck('province')->filter()->first()
                ?? $marketPrices->pluck('region')->filter()->first()
                ?? $marketPrices->pluck('market')->filter()->first();
            $analysisData['market_average'] = round((float) $marketPrices->avg('price'), 2);
            $analysisData['market_minimum'] = round((float) $marketPrices->min('price'), 2);
            $analysisData['market_maximum'] = round((float) $marketPrices->max('price'), 2);
        }

        $analysis = $openAI->analyzeCrop($analysisData);

        return response()->json($analysis);
    }
}
