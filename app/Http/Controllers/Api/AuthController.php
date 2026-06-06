<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Business;
use App\Models\Setting;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        if ($request->has('gst_number') && $request->gst_number !== null) {
            $request->merge(['gst_number' => strtoupper(trim($request->gst_number))]);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'mobile' => 'nullable|string|max:15|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'shop_name' => 'required|string|max:255',
            'business_type' => 'nullable|string|max:100',
            'gst_number' => ['nullable', 'string', new \App\Rules\ValidGstin()]
        ]);

        // 1. Create the unique Shop (Multi-tenant partition)
        $business = Business::create([
            'name' => $request->shop_name,
            'business_type' => $request->business_type,
            'gst_number' => $request->gst_number,
            'is_active' => true,
            'trial_ends_at' => now()->addDays(30),
        ]);

        // 2. Initialize default Settings for this specific shop
        // Force the environment to recognize this shop so Global Scopes pass safely
        Setting::withoutGlobalScopes()->create([
            'business_id' => $business->id,
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
            'business_id' => $business->id,
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

        if ($user->business && !$user->business->is_active) {
            return response()->json(['message' => 'Your account or shop has been deactivated. Please contact your administrator.'], 403);
        }

        if ($user->role === 'staff') {
            $staffRecord = \App\Models\Staff::where('user_id', $user->id)->first();
            if ($staffRecord && $staffRecord->status === 'inactive') {
                return response()->json(['message' => 'Your staff account has been deactivated. Please contact your administrator.'], 403);
            }
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        \App\Models\LoginLog::create([
            'user_id' => $user->id,
            'business_id' => $user->business_id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'login_at' => now(),
        ]);

        $logMessage = "[" . now()->toDateTimeString() . "] User ID: " . $user->id . " | Name: " . $user->name . " | Shop ID: " . $user->business_id . " | IP: " . $request->ip() . " | Agent: " . $request->userAgent() . PHP_EOL;
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
        return response()->json($request->user()->load('business'));
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'mobile' => 'nullable|string|max:15|unique:users,mobile,' . $user->id,
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'mobile' => $request->mobile,
        ]);

        return response()->json([
            'message' => 'Profile updated successfully!', 
            'user' => $user
        ]);
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

    public function deleteAccount(Request $request)
    {
        $user = $request->user();
        
        // Revoke all tokens
        $user->tokens()->delete();
        
        // Soft delete the user
        $user->delete();

        return response()->json(['message' => 'Account deleted successfully.']);
    }

    public function contactSubmit(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255',
            'message' => 'required|string|max:5000',
        ]);

        $name = $request->name;
        $email = $request->email;
        $msgContent = $request->message;

        try {
            \Illuminate\Support\Facades\Mail::send([], [], function ($message) use ($name, $email, $msgContent) {
                $message->to('support@vynkra.in')
                        ->subject("New Contact Inquiry from {$name}")
                        ->html("
                            <div style='font-family: sans-serif; padding: 20px; line-height: 1.6; color: #333;'>
                                <h2 style='color: #4f46e5; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;'>New Contact Inquiry Received</h2>
                                <p><strong>Name:</strong> {$name}</p>
                                <p><strong>Email Address:</strong> <a href='mailto:{$email}'>{$email}</a></p>
                                <p><strong>Inquiry Message:</strong></p>
                                <div style='background: #f3f4f6; padding: 15px; border-radius: 8px; font-style: italic; border-left: 4px solid #4f46e5; margin: 15px 0;'>
                                    " . nl2br(e($msgContent)) . "
                                </div>
                                <p style='font-size: 0.85rem; color: #6b7280; border-top: 1px solid #e5e7eb; padding-top: 10px; margin-top: 20px;'>
                                    This enquiry was sent automatically from the VyaparSync Landing Page.
                                </p>
                            </div>
                        ");
            });

            return response()->json(['message' => 'Your inquiry has been successfully sent to support@vynkra.in! We will contact you soon.']);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Contact form failed to send mail: " . $e->getMessage());
            // Fallback: succeed anyway so user doesn't hit a blank page or error
            return response()->json(['message' => 'Inquiry registered. Vynkra Support will get back to you shortly.']);
        }
    }
}
