<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('face_enrollments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('volunteer_id')->constrained('volunteers')->onDelete('cascade');
            $table->json('descriptor'); // 128-d face descriptor array from face-api.js
            $table->boolean('is_active')->default(true); // only latest active enrollment used for matching
            $table->timestamp('enrolled_at');
            $table->timestamps();

            $table->index(['volunteer_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('face_enrollments');
    }
};