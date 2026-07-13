<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AvisoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'titulo' => $this->titulo,
            'descripcion' => $this->descripcion,
            'tipo' => $this->tipo,
            'prioridad' => $this->prioridad,
            'latitud' => $this->latitud,
            'longitud' => $this->longitud,
            'direccion' => $this->direccion,
            'fecha_inicio' => $this->fecha_inicio,
            'fecha_fin' => $this->fecha_fin,
            'activo' => $this->activo,
            'creado' => $this->created_at->diffForHumans(),
            'usuario_id' => $this->usuario_id,
            'usuario' => $this->whenLoaded('usuario', fn() => [
                'id' => $this->usuario->id,
                'name' => $this->usuario->name,
            ]),
        ];
    }
}
