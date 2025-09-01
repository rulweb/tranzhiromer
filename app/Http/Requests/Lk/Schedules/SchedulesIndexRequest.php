<?php

namespace App\Http\Requests\Lk\Schedules;

use Illuminate\Foundation\Http\FormRequest;

class SchedulesIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'group_id' => ['nullable', 'integer', 'exists:groups,id'],
            'month' => ['nullable', 'date_format:Y-m'],
        ];
    }
}
