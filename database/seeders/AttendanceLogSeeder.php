<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Simulates the raw punch log format pulled from a ZKTeco biometric
     * device (e.g. via ZKTeco SDK / pyzk / TCP pull), mapped to your
     * volunteers table.
     */
    public function up(): void
    {
        Schema::create('attendance_logs', function (Blueprint $table) {
            $table->id();

            // Link to your existing volunteers table
            $table->foreignId('volunteer_id')
                ->nullable() // nullable = "unregistered PIN scanned" (face not recognized scenario)
                ->constrained('volunteers')
                ->nullOnDelete();

            // ZKTeco device fields
            $table->string('device_pin')->nullable();       // PIN/UserID registered on the device itself
            $table->string('device_sn');                    // Device serial number, e.g. ZK-MTNTLP-01
            $table->string('device_ip')->nullable();         // e.g. 192.168.1.201
            $table->string('device_location')->default('Muntinlupa Chapter - Main Office');

            // office = fixed ZKTeco unit at the chapter (fingerprint/card)
            // field = mobile/deployment scan using face recognition (face-api.js)
            $table->enum('location_type', ['office', 'field'])->default('office');

            $table->dateTime('log_datetime');                 // Actual punch timestamp from device

            // ZKTeco verify_mode codes: 0=Password, 1=Fingerprint, 2=Card, 15=Face
            // office logs use 1 (Fingerprint) or 2 (Card); field logs use 15 (Face)
            $table->unsignedTinyInteger('verify_mode')->default(1);
            $table->string('verify_mode_label')->default('Fingerprint'); // human-readable

            // ZKTeco in/out status codes: 0=Check In, 1=Check Out, 2=Break Out, 3=Break In, 4=OT In, 5=OT Out
            $table->unsignedTinyInteger('status_code')->default(0);
            $table->string('status_label')->default('Check In');

            $table->boolean('is_recognized')->default(true); // false = failed scan / unregistered face
            $table->decimal('match_confidence', 5, 2)->nullable(); // face-api.js style confidence score (e.g. 92.35)

            $table->json('raw_payload')->nullable(); // simulated raw JSON pulled from device SDK

            $table->boolean('synced_to_system')->default(true); // whether pulled into main attendance table

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
