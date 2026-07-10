<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reportes', function (Blueprint $table) {
            // Varias fotos por reporte (array de rutas relativas).
            // Se mantiene "fotografia" (la principal) por compatibilidad.
            $table->json('fotografias')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('reportes', function (Blueprint $table) {
            $table->dropColumn('fotografias');
        });
    }
};
