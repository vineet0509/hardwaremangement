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
        Schema::table('settings', function (Blueprint $table) {
            $table->string('subscription_plan')->default('free')->change();
        });

        // Migrate existing full_time users to starter
        DB::table('settings')->whereIn('subscription_plan', ['full_time', 'pro'])->update(['subscription_plan' => 'starter']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->string('subscription_plan')->default('full_time')->change();
        });
    }
};
