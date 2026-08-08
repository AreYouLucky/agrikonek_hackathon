<?php

namespace App\Http\Controllers\Processor;

use App\Http\Controllers\Controller;
use App\Http\Requests\Processor\StoreMyDemandRequest;
use App\Models\AgriResource;
use App\Models\ProcessorProfileTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Inertia\Response;

class MyDemandController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Processor/AgriResources/MyDemandsIndex');
    }

    public function getData(): JsonResponse
    {
        $user = Auth::user();
        $data = ProcessorProfileTransaction::query()
            ->with(['agriResource:id,name'])
            ->where('user_id', $user->id)
            ->latest()
            ->get()
            ->map(fn (ProcessorProfileTransaction $demand): array => [
                'id' => $demand->getKey(),
                'resource' => $demand->agriResource?->name ?? 'Unknown resource',
                'quantity' => $demand->quantity,
                'price' => $demand->price,
                'remarks' => $demand->remarks,
                'posted_at' => $demand->created_at?->diffForHumans(),
            ]);

        return response()->json($data);
    }

    public function create(): Response
    {
        return Inertia::render('Processor/AgriResources/MyDemandsCreateEdit', [
            'resources' => AgriResource::query()
                ->orderBy('name')
                ->get(['id', 'name']),
        ]);
    }

    public function store(StoreMyDemandRequest $request): RedirectResponse
    {
        $user = $request->user();
        $processorProfile = $user->processorProfile()->firstOrFail();

        ProcessorProfileTransaction::query()->create([
            ...$request->validated(),
            'user_id' => $user->getKey(),
            'processor_profile_id' => $processorProfile->getKey(),
        ]);

        return redirect()->route('processors.agri-resources.my-demands');
    }
}
