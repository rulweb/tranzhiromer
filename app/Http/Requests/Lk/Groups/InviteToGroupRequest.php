<?php

namespace App\Http\Requests\Lk\Groups;

use Illuminate\Foundation\Http\FormRequest;

class InviteToGroupRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'email' => ['required', 'email', 'max:255'],
        ];
    }
}
