<?php

namespace App\Http\Controllers\Lk;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\SchedulePayment;
use Carbon\Carbon;
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

        // Attach current month payment info for UI
        $monthDate = Carbon::now()->startOfMonth();
        $payments = SchedulePayment::query()
            ->whereIn('schedule_id', $schedules->pluck('id'))
            ->where('group_id', $user->current_group_id)
            ->whereDate('month', $monthDate->toDateString())
            ->get()
            ->keyBy('schedule_id');

        foreach ($schedules as $s) {
            $p = $payments->get($s->id);
            $s->setAttribute('is_paid', $p !== null);
            $s->setAttribute('leftover', $p?->leftover);
            $s->setAttribute('is_cash_leftover', $p?->is_cash_leftover ?? false);
        }

        return Inertia::render('Lk/Dashboard', [
            'schedules' => $schedules,
        ]);
    }
}
