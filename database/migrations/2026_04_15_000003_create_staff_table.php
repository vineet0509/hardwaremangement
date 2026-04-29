<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('staff', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone')->nullable();
            $table->string('role'); // Owner, Manager, Salesman, Labour, etc
            $table->string('address')->nullable();
            $table->string('aadhar_number')->nullable();
            $table->decimal('monthly_salary', 10, 2)->default(0);
            $table->date('joining_date');
            $table->enum('status', ['active', 'inactive'])->default('active');
            $table->timestamps();
        });

        Schema::create('salary_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_id')->constrained()->onDelete('cascade');
            $table->integer('month'); // 1-12
            $table->integer('year');
            $table->decimal('basic_salary', 10, 2);
            $table->decimal('bonus', 10, 2)->default(0);
            $table->decimal('deductions', 10, 2)->default(0);
            $table->decimal('net_salary', 10, 2);
            $table->decimal('paid_amount', 10, 2)->default(0);
            $table->enum('status', ['paid', 'pending', 'partial'])->default('pending');
            $table->date('payment_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('advance_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 10, 2);
            $table->date('advance_date'); // The date when advance was given
            $table->text('reason')->nullable();
            $table->enum('status', ['pending', 'deducted'])->default('pending');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('advance_payments');
        Schema::dropIfExists('salary_records');
        Schema::dropIfExists('staff');
    }
};
