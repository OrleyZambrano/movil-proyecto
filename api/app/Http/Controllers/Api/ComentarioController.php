<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreComentarioRequest;
use App\Http\Resources\ComentarioResource;
use App\Models\Comentario;
use App\Models\Reporte;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ComentarioController extends Controller
{
    public function index(Reporte $reporte): AnonymousResourceCollection
    {
        return ComentarioResource::collection(
            $reporte->comentarios()->with('usuario')->orderBy('id', 'desc')->get()
        );
    }

    public function store(StoreComentarioRequest $request, Reporte $reporte)
    {
        $comentario = Comentario::create([
            'reporte_id' => $reporte->id,
            'usuario_id' => auth()->id(),
            'comentario' => $request->comentario,
        ]);

        return ComentarioResource::make($comentario->load('usuario'))
            ->response()
            ->setStatusCode(201);
    }
}
