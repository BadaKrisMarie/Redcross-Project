<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = [
        'user_id',
        'activity_id',
        'date',
        'time_in',
        'time_out',
        'hours_rendered',
        'latitude',
        'longitude',
    ];

    protected $casts = [
        'time_in'  => 'datetime',
        'time_out' => 'datetime',
        'date'     => 'date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function activity()
    {
        return $this->belongsTo(Activity::class);
    }
}