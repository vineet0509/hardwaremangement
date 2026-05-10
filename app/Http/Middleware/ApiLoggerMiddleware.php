<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiLoggerMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Prepare request data (mask passwords for security)
        $input = $request->except(['password', 'password_confirmation', 'current_password', 'new_password', 'token', 'access_token']);
        
        $user = $request->user();
        $userInfo = $user ? "User: {$user->id} ({$user->name})" : "Guest";
        $shopId = $user ? "Shop: {$user->shop_id}" : "N/A";

        $logData = [
            'timestamp' => now()->toDateTimeString(),
            'ip' => $request->ip(),
            'user' => $userInfo,
            'shop' => $shopId,
            'method' => $request->method(),
            'url' => $request->fullUrl(),
            'input' => $input,
            'status' => $response->getStatusCode(),
        ];

        // Include response body for all requests
        $responseContent = $response->getContent();
        $decodedResponse = json_decode($responseContent, true);
        $logData['response'] = $decodedResponse ?: $responseContent;

        $logLine = json_encode($logData) . PHP_EOL;

        \Illuminate\Support\Facades\File::append(
            storage_path('logs/api_activity.log'),
            $logLine
        );

        return $response;
    }
}
