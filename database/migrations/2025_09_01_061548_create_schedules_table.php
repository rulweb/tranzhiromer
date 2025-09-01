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
        Schema::create('schedules', function (Blueprint $table) {
            $table->id();
            $table->foreignId('group_id')->constrained()->onDelete('cascade');

            $table->string('name', 255)->comment('Название операции: Зарплата, Аренда и т.п.');
            $table->text('description')->nullable()->comment('Описание (опционально)');
            $table->text('icon')->nullable()->comment('Может быть: emoji 🏠, название icon, или URL /icons/rent.svg');

            $table->enum('type', ['income', 'expense']);
            $table->enum('period_type', ['daily', 'weekly', 'monthly', 'one_time']);
            $table->foreignId('parent_id')->nullable()->constrained('schedules')->onDelete('set null');

            // Поля под периодичность (только одно активно в зависимости от period_type)
            $table->tinyInteger('day_of_month')->unsigned()->nullable()->comment('1-31');
            $table->tinyInteger('day_of_week')->unsigned()->nullable()->comment('0-6 (0=вс)');
            $table->time('time_of_day')->nullable();
            $table->date('single_date')->nullable();

            $table->decimal('amount', 10, 2);
            $table->date('end_date')->nullable()->comment('null = бессрочно');

            $table->timestamps();
        });

        // Индексы для производительности при генерации платежей
        Schema::table('schedules', function (Blueprint $table) {
            $table->index(['group_id', 'period_type']);
            $table->index(['parent_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedules');
    }
};
