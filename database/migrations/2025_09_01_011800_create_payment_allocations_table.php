<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_allocations', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('mandatory_payment_id')->constrained('mandatory_payments')->cascadeOnDelete();
            $table->foreignId('income_cycle_id')->constrained('income_cycles')->cascadeOnDelete();
            $table->decimal('planned_amount', 14, 2)->default(0);
            $table->decimal('paid_amount', 14, 2)->default(0);
            $table->enum('status', ['planned', 'partial', 'paid', 'skipped'])->default('planned');
            $table->unsignedBigInteger('paid_transaction_id')->nullable(); // FK to transactions later
            $table->date('planned_due_on')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->unique(['mandatory_payment_id', 'income_cycle_id']);
            $table->index(['user_id', 'income_cycle_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_allocations');
    }
};
