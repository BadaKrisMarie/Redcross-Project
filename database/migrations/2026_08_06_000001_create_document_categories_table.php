<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('document_categories', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->string('label');
            $table->string('color')->default('#6B7280');
            $table->boolean('is_default')->default(false);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        $now = now();
        DB::table('document_categories')->insert([
            ['key' => 'nbi',      'label' => 'NBI Clearance',        'color' => '#5B7FDE', 'is_default' => true, 'created_by' => null, 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'medical',  'label' => 'Medical Certificate',  'color' => '#3E9C6E', 'is_default' => true, 'created_by' => null, 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'training', 'label' => 'Training Certificate', 'color' => '#9066C7', 'is_default' => true, 'created_by' => null, 'created_at' => $now, 'updated_at' => $now],
            ['key' => 'barangay', 'label' => 'Barangay Clearance',   'color' => '#C98A2E', 'is_default' => true, 'created_by' => null, 'created_at' => $now, 'updated_at' => $now],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('document_categories');
    }
};