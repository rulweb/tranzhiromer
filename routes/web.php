<?php

use Illuminate\Support\Facades\Route;

Route::get('/', \App\Http\Controllers\LandingController::class);

// LK routes
Route::middleware('web')->group(function () {
    Route::get('/lk/login', [\App\Http\Controllers\SocialAuthController::class, 'login'])
        ->name('login')->middleware('guest');

    // Social auth
    Route::get('/auth/{provider}/redirect', [\App\Http\Controllers\SocialAuthController::class, 'redirect'])
        ->whereIn('provider', ['vkid', 'yandex'])
        ->name('social.redirect');
    Route::get('/auth/{provider}/callback', [\App\Http\Controllers\SocialAuthController::class, 'callback'])
        ->whereIn('provider', ['vkid', 'yandex'])
        ->name('social.callback');

    // App pages
    Route::middleware('auth')->prefix('lk')->group(function () {
        Route::get('/', [\App\Http\Controllers\Lk\DashboardController::class, 'index'])->name('lk.index')->middleware('auth');
        // Logout
        Route::post('logout', [\App\Http\Controllers\SocialAuthController::class, 'logout'])
            ->name('logout');

        Route::get('budget', function () {
            return \Inertia\Inertia::render('Lk/Budget/Index');
        })->name('lk.budget');
        Route::get('groups', [\App\Http\Controllers\Lk\GroupsController::class, 'index'])->name('lk.groups.index');
    });
});
