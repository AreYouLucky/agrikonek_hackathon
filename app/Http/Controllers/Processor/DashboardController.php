<?php

namespace App\Http\Controllers\Processor;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $user = request()->user();
        $processorProfile = $user?->processorProfile()->first();
        $demandQuery = $processorProfile?->resourceDemands()
            ->with('agriResource:id,name');

        $recentDemands = $demandQuery
            ? (clone $demandQuery)
                ->latest('id')
                ->limit(5)
                ->get()
                ->map(fn ($demand): array => [
                    'id' => $demand->getKey(),
                    'resource' => $demand->agriResource?->name ?? 'Unknown resource',
                    'quantity' => $demand->quantity,
                    'price' => $demand->price,
                    'remarks' => $demand->remarks,
                    'posted_at' => $demand->created_at?->diffForHumans(),
                ])
            : collect();

        return Inertia::render('Processor/DashboardIndex', [
            'processorProfile' => $processorProfile,
            'stats' => [
                'total_demands' => $demandQuery ? (clone $demandQuery)->count() : 0,
                'total_quantity' => $demandQuery ? (float) (clone $demandQuery)->sum('quantity') : 0,
                'average_price' => $demandQuery ? round((float) (clone $demandQuery)->avg('price'), 2) : 0,
            ],
            'recentDemands' => $recentDemands,
        ]);
    }
}
