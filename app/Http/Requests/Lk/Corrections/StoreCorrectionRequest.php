<?php

namespace App\Http\Requests\Lk\Corrections;

use Illuminate\Foundation\Http\FormRequest;

class StoreCorrectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'schedule_id' => ['required', 'integer', 'exists:schedules,id'],
            'amount' => ['nullable', 'numeric'],
            'adjusted_date' => ['nullable', 'date'],
        ];
    }
}
