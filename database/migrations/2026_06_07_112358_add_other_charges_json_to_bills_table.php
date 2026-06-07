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
            $table->json('other_charges_details')->nullable()->after('other_charges');
        });

        Schema::table('quotations', function (Blueprint $table) {
            $table->json('other_charges_details')->nullable()->after('other_charges');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bills', function (Blueprint $table) {
            $table->dropColumn('other_charges_details');
        });

        Schema::table('quotations', function (Blueprint $table) {
            $table->dropColumn('other_charges_details');
        });
    }
};
