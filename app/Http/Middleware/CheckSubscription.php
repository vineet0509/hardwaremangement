<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckSubscription
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = auth('sanctum')->user();
        if ($user) {
            $business = \App\Models\Business::find($user->business_id);
            if ($business && $business->trial_ends_at) {
                $isExpired = \Carbon\Carbon::now()->greaterThan($business->trial_ends_at);
                if ($isExpired) {
                    // Exempt routes so users can logout and renew
                    $exemptPaths = [
                        'api/logout',
                        'api/settings/subscription/order',
                        'api/settings/subscription/verify',
                    ];
                    
                    $isExempt = false;
                    foreach ($exemptPaths as $path) {
                        if ($request->is($path)) {
                            $isExempt = true;
                            break;
                        }
                    }

                    // Super Admins are exempt only for super-admin panel routes
                    if ($user->is_super_admin && $request->is('api/super-admin*')) {
                        $isExempt = true;
                    }

                    if (!$isExempt && ($request->isMethod('post') || $request->isMethod('put') || $request->isMethod('patch') || $request->isMethod('delete'))) {
                        return response()->json([
                            'message' => 'Action Restricted: Your active plan has expired. Please renew your plan.'
                        ], 403);
                    }
                }
            }
        }
        return $next($request);
    }
}
