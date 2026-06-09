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
        Schema::table('products', function (Blueprint $table) {
            $table->index('name');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->index('role');
        });

        Schema::table('quotations', function (Blueprint $table) {
            $table->index('quotation_number');
            $table->index('customer_phone');
            $table->index('created_at');
        });

        Schema::table('expenses', function (Blueprint $table) {
            $table->index('expense_date');
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->index('date');
        });

        Schema::table('damaged_goods', function (Blueprint $table) {
            $table->index('date');
        });

        Schema::table('supplier_transactions', function (Blueprint $table) {
            $table->index('transaction_date');
            $table->index('type');
        });

        Schema::table('stock_transactions', function (Blueprint $table) {
            $table->index('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['name']);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['role']);
        });

        Schema::table('quotations', function (Blueprint $table) {
            $table->dropIndex(['quotation_number']);
            $table->dropIndex(['customer_phone']);
            $table->dropIndex(['created_at']);
        });

        Schema::table('expenses', function (Blueprint $table) {
            $table->dropIndex(['expense_date']);
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->dropIndex(['date']);
        });

        Schema::table('damaged_goods', function (Blueprint $table) {
            $table->dropIndex(['date']);
        });

        Schema::table('supplier_transactions', function (Blueprint $table) {
            $table->dropIndex(['transaction_date']);
            $table->dropIndex(['type']);
        });

        Schema::table('stock_transactions', function (Blueprint $table) {
            $table->dropIndex(['type']);
        });
    }
};
