<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Shop;
use App\Models\Setting;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'mobile' => 'nullable|string|max:15|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'shop_name' => 'required|string|max:255',
            'gst_number' => 'nullable|string|max:20'
        ]);

        // 1. Create the unique Shop (Multi-tenant partition)
        $shop = Shop::create([
            'name' => $request->shop_name,
            'gst_number' => $request->gst_number,
            'is_active' => true,
            'trial_ends_at' => now()->addDays(30),
        ]);

        // 2. Initialize default Settings for this specific shop
        // Force the environment to recognize this shop so Global Scopes pass safely
        Setting::withoutGlobalScopes()->create([
            'shop_id' => $shop->id,
            'company_name' => $request->shop_name,
            'subscription_plan' => 'monthly', // Default 30 day trial
            'subscription_expires_at' => now()->addDays(30)
        ]);

        // 3. Create the Shop Owner User
        $user = User::withoutGlobalScopes()->create([
            'name' => $request->name,
            'email' => $request->email,
            'mobile' => $request->mobile,
            'password' => Hash::make($request->password),
            'shop_id' => $shop->id,
        ]);

        // 4. Authenticate User immediately
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function login(Request $request)
    {
        $request->validate([
            'login' => 'required|string', // This will be email or mobile
            'password' => 'required',
        ]);

        // Extremely critical: We must explicitly bypass the Global Shop Scope here.
        // Check both email and mobile
        $user = User::withoutGlobalScopes()
            ->where(function($query) use ($request) {
                $query->where('email', $request->login)
                      ->orWhere('mobile', $request->login);
            })
            ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid login credentials.'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        \App\Models\LoginLog::create([
            'user_id' => $user->id,
            'shop_id' => $user->shop_id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'login_at' => now(),
        ]);

        $logMessage = "[" . now()->toDateTimeString() . "] User ID: " . $user->id . " | Name: " . $user->name . " | Shop ID: " . $user->shop_id . " | IP: " . $request->ip() . " | Agent: " . $request->userAgent() . PHP_EOL;
        \Illuminate\Support\Facades\File::append(storage_path('logs/user_logins.log'), $logMessage);

        return response()->json([
            'user' => $user,
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    public function logout(Request $request)
    {
        // Revoke the token that was used to authenticate the current request
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Logged out successfully']);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function changePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        $user = $request->user();

        if (!Hash::check($request->current_password, $user->password)) {
            return response()->json(['message' => 'Your current password does not match.'], 400);
        }

        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json(['message' => 'Password successfully updated!']);
    }
}
