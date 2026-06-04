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
        Schema::table('staff', function (Blueprint $table) {
            $table->string('emergency_contact')->nullable();
            $table->decimal('commission_percent', 5, 2)->default(0);
        });

        Schema::table('users', function (Blueprint $table) {
            $table->json('permissions')->nullable();
        });

        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_id')->constrained('staff')->onDelete('cascade');
            $table->date('date');
            $table->dateTime('clock_in_time')->nullable();
            $table->dateTime('clock_out_time')->nullable();
            $table->foreignId('business_id')->nullable()->constrained('businesses')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('attendances');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('permissions');
        });

        Schema::table('staff', function (Blueprint $table) {
            $table->dropColumn(['emergency_contact', 'commission_percent']);
        });
    }
};
