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

        Route::get('budget', [\App\Http\Controllers\Lk\SchedulesController::class, 'index'])->name('lk.budget');

        // Schedules CRUD via Inertia
        Route::post('schedules', [\App\Http\Controllers\Lk\SchedulesController::class, 'store'])->name('lk.schedules.store');
        Route::patch('schedules/{schedule}', [\App\Http\Controllers\Lk\SchedulesController::class, 'update'])->name('lk.schedules.update');
        Route::delete('schedules/{schedule}', [\App\Http\Controllers\Lk\SchedulesController::class, 'destroy'])->name('lk.schedules.destroy');

        // Corrections via Inertia
        Route::post('corrections', [\App\Http\Controllers\Lk\CorrectionsController::class, 'store'])->name('lk.corrections.store');
        Route::patch('corrections/{correction}', [\App\Http\Controllers\Lk\CorrectionsController::class, 'update'])->name('lk.corrections.update');

        Route::post('groups', [\App\Http\Controllers\Lk\GroupsController::class, 'store'])->name('lk.groups.store');
        Route::post('groups/current', [\App\Http\Controllers\Lk\GroupsController::class, 'setCurrent'])->name('lk.groups.set-current');
        Route::patch('groups/{group}', [\App\Http\Controllers\Lk\GroupsController::class, 'update'])->name('lk.groups.update');
        Route::delete('groups/{group}', [\App\Http\Controllers\Lk\GroupsController::class, 'destroy'])->name('lk.groups.destroy');
        Route::delete('groups/{group}/members/{user}', [\App\Http\Controllers\Lk\GroupsController::class, 'removeMember'])->name('lk.groups.members.remove');
        Route::post('groups/{group}/invite', [\App\Http\Controllers\Lk\GroupsController::class, 'invite'])->name('lk.groups.invite');
    });
});
