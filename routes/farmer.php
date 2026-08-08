<?php

use App\Http\Controllers\Farmer\FarmersController;
use App\Http\Controllers\Farmer\FarmersProfileController;
use App\Http\Controllers\Farmer\FarmerTransactionController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'role:farmer'])->group(function () {
    Route::get('/create-agri-resource-listing', [FarmersController::class, 'createResourceListing'])
        ->name('create-agri-resource-listing');
    Route::post('/resource-listings', [FarmersController::class, 'storeResourceListing'])
        ->name('farmer.resource-listings.store');
    Route::post('/farmer/resource-buyer-suggestions', [FarmersController::class, 'suggestResourceBuyers'])
        ->name('farmer.resource-buyer-suggestions');
    Route::get('/farmer/profile', [FarmersProfileController::class, 'index'])
        ->name('farmer.profile');
    Route::get('/farmer/transactions', [FarmerTransactionController::class, 'index'])
        ->name('farmer.transactions');
    Route::post('/farmer/transactions/{transaction}/read', [FarmerTransactionController::class, 'read'])
        ->name('farmer.transactions.read');
    Route::patch('/farmer/transactions/{transaction}/price', [FarmerTransactionController::class, 'updatePrice'])
        ->name('farmer.transactions.price.update');
});
