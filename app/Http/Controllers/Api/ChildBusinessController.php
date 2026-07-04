<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Business;
use App\Models\Setting;
use App\Models\User;

class ChildBusinessController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $settings = \App\Models\Setting::where('business_id', $user->business_id)->first();
        
        if ($settings && !\App\Helpers\PlanHelper::checkLimit($settings->subscription_plan, 'shops', 1)) {
            // If plan allows only 1 shop, they shouldn't access child businesses
            return response()->json(['message' => 'Branch Transfer and multi-shop features are not available on your current plan. Please upgrade.'], 403);
        }

        // Eager-load users so the frontend listing can show admin contact info
        $childBusinesss = Business::where('parent_id', $user->business_id)
            ->with('users')
            ->get();

        return response()->json($childBusinesss);
    }

    public function toggleStatus(Request $request, $id)
    {
        $user = $request->user();

        $childBusiness = Business::where('parent_id', $user->business_id)->findOrFail($id);

        $childBusiness->is_active = !$childBusiness->is_active;
        $childBusiness->save();

        return response()->json([
            'message' => 'Child shop status updated successfully.',
            'business' => $childBusiness
        ]);
    }

    public function store(Request $request)
    {
        $user = $request->user();

        // Only root shops can create child shops
        if ($user->business && $user->business->parent_id !== null) {
            return response()->json(['message' => 'Child shops cannot create further sub-shops.'], 403);
        }

        // Check plan limits
        $parentSettings = Setting::withoutGlobalScopes()->where('business_id', $user->business_id)->first();
        
        if ($parentSettings) {
            $currentCount = Business::where('parent_id', $user->business_id)->where('is_active', true)->count();
            // Total shops = 1 (parent) + child shops. So check limit against 1 + current child count
            if (!\App\Helpers\PlanHelper::checkLimit($parentSettings->subscription_plan, 'shops', $currentCount + 1)) {
                return response()->json([
                    'message' => "You have reached the maximum allowed shops for your current plan. Please upgrade your subscription."
                ], 403);
            }
        }

        $request->validate([
            'name'       => 'required|string|max:255',
            'domain'     => 'nullable|string|max:255|unique:businesses',
            'gst_number' => 'nullable|string|max:20',
            'mobile'     => 'required|string|max:15|unique:users',
            'email'      => 'nullable|string|email|max:255|unique:users',
            'password'   => 'required|string|min:6',
        ]);

        // Use parent shop's name as the default company_name for this branch
        $parentShopName = $user->business ? $user->business->name : $request->name;

        // Create the child shop
        $childBusiness = Business::create([
            'name'          => $request->name,
            'gst_number'    => $request->gst_number,
            'domain'        => $request->domain,
            'parent_id'     => $user->business_id,
            'is_active'     => true,
            'trial_ends_at' => now()->addDays(30),
        ]);

        // Initialize settings for the child shop — company_name defaults to parent shop name
        Setting::withoutGlobalScopes()->create([
            'business_id'                 => $childBusiness->id,
            'company_name'            => $parentShopName,
            'subscription_plan'       => 'trial',
            'subscription_expires_at' => now()->addDays(30),
        ]);

        // Create the admin user for the child shop so they can login
        $adminUser = User::withoutGlobalScopes()->create([
            'name'     => $request->name . ' Admin',
            'email'    => $request->email,
            'mobile'   => $request->mobile,
            'password' => Hash::make($request->password),
            'business_id'  => $childBusiness->id,
        ]);

        return response()->json([
            'message' => 'Child shop created successfully. The branch admin can now log in with their mobile number and the password you set.',
            'business'    => $childBusiness->load('users'),
            'admin'   => [
                'name'   => $adminUser->name,
                'mobile' => $adminUser->mobile,
                'email'  => $adminUser->email,
            ],
        ], 201);
    }
}
