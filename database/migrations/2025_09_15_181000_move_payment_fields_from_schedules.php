<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            if (Schema::hasColumn('schedules', 'is_paid')) {
                $table->dropIndex(['is_paid']);
                $table->dropColumn('is_paid');
            }
            if (Schema::hasColumn('schedules', 'is_cash_leftover')) {
                $table->dropIndex(['is_cash_leftover']);
                $table->dropColumn('is_cash_leftover');
            }
            if (Schema::hasColumn('schedules', 'leftover')) {
                $table->dropColumn('leftover');
            }
        });
    }

    public function down(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            if (! Schema::hasColumn('schedules', 'is_paid')) {
                $table->boolean('is_paid')->default(false)->after('expected_leftover')->comment('Отметка об оплате');
                $table->index('is_paid');
            }
            if (! Schema::hasColumn('schedules', 'leftover')) {
                $table->decimal('leftover', 10, 2)->nullable()->after('expected_leftover')->comment('Остаток с платежа');
            }
            if (! Schema::hasColumn('schedules', 'is_cash_leftover')) {
                $table->boolean('is_cash_leftover')->default(false)->after('is_paid')->comment('Отметка о наличном остатке');
                $table->index('is_cash_leftover');
            }
        });
    }
};
