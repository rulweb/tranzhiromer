<?php

namespace App\Http\Controllers\Lk;

use App\Http\Controllers\Controller;
use App\Http\Requests\Lk\Schedules\PayScheduleRequest;
use App\Http\Requests\Lk\Schedules\SchedulesIndexRequest;
use App\Http\Requests\Lk\Schedules\StoreScheduleRequest;
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
    public function index(SchedulesIndexRequest $request): InertiaResponse
    {
        $validated = $request->validated();

        $user = $request->user();

        $group = Group::findOrFail((int) $user->current_group_id);
        Gate::authorize('view', $group);

        $query = Schedule::query()
            ->where('group_id', $group->id)
            ->with('parent');

        if ($month = ($validated['month'] ?? null)) {
            $time = Carbon::createFromFormat('Y-m', $month);

            $query->where(function ($q) use ($time) {
                $q->whereDate('end_date', '>', $time->startOfMonth()->toAtomString());
                $q->orWhereNull('end_date');
            });
        }

        $schedules = $query->orderBy('type')->orderBy('id')->get();

        // Derive monthly payment info for the requested month
        $monthStr = $validated['month'] ?? now()->format('Y-m');
        $monthDate = Carbon::createFromFormat('Y-m', $monthStr)->startOfMonth();

        $payments = SchedulePayment::query()
            ->whereIn('schedule_id', $schedules->pluck('id'))
            ->where('group_id', $group->id)
            ->whereDate('month', $monthDate->toDateString())
            ->get()
            ->keyBy('schedule_id');

        // Build grouped data by day of month for the requested month
        $locale = 'ru';
        $monthCarbon = $monthDate->copy();
        $groups = [];

        // prepare map day => items
        $byDay = [];
        foreach ($schedules as $s) {
            // determine day number within month
            $dayNum = null;
            if ($s->period_type === \App\Enums\SchedulePeriodType::ONE_TIME && $s->single_date) {
                if ($s->single_date->isSameMonth($monthCarbon)) {
                    $dayNum = (int) $s->single_date->day;
                }
            } elseif ($s->day_of_month) {
                $dayNum = min((int) $s->day_of_month, $monthCarbon->daysInMonth);
            } else {
                // fallback: put to first day if nothing defined
                $dayNum = 1;
            }

            if ($dayNum === null) {
                continue; // one_time but not in this month
            }

            $p = $payments->get($s->id);
            $item = [
                'id' => $s->id,
                'name' => $s->name,
                'description' => $s->description,
                'icon' => $s->icon,
                'amount' => (float) $s->amount,
                'expected_leftover' => $s->expected_leftover !== null ? (float) $s->expected_leftover : 0.0,
                'is_cash_leftover' => (bool) ($p?->is_cash_leftover ?? false),
                'is_paid' => $p !== null,
                'leftover' => $p?->leftover !== null ? (float) $p->leftover : 0.0,
            ];
            $byDay[$dayNum] = array_merge($byDay[$dayNum] ?? [], [$item]);
        }

        // sort days asc and format labels
        ksort($byDay);
        foreach ($byDay as $dayNum => $items) {
            $label = Carbon::create($monthCarbon->year, $monthCarbon->month, (int) $dayNum)
                ->locale($locale)
                ->translatedFormat('j F');

            $groups[] = [
                'day' => $label,
                'items' => $items,
            ];
        }

        return Inertia::render('Lk/Budget/Index', [
            'schedules' => $schedules,
            'days' => $groups,
            'month' => $monthStr,
            'groupId' => $group->id,
        ]);
    }

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

    public function unpay(PayScheduleRequest $request, Schedule $schedule): \Illuminate\Http\RedirectResponse
    {
        Gate::authorize('update', $schedule);

        $data = $request->validated();
        $monthStr = $data['month'] ?? now()->format('Y-m');
        $monthDate = Carbon::createFromFormat('Y-m', $monthStr)->startOfMonth();

        SchedulePayment::query()
            ->where('group_id', $schedule->group_id)
            ->where('schedule_id', $schedule->id)
            ->whereDate('month', $monthDate->toDateString())
            ->delete();

        return redirect()->back()->with('success', 'Оплата отменена');
    }
}
