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
        DB::table('products')->where('gst_slab', 0)->orWhereNull('gst_slab')->update(['gst_slab' => 18]);
        DB::table('bill_items')->where('gst_slab', 0)->orWhereNull('gst_slab')->update(['gst_slab' => 18]);
        DB::table('quotation_items')->where('gst_slab', 0)->orWhereNull('gst_slab')->update(['gst_slab' => 18]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // No down migration
    }
};
