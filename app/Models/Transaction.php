<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transaction extends Model
{
    protected $fillable = [
        'processor_profile_id',
        'resource_listing_id',
        'quantity',
        'price',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'float',
            'price' => 'float',
        ];
    }

    public function resourceListing(): BelongsTo
    {
        return $this->belongsTo(ResourceListing::class);
    }

    public function processorProfile(): BelongsTo
    {
        return $this->belongsTo(ProcessorProfile::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    public function isAccessibleBy(User $user): bool
    {
        if ($user->role === 'lgu') {
            return true;
        }

        if ($user->role === 'processor') {
            return $this->processorProfile()
                ->where('user_id', $user->getKey())
                ->exists();
        }

        if ($user->role === 'farmer') {
            return $this->resourceListing()
                ->whereHas('farmerProfile', fn ($query) => $query
                    ->where('user_id', $user->getKey()))
                ->exists();
        }

        return false;
    }
}
