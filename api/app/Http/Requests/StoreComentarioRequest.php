<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreComentarioRequest extends FormRequest
{
    public function authorize(): true
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'comentario' => ['required', 'string', 'max:2000'],
        ];
    }

    public function messages(): array
    {
        return [
            'comentario.required' => 'El comentario no puede estar vacío.',
        ];
    }
}
