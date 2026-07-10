<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoriaController;
use App\Http\Controllers\Api\ComentarioController;
use App\Http\Controllers\Api\EstadisticaController;
use App\Http\Controllers\Api\NotificacionController;
use App\Http\Controllers\Api\ReporteController;
use App\Http\Controllers\Api\UsuarioController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Públicas
Route::post('register', [AuthController::class, 'register']);
Route::post('login', [AuthController::class, 'login']);

Route::get('reportes', [ReporteController::class, 'index']);
Route::get('reportes/{reporte}', [ReporteController::class, 'show']);
Route::get('reportes/{reporte}/comentarios', [ComentarioController::class, 'index']);

Route::get('categorias', [CategoriaController::class, 'index']);

// Autenticadas
Route::middleware('auth:sanctum')->group(function () {
    Route::post('logout', [AuthController::class, 'logout']);
    Route::get('user', [AuthController::class, 'user']);

    // Reportes
    Route::post('reportes', [ReporteController::class, 'store']);
    Route::put('reportes/{reporte}', [ReporteController::class, 'update']);
    Route::get('mis-reportes', [ReporteController::class, 'misReportes']);

    // Estado (funcionario, admin)
    Route::patch('reportes/{reporte}/estado', [ReporteController::class, 'updateEstado']);

    // Asignación a funcionario (admin)
    Route::post('reportes/{reporte}/asignar', [ReporteController::class, 'asignar']);

    // Comentarios (funcionario, admin)
    Route::post('reportes/{reporte}/comentarios', [ComentarioController::class, 'store']);

    // Notificaciones
    Route::get('notificaciones', [NotificacionController::class, 'index']);
    Route::patch('notificaciones/{id}/leida', [NotificacionController::class, 'marcarLeida']);

    // Usuarios (admin)
    Route::get('usuarios', [UsuarioController::class, 'index']);
    Route::post('usuarios', [UsuarioController::class, 'store']);
    Route::put('usuarios/{usuario}', [UsuarioController::class, 'update']);
    Route::delete('usuarios/{usuario}', [UsuarioController::class, 'destroy']);
    Route::get('funcionarios', [UsuarioController::class, 'funcionarios']);

    // Estadísticas (admin)
    Route::get('estadisticas', [EstadisticaController::class, 'index']);

    // Categorías (admin)
    Route::post('categorias', [CategoriaController::class, 'store']);
    Route::put('categorias/{categoria}', [CategoriaController::class, 'update']);
    Route::delete('categorias/{categoria}', [CategoriaController::class, 'destroy']);

    // Reportes (admin)
    Route::delete('reportes/{reporte}', [ReporteController::class, 'destroy']);
});
