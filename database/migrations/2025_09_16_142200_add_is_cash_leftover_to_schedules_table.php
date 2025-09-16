<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            if (! Schema::hasColumn('schedules', 'is_cash_leftover')) {
                // Place near amount/expected_leftover per project convention
                $afterColumn = Schema::hasColumn('schedules', 'expected_leftover') ? 'expected_leftover' : 'amount';
                $table->boolean('is_cash_leftover')->default(false)->after($afterColumn)->comment('Отметка о наличном остатке');
                $table->index('is_cash_leftover');
            }
        });
    }

    public function down(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            if (Schema::hasColumn('schedules', 'is_cash_leftover')) {
                $table->dropIndex(['is_cash_leftover']);
                $table->dropColumn('is_cash_leftover');
            }
        });
    }
};
