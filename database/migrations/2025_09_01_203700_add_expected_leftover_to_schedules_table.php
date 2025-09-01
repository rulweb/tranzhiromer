<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            // Nullable because not all expenses have leftover, and incomes shouldn't use it
            $table->decimal('expected_leftover', 10, 2)->nullable()->after('amount')->comment('Ожидаемый остаток с платежа');
        });
    }

    public function down(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            $table->dropColumn('expected_leftover');
        });
    }
};
