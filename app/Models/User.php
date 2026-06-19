<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;
use App\Models\FingerprintTemplate; // ← ADDED

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
        'status', // ✅ Added
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password'          => 'hashed',
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
}