<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

class ApiDocsController extends Controller
{
    /**
     * Display a listing of all API routes with their details.
     */
    public function index()
    {
        $routes = collect(Route::getRoutes())->filter(function ($route) {
            return str_starts_with($route->uri(), 'api/') && !str_contains($route->uri(), 'docs');
        })->map(function ($route) {
            $methods = array_diff($route->methods(), ['HEAD']);
            
            // Try to guess params from the URI
            preg_match_all('/\{(.*?)\}/', $route->uri(), $matches);
            $params = $matches[1] ?? [];

            // Mock some expected data structure based on the URI
            $expectedResponse = $this->guessResponse($route->uri());
            $requestPayload = $this->guessRequestPayload($route->uri(), $methods);

            return [
                'method' => implode(', ', $methods),
                'uri' => '/' . $route->uri(),
                'name' => $route->getName(),
                'params' => $params,
                'payload' => $requestPayload,
                'response_example' => $expectedResponse,
                'middleware' => array_diff($route->gatherMiddleware(), ['web']),
            ];
        })->values();

        return view('api-docs', ['routes' => $routes]);
    }

    private function guessResponse($uri)
    {
        if (str_contains($uri, 'products')) return ['id' => 1, 'name' => 'Product Name', 'sku' => 'SKU-123', 'selling_price' => 100];
        if (str_contains($uri, 'bills')) return ['id' => 1, 'bill_number' => 'INV-2024-0001', 'total' => 500, 'items' => []];
        if (str_contains($uri, 'staff')) return ['id' => 1, 'name' => 'Staff Name', 'role' => 'Manager'];
        if (str_contains($uri, 'settings')) return ['company_name' => 'My Shop', 'gst_number' => '27XXXXX'];
        return ['message' => 'Success', 'data' => []];
    }

    private function guessRequestPayload($uri, $methods)
    {
        if (in_array('GET', $methods)) return null;

        if (str_contains($uri, 'login')) return ['login' => 'email@example.com', 'password' => '******'];
        if (str_contains($uri, 'products')) return ['name' => 'New Product', 'category_id' => 1, 'purchase_price' => 50, 'selling_price' => 75, 'quantity' => 10, 'unit' => 'pcs'];
        if (str_contains($uri, 'bills')) return ['customer_name' => 'John Doe', 'customer_phone' => '1234567890', 'items' => [['product_id' => 1, 'quantity' => 2]]];
        
        return ['example_field' => 'value'];
    }
}
