<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::prefix('agri-resources')->middleware(['auth', 'role:processor'])->group(function () {

    Route::get('', [App\Http\Controllers\AgriResourceController::class, 'index'])->name('agri-resources');


    // Route::get('/agri-resources', function () {
    //     return Inertia::render('Processor/SearchAgriResources');
    // })->name('agri-resources');
});
