<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        'name',
        'email',
        'password',
        'photo',
        'branch',
        'role',
        'phone',
        'birthdate',
        'gender',
        'address',
        'emergency_contact_name',
        'emergency_contact_phone',
        'status',
        'face_descriptor',
        'skills',
        'skills_notes',
        'is_available',
        'last_active_at',
        'is_online',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
        'face_descriptor'   => 'array',
        'skills'            => 'array',
        'birthdate'         => 'date',
        'is_available'      => 'boolean',
        'last_active_at'    => 'datetime',
        'is_online'         => 'boolean',
    ];

    protected $appends = ['avatar_url'];

    public function getAvatarUrlAttribute(): ?string
    {
        if (!$this->photo) {
            return null;
        }

        if (str_starts_with($this->photo, 'http')) {
            return $this->photo;
        }

        $fullPath = storage_path('app/public/' . $this->photo);
        $version  = file_exists($fullPath) ? filemtime($fullPath) : time();

        return asset('storage/' . $this->photo) . '?v=' . $version;
    }

    public function userNotifications()
    {
        return $this->hasMany(UserNotification::class);
    }

    public function activities()
    {
        return $this->belongsToMany(Activity::class, 'activity_volunteer');
    }

    // ✅ NEW — Fingerprint enrollment status
    public function fingerprintEnrollment()
    {
        return $this->hasOne(FingerprintEnrollment::class, 'user_id');
    }
}
