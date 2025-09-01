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
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response as InertiaResponse;

class SchedulesController extends Controller
{
    public function index(SchedulesIndexRequest $request): InertiaResponse
    {
        $validated = $request->validated();

        // Determine group: use provided or first user group
        $user = $request->user();

        $group = Group::findOrFail((int) $user->current_group_id);
        Gate::authorize('view', $group);

        $query = Schedule::query()
            ->where('group_id', $group->id)
            ->with('parent');

        if ($month = ($validated['month'] ?? null)) {
            // Budget page requirement: show all incomes and all expenses (including unassigned) for the group.
            // Keep month only for page title and URL state; do not filter schedules by month here.
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
            throw ValidationException::withMessages([
                'parent_id' => ['Expense must have parent_id (income)'],
            ]);
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

        $schedule->fill($validated)->save();

        return redirect()->back()->with('success', 'Сохранено');
    }

    public function destroy(Schedule $schedule): RedirectResponse
    {
        Gate::authorize('delete', $schedule);
        $schedule->delete();

        return redirect()->back()->with('success', 'Удалено');
    }
}
