<?php

namespace App\Http\Requests\Lk\Schedules;

use App\Enums\SchedulePeriodType;
use App\Enums\ScheduleType;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'group_id' => ['required', 'integer', 'exists:groups,id'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'icon' => ['nullable', 'string', 'max:100'],
            'type' => ['required', Rule::enum(ScheduleType::class)],
            'period_type' => ['required', Rule::enum(SchedulePeriodType::class)],
            'parent_id' => ['nullable', 'integer', 'exists:schedules,id'],
            'day_of_month' => ['nullable', 'integer', 'between:1,31'],
            'day_of_week' => ['nullable', 'integer', 'between:0,6'],
            'time_of_day' => ['nullable', 'string', 'max:10'],
            'single_date' => ['nullable', 'date'],
            'amount' => ['required', 'numeric'],
            'end_date' => ['nullable', 'date'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($v) {
            $type = $this->input('type');
            if ($type === ScheduleType::EXPENSE->value && empty($this->input('parent_id'))) {
                $v->errors()->add('parent_id', 'Expense must have parent_id (income)');
            }
        });
    }
}
