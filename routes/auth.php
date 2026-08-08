<?php

use App\Http\Controllers\Auth\AuthenticatedSessionController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function () {

    Route::get('/', [AuthenticatedSessionController::class, 'create']);

    Route::post('login', [AuthenticatedSessionController::class, 'store'])->name('login');

});
Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])
    ->middleware('auth')
    ->name('logout');
