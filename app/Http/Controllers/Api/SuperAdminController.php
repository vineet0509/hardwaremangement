<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Shop;
use App\Models\Setting;

class SuperAdminController extends Controller
{
    public function index(Request $request)
    {
        // Check if user is super admin
        if (!$request->user()->is_super_admin) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        // Fetch all shops with their settings and users
        // We use withoutGlobalScopes for settings because settings usually have ShopScope applied
        $shops = Shop::with(['users'])->get()->map(function ($shop) {
            $setting = Setting::withoutGlobalScopes()->where('shop_id', $shop->id)->first();
            return [
                'id' => $shop->id,
                'name' => $shop->name,
                'domain' => $shop->domain,
                'is_active' => (bool)$shop->is_active,
                'created_at' => $shop->created_at,
                'trial_ends_at' => $shop->trial_ends_at,
                'subscription_plan' => $setting?->subscription_plan ?? 'N/A',
                'subscription_expires_at' => $setting?->subscription_expires_at ?? 'N/A',
                'users_count' => $shop->users->count(),
                'users' => $shop->users->map(fn($u) => ['name' => $u->name, 'email' => $u->email]),
            ];
        });

        return response()->json($shops);
    }

    public function toggleStatus(Request $request, Shop $shop)
    {
        if (!$request->user()->is_super_admin) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $shop->is_active = !$shop->is_active;
        $shop->save();

        return response()->json([
            'shop' => $shop
        ]);
    }

    public function loginLogs(Request $request)
    {
        if (!$request->user()->is_super_admin) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $logs = \App\Models\LoginLog::with(['user', 'shop'])
            ->orderBy('login_at', 'desc')
            ->paginate(50);

        return response()->json($logs);
    }
    
    public function extendPlan(Request $request, Shop $shop)
    {
        if (!$request->user()->is_super_admin) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'days' => 'required|integer|min:1'
        ]);

        // If trial_ends_at is already past or null, calculate from now. Otherwise add to existing.
        $baseDate = $shop->trial_ends_at && \Carbon\Carbon::parse($shop->trial_ends_at)->isFuture() 
                    ? \Carbon\Carbon::parse($shop->trial_ends_at) 
                    : now();
        
        $shop->trial_ends_at = $baseDate->addDays($request->days);
        $shop->save();

        // Sync with Setting
        $setting = Setting::withoutGlobalScopes()->where('shop_id', $shop->id)->first();
        if ($setting) {
            $setting->subscription_expires_at = $shop->trial_ends_at;
            $setting->save();
        }

        return response()->json([
            'message' => "Plan extended by {$request->days} days successfully.",
            'shop' => $shop
        ]);
    }

    public function deleteShop(Request $request, Shop $shop)
    {
        if (!$request->user()->is_super_admin) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        // Soft delete all users associated with this shop
        $shop->users()->delete();
        
        // Soft delete the shop itself
        $shop->delete();

        return response()->json(['message' => 'Shop and its users deleted successfully.']);
    }
}
