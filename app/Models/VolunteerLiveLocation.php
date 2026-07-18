<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VolunteerLiveLocation extends Model
{
    protected $fillable = [
        'user_id',
        'activity_id',
        'latitude',
        'longitude',
        'last_ping_at',
    ];

    protected $casts = [
        'latitude'     => 'float',
        'longitude'    => 'float',
        'last_ping_at' => 'datetime',
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
