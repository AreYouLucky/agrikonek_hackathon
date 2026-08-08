<?php
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return inertia('Welcome');
})->name('welcome');
// require __DIR__.'/auth.php';
require __DIR__.'/farmer.php';
require __DIR__.'/processor.php';
require __DIR__.'/lgu.php';
