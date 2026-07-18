<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DisasterAlert extends Model
{
    protected $fillable = [
        'type',           // e.g. 'earthquake', 'typhoon', 'flood', 'volcano'
        'source',         // e.g. 'PHIVOLCS', 'PAGASA'
        'title',
        'description',
        'magnitude',      // for earthquakes
        'depth',          // for earthquakes
        'location',
        'signal_number',  // for typhoons
        'source_url',
        'image_url',
        'external_id',    // unique id/hash from source to avoid duplicate inserts
        'issued_at',
    ];

    protected $casts = [
        'issued_at' => 'datetime',
    ];

    /**
     * Only alerts issued within the last N hours (default 48).
     */
    public function scopeRecent($query, int $hours = 48)
    {
        return $query->where('issued_at', '>=', now()->subHours($hours));
    }

    /**
     * Order newest first.
     */
    public function scopeLatestFirst($query)
    {
        return $query->orderByDesc('issued_at');
    }
}

