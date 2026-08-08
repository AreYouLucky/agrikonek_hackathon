<?php

use App\Http\Controllers\Farmer\FarmersController;
use App\Http\Controllers\Farmer\FarmersProfileController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:farmer'])->group(function () {
    Route::get('/create-agri-resource-listing', [FarmersController::class, 'createResourceListing'])
        ->name('create-agri-resource-listing');
    Route::post('/resource-listings', [FarmersController::class, 'storeResourceListing'])
        ->name('farmer.resource-listings.store');
    Route::get('/farmer/profile', [FarmersProfileController::class, 'index'])
        ->name('farmer.profile');
});
