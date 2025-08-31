<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PaymentAllocationMoveRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'target_cycle_id' => ['required', 'integer', 'exists:income_cycles,id'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'target_cycle_id.required' => 'Укажите целевой цикл.',
            'target_cycle_id.exists' => 'Целевой цикл не найден.',
        ];
    }
}
