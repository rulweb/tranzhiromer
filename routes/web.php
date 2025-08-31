<?php

use Illuminate\Support\Facades\Route;

Route::get('/', \App\Http\Controllers\LandingController::class);

// LK routes
Route::middleware('web')->group(function () {
    Route::get('/lk/login', [\App\Http\Controllers\SocialAuthController::class, 'login'])
        ->name('login')->middleware('guest');

    Route::get('/lk', [\App\Http\Controllers\Lk\DashboardController::class, 'index'])->name('lk.index')->middleware('auth');

    // Income cycles & templates & mandatory payments
    Route::get('/lk/income-cycle-templates', [\App\Http\Controllers\Lk\IncomeCycleTemplatesController::class, 'index'])->middleware('auth')->name('lk.income-cycle-templates.index');
    Route::get('/lk/income-cycles', [\App\Http\Controllers\Lk\IncomeCyclesController::class, 'index'])->middleware('auth')->name('lk.income-cycles.index');
    Route::post('/lk/income-cycles/bootstrap', [\App\Http\Controllers\Lk\IncomeCyclesController::class, 'bootstrap'])->middleware('auth')->name('lk.income-cycles.bootstrap');
    Route::get('/lk/mandatory-payments', [\App\Http\Controllers\Lk\MandatoryPaymentsController::class, 'index'])->middleware('auth')->name('lk.mandatory-payments.index');
    Route::post('/lk/mandatory-payments', [\App\Http\Controllers\Lk\MandatoryPaymentsController::class, 'store'])->middleware('auth')->name('lk.mandatory-payments.store');

    // Allocations
    Route::patch('/lk/allocations/{id}', [\App\Http\Controllers\Lk\PaymentAllocationsController::class, 'update'])->middleware('auth')->name('lk.allocations.update');
    Route::post('/lk/allocations/{id}/move', [\App\Http\Controllers\Lk\PaymentAllocationsController::class, 'move'])->middleware('auth')->name('lk.allocations.move');

    // Social auth
    Route::get('/auth/{provider}/redirect', [\App\Http\Controllers\SocialAuthController::class, 'redirect'])
        ->whereIn('provider', ['vkid', 'yandex'])
        ->name('social.redirect');
    Route::get('/auth/{provider}/callback', [\App\Http\Controllers\SocialAuthController::class, 'callback'])
        ->whereIn('provider', ['vkid', 'yandex'])
        ->name('social.callback');

    // Logout
    Route::post('/logout', [\App\Http\Controllers\SocialAuthController::class, 'logout'])
        ->name('logout')->middleware('auth');
});
