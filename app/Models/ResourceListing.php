<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'float',
            'havested_at' => 'datetime',
            'price' => 'float',
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
}
