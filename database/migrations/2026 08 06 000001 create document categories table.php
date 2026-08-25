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
            // ✅ 'key' is the value stored in documents.type (e.g. "nbi", "medical",
            // or a slugified version of a custom folder name like "police_clearance")
            $table->string('key')->unique();
            $table->string('label'); // display name, e.g. "Police Clearance"
            $table->string('color')->default('#6B7280'); // used for folder/file-chip accent color
            // ✅ the original 4 required folders are marked is_default = true so we
            // can distinguish them from admin-created custom folders later if needed
            // (e.g. preventing deletion of required categories)
            $table->boolean('is_default')->default(false);
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        // ✅ Seed the 4 folders that already exist today, so nothing breaks for
        // documents already uploaded against these type values.
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