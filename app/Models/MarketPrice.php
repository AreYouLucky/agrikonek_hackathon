<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MarketPrice extends Model
{
    protected $fillable = [
        'agri_resource_id',
        'specifications',
        'longitude',
        'latitude',
        'province',
        'region',
        'market',
        'price',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'float',
        ];
    }

    public function agriResource(): BelongsTo
    {
        return $this->belongsTo(AgriResource::class);
    }
}
