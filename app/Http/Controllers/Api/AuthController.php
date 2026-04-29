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
            'password' => 'required|string|min:8|confirmed',
            'shop_name' => 'required|string|max:255'
        ]);

        // 1. Create the unique Shop (Multi-tenant partition)
        $shop = Shop::create([
            'name' => $request->shop_name,
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
            'email' => 'required|email',
            'password' => 'required',
        ]);

        // Extremely critical: We must explicitly bypass the Global Shop Scope here.
        // Otherwise, unauthenticated requests default to 'shop_id = 1' and block users
        // from any other newly registered shops from being found!
        $user = User::withoutGlobalScopes()->where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid email or password.'], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

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
