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
        $business = auth()->user()->business;

        if (!$settings) {
            $settings = Setting::create([
                'company_name' => $business->name ?? 'VyaparSync',
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
        $data['gst_number'] = $business?->gst_number ?? '';
        $data['business_type'] = $business?->business_type ?? '';
        $data['latest_request'] = \App\Models\SubscriptionRequest::where('business_id', $business->id)->latest()->first();
        
        return response()->json($data);
    }

    public function submitSubscriptionRequest(Request $request): JsonResponse
    {
        if (auth()->user()->business->parent_id !== null) {
            return response()->json(['message' => 'Subscription updates must be managed by the parent shop owner.'], 403);
        }

        $request->validate([
            'plan_type' => 'required|in:pro,business,enterprise',
        ]);

        $prices = [
            'pro' => 2999,
            'business' => 4999,
            'enterprise' => 9999
        ];
        
        $amount = $prices[$request->plan_type];

        $existing = \App\Models\SubscriptionRequest::where('business_id', auth()->user()->business_id)
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
            'business_id' => auth()->user()->business_id,
            'plan_type' => $request->plan_type,
            'amount' => $amount,
            'status' => 'pending'
        ]);

        return response()->json(['message' => 'Subscription request submitted successfully.']);
    }

    public function update(Request $request): JsonResponse
    {
        $settings = Setting::first();
        $business = auth()->user()->business;
        
        if ($request->has('gst_number') && $request->gst_number !== null) {
            $request->merge(['gst_number' => strtoupper(trim($request->gst_number))]);
        }

        $request->validate([
            'company_name' => 'required|string|max:255',
            'business_type'=> 'nullable|string|max:100',
            'company_phone'=> 'nullable|string|max:50',
            'company_address' => 'nullable|string',
            'gst_number' => ['nullable', 'string', new \App\Rules\ValidGstin()],
        ]);

        $data = $request->only(['company_name', 'company_phone', 'company_address']);

        if ($settings) {
            $settings->update($data);
        } else {
            $settings = Setting::create($data);
        }

        if ($business) {
            $business->update([
                'gst_number' => $request->gst_number,
                'business_type' => $request->business_type
            ]);
        }

        $response = $settings->toArray();
        $response['gst_number'] = $business?->gst_number ?? '';
        $response['business_type'] = $business?->business_type ?? '';

        return response()->json($response);
    }
}
