<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {

            $table->string('full_name')->nullable();
            $table->string('phone')->nullable();
            $table->string('role')->nullable();
            $table->string('address')->nullable();
            $table->string('photo_url')->nullable();

        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {

            $table->dropColumn([
                'full_name',
                'phone',
                'role',
                'address',
                'photo_url'
            ]);

        });
    }
};