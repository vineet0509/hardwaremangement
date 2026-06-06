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
            'other_charges' => 'nullable|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.product_id' => [
                'required',
                \Illuminate\Validation\Rule::exists('products', 'id')->where(function ($query) {
                    return $query->where('business_id', auth()->user()->business_id);
                }),
            ],
            'items.*.quantity' => 'required|numeric|min:0.1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.gst_slab' => 'nullable|integer|min:0',
        ]);

        try {
            DB::beginTransaction();

            $subtotal = 0;
            foreach ($request->items as $item) {
                $subtotal += $item['price'] * $item['quantity'];
            }

            $discount = $request->discount ?? 0;
            $other_charges = $request->other_charges ?? 0;
            $total = round($subtotal - $discount + $other_charges);

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
                'other_charges' => $other_charges,
                'tax' => $request->tax ?? 0,
                'total' => $total,
                'notes' => $request->notes,
            ]);

            foreach ($request->items as $item) {
                $product = \App\Models\Product::find($item['product_id']);
                
                $quotation->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'description' => $product->description,
                    'unit' => $product->unit,
                    'price' => $item['price'],
                    'gst_slab' => $item['gst_slab'] ?? $product->gst_slab ?? 0,
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
            'other_charges' => 'nullable|numeric|min:0',
            'items' => 'required|array|min:1',
            'items.*.product_id' => [
                'required',
                \Illuminate\Validation\Rule::exists('products', 'id')->where(function ($query) {
                    return $query->where('business_id', auth()->user()->business_id);
                }),
            ],
            'items.*.quantity' => 'required|numeric|min:0.1',
            'items.*.price' => 'required|numeric|min:0',
            'items.*.gst_slab' => 'nullable|integer|min:0',
        ]);

        try {
            DB::beginTransaction();

            $subtotal = 0;
            foreach ($request->items as $item) {
                $subtotal += $item['price'] * $item['quantity'];
            }

            $discount = $request->discount ?? 0;
            $other_charges = $request->other_charges ?? 0;
            $total = round($subtotal - $discount + $other_charges);

            $quotation->update([
                'customer_name' => $request->customer_name,
                'customer_phone' => $request->customer_phone,
                'customer_address' => $request->customer_address,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'other_charges' => $other_charges,
                'total' => $total,
                'tax' => $request->tax ?? 0,
                'notes' => $request->notes,
            ]);

            // Clear old items and recreate
            $quotation->items()->delete();

            foreach ($request->items as $item) {
                $product = \App\Models\Product::find($item['product_id']);
                
                $quotation->items()->create([
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'description' => $product->description,
                    'unit' => $product->unit,
                    'price' => $item['price'],
                    'gst_slab' => $item['gst_slab'] ?? $product->gst_slab ?? 0,
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

    public function convertToBill(Request $request, Quotation $quotation)
    {
        try {
            DB::beginTransaction();

            $bill = \App\Models\Bill::create([
                'bill_number'    => \App\Models\Bill::generateBillNumber(),
                'customer_name'  => $quotation->customer_name,
                'customer_phone' => $quotation->customer_phone,
                'customer_address'=> $quotation->customer_address,
                'subtotal'       => $quotation->subtotal,
                'discount'       => $quotation->discount,
                'other_charges'  => $quotation->other_charges,
                'tax'            => $quotation->tax,
                'total'          => $quotation->total,
                'paid_amount'    => 0,
                'due_amount'     => $quotation->total,
                'payment_method' => 'cash',
                'status'         => 'pending',
                'notes'          => "Converted from Quotation #{$quotation->quotation_number}",
                'is_gst'         => false,
            ]);

            foreach ($quotation->items as $item) {
                $product = \App\Models\Product::find($item->product_id);
                if (!$product) throw new \Exception("Product {$item->product_name} not found.");
                if ($product->quantity < $item->quantity) {
                    throw new \Exception("Insufficient stock for: {$product->name}");
                }

                \App\Models\BillItem::create([
                    'bill_id'      => $bill->id,
                    'business_id'      => $bill->business_id,
                    'product_id'   => $product->id,
                    'product_name' => $product->name,
                    'description'  => $product->description,
                    'unit'         => $product->unit,
                    'price'        => $item->price,
                    'gst_slab'     => $item->gst_slab ?? $product->gst_slab ?? 0,
                    'quantity'     => $item->quantity,
                    'discount'     => 0,
                    'total'        => $item->total,
                ]);

                $product->decrement('quantity', $item->quantity);
                \App\Models\StockTransaction::create([
                    'product_id' => $product->id,
                    'type'       => 'sale',
                    'quantity'   => -$item->quantity,
                    'price'      => $item->price,
                ]);
            }

            $quotation->notes = ($quotation->notes ? $quotation->notes . "\n" : "") . "Converted to Bill #{$bill->bill_number}";
            $quotation->save();

            DB::commit();
            return response()->json(['message' => 'Successfully converted to bill', 'bill' => $bill->load('items')], 200);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to convert quotation: ' . $e->getMessage()], 500);
        }
    }
}
