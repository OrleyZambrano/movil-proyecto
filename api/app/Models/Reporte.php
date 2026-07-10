<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Reporte extends Model
{
    protected $fillable = [
        'usuario_id',
        'categoria_id',
        'titulo',
        'descripcion',
        'fotografia',
        'latitud',
        'longitud',
        'direccion',
        'prioridad',
        'estado',
        'fecha_reporte',
    ];

    protected function casts(): array
    {
        return [
            'latitud' => 'decimal:7',
            'longitud' => 'decimal:7',
            'prioridad' => 'integer',
            'fecha_reporte' => 'datetime',
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function categoria(): BelongsTo
    {
        return $this->belongsTo(Categoria::class, 'categoria_id');
    }

    public function comentarios(): HasMany
    {
        return $this->hasMany(Comentario::class, 'reporte_id');
    }

    public function notificaciones(): HasMany
    {
        return $this->hasMany(Notificacion::class, 'reporte_id');
    }
}
