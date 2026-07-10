<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notificacion extends Model
{
    protected $table = 'notificaciones';

    protected $fillable = [
        'usuario_id',
        'reporte_id',
        'mensaje',
        'leida',
    ];

    protected function casts(): array
    {
        return [
            'leida' => 'boolean',
        ];
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }

    public function reporte(): BelongsTo
    {
        return $this->belongsTo(Reporte::class, 'reporte_id');
    }
}
