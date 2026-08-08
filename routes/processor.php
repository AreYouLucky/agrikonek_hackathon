<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::prefix('processors')->middleware(['auth', 'role:processor'])->group(function () {

    Route::get('/dashboard', [App\Http\Controllers\Processor\DashboardController::class, 'index'])->name('processors.dashboard');


    Route::get('/agri-resources/my-demands', [App\Http\Controllers\Processor\MyDemandController::class, 'index'])->name('processors.agri-resources.my-demands');


    // Route::get('/agri-resources', function () {
    //     return Inertia::render('Processor/SearchAgriResources');
    // })->name('agri-resources');
});
