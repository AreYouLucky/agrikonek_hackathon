<?php

namespace App\Http\Controllers\Processor;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;


class SmartDemandController extends Controller
{
    public function index(){
        return Inertia::render('Processor/SmartDemand/SmartDemandIndex');
    }
}
