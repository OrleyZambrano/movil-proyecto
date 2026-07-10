<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReporteRequest;
use App\Http\Requests\UpdateReporteRequest;
use App\Http\Requests\UpdateEstadoRequest;
use App\Http\Resources\ReporteResource;
use App\Models\Reporte;
use App\Models\Notificacion;
use App\Models\HistorialEstado;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;

class ReporteController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Reporte::with(['usuario', 'categoria', 'funcionario']);

        if ($request->filled('categoria_id')) {
            $query->where('categoria_id', $request->categoria_id);
        }

        if ($request->filled('estado')) {
            $query->where('estado', $request->estado);
        }

        // Filtro: reportes asignados a un funcionario, o sin asignar.
        if ($request->filled('funcionario_id')) {
            if ($request->funcionario_id === 'null') {
                $query->whereNull('funcionario_id');
            } else {
                $query->where('funcionario_id', $request->funcionario_id);
            }
        }

        return ReporteResource::collection(
            $query->orderBy('id', 'desc')->paginate(20)
        );
    }

    public function store(StoreReporteRequest $request)
    {
        $data = $request->validated();
        $data['usuario_id'] = auth()->id();
        // El frontend no envía "estado". La columna tiene default 'pendiente' en
        // la BD, pero Eloquent NO recarga ese default en memoria, así que
        // $reporte->estado quedaría null y el HistorialEstado (estado NOT NULL)
        // fallaría con SQLSTATE[23000]. Lo asignamos explícitamente aquí.
        $data['estado'] = $data['estado'] ?? 'pendiente';

        if ($request->filled('fotografias_base64') && is_array($request->fotografias_base64)) {
            $rutas = $this->guardarImagenesBase64($request->fotografias_base64);
            if (!empty($rutas)) {
                $data['fotografias'] = $rutas;
                $data['fotografia'] = $rutas[0]; // principal, por compatibilidad
            }
        } elseif ($request->filled('fotografia_base64')) {
            $data['fotografia'] = $this->guardarImagenBase64($request->fotografia_base64, $request->fotografia_tipo);
            $data['fotografias'] = [$data['fotografia']];
        } elseif ($request->hasFile('fotografia')) {
            $data['fotografia'] = $request->file('fotografia')->store('reportes', 'public');
            $data['fotografias'] = [$data['fotografia']];
        }

        $reporte = Reporte::create($data);

        HistorialEstado::create([
            'reporte_id' => $reporte->id,
            'usuario_id' => auth()->id(),
            'estado'     => $reporte->estado,
            'comentario' => 'Reporte creado',
        ]);

        return ReporteResource::make($reporte->load(['usuario', 'categoria']))
            ->response()
            ->setStatusCode(201);
    }

    public function show(Reporte $reporte): ReporteResource
    {
        return ReporteResource::make(
            $reporte->load(['usuario', 'categoria', 'funcionario', 'comentarios.usuario', 'historial.usuario'])
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

        // En edición, las fotos "actuales" que se conservan son la fuente de
        // verdad. Si el usuario solo QUITA fotos (sin agregar nuevas), viene
        // 'fotografias_actuales' pero no 'fotografias_base64'; por eso el bloque
        // se activa con cualquiera de los dos, no solo con base64.
        if ($request->has('fotografias_actuales')) {
            $actuales = is_array($request->input('fotografias_actuales'))
                ? $request->input('fotografias_actuales')
                : [];
            $nuevas = [];
            if ($request->filled('fotografias_base64') && is_array($request->fotografias_base64)) {
                $nuevas = $this->guardarImagenesBase64($request->fotografias_base64);
            }
            $todas = array_merge($actuales, $nuevas);
            $data['fotografias'] = $todas;
            $data['fotografia'] = $todas[0] ?? null;
        } elseif ($request->filled('fotografias_base64') && is_array($request->fotografias_base64)) {
            $todas = $this->guardarImagenesBase64($request->fotografias_base64);
            if (!empty($todas)) {
                $data['fotografias'] = $todas;
                $data['fotografia'] = $todas[0];
            }
        } elseif ($request->filled('fotografia_base64')) {
            $data['fotografia'] = $this->guardarImagenBase64($request->fotografia_base64, $request->fotografia_tipo);
            $data['fotografias'] = [$data['fotografia']];
        } elseif ($request->hasFile('fotografia')) {
            $data['fotografia'] = $request->file('fotografia')->store('reportes', 'public');
            $data['fotografias'] = [$data['fotografia']];
        }

        $reporte->update($data);

        return ReporteResource::make($reporte->load(['usuario', 'categoria']))->response();
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

        HistorialEstado::create([
            'reporte_id' => $reporte->id,
            'usuario_id' => auth()->id(),
            'estado'     => $reporte->estado,
            'comentario' => $request->comentario,
        ]);

        Notificacion::create([
            'usuario_id' => $reporte->usuario_id,
            'reporte_id' => $reporte->id,
            // str_replace para mostrar "en proceso" en lugar de "en_proceso".
            'mensaje'    => "Tu reporte '{$reporte->titulo}' cambió a estado: " . str_replace('_', ' ', $request->estado),
        ]);

        return ReporteResource::make($reporte->load(['usuario', 'categoria']))->response();
    }

    public function asignar(Request $request, Reporte $reporte): JsonResponse
    {
        if (auth()->user()->rol !== 'admin') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $request->validate([
            'funcionario_id' => ['required', 'exists:users,id'],
        ]);

        $funcionario = User::find($request->funcionario_id);
        if ($funcionario->rol !== 'funcionario') {
            return response()->json(['error' => 'El usuario debe ser funcionario'], 422);
        }

        $reporte->update(['funcionario_id' => $funcionario->id]);

        HistorialEstado::create([
            'reporte_id' => $reporte->id,
            'usuario_id' => auth()->id(),
            'estado'     => $reporte->estado,
            'comentario' => "Asignado a {$funcionario->name}",
        ]);

        Notificacion::create([
            'usuario_id' => $funcionario->id,
            'reporte_id' => $reporte->id,
            'mensaje'    => "Se te asignó el reporte '{$reporte->titulo}'",
        ]);

        return ReporteResource::make(
            $reporte->load(['usuario', 'categoria', 'funcionario'])
        )->response();
    }

    /**
     * Decodifica una imagen en base64 y la guarda en el disco público.
     * Acepta "data:image/png;base64,..." o base64 puro. Retorna la ruta
     * relativa o null si no se pudo decodificar.
     */
    private function guardarImagenBase64(?string $base64, ?string $tipo = null): ?string
    {
        if (!$base64) {
            return null;
        }
        $limpio = preg_replace('/^data:image\/\w+;base64,/', '', $base64);
        $decodificado = base64_decode($limpio, true);
        if ($decodificado === false || $decodificado === '') {
            return null;
        }
        $ext = 'jpg';
        if ($tipo && preg_match('/image\/(\w+)/', $tipo, $m)) {
            $ext = strtolower($m[1]) === 'jpeg' ? 'jpg' : strtolower($m[1]);
        }
        $nombre = 'reportes/' . uniqid('rep_', true) . '.' . $ext;
        Storage::disk('public')->put($nombre, $decodificado);
        return $nombre;
    }

    /**
     * Guarda varias imágenes en base64. Recibe un array de
     * ["base64" => ..., "tipo" => ...] y retorna un array de rutas relativas.
     */
    private function guardarImagenesBase64(?array $items): array
    {
        if (empty($items)) {
            return [];
        }
        $rutas = [];
        foreach ($items as $item) {
            if (!is_array($item) || empty($item['base64'])) {
                continue;
            }
            $ruta = $this->guardarImagenBase64($item['base64'], $item['tipo'] ?? null);
            if ($ruta) {
                $rutas[] = $ruta;
            }
        }
        return $rutas;
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
