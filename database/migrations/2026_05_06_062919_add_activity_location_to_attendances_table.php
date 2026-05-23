<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->foreignId('activity_id')->nullable()->constrained()->onDelete('set null')->after('user_id');
            $table->decimal('latitude', 10, 8)->nullable()->after('hours_rendered');
            $table->decimal('longitude', 11, 8)->nullable()->after('latitude');
        });
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropForeign(['activity_id']);
            $table->dropColumn(['activity_id', 'latitude', 'longitude']);
        });
    }
};