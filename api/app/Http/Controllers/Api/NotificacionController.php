<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\NotificacionResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class NotificacionController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return NotificacionResource::collection(
            auth()->user()->notificaciones()->orderBy('id', 'desc')->get()
        );
    }

    public function marcarLeida($id): JsonResponse
    {
        $notificacion = auth()->user()->notificaciones()->findOrFail($id);
        $notificacion->update(['leida' => true]);

        return response()->json(['mensaje' => 'Notificación marcada como leída']);
    }
}
