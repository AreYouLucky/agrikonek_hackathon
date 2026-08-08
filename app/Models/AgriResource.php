<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AgriResource extends Model
{
    protected $fillable = [
        'name',
        'img',
    ];

    public function resourceListings(): HasMany
    {
        return $this->hasMany(ResourceListing::class);
    }

    public function marketPrices(): HasMany
    {
        return $this->hasMany(MarketPrice::class);
    }

    public function processorDemands(): HasMany
    {
        return $this->hasMany(ProcessorProfileTransaction::class);
    }
}
