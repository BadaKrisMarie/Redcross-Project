<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // 1. Tanggalin muna yung foreign key constraint
        DB::statement('ALTER TABLE activities DROP FOREIGN KEY activities_assigned_by_foreign');

        // 2. Ngayon pwede nang baguhin ang column type
        DB::statement('ALTER TABLE activities MODIFY assigned_by VARCHAR(255) NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE activities MODIFY assigned_by BIGINT UNSIGNED NULL');
        DB::statement('ALTER TABLE activities ADD CONSTRAINT activities_assigned_by_foreign FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL');
    }
};