<?php

namespace App\Http\Requests\Lk\Corrections;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCorrectionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'amount' => ['nullable', 'numeric'],
            'adjusted_date' => ['nullable', 'date'],
        ];
    }
}
