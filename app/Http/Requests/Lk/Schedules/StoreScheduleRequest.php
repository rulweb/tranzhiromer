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
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'icon' => ['nullable', 'string', 'max:100'],
            'type' => ['required', Rule::enum(ScheduleType::class)],
            'period_type' => ['required', Rule::enum(SchedulePeriodType::class)],
            'parent_id' => ['nullable', 'integer', 'exists:schedules,id'],
            'day_of_month' => ['nullable', 'integer', 'between:1,31', Rule::requiredIf(fn () => $this->input('period_type') === SchedulePeriodType::MONTHLY->value)],
            'day_of_week' => ['nullable', 'integer', 'between:0,6', Rule::requiredIf(fn () => $this->input('period_type') === SchedulePeriodType::WEEKLY->value)],
            'time_of_day' => ['nullable', 'string', 'max:10', Rule::requiredIf(fn () => $this->input('period_type') === SchedulePeriodType::DAILY->value)],
            'single_date' => ['nullable', 'date', Rule::requiredIf(fn () => $this->input('period_type') === SchedulePeriodType::ONE_TIME->value)],
            'amount' => ['required', 'numeric'],
            'expected_leftover' => ['nullable', 'numeric'],
            'is_cash_leftover' => ['nullable', 'boolean'],
            'end_date' => ['nullable', 'date'],
        ];
    }
}
