<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AvisoResource;
use App\Models\Aviso;
use App\Models\Notificacion;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class AvisoController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Aviso::with('usuario')->orderBy('id', 'desc');

        if ($request->filled('tipo')) {
            $query->where('tipo', $request->tipo);
        }

        if ($request->filled('activo')) {
            $query->where('activo', filter_var($request->activo, FILTER_VALIDATE_BOOLEAN));
        }

        return AvisoResource::collection($query->paginate(20));
    }

    public function show(Aviso $aviso): AvisoResource
    {
        return AvisoResource::make($aviso->load('usuario'));
    }

    public function store(Request $request): JsonResponse
    {
        if (!in_array(auth()->user()->rol, ['funcionario', 'admin'])) {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $data = $request->validate([
            'titulo' => ['required', 'string', 'max:255'],
            'descripcion' => ['required', 'string'],
            'tipo' => ['required', 'in:corte_luz,corte_agua,ayuda,evento,emergencia,otro'],
            'prioridad' => ['sometimes', 'integer', 'min:1', 'max:5'],
            'latitud' => ['nullable', 'numeric'],
            'longitud' => ['nullable', 'numeric'],
            'direccion' => ['nullable', 'string', 'max:500'],
            'fecha_inicio' => ['nullable', 'date'],
            'fecha_fin' => ['nullable', 'date', 'after_or_equal:fecha_inicio'],
        ]);

        $data['usuario_id'] = auth()->id();
        $data['activo'] = true;

        $aviso = Aviso::create($data);

        if ($request->boolean('notificar_todos', false)) {
            $usuarios = User::where('id', '!=', auth()->id())->pluck('id');
            $notificaciones = $usuarios->map(fn($uid) => [
                'usuario_id' => $uid,
                'aviso_id' => $aviso->id,
                'tipo' => 'aviso',
                'mensaje' => "Nuevo aviso: {$aviso->titulo} (" . $this->tipoLegible($aviso->tipo) . ')',
                'leida' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ])->toArray();

            Notificacion::insert($notificaciones);
        }

        return AvisoResource::make($aviso->load('usuario'))
            ->response()
            ->setStatusCode(201);
    }

    public function update(Request $request, Aviso $aviso): JsonResponse
    {
        if ($aviso->usuario_id !== auth()->id() && auth()->user()->rol !== 'admin') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $data = $request->validate([
            'titulo' => ['sometimes', 'string', 'max:255'],
            'descripcion' => ['sometimes', 'string'],
            'tipo' => ['sometimes', 'in:corte_luz,corte_agua,ayuda,evento,emergencia,otro'],
            'prioridad' => ['sometimes', 'integer', 'min:1', 'max:5'],
            'latitud' => ['nullable', 'numeric'],
            'longitud' => ['nullable', 'numeric'],
            'direccion' => ['nullable', 'string', 'max:500'],
            'fecha_inicio' => ['nullable', 'date'],
            'fecha_fin' => ['nullable', 'date'],
            'activo' => ['sometimes', 'boolean'],
        ]);

        $aviso->update($data);

        return AvisoResource::make($aviso->load('usuario'))->response();
    }

    public function destroy(Aviso $aviso): JsonResponse
    {
        if (auth()->user()->rol !== 'admin') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $aviso->delete();

        return response()->json(['mensaje' => 'Aviso eliminado']);
    }

    public function cercanos(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'lat' => ['required', 'numeric'],
            'lng' => ['required', 'numeric'],
            'radio' => ['sometimes', 'numeric', 'min:1', 'max:50'],
        ]);

        $lat = $request->lat;
        $lng = $request->lng;
        $radio = $request->radio ?? 5;

        $avisos = Aviso::with('usuario')
            ->where('activo', true)
            ->whereNotNull('latitud')
            ->whereNotNull('longitud')
            ->selectRaw("*, (
                6371 * acos(
                    cos(radians(?)) * cos(radians(latitud)) *
                    cos(radians(longitud) - radians(?)) +
                    sin(radians(?)) * sin(radians(latitud))
                )
            ) AS distancia", [$lat, $lng, $lat])
            ->having('distancia', '<=', $radio)
            ->orderBy('distancia')
            ->paginate(50);

        return AvisoResource::collection($avisos);
    }

    private function tipoLegible(string $tipo): string
    {
        return [
            'corte_luz' => 'Corte de luz',
            'corte_agua' => 'Corte de agua',
            'ayuda' => 'Ayuda/Solicitud',
            'evento' => 'Evento',
            'emergencia' => 'Emergencia',
            'otro' => 'Otro',
        ][$tipo] ?? $tipo;
    }
}
