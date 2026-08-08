<?php

namespace App\Http\Controllers\AgriResource;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;



class MyDemandController extends Controller
{
    public function index(){
        return Inertia::render('Processor/AgriResources/MyDemandsIndex');
    }



    public function create(){
        return Inertia::render('Processor/AgriResources/MyDemandsCreateEdit');
    }
}
