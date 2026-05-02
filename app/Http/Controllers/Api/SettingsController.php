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
        if ($settings->subscription_plan !== 'full_time' && $settings->subscription_expires_at) {
            if (Carbon::now()->startOfDay()->greaterThan($settings->subscription_expires_at)) {
                $isExpired = true;
            }
        }

        $data = $settings->toArray();
        $data['is_expired'] = $isExpired;
        $data['gst_number'] = $shop->gst_number ?? '';
        
        return response()->json($data);
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
        $response['gst_number'] = $shop->gst_number;

        return response()->json($response);
    }
}
