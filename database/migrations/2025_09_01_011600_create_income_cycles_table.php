<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('income_cycles', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('template_id')->constrained('income_cycle_templates')->cascadeOnDelete();
            $table->string('period_ref'); // YYYY-MM
            $table->decimal('planned_amount', 14, 2)->nullable();
            $table->decimal('received_amount', 14, 2)->nullable();
            $table->dateTime('received_at')->nullable();
            $table->unsignedBigInteger('account_id')->nullable(); // FK to accounts later
            $table->unsignedTinyInteger('expected_day')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'template_id', 'period_ref']);
            $table->index(['user_id', 'period_ref']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('income_cycles');
    }
};
