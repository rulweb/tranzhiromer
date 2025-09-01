<?php

namespace App\Http\Controllers\Lk;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        // For now, reuse Schedules upcoming logic: fetch last 50 schedules from user's groups
        $groupIds = \App\Models\Group::query()
            ->whereHas('members', fn ($q) => $q->where('user_id', $user->id))
            ->pluck('id');

        $schedules = \App\Models\Schedule::query()
            ->whereIn('group_id', $groupIds)
            ->with('parent')
            ->latest('id')
            ->limit(100)
            ->get();

        return Inertia::render('Lk/Dashboard', [
            'schedules' => $schedules,
        ]);
    }
}
