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
        if (!$settings) {
            $settings = Setting::create([
                'company_name' => 'Hardware Manager',
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
        
        return response()->json($data);
    }

    public function update(Request $request): JsonResponse
    {
        $settings = Setting::first();
        
        $data = $request->validate([
            'company_name' => 'required|string|max:255',
            'company_phone'=> 'nullable|string|max:50',
            'company_address' => 'nullable|string',
        ]);

        if ($settings) {
            $settings->update($data);
        } else {
            $settings = Setting::create($data);
        }

        return response()->json($settings);
    }
}
