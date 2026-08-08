<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Transaction extends Model
{
    protected $fillable = [
        'processor_profile_id',
        'agri_resource_id',
        'quantity',
        'price',
        'status',
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

        return $this->processorProfile()
            ->where('user_id', $user->getKey())
            ->exists();
    }
}
