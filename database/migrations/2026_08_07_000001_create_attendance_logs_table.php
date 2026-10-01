<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Simulates the raw punch log format pulled from a biometric
     * device, mapped to users table.
     */
    public function up(): void
    {
        Schema::create('attendance_logs', function (Blueprint $table) {
            $table->id();

            // Link to users table
            $table->foreignId('volunteer_id')
                ->nullable()
                ->constrained('users')
                ->nullOnDelete();

            // Device fields
            $table->string('device_pin')->nullable();
            $table->string('device_sn');
            $table->string('device_ip')->nullable();
            $table->string('device_location')->default('Muntinlupa Chapter - Main Office');

            $table->enum('location_type', ['office', 'field'])->default('office');

            $table->dateTime('log_datetime');

            $table->unsignedTinyInteger('verify_mode')->default(1);
            $table->string('verify_mode_label')->default('Fingerprint');

            $table->unsignedTinyInteger('status_code')->default(0);
            $table->string('status_label')->default('Check In');

            $table->boolean('is_recognized')->default(true);
            $table->decimal('match_confidence', 5, 2)->nullable();

            $table->json('raw_payload')->nullable();

            $table->boolean('synced_to_system')->default(true);

            $table->timestamps();

            $table->index(['device_sn', 'log_datetime']);
            $table->index(['volunteer_id', 'log_datetime']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendance_logs');
    }
};
