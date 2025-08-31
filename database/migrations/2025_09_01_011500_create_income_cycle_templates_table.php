<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('income_cycle_templates', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('key')->default('custom'); // advance, salary, custom
            $table->string('name');
            $table->unsignedTinyInteger('sequence')->default(0);
            $table->unsignedTinyInteger('default_expected_day')->nullable();
            $table->unsignedBigInteger('default_account_id')->nullable(); // FK to accounts.id when accounts table exists
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['user_id', 'name']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('income_cycle_templates');
    }
};
