<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateEstadoRequest extends FormRequest
{
    public function authorize(): true
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'estado' => ['required', 'in:pendiente,en_revision,en_proceso,resuelto,rechazado'],
        ];
    }

    public function messages(): array
    {
        return [
            'estado.required' => 'El estado es obligatorio.',
            'estado.in'       => 'Estado no válido. Valores: pendiente, en_revision, en_proceso, resuelto, rechazado.',
        ];
    }
}
