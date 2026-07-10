<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReporteRequest;
use App\Http\Requests\UpdateReporteRequest;
use App\Http\Requests\UpdateEstadoRequest;
use App\Http\Resources\ReporteResource;
use App\Models\Reporte;
use App\Models\Notificacion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ReporteController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Reporte::with(['usuario', 'categoria']);

        if ($request->filled('categoria_id')) {
            $query->where('categoria_id', $request->categoria_id);
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        return ReporteResource::collection(
            $query->orderBy('id', 'desc')->paginate(20)
        );
    }

    public function store(StoreReporteRequest $request)
    {
        $data = $request->validated();
        $data['usuario_id'] = auth()->id();

        if ($request->hasFile('fotografia')) {
            $data['fotografia'] = $request->file('fotografia')->store('reportes', 'public');
        }

        $reporte = Reporte::create($data);

        return ReporteResource::make($reporte->load(['usuario', 'categoria']))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Reporte $reporte): ReporteResource
    {
        return ReporteResource::make(
            $reporte->load(['usuario', 'categoria', 'comentarios.usuario'])
        );
    }

    public function update(UpdateReporteRequest $request, Reporte $reporte): JsonResponse
    {
        if ($reporte->usuario_id !== auth()->id()) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        if ($reporte->estado !== 'pendiente') {
            return response()->json(['error' => 'Solo puedes editar reportes pendientes'], 422);
        }

        $data = $request->validated();

        if ($request->hasFile('fotografia')) {
            $data['fotografia'] = $request->file('fotografia')->store('reportes', 'public');
        }

        $reporte->update($data);

        return ReporteResource::make($reporte->load(['usuario', 'categoria']));
    }

    public function destroy(Reporte $reporte): JsonResponse
    {
        if (auth()->user()->rol !== 'admin') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $reporte->delete();

        return response()->json(['mensaje' => 'Reporte eliminado']);
    }

    public function updateEstado(UpdateEstadoRequest $request, Reporte $reporte): JsonResponse
    {
        if (!in_array(auth()->user()->rol, ['funcionario', 'admin'])) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $reporte->update($request->validated());

        Notificacion::create([
            'usuario_id' => $reporte->usuario_id,
            'reporte_id' => $reporte->id,
            'mensaje'    => "Tu reporte '{$reporte->titulo}' cambió a estado: {$request->estado}",
        ]);

        return ReporteResource::make($reporte->load(['usuario', 'categoria']))->response();
    }

    public function misReportes(Request $request): AnonymousResourceCollection
    {
        return ReporteResource::collection(
            Reporte::with(['categoria'])
                ->where('usuario_id', auth()->id())
                ->orderBy('id', 'desc')
                ->paginate(20)
        );
    }
}
