<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Business;
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
        // We use withoutGlobalScopes for settings because settings usually have BusinessScope applied
        $businesses = Business::with(['users'])->get()->map(function ($business) {
            $setting = Setting::withoutGlobalScopes()->where('business_id', $business->id)->first();
            return [
                'id' => $business->id,
                'name' => $business->name,
                'domain' => $business->domain,
                'is_active' => (bool)$business->is_active,
                'parent_id' => $business->parent_id,
                'is_child' => $business->parent_id !== null,
                'parent_name' => $business->parent ? $business->parent->name : null,
                'created_at' => $business->created_at,
                'trial_ends_at' => $business->trial_ends_at,
                'subscription_plan' => $setting?->subscription_plan ?? 'N/A',
                'subscription_expires_at' => $setting?->subscription_expires_at ?? 'N/A',
                'users_count' => $business->users->count(),
                'users' => $business->users->map(fn($u) => ['name' => $u->name, 'email' => $u->email]),
            ];
        });

        return response()->json($businesses);
    }

    public function toggleStatus(Request $request, Business $business)
    {
        if (!$request->user()->is_super_admin) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $business->is_active = !$business->is_active;
        $business->save();

        return response()->json([
            'business' => $business
        ]);
    }

    public function loginLogs(Request $request)
    {
        if (!$request->user()->is_super_admin) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $logs = \App\Models\LoginLog::with(['user', 'business'])
            ->orderBy('login_at', 'desc')
            ->paginate(50);

        return response()->json($logs);
    }
    
    public function extendPlan(Request $request, Business $business)
    {
        if (!$request->user()->is_super_admin) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'days' => 'required|integer|min:1'
        ]);

        // If trial_ends_at is already past or null, calculate from now. Otherwise add to existing.
        $baseDate = $business->trial_ends_at && \Carbon\Carbon::parse($business->trial_ends_at)->isFuture() 
                    ? \Carbon\Carbon::parse($business->trial_ends_at) 
                    : now();
        
        $business->trial_ends_at = $baseDate->addDays($request->days);
        $business->save();

        // Sync with Setting
        $setting = Setting::withoutGlobalScopes()->where('business_id', $business->id)->first();
        if (!$setting) {
            $setting = new Setting();
            $setting->business_id = $business->id;
            $setting->company_name = $business->name;
        }
        $setting->subscription_expires_at = $business->trial_ends_at;
        $setting->save();

        return response()->json([
            'message' => "Plan extended by {$request->days} days successfully.",
            'business' => $business
        ]);
    }

    public function updatePlan(Request $request, Business $business)
    {
        if (!$request->user()->is_super_admin) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $request->validate([
            'plan_type' => 'required|in:free,starter,business,enterprise,full_time',
            'days' => 'nullable|integer|min:1'
        ]);

        $setting = Setting::withoutGlobalScopes()->where('business_id', $business->id)->first();
        if (!$setting) {
            $setting = new Setting();
            $setting->business_id = $business->id;
            $setting->company_name = $business->name;
        }

        $setting->subscription_plan = $request->plan_type;
        
        if ($request->has('days') && $request->days > 0) {
            $baseDate = $business->trial_ends_at && \Carbon\Carbon::parse($business->trial_ends_at)->isFuture() 
                        ? \Carbon\Carbon::parse($business->trial_ends_at) 
                        : now();
            $business->trial_ends_at = $baseDate->addDays($request->days);
            $business->save();
            $setting->subscription_expires_at = $business->trial_ends_at;
        } elseif ($request->plan_type === 'full_time') {
            $business->trial_ends_at = null;
            $business->save();
            $setting->subscription_expires_at = null;
        }

        $setting->save();

        return response()->json([
            'message' => "Subscription updated to " . strtoupper($request->plan_type) . " successfully.",
            'business' => $business
        ]);
    }

    public function deleteShop(Request $request, Business $business)
    {
        if (!$request->user()->is_super_admin) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        // Soft delete all users associated with this shop
        $business->users()->delete();
        
        // Soft delete the shop itself
        $business->delete();

        return response()->json(['message' => 'Shop and its users deleted successfully.']);
    }

    public function subscriptionRequests(Request $request)
    {
        if (!$request->user()->is_super_admin) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $requests = \App\Models\SubscriptionRequest::withoutGlobalScopes()
            ->with('business')
            ->orderBy('created_at', 'desc')
            ->get();
        return response()->json($requests);
    }

    public function approveSubscriptionRequest(Request $request, $id)
    {
        if (!$request->user()->is_super_admin) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $subscriptionRequest = \App\Models\SubscriptionRequest::withoutGlobalScopes()->find($id);
        
        if (!$subscriptionRequest) {
            return response()->json(['message' => 'Request not found.'], 404);
        }

        if ($subscriptionRequest->status !== 'pending') {
            return response()->json(['message' => 'Request already processed.'], 400);
        }

        $subscriptionRequest->status = 'approved';
        $subscriptionRequest->save();

        $business = $subscriptionRequest->business;
        
        $days = $subscriptionRequest->plan_type === 'yearly' ? 365 : 30;

        $baseDate = $business->trial_ends_at && \Carbon\Carbon::parse($business->trial_ends_at)->isFuture() 
                    ? \Carbon\Carbon::parse($business->trial_ends_at) 
                    : now();
        
        $business->trial_ends_at = $baseDate->addDays($days);
        $business->save();

        $setting = Setting::withoutGlobalScopes()->where('business_id', $business->id)->first();
        if ($setting) {
            $setting->subscription_plan = $subscriptionRequest->plan_type;
            $setting->subscription_expires_at = $business->trial_ends_at;
            $setting->save();
        }

        return response()->json(['message' => 'Subscription approved and plan extended.']);
    }

    public function rejectSubscriptionRequest(Request $request, $id)
    {
        if (!$request->user()->is_super_admin) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $subscriptionRequest = \App\Models\SubscriptionRequest::withoutGlobalScopes()->find($id);

        if (!$subscriptionRequest) {
            return response()->json(['message' => 'Request not found.'], 404);
        }

        $subscriptionRequest->status = 'rejected';
        $subscriptionRequest->save();

        return response()->json(['message' => 'Subscription request rejected.']);
    }
}
