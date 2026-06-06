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
        Schema::table('bills', function (Blueprint $table) {
            $table->decimal('other_charges', 10, 2)->default(0)->after('discount');
        });

        Schema::table('quotations', function (Blueprint $table) {
            $table->decimal('other_charges', 10, 2)->default(0)->after('discount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bills', function (Blueprint $table) {
            $table->dropColumn('other_charges');
        });

        Schema::table('quotations', function (Blueprint $table) {
            $table->dropColumn('other_charges');
        });
    }
};
