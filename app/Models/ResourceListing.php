<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ResourceListing extends Model
{
    protected $fillable = [
        'farmer_profile_id',
        'agri_resource_id',
        'quantity',
        'havested_at',
        'preservation_method',
        'img',
        'price',
        'estimated_price',
        'fresh_until',
        'freshness_status',
        'ai_analysis_message',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'float',
            'havested_at' => 'datetime',
            'price' => 'float',
            'estimated_price' => 'float',
            'fresh_until' => 'date',
        ];
    }

    public function farmerProfile(): BelongsTo
    {
        return $this->belongsTo(FarmerProfile::class);
    }

    public function agriResource(): BelongsTo
    {
        return $this->belongsTo(AgriResource::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }
}
