<?php

namespace App\Http\Controllers\Farmer;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class FarmersProfileController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('Farmer/Profile', [
            'farmerProfile' => $request->user()->farmerProfile()->first([
                'farm_name',
                'farm_complete_address',
                'latitude',
                'longitude',
                'contact_number',
            ]),
        ]);
    }
}
