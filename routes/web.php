<?php

use Illuminate\Support\Facades\Route;

Route::get('/api/docs', [\App\Http\Controllers\ApiDocsController::class, 'index']);

Route::get('/{any}', function () {
    return view('app');
})->where('any', '.*');
