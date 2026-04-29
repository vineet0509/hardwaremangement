<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Setting;
use Carbon\Carbon;

class SettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Setting::create([
            'company_name' => 'Premium Hardware Store',
            'company_phone' => '+91 9876543210',
            'company_address' => '123 Main Market, City',
            'subscription_plan' => 'yearly',
            'subscription_expires_at' => Carbon::now()->addYear(),
        ]);
    }
}
