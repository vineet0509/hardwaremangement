<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Quotation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QuotationController extends Controller
{
    public function index()
    {
        $quotations = Quotation::with('items')->orderBy('created_at', 'desc')->get();
        return response()->json($quotations);
    }

    public function store(Request $request)
    {
        $request->validate([
            'customer_name' => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'customer_address' => 'nullable|string',
            'discount' => 'numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.1',
            'items.*.price' => 'required|numeric|min:0'
        ]);

        try {
            DB::beginTransaction();

            $subtotal = 0;
            foreach ($request->items as $item) {
                $subtotal += $item['price'] * $item['quantity'];
            }

            $discount = $request->discount ?? 0;
            $total = $subtotal - $discount;

            // Generate unique quotation number
            $count = Quotation::count() + 1;
            $prefix = 'QT-';
            $quotationNumber = $prefix . str_pad($count, 5, '0', STR_PAD_LEFT);

            // Ensure unique
            while(Quotation::where('quotation_number', $quotationNumber)->exists()) {
                $count++;
                $quotationNumber = $prefix . str_pad($count, 5, '0', STR_PAD_LEFT);
            }

            $quotation = Quotation::create([
                'quotation_number' => $quotationNumber,
                'customer_name' => $request->customer_name,
                'customer_phone' => $request->customer_phone,
                'customer_address' => $request->customer_address,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'tax' => 0,
                'total' => $total,
                'notes' => $request->notes,
            ]);

            foreach ($request->items as $item) {
                $product = \App\Models\Product::find($item['product_id']);
                
                $quotation->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'price' => $item['price'],
                    'quantity' => $item['quantity'],
                    'total' => $item['price'] * $item['quantity'],
                ]);
            }

            DB::commit();
            return response()->json($quotation->load('items'), 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to create quotation: ' . $e->getMessage()], 500);
        }
    }

    public function show(Quotation $quotation)
    {
        return response()->json($quotation->load('items'));
    }

    public function update(Request $request, Quotation $quotation)
    {
        $request->validate([
            'customer_name' => 'nullable|string|max:255',
            'customer_phone' => 'nullable|string|max:20',
            'customer_address' => 'nullable|string',
            'discount' => 'numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|numeric|min:0.1',
            'items.*.price' => 'required|numeric|min:0'
        ]);

        try {
            DB::beginTransaction();

            $subtotal = 0;
            foreach ($request->items as $item) {
                $subtotal += $item['price'] * $item['quantity'];
            }

            $discount = $request->discount ?? 0;
            $total = $subtotal - $discount;

            $quotation->update([
                'customer_name' => $request->customer_name,
                'customer_phone' => $request->customer_phone,
                'customer_address' => $request->customer_address,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total' => $total,
                'notes' => $request->notes,
            ]);

            // Clear old items and recreate
            $quotation->items()->delete();

            foreach ($request->items as $item) {
                $product = \App\Models\Product::find($item['product_id']);
                
                $quotation->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'price' => $item['price'],
                    'quantity' => $item['quantity'],
                    'total' => $item['price'] * $item['quantity'],
                ]);
            }

            DB::commit();
            return response()->json($quotation->load('items'), 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to update quotation: ' . $e->getMessage()], 500);
        }
    }

    public function destroy(Quotation $quotation)
    {
        $quotation->delete();
        return response()->json(['message' => 'Quotation deleted successfully']);
    }
}
