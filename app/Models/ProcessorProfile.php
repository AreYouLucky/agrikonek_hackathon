<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProcessorProfile extends Model
{
    protected $fillable = [
        'user_id',
        'business_name',
        'business_type',
        'complete_address',
        'latitude',
        'longitude',
        'contact_number',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function resourceDemands(): HasMany
    {
        return $this->hasMany(ProcessorProfileTransaction::class);
    }
}
