<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth', 'role:processor'])->group(function () {
    Route::get('/search-agri-resources', function () {
        return Inertia::render('Processor/SearchAgriResources');
    })->name('search-agri-resources');
});
