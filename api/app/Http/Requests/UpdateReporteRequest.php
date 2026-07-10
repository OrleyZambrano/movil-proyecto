<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateReporteRequest extends FormRequest
{
    public function authorize(): true
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'categoria_id' => ['sometimes', 'integer', 'exists:categorias,id'],
            'titulo'       => ['sometimes', 'string', 'max:255'],
            'descripcion'  => ['sometimes', 'string', 'max:2000'],
            'fotografia'   => ['nullable', 'image', 'max:5120'],
            'latitud'      => ['sometimes', 'numeric', 'between:-90,90'],
            'longitud'     => ['sometimes', 'numeric', 'between:-180,180'],
            'direccion'    => ['nullable', 'string', 'max:500'],
            'prioridad'    => ['sometimes', 'integer', 'min:1', 'max:5'],
        ];
    }
}
