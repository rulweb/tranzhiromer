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
        Schema::create('corrections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('schedule_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 10, 2)->nullable()->comment('если null — сумма не меняется');
            $table->date('adjusted_date')->nullable()->comment('новая дата платежа');
            $table->timestamps();
        });

        // Индекс для быстрого поиска коррекций по графику
        Schema::table('corrections', function (Blueprint $table) {
            $table->index('schedule_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('corrections');
    }
};
