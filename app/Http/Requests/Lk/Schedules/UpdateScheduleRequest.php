<?php

namespace App\Http\Requests\Lk\Schedules;

use App\Enums\SchedulePeriodType;
use App\Enums\ScheduleType;
use App\Models\Schedule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['sometimes', 'nullable', 'string', 'max:1000'],
            'icon' => ['sometimes', 'nullable', 'string', 'max:100'],
            'type' => ['sometimes', Rule::enum(ScheduleType::class)],
            'period_type' => ['sometimes', Rule::enum(SchedulePeriodType::class)],
            'parent_id' => ['sometimes', 'nullable', 'integer', 'exists:schedules,id'],
            'day_of_month' => ['sometimes', 'nullable', 'integer', 'between:1,31'],
            'day_of_week' => ['sometimes', 'nullable', 'integer', 'between:0,6'],
            'time_of_day' => ['sometimes', 'nullable', 'string', 'max:10'],
            'single_date' => ['sometimes', 'nullable', 'date'],
            'amount' => ['sometimes', 'numeric'],
            'end_date' => ['sometimes', 'nullable', 'date'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($v) {
            if ($this->has('parent_id') && $this->input('parent_id')) {
                $schedule = $this->route('schedule');
                if ($schedule instanceof Schedule) {
                    $newParent = Schedule::find($this->input('parent_id'));
                    if ($newParent) {
                        if ($newParent->group_id !== $schedule->group_id || $newParent->type !== ScheduleType::INCOME) {
                            $v->errors()->add('parent_id', 'Invalid parent income');
                        }
                    }
                }
            }
        });
    }
}
