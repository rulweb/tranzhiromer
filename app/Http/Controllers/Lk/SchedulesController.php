<?php

namespace App\Http\Controllers\Lk;

use App\Enums\ScheduleType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Lk\Schedules\SchedulesIndexRequest;
use App\Http\Requests\Lk\Schedules\StoreScheduleRequest;
use App\Http\Requests\Lk\Schedules\UpdateScheduleRequest;
use App\Models\Group;
use App\Models\Schedule;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class SchedulesController extends Controller
{
    public function index(SchedulesIndexRequest $request): InertiaResponse
    {
        $validated = $request->validated();

        // Determine group: use provided or first user group
        $user = $request->user();
        if (! isset($validated['group_id'])) {
            $firstGroupId = Group::query()
                ->whereHas('members', fn ($q) => $q->where('user_id', $user->id))
                ->orderBy('id')
                ->value('id');
            $validated['group_id'] = $user->current_group_id ?? $firstGroupId;
        }

        $group = Group::findOrFail((int) $validated['group_id']);
        Gate::authorize('view', $group);

        $query = Schedule::query()
            ->where('group_id', $group->id)
            ->with('parent');

        if ($month = ($validated['month'] ?? null)) {
            // Filter by month boundaries using created_at or period specifics is ambiguous
            // We'll filter schedules that are active within the month (by end_date or single_date if one_time)
            $start = \Carbon\Carbon::createFromFormat('Y-m', $month)->startOfMonth();
            $end = (clone $start)->endOfMonth();

            $query->where(function ($q) use ($start, $end) {
                $q->whereNull('end_date')->orWhereBetween('end_date', [$start, $end]);
            });
        }

        $schedules = $query->orderBy('type')->orderBy('id')->get();

        return Inertia::render('Lk/Budget/Index', [
            'schedules' => $schedules,
            'month' => $validated['month'] ?? now()->format('Y-m'),
            'groupId' => $group->id,
        ]);
    }

    public function store(StoreScheduleRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        $group = Group::findOrFail($validated['group_id']);
        Gate::authorize('view', $group);

        if (($validated['type'] ?? null) === ScheduleType::EXPENSE->value && empty($validated['parent_id'])) {
            return response()->json(['message' => 'Expense must have parent_id (income)'], 422);
        }

        $schedule = new Schedule($validated);
        $schedule->group_id = $group->id;

        // Policy create: pass a schedule with related group
        Gate::authorize('create', $schedule);

        $schedule->save();

        return redirect()->back()->with('success', 'Создано');
    }

    public function update(UpdateScheduleRequest $request, Schedule $schedule): InertiaResponse
    {
        Gate::authorize('update', $schedule);

        $validated = $request->validated();

        $schedule->fill($validated)->save();

        if ($request->wantsJson() || $request->is('api/*')) {
            return response()->json(['data' => $schedule->fresh('parent')]);
        }

        return redirect()->back()->with('success', 'Сохранено');
    }

    public function destroy(Schedule $schedule): RedirectResponse
    {
        Gate::authorize('delete', $schedule);
        $schedule->delete();

        return redirect()->back()->with('success', 'Удалено');
    }
}
