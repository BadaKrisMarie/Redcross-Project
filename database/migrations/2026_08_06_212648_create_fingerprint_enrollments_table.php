<?php
// database/migrations/xxxx_xx_xx_create_fingerprint_enrollments_table.php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('fingerprint_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->unique()->constrained()->onDelete('cascade');
            $table->boolean('is_enrolled')->default(false);
            $table->timestamp('enrolled_at')->nullable();
            $table->foreignId('enrolled_by')->nullable()->constrained('users')->nullOnDelete();

            // Reserved for future ZKTeco device integration
            $table->string('device_id')->nullable();
            $table->string('device_user_id')->nullable(); // ID assigned by the fingerprint device
            $table->longText('fingerprint_template')->nullable(); // raw template data from device
            $table->string('enrollment_method')->default('manual'); // manual | device

            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('fingerprint_enrollments');
    }
};