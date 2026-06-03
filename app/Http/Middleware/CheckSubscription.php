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
        if ($user && !$user->is_super_admin) {
            $business = \App\Models\Business::find($user->business_id);
            if ($business && $business->trial_ends_at) {
                $isExpired = \Carbon\Carbon::now()->greaterThan($business->trial_ends_at);
                if ($isExpired) {
                    if ($request->isMethod('post') || $request->isMethod('put') || $request->isMethod('patch') || $request->isMethod('delete')) {
                        return response()->json([
                            'message' => 'Action Restricted: Your 30-Day Trial or active plan has expired. Please reach out to Super Admin.'
                        ], 403);
                    }
                }
            }
        }
        return $next($request);
    }
}
