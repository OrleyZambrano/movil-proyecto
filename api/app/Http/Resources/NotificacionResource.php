<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class NotificacionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'       => $this->id,
            'mensaje'  => $this->mensaje,
            'leida'    => $this->leida,
            'reporte_id' => $this->reporte_id,
            'creado'   => $this->created_at->diffForHumans(),
        ];
    }
}
