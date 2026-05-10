<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Support\Str;

class ConstructionSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Ensure Dummy Supplier exists
        $supplier = Supplier::firstOrCreate(
            ['name' => 'BuildTech Global Suppliers'],
            [
                'phone' => '9876543210',
                'email' => 'contact@buildtech.com',
                'address' => '123 Industrial Area, Phase 1',
            ]
        );

        // 2. Ensure Categories exist
        $catConstruction = Category::firstOrCreate(['name' => 'Construction'], ['description' => 'Cement, Bricks, Sand']);
        $catPlumbing = Category::firstOrCreate(['name' => 'Plumbing'], ['description' => 'Pipes, fittings, tanks']);
        $catHardware = Category::firstOrCreate(['name' => 'Hardware'], ['description' => 'Nails, screws, hinges']);

        // 3. Products Data
        $products = [
            // Construction
            ['cat' => $catConstruction->id, 'name' => 'UltraTech Cement 50kg', 'cost' => 380, 'sell' => 410, 'qty' => 500, 'unit' => 'bag'],
            ['cat' => $catConstruction->id, 'name' => 'Red Bricks (Premium)', 'cost' => 6, 'sell' => 8, 'qty' => 10000, 'unit' => 'piece'],
            ['cat' => $catConstruction->id, 'name' => 'River Sand (Tractor Load)', 'cost' => 2500, 'sell' => 3200, 'qty' => 20, 'unit' => 'load'],
            
            // Plumbing
            ['cat' => $catPlumbing->id, 'name' => 'Sintex Water Tank 1000L', 'cost' => 4500, 'sell' => 5200, 'qty' => 15, 'unit' => 'piece'],
            ['cat' => $catPlumbing->id, 'name' => 'CPVC Pipe 1" (3m)', 'cost' => 280, 'sell' => 340, 'qty' => 120, 'unit' => 'piece'],
            ['cat' => $catPlumbing->id, 'name' => 'Brass Bib Cock', 'cost' => 180, 'sell' => 250, 'qty' => 50, 'unit' => 'piece'],
            
            // Hardware
            ['cat' => $catHardware->id, 'name' => 'Iron Nails 2 Inch (1kg)', 'cost' => 70, 'sell' => 100, 'qty' => 80, 'unit' => 'kg'],
            ['cat' => $catHardware->id, 'name' => 'Door Hinge 4" SS', 'cost' => 45, 'sell' => 75, 'qty' => 200, 'unit' => 'piece'],
            ['cat' => $catHardware->id, 'name' => 'Aldrop 10" Heavy', 'cost' => 220, 'sell' => 350, 'qty' => 40, 'unit' => 'piece'],
        ];

        foreach ($products as $p) {
            $prod = Product::create([
                'category_id'     => $p['cat'],
                'supplier_id'     => $supplier->id,
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
                'reference'  => 'Opening Stock from BuildTech',
            ]);
        }

        $this->command->info('Construction, Plumbing, and Hardware dummy data seeded successfully.');
    }
}
