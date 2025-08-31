<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class PaymentAllocationUpdateRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Ownership checks should be enforced via policies in controller.
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'planned_amount' => ['required', 'numeric', 'min:0'],
            'planned_due_on' => ['nullable', 'date'],
            'status' => ['nullable', 'in:planned,partial,paid,skipped'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'planned_amount.required' => 'Укажите сумму.',
            'planned_amount.numeric' => 'Сумма должна быть числом.',
            'planned_amount.min' => 'Сумма не может быть отрицательной.',
            'planned_due_on.date' => 'Некорректная дата.',
            'status.in' => 'Недопустимый статус.',
            'notes.max' => 'Слишком длинное примечание.',
        ];
    }
}
