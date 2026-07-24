<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            // 'face'      = field attendance via face recognition (FaceAttendanceController)
            // 'fingerprint' = office attendance via WebAuthn biometric (WebAuthnAttendanceController)
            // Existing rows created before this column existed will be NULL — shown as "Unknown" in the UI.
            $table->string('method')->nullable()->after('activity_id');
        });
    }

    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropColumn('method');
        });
    }
};