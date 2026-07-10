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
            'fotografias' => collect($this->fotografias ?? [])
                ->filter()
                ->map(fn($f) => asset('storage/' . $f))
                ->values()
                ->all(),
            'latitud'     => $this->latitud,
            'longitud'    => $this->longitud,
            'direccion'   => $this->direccion,
            'prioridad'   => $this->prioridad,
            'estado'      => $this->estado,
            'fecha_reporte' => $this->fecha_reporte,
            'creado'      => $this->created_at->diffForHumans(),
            'usuario_id'    => $this->usuario_id,
            'categoria_id'  => $this->categoria_id,
            'funcionario_id' => $this->funcionario_id,
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
            'funcionario' => $this->whenLoaded('funcionario', fn() => $this->funcionario ? [
                'id'   => $this->funcionario->id,
                'name' => $this->funcionario->name,
            ] : null),
            'historial'   => HistorialEstadoResource::collection($this->whenLoaded('historial')),
            'comentarios' => ComentarioResource::collection($this->whenLoaded('comentarios')),
        ];
    }
}
