<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FaceEnrollment extends Model
{
    use HasFactory;

    protected $fillable = [
        'volunteer_id',
        'descriptor',
        'is_active',
        'enrolled_at',
    ];

    protected $casts = [
        'descriptor' => 'array', // stored as JSON, cast to PHP array automatically
        'is_active' => 'boolean',
        'enrolled_at' => 'datetime',
    ];

    public function volunteer()
    {
        return $this->belongsTo(Volunteer::class);
    }
}