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
        Schema::table('advance_payments', function (Blueprint $table) {
            $table->dateTime('advance_date')->change();
        });
        Schema::table('salary_records', function (Blueprint $table) {
            $table->dateTime('payment_date')->nullable()->change();
        });
        Schema::table('staff', function (Blueprint $table) {
            $table->dateTime('joining_date')->change();
        });
        Schema::table('supplier_transactions', function (Blueprint $table) {
            $table->dateTime('transaction_date')->change();
        });
    }

    public function down(): void
    {
        Schema::table('advance_payments', function (Blueprint $table) {
            $table->date('advance_date')->change();
        });
        Schema::table('salary_records', function (Blueprint $table) {
            $table->date('payment_date')->nullable()->change();
        });
        Schema::table('staff', function (Blueprint $table) {
            $table->date('joining_date')->change();
        });
        Schema::table('supplier_transactions', function (Blueprint $table) {
            $table->date('transaction_date')->change();
        });
    }
};
