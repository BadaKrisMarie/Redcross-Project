<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('type'); // nbi, medical, training, barangay
            $table->string('file_path');
            $table->string('original_name');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamps();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->string('badge_number')->nullable()->unique()->after('id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('documents');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('badge_number');
        });
    }
};