<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shops', function (Blueprint $column) {
            $column->string('gst_number')->nullable()->after('name');
        });

        Schema::table('bills', function (Blueprint $column) {
            $column->boolean('is_gst')->default(false)->after('payment_method');
            $column->decimal('tax_amount', 15, 2)->default(0)->after('is_gst');
        });

        Schema::table('quotations', function (Blueprint $column) {
            $column->boolean('is_gst')->default(false)->after('discount');
            $column->decimal('tax_amount', 15, 2)->default(0)->after('is_gst');
        });
    }

    public function down(): void
    {
        Schema::table('shops', function (Blueprint $column) {
            $column->dropColumn('gst_number');
        });

        Schema::table('bills', function (Blueprint $column) {
            $column->dropColumn(['is_gst', 'tax_amount']);
        });

        Schema::table('quotations', function (Blueprint $column) {
            $column->dropColumn(['is_gst', 'tax_amount']);
        });
    }
};
