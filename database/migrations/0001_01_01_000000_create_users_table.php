<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // ⚠️ phone / address / gender / birthdate ay malamang existing na
            // (nakita natin sa User model $fillable) — pero naka-guard pa rin
            // gamit ang hasColumn() kung sakaling wala pa talaga.
            if (!Schema::hasColumn('users', 'phone')) {
                $table->string('phone')->nullable();
            }
            if (!Schema::hasColumn('users', 'address')) {
                $table->string('address')->nullable();
            }
            if (!Schema::hasColumn('users', 'birthdate')) {
                $table->date('birthdate')->nullable();
            }
            if (!Schema::hasColumn('users', 'gender')) {
                $table->string('gender')->nullable();
            }
            // ✅ Talagang bago: skills/trainings (e.g. First Aid, CPR, Water Rescue)
            // stored as JSON array of strings, e.g. ["First Aid", "CPR", "Water Rescue"]
            if (!Schema::hasColumn('users', 'skills')) {
                $table->json('skills')->nullable();
            }
            // ✅ Talagang bago: optional free-text para sa ibang details
            if (!Schema::hasColumn('users', 'skills_notes')) {
                $table->text('skills_notes')->nullable();
            }
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $columns = ['skills', 'skills_notes'];
            foreach ($columns as $col) {
                if (Schema::hasColumn('users', $col)) {
                    $table->dropColumn($col);
                }
            }
        });
    }
};
