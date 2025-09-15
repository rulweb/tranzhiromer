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

        // Build grouped data: first by incomes, then expenses grouped by day inside each income
        $locale = 'ru';
        $monthCarbon = $monthDate->copy();
        $groups = [];

        // Split schedules
        $incomes = $schedules->where('type', \App\Enums\ScheduleType::INCOME);
        $expenses = $schedules->where('type', \App\Enums\ScheduleType::EXPENSE);

        // Map schedule_id => payment once
        $getPayment = function (Schedule $s) use ($payments) {
            return $payments->get($s->id);
        };

        // Helper to resolve day number for a schedule within month
        $resolveDay = function (Schedule $s) use ($monthCarbon) {
            $dayNum = null;
            if ($s->period_type === \App\Enums\SchedulePeriodType::ONE_TIME && $s->single_date) {
                if ($s->single_date->isSameMonth($monthCarbon)) {
                    $dayNum = (int) $s->single_date->day;
                }
            } elseif ($s->day_of_month) {
                $dayNum = min((int) $s->day_of_month, $monthCarbon->daysInMonth);
            } else {
                $dayNum = 1;
            }

            return $dayNum;
        };

        // For each income, collect its expenses and group them by day
        foreach ($incomes as $income) {
            $children = $expenses->where('parent_id', $income->id);

            // Build day => items for this income
            $byDay = [];
            foreach ($children as $s) {
                $dayNum = $resolveDay($s);
                if ($dayNum === null) {
                    continue;
                }
                $p = $getPayment($s);
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

            ksort($byDay);
            // Convert to label groups
            $incomeGroups = [];
            foreach ($byDay as $dayNum => $items) {
                $label = Carbon::create($monthCarbon->year, $monthCarbon->month, (int) $dayNum)
                    ->locale($locale)
                    ->translatedFormat('j F');
                $incomeGroups[] = [
                    'day' => $label,
                    'items' => $items,
                ];
            }

            // Push a section per income keeping backward compatibility by nesting under days_by_income
            $groups[] = [
                'income' => [
                    'id' => $income->id,
                    'name' => $income->name,
                    'amount' => (float) $income->amount,
                    'description' => $income->description,
                    'icon' => $income->icon,
                ],
                'days' => $incomeGroups,
            ];
        }

        // Additionally, keep flat day groups for all expenses to not break UI that expects `days` as DayGroup[]
        $flatByDay = [];
        foreach ($expenses as $s) {
            $dayNum = $resolveDay($s);
            if ($dayNum === null) {
                continue;
            }
            $p = $getPayment($s);
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
            $flatByDay[$dayNum] = array_merge($flatByDay[$dayNum] ?? [], [$item]);
        }
        ksort($flatByDay);
        $flatGroups = [];
        foreach ($flatByDay as $dayNum => $items) {
            $label = Carbon::create($monthCarbon->year, $monthCarbon->month, (int) $dayNum)
                ->locale($locale)
                ->translatedFormat('j F');
            $flatGroups[] = [
                'day' => $label,
                'items' => $items,
            ];
        }

        return Inertia::render('Lk/Budget/Index', [
            'schedules' => $schedules,
            // Keep original flat day grouping for backward compatibility
            'days' => $flatGroups,
            // New structure: first by income, then by days inside each income
            'incomeDays' => $groups,
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
