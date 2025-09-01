<?php

namespace App\Http\Controllers\Lk;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        $schedules = Schedule::query()
            ->where('group_id', $user->current_group_id)
            ->with('parent')
            ->latest('id')
            ->limit(100)
            ->get();

        return Inertia::render('Lk/Dashboard', [
            'schedules' => $schedules,
        ]);
    }
}
