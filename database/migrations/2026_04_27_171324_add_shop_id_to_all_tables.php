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
        $tables = ['users', 'products', 'bills', 'bill_items', 'staff', 'salary_records', 'advance_payments', 'stock_transactions', 'settings'];

        foreach ($tables as $t) {
            if (Schema::hasTable($t)) {
                Schema::table($t, function (Blueprint $table) {
                    $table->foreignId('business_id')->nullable()->constrained('businesses')->cascadeOnDelete();
                });
            }
        }

        // Seed Default tenant
        $defaultShopId = DB::table('businesses')->insertGetId([
            'name' => 'Default Hardware Shop',
            'domain' => 'default.localhost',
            'created_at' => now(),
            'updated_at' => now()
        ]);

        // Assign all existing records to the default shop
        foreach ($tables as $t) {
            if (Schema::hasTable($t)) {
                DB::table($t)->update(['business_id' => $defaultShopId]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        $tables = ['users', 'products', 'bills', 'bill_items', 'staff', 'salary_records', 'advance_payments', 'stock_transactions', 'settings'];
        foreach ($tables as $t) {
            if (Schema::hasTable($t)) {
                Schema::table($t, function (Blueprint $table) {
                    $table->dropForeign(['business_id']);
                    $table->dropColumn('business_id');
                });
            }
        }
    }
};
