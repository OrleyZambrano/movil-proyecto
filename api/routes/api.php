<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoriaController;
use App\Http\Controllers\Api\ComentarioController;
use App\Http\Controllers\Api\EstadisticaController;
use App\Http\Controllers\Api\NotificacionController;
use App\Http\Controllers\Api\ReporteController;
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

    // Comentarios (funcionario, admin)
    Route::post('reportes/{reporte}/comentarios', [ComentarioController::class, 'store']);

    // Notificaciones
    Route::get('notificaciones', [NotificacionController::class, 'index']);
    Route::patch('notificaciones/{id}/leida', [NotificacionController::class, 'marcarLeida']);

    // Estadísticas (admin)
    Route::get('estadisticas', [EstadisticaController::class, 'index']);

    // Categorías (admin)
    Route::post('categorias', [CategoriaController::class, 'store']);
    Route::put('categorias/{categoria}', [CategoriaController::class, 'update']);
    Route::delete('categorias/{categoria}', [CategoriaController::class, 'destroy']);

    // Reportes (admin)
    Route::delete('reportes/{reporte}', [ReporteController::class, 'destroy']);
});
