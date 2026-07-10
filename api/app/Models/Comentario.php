<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Comentario extends Model
{
    protected $fillable = [
        'reporte_id',
        'usuario_id',
        'comentario',
    ];

    public function reporte(): BelongsTo
    {
        return $this->belongsTo(Reporte::class, 'reporte_id');
    }

    public function usuario(): BelongsTo
    {
        return $this->belongsTo(User::class, 'usuario_id');
    }
}
