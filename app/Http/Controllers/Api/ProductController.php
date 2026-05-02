<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Product;
use App\Models\StockTransaction;
use App\Models\SupplierTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::with('category');

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('sku', 'like', "%{$request->search}%");
            });
        }
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        if ($request->filled('low_stock') && $request->low_stock == 1) {
            $query->whereColumn('quantity', '<=', 'min_stock_alert');
        }

        $products = $query->orderBy('name')->paginate(20);
        return response()->json($products);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'category_id'     => [
                'required',
                Rule::exists('categories', 'id')->where(function ($query) {
                    return $query->where('shop_id', auth('sanctum')->user()->shop_id);
                })
            ],
            'supplier_id'     => 'nullable|exists:suppliers,id',
            'name'            => 'required|string|max:255',
            'description'     => 'nullable|string',
            'purchase_price'  => 'required|numeric|min:0',
            'selling_price'   => 'required|numeric|min:0',
            'quantity'        => 'required|integer|min:0',
            'min_stock_alert' => 'required|integer|min:0',
            'unit'            => 'required|string|max:50',
        ]);

        $data['sku'] = 'SKU-' . strtoupper(Str::random(8));

        $product = DB::transaction(function () use ($data) {
            $product = Product::create($data);
            if ($product->quantity > 0) {
                StockTransaction::create([
                    'product_id' => $product->id,
                    'type'       => 'purchase',
                    'quantity'   => $product->quantity,
                    'price'      => $product->purchase_price,
                    'reference'  => 'Initial Stock',
                ]);
            }

            if ($product->quantity > 0 && $product->supplier_id) {
                SupplierTransaction::create([
                    'shop_id' => $product->shop_id,
                    'supplier_id' => $product->supplier_id,
                    'type' => 'purchase',
                    'amount' => $product->quantity * $product->purchase_price,
                    'transaction_date' => now(),
                    'notes' => "Initial stock for product: {$product->name}"
                ]);
            }
            return $product;
        });

        return response()->json($product->load('category'), 201);
    }

    public function show(Product $product): JsonResponse
    {
        return response()->json($product->load(['category', 'stockTransactions' => fn($q) => $q->latest()->limit(20)]));
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate([
            'category_id'     => [
                'sometimes',
                Rule::exists('categories', 'id')->where(function ($query) {
                    return $query->where('shop_id', auth('sanctum')->user()->shop_id);
                })
            ],
            'supplier_id'     => 'nullable|exists:suppliers,id',
            'name'            => 'sometimes|string|max:255',
            'description'     => 'nullable|string',
            'purchase_price'  => 'sometimes|numeric|min:0',
            'selling_price'   => 'sometimes|numeric|min:0',
            'min_stock_alert' => 'sometimes|integer|min:0',
            'unit'            => 'sometimes|string|max:50',
        ]);

        $product->update($data);
        return response()->json($product->load('category'));
    }

    public function destroy(Product $product): JsonResponse
    {
        $product->delete();
        return response()->json(['message' => 'Product deleted successfully.']);
    }

    public function addStock(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate([
            'quantity'  => 'required|integer|min:1',
            'price'     => 'nullable|numeric|min:0',
            'reference' => 'nullable|string|max:255',
            'notes'     => 'nullable|string',
        ]);

        DB::transaction(function () use ($data, $product) {
            $product->increment('quantity', $data['quantity']);
            StockTransaction::create([
                'product_id' => $product->id,
                'type'       => 'purchase',
                'quantity'   => $data['quantity'],
                'price'      => $data['price'] ?? $product->purchase_price,
                'reference'  => $data['reference'] ?? null,
                'notes'      => $data['notes'] ?? null,
            ]);

            if ($product->supplier_id) {
                $buyPrice = $data['price'] ?? $product->purchase_price;
                SupplierTransaction::create([
                    'shop_id' => $product->shop_id,
                    'supplier_id' => $product->supplier_id,
                    'type' => 'purchase',
                    'amount' => $data['quantity'] * $buyPrice,
                    'transaction_date' => now(),
                    'notes' => "Stock added: {$product->name} (Qty: {$data['quantity']})"
                ]);
            }
        });

        return response()->json($product->fresh());
    }

    public function removeStock(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate([
            'quantity'  => 'required|integer|min:1',
            'reason'    => 'nullable|string|max:255',
            'notes'     => 'nullable|string',
        ]);

        if ($product->quantity < $data['quantity']) {
            return response()->json(['message' => 'Insufficient stock.'], 422);
        }

        DB::transaction(function () use ($data, $product) {
            $product->decrement('quantity', $data['quantity']);
            StockTransaction::create([
                'product_id' => $product->id,
                'type'       => 'adjustment',
                'quantity'   => -$data['quantity'],
                'reference'  => $data['reason'] ?? 'Manual Removal',
                'notes'      => $data['notes'] ?? null,
            ]);
        });

        return response()->json($product->fresh());
    }

    public function categories(): JsonResponse
    {
        return response()->json(Category::orderBy('name')->get());
    }

    public function storeCategory(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'        => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories')->where(function ($query) {
                    return $query->where('shop_id', auth('sanctum')->user()->shop_id);
                })
            ],
            'description' => 'nullable|string',
        ]);
        return response()->json(Category::create($data), 201);
    }

    public function exportCSV()
    {
        $products = Product::with('category')->get();
        $csvFileName = 'products_' . now()->format('Ymd_His') . '.csv';
        
        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$csvFileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = ['SKU', 'Product Name', 'Category', 'Purchase Price', 'Selling Price', 'Quantity', 'Min Stock Alert', 'Unit', 'Description'];

        $callback = function() use($products, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($products as $product) {
                fputcsv($file, [
                    $product->sku,
                    $product->name,
                    $product->category?->name ?? 'N/A',
                    $product->purchase_price,
                    $product->selling_price,
                    $product->quantity,
                    $product->min_stock_alert,
                    $product->unit,
                    $product->description
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function importCSV(Request $request)
    {
        $request->validate([
            'file' => 'required|file|mimes:csv,txt|max:2048'
        ]);

        $file = $request->file('file');
        $path = $file->getRealPath();
        
        $csvData = array_map('str_getcsv', file($path));
        if (count($csvData) <= 1) {
            return response()->json(['message' => 'Empty file provided'], 400);
        }

        $header = array_shift($csvData);
        $count = 0;

        DB::beginTransaction();
        try {
            foreach ($csvData as $row) {
                if (count($row) < 6) continue; 
                
                $sku = !empty($row[0]) ? $row[0] : 'SKU-' . strtoupper(Str::random(8));
                $name = $row[1] ?? null;
                $categoryName = $row[2] ?? 'General';
                $purchasePrice = floatval($row[3] ?? 0);
                $sellingPrice = floatval($row[4] ?? 0);
                $quantity = intval($row[5] ?? 0);
                $minStock = intval($row[6] ?? 5);
                $unit = $row[7] ?? 'pcs';
                $description = $row[8] ?? null;

                if (!$name) continue;

                $category = Category::withoutGlobalScopes()->firstOrCreate(
                    ['name' => $categoryName, 'shop_id' => auth('sanctum')->user()->shop_id]
                );

                Product::create([
                    'category_id' => $category->id,
                    'sku' => $sku,
                    'name' => $name,
                    'description' => $description,
                    'purchase_price' => $purchasePrice,
                    'selling_price' => $sellingPrice,
                    'quantity' => $quantity,
                    'min_stock_alert' => $minStock,
                    'unit' => $unit,
                    'shop_id' => auth('sanctum')->user()->shop_id
                ]);
                
                $count++;
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Import failed: ' . $e->getMessage()], 500);
        }

        return response()->json(['message' => "Successfully imported $count products."]);
    }
}
