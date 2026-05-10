<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class SettingsController extends Controller
{
    public function index(): JsonResponse
    {
        $settings = Setting::first();
        $shop = auth()->user()->shop;

        if (!$settings) {
            $settings = Setting::create([
                'company_name' => $shop->name ?? 'Hardware Manager',
                'subscription_plan' => 'full_time',
            ]);
        }

        $isExpired = false;
        $daysRemaining = 0;
        
        if ($settings->subscription_plan !== 'full_time' && $settings->subscription_expires_at) {
            $expiresAt = Carbon::parse($settings->subscription_expires_at);
            if (Carbon::now()->startOfDay()->greaterThan($expiresAt)) {
                $isExpired = true;
            } else {
                $daysRemaining = Carbon::now()->startOfDay()->diffInDays($expiresAt, false);
            }
        }

        $data = $settings->toArray();
        $data['is_expired'] = $isExpired;
        $data['trial_days_remaining'] = max(0, $daysRemaining);
        $data['gst_number'] = $shop?->gst_number ?? '';
        $data['latest_request'] = \App\Models\SubscriptionRequest::where('shop_id', $shop->id)->latest()->first();
        
        return response()->json($data);
    }

    public function submitSubscriptionRequest(Request $request): JsonResponse
    {
        $request->validate([
            'plan_type' => 'required|in:monthly,yearly',
        ]);

        $amount = $request->plan_type === 'yearly' ? 4999 : 499;

        $existing = \App\Models\SubscriptionRequest::where('shop_id', auth()->user()->shop_id)
            ->where('status', 'pending')
            ->first();

        if ($existing) {
            $existing->update([
                'plan_type' => $request->plan_type,
                'amount' => $amount
            ]);
            return response()->json(['message' => 'Subscription request updated successfully.']);
        }

        \App\Models\SubscriptionRequest::create([
            'shop_id' => auth()->user()->shop_id,
            'plan_type' => $request->plan_type,
            'amount' => $amount,
            'status' => 'pending'
        ]);

        return response()->json(['message' => 'Subscription request submitted successfully.']);
    }

    public function update(Request $request): JsonResponse
    {
        $settings = Setting::first();
        $shop = auth()->user()->shop;
        
        $request->validate([
            'company_name' => 'required|string|max:255',
            'company_phone'=> 'nullable|string|max:50',
            'company_address' => 'nullable|string',
            'gst_number' => 'nullable|string|max:20',
        ]);

        $data = $request->only(['company_name', 'company_phone', 'company_address']);

        if ($settings) {
            $settings->update($data);
        } else {
            $settings = Setting::create($data);
        }

        if ($shop) {
            $shop->update(['gst_number' => $request->gst_number]);
        }

        $response = $settings->toArray();
        $response['gst_number'] = $shop?->gst_number ?? '';

        return response()->json($response);
    }
}
