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
            $table->string('type');              // earthquake, typhoon, flood, volcano
            $table->string('source');             // PHIVOLCS, PAGASA
            $table->string('title');
            $table->text('description')->nullable();
            $table->string('magnitude')->nullable();
            $table->string('depth')->nullable();
            $table->string('location')->nullable();
            $table->string('signal_number')->nullable();
            $table->string('source_url')->nullable();
            $table->string('external_id')->unique()->nullable();
            $table->timestamp('issued_at')->nullable();
            $table->timestamps();

            $table->index(['type', 'issued_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('disaster_alerts');
    }
};
