<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReporteRequest extends FormRequest
{
    public function authorize(): true
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'categoria_id' => ['required', 'integer', 'exists:categorias,id'],
            'titulo'       => ['required', 'string', 'max:255'],
            'descripcion'  => ['required', 'string', 'max:2000'],
            'fotografia'   => ['nullable', 'image', 'max:5120'],
            'fotografia_base64' => ['nullable', 'string'],
            'fotografia_tipo'   => ['nullable', 'string'],
            'fotografias_base64' => ['nullable', 'array'],
            'fotografias_base64.*.base64' => ['nullable', 'string'],
            'fotografias_base64.*.tipo' => ['nullable', 'string'],
            'fotografias_actuales' => ['nullable', 'array'],
            'fotografias_actuales.*' => ['nullable', 'string'],
            'latitud'      => ['required', 'numeric', 'between:-90,90'],
            'longitud'     => ['required', 'numeric', 'between:-180,180'],
            'direccion'    => ['nullable', 'string', 'max:500'],
            'prioridad'    => ['required', 'integer', 'min:1', 'max:5'],
        ];
    }

    public function messages(): array
    {
        return [
            'categoria_id.required' => 'La categoría es obligatoria.',
            'categoria_id.exists'   => 'La categoría seleccionada no es válida.',
            'titulo.required'       => 'El título es obligatorio.',
            'descripcion.required'  => 'La descripción es obligatoria.',
            'latitud.required'      => 'La ubicación es obligatoria.',
            'longitud.required'     => 'La ubicación es obligatoria.',
            'prioridad.required'    => 'La prioridad es obligatoria.',
            'prioridad.min'         => 'La prioridad debe ser entre 1 y 5.',
            'prioridad.max'         => 'La prioridad debe ser entre 1 y 5.',
            'fotografia.max'        => 'La foto no debe superar los 5MB.',
        ];
    }
}
