<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bills', function (Blueprint $table) {
            $table->dropUnique(['bill_number']);
            $table->unique(['shop_id', 'bill_number']);
        });
    }

    public function down(): void
    {
        Schema::table('bills', function (Blueprint $table) {
            $table->dropUnique(['shop_id', 'bill_number']);
            $table->unique(['bill_number']);
        });
    }
};
