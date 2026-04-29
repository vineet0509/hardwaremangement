<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;
use App\Models\Staff;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Add Categories
        $categories = [
            Category::create(['name' => 'Paints & Chemical', 'description' => 'Wall paints, primer, putty']),
            Category::create(['name' => 'Plumbing', 'description' => 'Pipes, taps, fittings']),
            Category::create(['name' => 'Electricals', 'description' => 'Wires, switches, boards']),
            Category::create(['name' => 'Tools', 'description' => 'Hammers, drills, screwdrivers']),
        ];

        // Add Products
        $productsData = [
            ['cat' => 0, 'name' => 'Asian Paints Apex 20L', 'cost' => 3200, 'sell' => 3600, 'qty' => 15, 'unit' => 'piece'],
            ['cat' => 0, 'name' => 'Wall Putty 40kg', 'cost' => 650, 'sell' => 750, 'qty' => 30, 'unit' => 'piece'],
            ['cat' => 1, 'name' => 'PVC Pipe 1.5 inch', 'cost' => 120, 'sell' => 150, 'qty' => 100, 'unit' => 'meter'],
            ['cat' => 1, 'name' => 'Steel Tap Heavy', 'cost' => 250, 'sell' => 350, 'qty' => 45, 'unit' => 'piece'],
            ['cat' => 2, 'name' => 'Copper Wire 1.5 sq mm Bundle', 'cost' => 1400, 'sell' => 1700, 'qty' => 20, 'unit' => 'piece'],
            ['cat' => 2, 'name' => 'Modular Switch 6A', 'cost' => 35, 'sell' => 50, 'qty' => 200, 'unit' => 'piece'],
            ['cat' => 3, 'name' => 'Drill Machine 500W', 'cost' => 1500, 'sell' => 1900, 'qty' => 5, 'unit' => 'piece'],
        ];

        foreach ($productsData as $p) {
            $prod = Product::create([
                'category_id'     => $categories[$p['cat']]->id,
                'name'            => $p['name'],
                'sku'             => 'SKU-' . strtoupper(Str::random(6)),
                'purchase_price'  => $p['cost'],
                'selling_price'   => $p['sell'],
                'quantity'        => $p['qty'],
                'min_stock_alert' => 10,
                'unit'            => $p['unit'],
            ]);

            \App\Models\StockTransaction::create([
                'product_id' => $prod->id,
                'type'       => 'purchase',
                'quantity'   => $p['qty'],
                'price'      => $p['cost'],
                'reference'  => 'Opening Stock',
            ]);
        }

        // Add Staff
        Staff::create([
            'name'           => 'Raju Kumar',
            'phone'          => '9876543210',
            'role'           => 'Salesman',
            'monthly_salary' => 15000,
            'joining_date'   => now()->subMonths(6),
            'status'         => 'active',
        ]);

        Staff::create([
            'name'           => 'Mohan Lal',
            'phone'          => '9123456780',
            'role'           => 'Labour',
            'monthly_salary' => 12000,
            'joining_date'   => now()->subYear(),
            'status'         => 'active',
        ]);
        
        $this->command->info('Hardware Shop data seeded successfully.');
    }
}
