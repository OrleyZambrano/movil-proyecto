<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('telefono', 20)->nullable()->after('password');
            $table->enum('rol', ['ciudadano', 'funcionario', 'admin'])->default('ciudadano')->after('telefono');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['telefono', 'rol']);
        });
    }
};
