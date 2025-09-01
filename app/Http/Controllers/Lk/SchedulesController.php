<?php

namespace App\Http\Controllers\Lk;

use App\Enums\ScheduleType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Lk\Schedules\SchedulesIndexRequest;
use App\Http\Requests\Lk\Schedules\StoreScheduleRequest;
use App\Http\Requests\Lk\Schedules\UpdateScheduleRequest;
use App\Models\Group;
use App\Models\Schedule;
use Illuminate\Http\JsonResponse;

class SchedulesController extends Controller
{
    public function index(SchedulesIndexRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $group = Group::findOrFail((int) $validated['group_id']);
        $this->authorize('view', $group);

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

        return response()->json(['data' => $schedules]);
    }

    public function store(StoreScheduleRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $group = Group::findOrFail($validated['group_id']);
        $this->authorize('view', $group);

        if (($validated['type'] ?? null) === ScheduleType::EXPENSE->value && empty($validated['parent_id'])) {
            return response()->json(['message' => 'Expense must have parent_id (income)'], 422);
        }

        $schedule = new Schedule($validated);
        $schedule->group_id = $group->id;

        // Policy create: pass a schedule with related group
        $this->authorize('create', $schedule);

        $schedule->save();

        return response()->json(['data' => $schedule->fresh('parent')], 201);
    }

    public function update(UpdateScheduleRequest $request, Schedule $schedule): JsonResponse
    {
        $this->authorize('update', $schedule);

        $validated = $request->validated();

        $schedule->fill($validated)->save();

        return response()->json(['data' => $schedule->fresh('parent')]);
    }

    public function destroy(Schedule $schedule): JsonResponse
    {
        $this->authorize('delete', $schedule);
        $schedule->delete();

        return response()->json(['message' => 'Deleted']);
    }
}
