<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FarmerProfile extends Model
{
    protected $fillable = [
        'user_id',
        'farm_name',
        'farm_complete_address',
        'latitude',
        'longitude',
        'contact_number',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function resourceListings(): HasMany
    {
        return $this->hasMany(ResourceListing::class);
    }
}
