<?php

use App\Http\Controllers\Lk\CorrectionsController;
use App\Http\Controllers\Lk\GroupsController;
use App\Http\Controllers\Lk\SchedulesController;
use Illuminate\Support\Facades\Route;

Route::middleware(['api', 'auth'])->group(function () {
    // Groups
    Route::get('/groups', [GroupsController::class, 'index']);
    Route::post('/groups', [GroupsController::class, 'store']);
    Route::post('/groups/{group}/invite', [GroupsController::class, 'invite']);

    // Schedules
    Route::get('/schedules', [SchedulesController::class, 'index']);
    Route::post('/schedules', [SchedulesController::class, 'store']);
    Route::patch('/schedules/{schedule}', [SchedulesController::class, 'update']);
    Route::delete('/schedules/{schedule}', [SchedulesController::class, 'destroy']);

    // Corrections
    Route::post('/corrections', [CorrectionsController::class, 'store']);
    Route::patch('/corrections/{correction}', [CorrectionsController::class, 'update']);
});
