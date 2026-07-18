<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('disaster_alerts', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['earthquake', 'storm', 'other'])->index();
            $table->string('source'); // PHIVOLCS / PAGASA
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('magnitude')->nullable();      // earthquake
            $table->string('depth')->nullable();           // earthquake
            $table->string('location')->nullable();        // earthquake
            $table->string('signal_number')->nullable();   // storm
            $table->string('source_url')->nullable();
            $table->string('external_id')->unique();       // para di ma-duplicate
            $table->timestamp('issued_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('disaster_alerts');
    }
};