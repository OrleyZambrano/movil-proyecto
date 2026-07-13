<?php

namespace Database\Seeders;

use App\Models\Categoria;
use Illuminate\Database\Seeder;

class CategoriaSeeder extends Seeder
{
    public function run(): void
    {
        $categorias = [
            ['nombre' => 'Baches',          'icono' => 'car',           'color' => '#ff6d00'],
            ['nombre' => 'Basura acumulada', 'icono' => 'trash',        'color' => '#64dd17'],
            ['nombre' => 'Alumbrado público','icono' => 'bulb',         'color' => '#ffd600'],
            ['nombre' => 'Fugas de agua',    'icono' => 'water',        'color' => '#2979ff'],
            ['nombre' => 'Alcantarillado',   'icono' => 'close-circle',  'color' => '#6200ea'],
            ['nombre' => 'Semáforos dañados', 'icono' => 'flag',        'color' => '#d50000'],
            ['nombre' => 'Árboles caídos',   'icono' => 'leaf',         'color' => '#00c853'],
            ['nombre' => 'Daños en parques', 'icono' => 'football',     'color' => '#00bfa5'],
            ['nombre' => 'Inundaciones',     'icono' => 'rainy',        'color' => '#1565c0'],
            ['nombre' => 'Vandalismo',       'icono' => 'flame',        'color' => '#d50000'],
            ['nombre' => 'Otros',            'icono' => 'ellipsis-horizontal',  'color' => '#546e7a'],
        ];

        foreach ($categorias as $cat) {
            Categoria::create($cat);
        }
    }
}
