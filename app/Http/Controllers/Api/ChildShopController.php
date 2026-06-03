<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Shop;
use App\Models\Setting;

class ChildShopController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        // Fetch child shops of the user's primary shop
        $childShops = Shop::where('parent_id', $user->shop_id)->get();
        
        return response()->json($childShops);
    }

    public function toggleStatus(Request $request, $id)
    {
        $user = $request->user();
        
        $childShop = Shop::where('parent_id', $user->shop_id)->findOrFail($id);
        
        $childShop->is_active = !$childShop->is_active;
        $childShop->save();
        
        return response()->json([
            'message' => 'Child shop status updated successfully.',
            'shop' => $childShop
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        if ($user->shop && $user->shop->parent_id !== null) {
            return response()->json(['message' => 'Child shops cannot create further sub-shops.'], 403);
        }

        $parentSettings = Setting::withoutGlobalScopes()->where('shop_id', $user->shop_id)->first();
        $plan = $parentSettings ? $parentSettings->subscription_plan : 'trial';

        $limits = [
            'trial' => 3,
            'pro' => 10,
            'business' => 50,
            'enterprise' => 9999999
        ];

        $allowedLimit = $limits[$plan] ?? 3;
        $currentCount = Shop::where('parent_id', $user->shop_id)->where('is_active', true)->count();

        if ($currentCount >= $allowedLimit) {
            return response()->json(['message' => "You have reached the maximum allowed child shops ({$allowedLimit}) for your current plan. Please upgrade your subscription."], 403);
        }
        
        $request->validate([
            'name' => 'required|string|max:255',
            'domain' => 'nullable|string|max:255|unique:shops',
        ]);

        // Create the child shop
        $childShop = Shop::create([
            'name' => $request->name,
            'domain' => $request->domain,
            'parent_id' => $user->shop_id,
            'is_active' => true,
            'trial_ends_at' => now()->addDays(30), // Default trial, can be adjusted
        ]);

        // Initialize settings for the child shop
        Setting::withoutGlobalScopes()->create([
            'shop_id' => $childShop->id,
            'company_name' => $request->name,
            'subscription_plan' => 'monthly',
            'subscription_expires_at' => now()->addDays(30)
        ]);

        return response()->json([
            'message' => 'Child shop created successfully.',
            'shop' => $childShop
        ], 201);
    }
}
