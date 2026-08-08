<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'role:farmer'])->group(function () {
    Route::get('/create-agri-resource-listing', function () {
        return Inertia::render('Farmer/CreateAgriResourceListing');
    })->name('create-agri-resource-listing');
});
