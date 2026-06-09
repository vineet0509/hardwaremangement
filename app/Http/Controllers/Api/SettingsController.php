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
                'subscription_plan' => 'free',
            ]);
        }

        $isExpired = false;
        $daysRemaining = 0;
        
        if (!in_array($settings->subscription_plan, ['free', 'full_time']) && $settings->subscription_expires_at) {
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
        $data['terms_and_conditions'] = $settings->terms_and_conditions;
        $data['plan_limits'] = \App\Helpers\PlanHelper::getPlanLimits($settings->subscription_plan);
        

        $data['upi_qr_code'] = $settings->upi_qr_code;

        return response()->json($data);
    }

    public function createSubscriptionOrder(Request $request): JsonResponse
    {
        if (auth()->user()->business->parent_id !== null) {
            return response()->json(['message' => 'Subscription updates must be managed by the parent shop owner.'], 403);
        }

        $request->validate([
            'plan_type' => 'required|in:starter,business,enterprise',
        ]);

        $prices = [
            'starter' => 999,
            'business' => 2499,
            'enterprise' => 4999
        ];
        
        $amount = $prices[$request->plan_type];

        $key = config('services.razorpay.key');
        $secret = config('services.razorpay.secret');

        if (!$key || !$secret) {
            return response()->json(['message' => 'Super Admin Razorpay keys are not configured.'], 500);
        }

        $api = new \Razorpay\Api\Api($key, $secret);

        try {
            $orderData = [
                'receipt'         => 'sub_' . time() . '_' . auth()->user()->business_id,
                'amount'          => $amount * 100, // paise
                'currency'        => 'INR',
                'payment_capture' => 1 // auto capture
            ];

            $razorpayOrder = $api->order->create($orderData);

            return response()->json([
                'order_id' => $razorpayOrder['id'],
                'amount' => $amount,
                'currency' => 'INR',
                'key' => $key,
            ]);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Razorpay Order Error: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to create Razorpay order.'], 500);
        }
    }

    public function verifySubscriptionPayment(Request $request): JsonResponse
    {
        $request->validate([
            'razorpay_payment_id' => 'required|string',
            'razorpay_order_id' => 'required|string',
            'razorpay_signature' => 'required|string',
            'plan_type' => 'required|in:starter,business,enterprise',
        ]);

        $key = config('services.razorpay.key');
        $secret = config('services.razorpay.secret');

        $api = new \Razorpay\Api\Api($key, $secret);

        try {
            $attributes = array(
                'razorpay_order_id' => $request->razorpay_order_id,
                'razorpay_payment_id' => $request->razorpay_payment_id,
                'razorpay_signature' => $request->razorpay_signature
            );

            $api->utility->verifyPaymentSignature($attributes);

            // Payment verified, update subscription
            $settings = Setting::first();
            
            $currentExpires = $settings->subscription_expires_at ? Carbon::parse($settings->subscription_expires_at) : Carbon::now();
            if ($currentExpires->isPast()) {
                $currentExpires = Carbon::now();
            }

            $settings->update([
                'subscription_plan' => $request->plan_type,
                'subscription_expires_at' => $currentExpires->addDays(365),
            ]);

            // Clear any pending requests
            \App\Models\SubscriptionRequest::where('business_id', auth()->user()->business_id)
                ->where('status', 'pending')
                ->update(['status' => 'approved']);

            return response()->json(['message' => 'Subscription updated successfully!', 'settings' => $settings]);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Razorpay Verify Error: ' . $e->getMessage());
            return response()->json(['message' => 'Payment verification failed.'], 400);
        }
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
            'terms_and_conditions' => 'nullable|string',
            'gst_number' => ['nullable', 'string', new \App\Rules\ValidGstin()],
            'company_logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'upi_qr_code' => 'nullable|string|max:255',
        ]);

        $data = $request->only(['company_name', 'business_type', 'company_phone', 'company_address', 'terms_and_conditions', 'upi_qr_code']);

        if ($request->hasFile('company_logo')) {
            $path = $request->file('company_logo')->store('public/logos');
            $data['company_logo'] = str_replace('public/', '', $path);
        }

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
