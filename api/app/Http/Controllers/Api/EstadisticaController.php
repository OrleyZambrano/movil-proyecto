<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Categoria;
use App\Models\Reporte;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class EstadisticaController extends Controller
{
    public function index(): JsonResponse
    {
        if (auth()->user()->rol !== 'admin') {
            return response()->json(['error' => 'No autorizado'], 403);
        }

        $totalReportes = Reporte::count();
        $reportesPorEstado = Reporte::selectRaw('estado, count(*) as total')
            ->groupBy('estado')
            ->pluck('total', 'estado');

        $reportesPorCategoria = Categoria::withCount('reportes')
            ->get()
            ->pluck('reportes_count', 'nombre');

        $totalUsuarios = User::count();
        $usuariosPorRol = User::selectRaw('rol, count(*) as total')
            ->groupBy('rol')
            ->pluck('total', 'rol');

        return response()->json([
            'total_reportes'       => $totalReportes,
            'reportes_por_estado'  => $reportesPorEstado,
            'reportes_por_categoria' => $reportesPorCategoria,
            'total_usuarios'       => $totalUsuarios,
            'usuarios_por_rol'     => $usuariosPorRol,
        ]);
    }
}
