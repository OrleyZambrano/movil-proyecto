<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('notificaciones', function (Blueprint $table) {
            $table->dropForeign(['reporte_id']);
            $table->string('tipo', 20)->default('reporte')->after('usuario_id');
        });

        Schema::table('notificaciones', function (Blueprint $table) {
            $table->foreignId('reporte_id')->nullable()->change();
            $table->foreignId('aviso_id')->nullable()->after('reporte_id')->constrained('avisos')->nullOnDelete();
            $table->foreign('reporte_id')->references('id')->on('reportes')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('notificaciones', function (Blueprint $table) {
            $table->dropForeign(['aviso_id']);
            $table->dropColumn('aviso_id');
            $table->dropColumn('tipo');
        });

        DB::table('notificaciones')->whereNull('reporte_id')->delete();

        Schema::table('notificaciones', function (Blueprint $table) {
            $table->foreignId('reporte_id')->nullable(false)->change();
        });
    }
};
