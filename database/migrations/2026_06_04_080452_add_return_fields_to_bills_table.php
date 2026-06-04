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
            $table->string('type')->default('sale')->after('status');
            $table->unsignedBigInteger('parent_bill_id')->nullable()->after('type');
            $table->foreign('parent_bill_id')->references('id')->on('bills')->nullOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('bills', function (Blueprint $table) {
            $table->dropForeign(['parent_bill_id']);
            $table->dropColumn(['type', 'parent_bill_id']);
        });
    }
};
