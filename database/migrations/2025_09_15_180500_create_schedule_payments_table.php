<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('schedule_payments', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('group_id');
            $table->unsignedBigInteger('schedule_id');
            // Store the month as the first day of month date for easy querying
            $table->date('month')->comment('Месяц оплаты (первый день месяца)');
            $table->timestamp('paid_at')->nullable()->comment('Дата и время отметки оплаты');
            $table->decimal('leftover', 10, 2)->nullable()->comment('Остаток с платежа в этом месяце');
            $table->boolean('is_cash_leftover')->default(false)->comment('Остаток наличными в этом месяце');
            $table->timestamps();

            $table->foreign('group_id')->references('id')->on('groups')->cascadeOnDelete();
            $table->foreign('schedule_id')->references('id')->on('schedules')->cascadeOnDelete();
            $table->unique(['schedule_id', 'month']);
            $table->index(['group_id', 'month']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('schedule_payments');
    }
};
