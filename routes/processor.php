<?php

use App\Http\Controllers\Processor\DashboardController;
use App\Http\Controllers\Processor\MyDemandController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::prefix('processors')->middleware(['auth', 'role:processor'])->group(function () {

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('processors.dashboard');
    Route::get('/about-us', fn () => Inertia::render('Processor/AboutUs'))->name('processors.about-us');

    Route::get('/agri-resources/my-demands', [MyDemandController::class, 'index'])->name('processors.agri-resources.my-demands');
    Route::get('/agri-resources/my-demands-get-data', [MyDemandController::class, 'getData'])->name('processors.agri-resources.my-demands.getdata');
    Route::get('/agri-resources/my-demands/create', [MyDemandController::class, 'create'])->name('processors.agri-resources.my-demands.create');
    Route::post('/agri-resources/my-demands', [MyDemandController::class, 'store'])->name('processors.agri-resources.my-demands.store');

    // Route::get('/agri-resources', function () {
    //     return Inertia::render('Processor/SearchAgriResources');
    // })->name('agri-resources');
});
