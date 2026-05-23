<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // About Page Content (Mission, Vision, Hero text)
        Schema::create('about_contents', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // e.g. 'mission', 'vision', 'hero_title'
            $table->text('value');
            $table->timestamps();
        });

        // Core Values
        Schema::create('about_values', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        // Services
        Schema::create('about_services', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->integer('order')->default(0);
            $table->timestamps();
        });

        // Stats (500+ Volunteers, etc.)
        Schema::create('about_stats', function (Blueprint $table) {
            $table->id();
            $table->string('value');  // e.g. '500+'
            $table->string('label');  // e.g. 'Volunteers'
            $table->boolean('is_red')->default(false);
            $table->integer('order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('about_contents');
        Schema::dropIfExists('about_values');
        Schema::dropIfExists('about_services');
        Schema::dropIfExists('about_stats');
    }
};
