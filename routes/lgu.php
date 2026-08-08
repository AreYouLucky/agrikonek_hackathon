<?php

use App\Http\Controllers\Lgu\DashboardController;
use Illuminate\Support\Facades\Route;

Route::prefix('lgu')->middleware(['auth', 'role:lgu'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('lgu.dashboard');
});
