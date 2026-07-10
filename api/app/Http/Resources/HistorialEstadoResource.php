<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HistorialEstadoResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'        => $this->id,
            'estado'    => $this->estado,
            'comentario' => $this->comentario,
            'creado'    => $this->created_at->diffForHumans(),
            'usuario'    => $this->whenLoaded('usuario', fn() => $this->usuario ? [
                'id'   => $this->usuario->id,
                'name' => $this->usuario->name,
            ] : null),
        ];
    }
}
