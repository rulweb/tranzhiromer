<?php

namespace App\Http\Requests\Lk\Schedules;

use Illuminate\Foundation\Http\FormRequest;

class PayScheduleRequest extends FormRequest
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
            'leftover' => ['required', 'numeric'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'leftover.required' => 'Укажите остаток',
            'leftover.numeric' => 'Остаток должен быть числом',
        ];
    }
}
