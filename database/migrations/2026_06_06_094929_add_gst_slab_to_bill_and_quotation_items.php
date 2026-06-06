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
        Schema::table('bill_items', function (Blueprint $table) {
            $table->integer('gst_slab')->default(0)->after('price');
        });
        Schema::table('quotation_items', function (Blueprint $table) {
            $table->integer('gst_slab')->default(0)->after('price');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bill_items', function (Blueprint $table) {
            $table->dropColumn('gst_slab');
        });
        Schema::table('quotation_items', function (Blueprint $table) {
            $table->dropColumn('gst_slab');
        });
    }
};
