<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReporteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'          => $this->id,
            'titulo'      => $this->titulo,
            'descripcion' => $this->descripcion,
            'fotografia'  => $this->fotografia ? asset('storage/' . $this->fotografia) : null,
            'latitud'     => $this->latitud,
            'longitud'    => $this->longitud,
            'direccion'   => $this->direccion,
            'prioridad'   => $this->prioridad,
            'estado'      => $this->estado,
            'fecha_reporte' => $this->fecha_reporte,
            'creado'      => $this->created_at->diffForHumans(),
            'categoria'   => $this->whenLoaded('categoria', fn() => [
                'id'     => $this->categoria->id,
                'nombre' => $this->categoria->nombre,
                'icono'  => $this->categoria->icono,
                'color'  => $this->categoria->color,
            ]),
            'usuario'     => $this->whenLoaded('usuario', fn() => [
                'id'   => $this->usuario->id,
                'name' => $this->usuario->name,
            ]),
            'comentarios' => ComentarioResource::collection($this->whenLoaded('comentarios')),
        ];
    }
}
