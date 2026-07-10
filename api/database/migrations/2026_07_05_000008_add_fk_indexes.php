<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reportes', function (Blueprint $table) {
            $table->index('categoria_id', 'idx_reportes_categoria_id');
        });

        Schema::table('notificaciones', function (Blueprint $table) {
            $table->index('reporte_id', 'idx_notificaciones_reporte_id');
        });
    }

    public function down(): void
    {
        Schema::table('reportes', function (Blueprint $table) {
            $table->dropIndex('idx_reportes_categoria_id');
        });

        Schema::table('notificaciones', function (Blueprint $table) {
            $table->dropIndex('idx_notificaciones_reporte_id');
        });
    }
};
