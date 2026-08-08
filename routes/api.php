<?php
use App\Http\Controllers\OpenAIController;
use App\Http\Controllers\Api\TransactionRealtimeController;
use Illuminate\Support\Facades\Route;

Route::prefix('transactions')->group(function (): void {
    Route::post('messages', [TransactionRealtimeController::class, 'message']);
    Route::post('alert', [TransactionRealtimeController::class, 'alert']);
    Route::post('ping', [TransactionRealtimeController::class, 'ping']);
});
Route::post('/ai/chat', [OpenAIController::class, 'chat'])
    ->name('ai.chat');
Route::post('/ai/analyze-crop-price', [OpenAIController::class, 'analyzeCropPrice'])
    ->name('ai.analyze-crop-price');