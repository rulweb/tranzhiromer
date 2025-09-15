<?php

namespace App\Http\Controllers\Lk;

use App\Http\Controllers\Controller;
use App\Http\Requests\Lk\Schedules\PayScheduleRequest;
use App\Http\Requests\Lk\Schedules\SchedulesIndexRequest;
use App\Http\Requests\Lk\Schedules\StoreScheduleRequest;
use App\Http\Requests\Lk\Schedules\UnpayScheduleRequest;
use App\Http\Requests\Lk\Schedules\UpdateScheduleRequest;
use App\Models\Group;
use App\Models\Schedule;
use App\Models\SchedulePayment;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class SchedulesController extends Controller
{
    public function store(StoreScheduleRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $user = $request->user();

        $group = Group::findOrFail((int) $user->current_group_id);
        Gate::authorize('view', $group);

        // Normalize one-time: end_date equals single_date
        if (($validated['period_type'] ?? null) === 'one_time') {
            $validated['end_date'] = $validated['single_date'] ?? null;
        }

        $schedule = new Schedule($validated);
        $schedule->group_id = $group->id;

        // Policy create: pass a schedule with related group
        Gate::authorize('create', $schedule);

        $schedule->save();

        return redirect()->back()->with('success', 'Создано');
    }

    public function update(UpdateScheduleRequest $request, Schedule $schedule): RedirectResponse
    {
        Gate::authorize('update', $schedule);

        $validated = $request->validated();

        if (($validated['period_type'] ?? null) === 'one_time') {
            $validated['end_date'] = $validated['single_date'] ?? null;
        }

        $schedule->fill($validated)->save();

        return redirect()->back()->with('success', 'Сохранено');
    }

    public function destroy(Schedule $schedule): RedirectResponse
    {
        Gate::authorize('delete', $schedule);
        $schedule->delete();

        return redirect()->back()->with('success', 'Удалено');
    }

    public function pay(PayScheduleRequest $request, Schedule $schedule): \Illuminate\Http\RedirectResponse
    {
        Gate::authorize('update', $schedule);

        $data = $request->validated();
        $monthStr = $data['month'] ?? now()->format('Y-m');
        $monthDate = Carbon::createFromFormat('Y-m', $monthStr)->startOfMonth();

        SchedulePayment::query()->updateOrCreate(
            [
                'group_id' => $schedule->group_id,
                'schedule_id' => $schedule->id,
                'month' => $monthDate->toDateString(),
            ],
            [
                'paid_at' => now(),
                'leftover' => $data['leftover'],
                // For now, default to false; can be extended to accept from request
                'is_cash_leftover' => false,
            ]
        );

        return redirect()->back()->with('success', 'Оплата отмечена');
    }

    public function unpay(UnpayScheduleRequest $request, Schedule $schedule): \Illuminate\Http\RedirectResponse
    {
        Gate::authorize('update', $schedule);

        $data = $request->validated();

        SchedulePayment::query()
            ->where('id', $data['payment_id'])
            ->where('group_id', $schedule->group_id)
            ->where('schedule_id', $schedule->id)
            ->delete();

        return redirect()->back()->with('success', 'Оплата отменена');
    }
}
