<?php

namespace Database\Seeders;

use App\Models\Categoria;
use Illuminate\Database\Seeder;

class CategoriaSeeder extends Seeder
{
    public function run(): void
    {
        $categorias = [
            ['nombre' => 'Baches',         'icono' => 'car',          'color' => '#f97316'],
            ['nombre' => 'Basura acumulada','icono' => 'trash',       'color' => '#84cc16'],
            ['nombre' => 'Alumbrado público','icono' => 'bulb',       'color' => '#eab308'],
            ['nombre' => 'Fugas de agua',   'icono' => 'water',       'color' => '#06b6d4'],
            ['nombre' => 'Alcantarillado',  'icono' => 'close-circle', 'color' => '#6366f1'],
            ['nombre' => 'Semáforos dañados','icono' => 'flag',       'color' => '#ef4444'],
            ['nombre' => 'Árboles caídos',  'icono' => 'leaf',        'color' => '#22c55e'],
            ['nombre' => 'Daños en parques', 'icono' => 'football','color' => '#10b981'],
            ['nombre' => 'Inundaciones',    'icono' => 'rainy',       'color' => '#3b82f6'],
            ['nombre' => 'Vandalismo',      'icono' => 'flame',       'color' => '#dc2626'],
            ['nombre' => 'Otros',           'icono' => 'ellipsis-horizontal', 'color' => '#6b7280'],
        ];

        foreach ($categorias as $cat) {
            Categoria::create($cat);
        }
    }
}
