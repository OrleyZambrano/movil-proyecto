<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name'     => 'Administrador',
            'email'    => 'admin@reportes.com',
            'password' => Hash::make('admin123'),
            'telefono' => '5555555555',
            'rol'      => 'admin',
        ]);

        User::create([
            'name'     => 'Funcionario',
            'email'    => 'funcionario@reportes.com',
            'password' => Hash::make('func123'),
            'telefono' => '5555555556',
            'rol'      => 'funcionario',
        ]);

        User::create([
            'name'     => 'Ciudadano',
            'email'    => 'ciudadano@reportes.com',
            'password' => Hash::make('ciudadano123'),
            'telefono' => '5555555557',
            'rol'      => 'ciudadano',
        ]);
    }
}
