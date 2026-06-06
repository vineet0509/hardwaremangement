<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Changing ENUM columns requires DB::statement in MySQL
        // or doctrine/dbal, but a raw query is safer to avoid issues
        DB::statement("ALTER TABLE bills MODIFY COLUMN payment_method VARCHAR(50) DEFAULT 'cash'");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE bills MODIFY COLUMN payment_method ENUM('cash', 'card', 'upi', 'credit') DEFAULT 'cash'");
    }
};
