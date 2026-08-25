<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('chat_messages', function (Blueprint $table) {
            $table->id();

            // Kung kaninong volunteer ang thread na ito (parehong ginagamit
            // sa admin.chat.* at volunteer.chat.* routes).
            $table->unsignedBigInteger('volunteer_id');

            // Ang aktwal na nagpadala ng message (pwedeng volunteer o admin user id)
            $table->unsignedBigInteger('sender_id');

            // 'volunteer' o 'admin' — ginagamit ng LiveChatPanel.jsx para malaman
            // kung kanan (mine) o kaliwa ang bubble ng message
            $table->string('sender_role');

            $table->text('body');

            $table->timestamps();

            $table->index('volunteer_id');

            $table->foreign('volunteer_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chat_messages');
    }
};