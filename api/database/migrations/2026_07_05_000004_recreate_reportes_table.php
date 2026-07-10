<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('reportes');

        Schema::create('reportes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('usuario_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('categoria_id')->constrained('categorias')->onDelete('cascade');
            $table->string('titulo', 255);
            $table->text('descripcion');
            $table->string('fotografia', 255)->nullable();
            $table->decimal('latitud', 10, 7);
            $table->decimal('longitud', 10, 7);
            $table->string('direccion', 500)->nullable();
            $table->unsignedTinyInteger('prioridad'); // 1-5
            $table->enum('estado', ['pendiente', 'en_revision', 'en_proceso', 'resuelto', 'rechazado'])->default('pendiente');
            $table->timestamp('fecha_reporte')->useCurrent();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reportes');

        Schema::create('reportes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('titulo', 100);
            $table->string('descripcion', 500);
            $table->enum('categoria', ['bache', 'alumbrado', 'basura', 'areas_verdes', 'otro']);
            $table->unsignedTinyInteger('urgencia');
            $table->string('telefono_contacto', 10);
            $table->string('foto');
            $table->decimal('lat', 10, 7);
            $table->decimal('lng', 10, 7);
            $table->enum('estado', ['pendiente', 'en_proceso', 'resuelto'])->default('pendiente');
            $table->timestamps();
        });
    }
};
