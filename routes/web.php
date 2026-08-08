<?php

use App\Http\Controllers\Api\TransactionRealtimeController;
use Illuminate\Support\Facades\Route;

Route::post('/transactions/messages', [TransactionRealtimeController::class, 'message'])
    ->middleware('auth')
    ->name('transactions.messages.store');

require __DIR__.'/auth.php';
require __DIR__.'/farmer.php';
require __DIR__.'/processor.php';
require __DIR__.'/lgu.php';
