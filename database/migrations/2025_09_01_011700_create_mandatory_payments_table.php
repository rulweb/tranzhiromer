<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('mandatory_payments', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->unsignedBigInteger('category_id'); // FK to categories later
            $table->decimal('default_amount', 14, 2);
            $table->unsignedBigInteger('default_cycle_template_id')->nullable();
            $table->enum('schedule', ['monthly', 'custom'])->default('monthly');
            $table->unsignedTinyInteger('due_day')->nullable();
            $table->unsignedBigInteger('account_id')->nullable(); // default paying account
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['user_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('mandatory_payments');
    }
};
