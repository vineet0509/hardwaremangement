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
            $table->index('created_at');
            $table->index('status');
            $table->index('customer_phone');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->index('quantity');
            $table->index('min_stock_alert');
        });

        Schema::table('bill_items', function (Blueprint $table) {
            $table->index('bill_id');
            $table->index('product_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bills', function (Blueprint $table) {
            $table->dropIndex(['created_at']);
            $table->dropIndex(['status']);
            $table->dropIndex(['customer_phone']);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['quantity']);
            $table->dropIndex(['min_stock_alert']);
        });

        Schema::table('bill_items', function (Blueprint $table) {
            $table->dropIndex(['bill_id']);
            $table->dropIndex(['product_id']);
        });
    }
};
