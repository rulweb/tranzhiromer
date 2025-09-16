<?php

namespace App\Http\Controllers\Lk;

use App\Http\Controllers\Controller;
use App\Http\Requests\Lk\Schedules\SchedulesIndexRequest;
use App\Models\Group;
use App\Models\Schedule;
use App\Models\SchedulePayment;
use Carbon\Carbon;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class DashboardController extends Controller
{
    public function index(SchedulesIndexRequest $request): InertiaResponse
    {
        $validated = $request->validated();

        $user = $request->user();

        $group = Group::findOrFail((int)$user->current_group_id);
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
        $monthCarbon = $monthDate->copy();
        $incomeDays = [];

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
                    $dayNum = (int)$s->single_date->day;
                }
            } elseif ($s->day_of_month) {
                $dayNum = min((int)$s->day_of_month, $monthCarbon->daysInMonth);
            } else {
                $dayNum = 1;
            }

            return $dayNum;
        };

        // For each income, collect its expenses and group them by day
        foreach ($incomes as $income) {
            $children = $expenses->where('parent_id', $income->id);
            $incomeGroups = $this->buildDays($children, $resolveDay, $getPayment, $monthCarbon);

            $expenses_sum = $incomeGroups->sum('sum');
            $leftover_cash = $incomeGroups->sum('leftover_cash');
            $leftover_credit = $incomeGroups->sum('leftover_credit');

            $data = [
                'income' => [
                    ...$income->toArray(),
                    'amount' => (float)$income->amount,
                ],
                'expenses_sum' => $expenses_sum,
                'leftover_cash' => $income->amount - $expenses_sum + $leftover_cash,
                'leftover_credit' => $income->amount - $expenses_sum + $leftover_credit,
                'leftover_total' => $income->amount - $expenses_sum + $leftover_cash + $leftover_credit,
                'days' => $incomeGroups,
            ];

            $incomeDays[] = $data;
        }

        $unassignedGroups = $this->buildDays(
            $expenses->whereNull('parent_id'),
            $resolveDay,
            $getPayment,
            $monthCarbon
        );

        $expenses_sum = $unassignedGroups->sum('sum');
        $leftover_cash = $unassignedGroups->sum('leftover_cash');
        $leftover_credit = $unassignedGroups->sum('leftover_credit');

        $unassignedDays = [
            'expenses_sum' => $expenses_sum,
            'leftover_cash' => $leftover_cash,
            'leftover_credit' => $leftover_credit,
            'days' => $unassignedGroups
        ];

        $unassignedDays['leftover'] = $unassignedDays['leftover_cash'] + $unassignedDays['leftover_credit'];

        return Inertia::render('Lk/Dashboard', [
            'unassignedDays' => $unassignedDays,
            'incomeDays' => $incomeDays,
            'month' => $monthStr,
            'groupId' => $group->id,
        ]);
    }

    /**
     * @param \Illuminate\Database\Eloquent\Collection $children
     * @param \Closure $resolveDay
     * @param \Closure $getPayment
     * @param Carbon|null $monthCarbon
     * @return \Illuminate\Support\Collection
     */
    public function buildDays(\Illuminate\Database\Eloquent\Collection $children, \Closure $resolveDay, \Closure $getPayment, ?Carbon $monthCarbon): \Illuminate\Support\Collection
    {
        $byDay = [];
        foreach ($children as $s) {
            $dayNum = $resolveDay($s);
            if ($dayNum === null) {
                continue;
            }
            /** @var SchedulePayment $p */
            $p = $getPayment($s);
            $item = [
                ...$s->toArray(),
                'day' => Carbon::create($monthCarbon->year, $monthCarbon->month, (int)$dayNum),
                'amount' => (float)$s->amount,
                'expected_leftover' => $s->expected_leftover !== null ? (float)$s->expected_leftover : 0.0,
                'payment_id' => $p?->id,
                'is_paid' => $p !== null,
                'leftover' => $p?->leftover !== null ? (float)$p->leftover : 0.0,
            ];
            $byDay[$dayNum] = array_merge($byDay[$dayNum] ?? [], [$item]);
        }

        ksort($byDay);

        $incomeGroups = [];
        foreach ($byDay as $dayNum => $items) {
            $items = collect($items);
            $leftover_cash = $items->where('is_cash_leftover', true)->map(fn($i) => $i['leftover'] > 0 ? $i['leftover'] : $i['expected_leftover'])->sum();
            $leftover_credit = $items->where('is_cash_leftover', false)->map(fn($i) => $i['leftover'] > 0 ? $i['leftover'] : $i['expected_leftover'])->sum();
            $incomeGroups[] = [
                'day' => Carbon::create($monthCarbon->year, $monthCarbon->month, (int)$dayNum),
                'sum' => $items->sum('amount'),
                'leftover_cash' => $leftover_cash,
                'leftover_credit' => $leftover_credit,
                'items' => $items,
            ];
        }

        return collect($incomeGroups);
    }
}
