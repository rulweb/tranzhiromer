<?php

use Illuminate\Support\Facades\Route;

Route::get('/', \App\Http\Controllers\LandingController::class);

// LK routes
Route::middleware('web')->group(function () {
    Route::get('/lk/login', [\App\Http\Controllers\SocialAuthController::class, 'login'])
        ->name('login')->middleware('guest');

    Route::get('/lk', function () {
        return \Inertia\Inertia::render('Lk/Index');
    })->name('lk.index')->middleware('auth');

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
