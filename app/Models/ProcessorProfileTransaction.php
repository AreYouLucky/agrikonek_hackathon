<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProcessorProfileTransaction extends Model
{
    protected $fillable = [
        'processor_profile_id',
        'agri_resource_id',
        'quantity',
        'price',
        'remarks',
    ];

    public function agriResource()
    {
        return $this->belongsTo(AgriResource::class);
    }
}
