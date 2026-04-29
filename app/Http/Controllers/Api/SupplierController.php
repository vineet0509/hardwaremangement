<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index(): JsonResponse
    {
        $suppliers = Supplier::with('transactions')->orderBy('name')->get()->map(function($s) {
            $purchases = $s->transactions->where('type', 'purchase')->sum('amount');
            $payments = $s->transactions->where('type', 'payment')->sum('amount');
            $s->total_due = $purchases - $payments;
            return $s;
        });

        return response()->json($suppliers);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
        ]);

        $supplier = Supplier::create($data);

        return response()->json($supplier, 201);
    }

    public function storeTransaction(Request $request, Supplier $supplier): JsonResponse
    {
        $data = $request->validate([
            'type' => 'required|in:purchase,payment',
            'amount' => 'required|numeric|min:0.01',
            'transaction_date' => 'required|date',
            'notes' => 'nullable|string|max:255',
        ]);

        $tx = $supplier->transactions()->create($data);

        return response()->json($tx, 201);
    }

    public function transactions(Supplier $supplier): JsonResponse
    {
        return response()->json($supplier->transactions()->orderBy('transaction_date', 'desc')->get());
    }

    public function update(Request $request, Supplier $supplier): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'address' => 'nullable|string',
        ]);

        $supplier->update($data);

        return response()->json($supplier);
    }

    public function destroy(Supplier $supplier): JsonResponse
    {
        $supplier->delete();
        return response()->json(['message' => 'Supplier deleted successfully']);
    }
}
