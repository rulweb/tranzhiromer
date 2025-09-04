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
        Schema::table('schedules', function (Blueprint $table) {
            $table->decimal('leftover', 10, 2)->nullable()->after('expected_leftover')->comment('Остаток с платежа');
            $table->boolean('is_cash_leftover')->default(false)->after('is_paid')->comment('Отметка о наличном остатке');
            $table->index('is_cash_leftover');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            $table->dropIndex(['is_cash_leftover']);
            $table->dropColumn('is_cash_leftover');
            $table->dropColumn('leftover');
        });
    }
};
