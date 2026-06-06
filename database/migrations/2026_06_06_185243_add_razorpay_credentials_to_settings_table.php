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
            $table->string('razorpay_key')->nullable()->after('subscription_expires_at');
            $table->string('razorpay_secret')->nullable()->after('razorpay_key');
            $table->string('razorpay_webhook_secret')->nullable()->after('razorpay_secret');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('settings', function (Blueprint $table) {
            $table->dropColumn(['razorpay_key', 'razorpay_secret', 'razorpay_webhook_secret']);
        });
    }
};
