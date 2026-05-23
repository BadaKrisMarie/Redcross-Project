public function up(): void
{
    Schema::table('activities', function (Blueprint $table) {
        $table->unsignedBigInteger('assigned_by')->nullable()->after('status');
        $table->foreign('assigned_by')->references('id')->on('users')->onDelete('set null');
    });
}

public function down(): void
{
    Schema::table('activities', function (Blueprint $table) {
        $table->dropForeign(['assigned_by']);
        $table->dropColumn('assigned_by');
    });
}