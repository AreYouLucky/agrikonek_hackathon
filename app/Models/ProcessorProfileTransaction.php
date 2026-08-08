<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProcessorProfileTransaction extends Model
{
    protected $fillable = [
        'user_id',
        'processor_profile_id',
        'agri_resource_id',
        'quantity',
        'price',
        'remarks',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'float',
            'price' => 'float',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function processorProfile(): BelongsTo
    {
        return $this->belongsTo(ProcessorProfile::class);
    }

    public function agriResource(): BelongsTo
    {
        return $this->belongsTo(AgriResource::class);
    }
}
