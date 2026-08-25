<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FingerprintEnrollment extends Model
{
    use HasFactory;

    protected $fillable = [
        "user_id",
        "is_enrolled",
        "enrolled_at",
        "enrolled_by",
        "device_id",
        "device_user_id",
        "fingerprint_template",
        "enrollment_method",
        "notes",
    ];

    protected $casts = [
        "is_enrolled" => "boolean",
        "enrolled_at" => "datetime",
    ];

    public function user()
    {
        return $this->belongsTo(User::class, "user_id");
    }

    public function enrolledBy()
    {
        return $this->belongsTo(User::class, "enrolled_by");
    }
}