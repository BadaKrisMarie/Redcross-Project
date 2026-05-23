<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AboutStat extends Model
{
    protected $fillable = ['value', 'label', 'is_red', 'order'];

    protected $casts = [
        'is_red' => 'boolean',
    ];
}
