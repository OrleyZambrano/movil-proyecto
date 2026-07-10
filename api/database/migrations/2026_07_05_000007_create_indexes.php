<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reportes', function (Blueprint $table) {
            $table->index('usuario_id', 'idx_reportes_usuario_id');
            $table->index('estado', 'idx_reportes_estado');
            $table->index('prioridad', 'idx_reportes_prioridad');
            $table->index('fecha_reporte', 'idx_reportes_fecha');
            $table->index(['estado', 'categoria_id'], 'idx_reportes_estado_categoria');
            $table->index(['usuario_id', 'estado'], 'idx_reportes_usuario_estado');
        });

        Schema::table('notificaciones', function (Blueprint $table) {
            $table->index(['usuario_id', 'leida'], 'idx_notificaciones_usuario_leida');
        });

        Schema::table('comentarios', function (Blueprint $table) {
            $table->index('reporte_id', 'idx_comentarios_reporte_id');
        });
    }

    public function down(): void
    {
        Schema::table('reportes', function (Blueprint $table) {
            $table->dropIndex('idx_reportes_usuario_id');
            $table->dropIndex('idx_reportes_estado');
            $table->dropIndex('idx_reportes_prioridad');
            $table->dropIndex('idx_reportes_fecha');
            $table->dropIndex('idx_reportes_estado_categoria');
            $table->dropIndex('idx_reportes_usuario_estado');
        });

        Schema::table('notificaciones', function (Blueprint $table) {
            $table->dropIndex('idx_notificaciones_usuario_leida');
        });

        Schema::table('comentarios', function (Blueprint $table) {
            $table->dropIndex('idx_comentarios_reporte_id');
        });
    }
};
