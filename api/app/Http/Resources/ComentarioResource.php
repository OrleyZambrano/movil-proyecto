<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ComentarioResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'comentario' => $this->comentario,
            'creado'     => $this->created_at->diffForHumans(),
            'usuario'    => $this->whenLoaded('usuario', fn() => [
                'id'   => $this->usuario->id,
                'name' => $this->usuario->name,
            ]),
        ];
    }
}
