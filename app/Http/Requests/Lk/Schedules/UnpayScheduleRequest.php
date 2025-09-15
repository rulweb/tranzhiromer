<?php

namespace App\Http\Requests\Lk\Schedules;

use Illuminate\Foundation\Http\FormRequest;

class UnpayScheduleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'payment_id' => ['required', 'integer', 'exists:schedule_payments,id'],
        ];
    }
}
