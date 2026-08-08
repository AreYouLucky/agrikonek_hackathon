<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;

class OpenAIService
{
    public function prompt(string $prompt): string
    {
        $response = Http::withToken(config('services.openai.key'))
            ->acceptJson()
            ->timeout(60)
            ->post('https://api.openai.com/v1/responses', [
                'model' => config('services.openai.model'),
                'input' => $prompt,
            ])
            ->throw()
            ->json();

        foreach ($response['output'] ?? [] as $output) {
            if (($output['type'] ?? null) !== 'message') {
                continue;
            }

            foreach ($output['content'] ?? [] as $content) {
                if (($content['type'] ?? null) === 'output_text') {
                    return $content['text'] ?? '';
                }
            }
        }

        return '';
    }

    public function analyzeCrop(array $crop): array
    {
        $response = Http::withToken(config('services.openai.key'))
            ->acceptJson()
            ->connectTimeout(5)
            ->timeout(20)
            ->retry([200, 500])
            ->post('https://api.openai.com/v1/responses', [
                'model' => config('services.openai.model'),

                'input' => [
                    [
                        'role' => 'system',
                        'content' => '
                        You are a Philippine agricultural surplus and waste-resource market analysis assistant.

                        Analyze the supplied resource listing and any verified market-price context.

                        Return ONLY valid JSON using this exact structure:

                        {
                            "estimated_price": 0,
                            "fresh_until": "YYYY-MM-DD",
                            "freshness_status": "fresh",
                            "message": ""
                        }

                        Rules:
                        - estimated_price must be a number representing the recommended price per kilogram.
                        - When market_minimum and market_maximum are supplied, estimated_price must stay inside that verified range.
                        - Compare the seller price with the supplied market average when available.
                        - fresh_until must be a date in YYYY-MM-DD format.
                        - freshness_status must only be:
                          fresh, aging, near_spoilage, or spoiled.
                        - message must be short, maximum 15 words.
                        - Use only the supplied resource and market data.
                        - Do not include markdown.
                        - Do not include ```json.
                        - Do not include any explanation outside the JSON.
                    ',
                    ],
                    [
                        'role' => 'user',
                        'content' => json_encode($crop, JSON_THROW_ON_ERROR),
                    ],
                ],
            ])
            ->throw()
            ->json();

        $text = collect($response['output'] ?? [])
            ->where('type', 'message')
            ->flatMap(fn ($item) => $item['content'] ?? [])
            ->firstWhere('type', 'output_text')['text'] ?? '{}';

        $result = json_decode($text, true);

        if (! is_array($result)) {
            return [
                'estimated_price' => null,
                'fresh_until' => null,
                'freshness_status' => null,
                'message' => 'Unable to analyze crop.',
            ];
        }

        return [
            'estimated_price' => isset($result['estimated_price'])
                ? (float) $result['estimated_price']
                : null,

            'fresh_until' => $result['fresh_until'] ?? null,

            'freshness_status' => $result['freshness_status'] ?? null,

            'message' => $result['message'] ?? null,
        ];
    }

}
