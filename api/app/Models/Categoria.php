<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Categoria extends Model
{
    protected $fillable = [
        'nombre',
        'icono',
        'color',
    ];

    protected $table = 'categorias';

    public function reportes(): HasMany
    {
        return $this->hasMany(Reporte::class, 'categoria_id');
    }
}
