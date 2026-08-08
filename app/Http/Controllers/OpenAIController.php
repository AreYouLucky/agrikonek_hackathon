<?php

namespace App\Http\Controllers;
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
        Request $request,
        OpenAIService $openAI
    ): JsonResponse {
        $validated = $request->validate([
            'name' => ['required', 'string'],
            'weight' => ['required', 'numeric'],
            'harvested_at' => ['required', 'string'],
            'preservation_method' => ['required', 'string'],
            'price' => ['required', 'string'],
        ]);

        $analysis = $openAI->analyzeCrop($validated);

        return response()->json($analysis);
    }
}
