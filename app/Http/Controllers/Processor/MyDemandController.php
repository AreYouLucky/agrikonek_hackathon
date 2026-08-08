<?php

namespace App\Http\Controllers\Processor;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class MyDemandController extends Controller
{
    public function index()
    {
        return Inertia::render('Processor/AgriResources/MyDemandsIndex');
    }

    public function getData()
    {

        $user = Auth::user();
        $data = ProcessorProfileTransaction::with(['agriResource'])
            ->where('user_id', $user->id)
            ->get();

        return $data;
    }

    public function create()
    {
        return Inertia::render('Processor/AgriResources/MyDemandsCreateEdit');
    }
}
