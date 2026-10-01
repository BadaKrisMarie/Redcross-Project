<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'mysql') {
            try {
                DB::statement('ALTER TABLE activities DROP FOREIGN KEY activities_assigned_by_foreign');
            } catch (\Throwable $e) {}
            DB::statement('ALTER TABLE activities MODIFY assigned_by VARCHAR(255) NULL');
        } else {
            Schema::table('activities', function (Blueprint $table) {
                $table->string('assigned_by')->nullable()->change();
            });
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE activities MODIFY assigned_by BIGINT UNSIGNED NULL');
            DB::statement('ALTER TABLE activities ADD CONSTRAINT activities_assigned_by_foreign FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL');
        }
    }
};