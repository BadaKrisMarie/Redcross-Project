<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'full_name')) $table->string('full_name')->nullable();
            if (!Schema::hasColumn('users', 'phone')) $table->string('phone')->nullable();
            if (!Schema::hasColumn('users', 'role')) $table->string('role')->nullable();
            if (!Schema::hasColumn('users', 'address')) $table->string('address')->nullable();
            if (!Schema::hasColumn('users', 'photo_url')) $table->string('photo_url')->nullable();
        });
    }
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['full_name','phone','role','address','photo_url']);
        });
    }
};