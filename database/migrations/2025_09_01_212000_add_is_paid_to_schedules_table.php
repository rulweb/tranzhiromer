<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            $table->boolean('is_paid')->default(false)->after('expected_leftover')->comment('Отметка об оплате');
            $table->index('is_paid');
        });
    }

    public function down(): void
    {
        Schema::table('schedules', function (Blueprint $table) {
            $table->dropIndex(['is_paid']);
            $table->dropColumn('is_paid');
        });
    }
};
