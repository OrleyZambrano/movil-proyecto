<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reportes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('titulo', 100);
            $table->string('descripcion', 500);
            $table->enum('categoria', ['bache', 'alumbrado', 'basura', 'areas_verdes', 'otro']);
            $table->unsignedTinyInteger('urgencia'); // 1-5
            $table->string('telefono_contacto', 10);
            $table->string('foto');
            $table->decimal('lat', 10, 7);
            $table->decimal('lng', 10, 7);
            $table->enum('estado', ['pendiente', 'en_proceso', 'resuelto'])->default('pendiente');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reportes');
    }
};
