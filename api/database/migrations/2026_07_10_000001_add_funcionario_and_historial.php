<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reportes', function (Blueprint $table) {
            $table->foreignId('funcionario_id')
                ->nullable()
                ->after('usuario_id')
                ->constrained('users')
                ->nullOnDelete();
        });

        Schema::create('reporte_historial_estados', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reporte_id')->constrained('reportes')->onDelete('cascade');
            $table->foreignId('usuario_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('estado');
            $table->text('comentario')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reporte_historial_estados');
        Schema::table('reportes', function (Blueprint $table) {
            $table->dropForeign(['funcionario_id']);
            $table->dropColumn('funcionario_id');
        });
    }
};
