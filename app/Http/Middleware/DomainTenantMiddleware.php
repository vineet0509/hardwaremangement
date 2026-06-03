<?php

namespace App\Http\Middleware;

use Closure;
use App\Models\Business;
use Illuminate\Http\Request;

class DomainTenantMiddleware
{
    public function handle(Request $request, Closure $next)
    {
        $host = $request->getHost();
        
        // Skip on localhost development defaults
        if (str_contains($host, 'localhost') || str_contains($host, '127.0.0.1')) {
            return $next($request);
        }

        $business = Business::where('domain', $host)
            ->orWhere('domain', 'like', '%' . explode('.', $host)[0] . '%')
            ->first();

        if ($business) {
            app()->instance('current_shop', $business);
        }

        return $next($request);
    }
}
