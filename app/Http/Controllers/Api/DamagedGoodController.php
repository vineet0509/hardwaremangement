<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DamagedGood;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DamagedGoodController extends Controller
{
    public function index(): JsonResponse
    {
        $user = auth()->user();
        $business = $user->business;
        $settings = \App\Models\Setting::where('business_id', $business->id)->first();
        
        if (!$settings || !\App\Helpers\PlanHelper::hasFeature($settings->subscription_plan, 'damaged_goods')) {
            return response()->json(['message' => 'Your current plan does not support Damaged Goods & Wastage tracking. Please upgrade your plan.'], 403);
        }

        $damagedGoods = DamagedGood::with('product')->orderBy('date', 'desc')->get();
        return response()->json($damagedGoods);
    }

    public function store(Request $request): JsonResponse
    {
        $user = auth()->user();
        $business = $user->business;
        $settings = \App\Models\Setting::where('business_id', $business->id)->first();
        
        if (!$settings || !\App\Helpers\PlanHelper::hasFeature($settings->subscription_plan, 'damaged_goods')) {
            return response()->json(['message' => 'Your current plan does not support Damaged Goods & Wastage tracking. Please upgrade your plan.'], 403);
        }

        $data = $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity'   => 'required|numeric|min:0.01',
            'reason'     => 'nullable|string|max:255',
            'date'       => 'required|date',
        ]);

        $product = Product::findOrFail($data['product_id']);

        if ($product->quantity < $data['quantity']) {
            return response()->json(['message' => 'Not enough stock to report this quantity as damaged.'], 400);
        }

        $lossAmount = $data['quantity'] * $product->purchase_price;

        DB::beginTransaction();
        try {
            // Deduct stock
            $product->decrement('quantity', $data['quantity']);

            // Record damaged good
            $damagedGood = DamagedGood::create([
                'product_id'  => $data['product_id'],
                'quantity'    => $data['quantity'],
                'reason'      => $data['reason'],
                'loss_amount' => $lossAmount,
                'date'        => $data['date'],
            ]);

            DB::commit();

            return response()->json($damagedGood->load('product'), 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to report damaged goods. ' . $e->getMessage()], 500);
        }
    }

    public function destroy(DamagedGood $damagedGood): JsonResponse
    {
        DB::beginTransaction();
        try {
            // Restore stock
            $product = $damagedGood->product;
            if ($product) {
                $product->increment('quantity', $damagedGood->quantity);
            }

            // Delete record
            $damagedGood->delete();

            DB::commit();
            return response()->json(['message' => 'Damaged good record reverted successfully.']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Failed to revert damaged goods. ' . $e->getMessage()], 500);
        }
    }
}
