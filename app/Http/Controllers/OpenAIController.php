<?php

namespace App\Http\Controllers;

use App\Http\Requests\AnalyzeCropPriceRequest;
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
        $analysis = $openAI->analyzeCrop($request->validated());

        return response()->json($analysis);
    }
}
