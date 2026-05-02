<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\BillItem;
use App\Models\Product;
use App\Models\StockTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BillController extends Controller
{
    public function searchCustomer(Request $request): JsonResponse
    {
        $query = $request->query('q');
        if (!$query) return response()->json([]);

        $customers = Bill::select('customer_name', 'customer_phone', 'customer_address')
            ->whereNotNull('customer_name')
            ->where(function($q) use ($query) {
                $q->where('customer_phone', 'like', "%{$query}%")
                  ->orWhere('customer_name', 'like', "%{$query}%");
            })
            ->groupBy('customer_name', 'customer_phone', 'customer_address')
            ->limit(10)
            ->get();
            
        return response()->json($customers);
    }

    public function customersList(Request $request): JsonResponse
    {
        $query = Bill::select(
                'customer_phone',
                DB::raw('MAX(customer_name) as customer_name'),
                DB::raw('MAX(customer_address) as customer_address'),
                DB::raw('COUNT(id) as total_bills'),
                DB::raw('SUM(total) as lifetime_purchase'),
                DB::raw('SUM(paid_amount) as lifetime_paid'),
                DB::raw('SUM(due_amount) as current_due')
            )
            ->whereNotNull('customer_phone')
            ->where('customer_phone', '!=', '')
            ->groupBy('customer_phone');

        if ($request->search) {
            $query->where(function($q) use ($request) {
                $q->where('customer_phone', 'like', "%{$request->search}%")
                  ->orWhere('customer_name', 'like', "%{$request->search}%");
            });
        }

        return response()->json($query->orderByDesc('current_due')->paginate(50));
    }

    public function updateCustomer(Request $request, $phone): JsonResponse
    {
        // Decode in case of special characters, though phone should be numeric
        $phone = urldecode($phone);
        
        $data = $request->validate([
            'customer_name'    => 'required|string|max:255',
            'customer_phone'   => 'required|string|max:20',
            'customer_address' => 'required|string',
        ]);

        if ($phone !== $data['customer_phone']) {
            $existing = Bill::where('customer_phone', $data['customer_phone'])->first();
            if ($existing) {
                return response()->json(['message' => 'This target mobile number is already registered to another customer.'], 422);
            }
        }

        Bill::where('customer_phone', $phone)->update([
            'customer_name'    => $data['customer_name'],
            'customer_phone'   => $data['customer_phone'],
            'customer_address' => $data['customer_address'],
        ]);

        return response()->json(['message' => 'Customer profile updated successfully across all records.']);
    }

    public function udharList(): JsonResponse
    {
        $udhar = Bill::select('customer_name', 'customer_phone', DB::raw('SUM(due_amount) as total_due'))
            ->where('due_amount', '!=', 0)
            ->whereNotNull('customer_name')
            ->groupBy('customer_name', 'customer_phone')
            ->orderByDesc('total_due')
            ->get();
            
        return response()->json($udhar);
    }

    public function advancesList(Request $request): JsonResponse
    {
        $query = Bill::where('due_amount', '<', 0)->orderBy('created_at', 'desc');
        if ($request->search) {
            $query->where('customer_name', 'like', "%{$request->search}%")
                  ->orWhere('bill_number', 'like', "%{$request->search}%");
        }
        return response()->json($query->get());
    }

    public function storeAdvance(Request $request): JsonResponse
    {
        $data = $request->validate([
            'customer_name'  => 'required|string',
            'customer_phone' => 'nullable|string',
            'amount'         => 'required|numeric|min:1',
            'method'         => 'required|in:cash,upi,card',
            'date'           => 'required|date_format:Y-m-d H:i:s'
        ]);

        $bill = Bill::create([
            'bill_number'    => Bill::generateBillNumber(),
            'customer_name'  => $data['customer_name'],
            'customer_phone' => $data['customer_phone'],
            'subtotal'       => 0,
            'discount'       => 0,
            'tax'            => 0,
            'total'          => 0,
            'paid_amount'    => $data['amount'],
            'due_amount'     => -$data['amount'],
            'payment_method' => $data['method'],
            'status'         => 'paid',
            'notes'          => "Advance Received",
            'created_at'     => $data['date'],
            'updated_at'     => $data['date']
        ]);

        return response()->json(['message' => 'Advance recorded successfully!', 'data' => $bill]);
    }

    public function index(Request $request): JsonResponse
    {
        $query = Bill::with('items');

        if ($request->filled('search')) {
            $query->where(function ($q) use ($request) {
                $q->where('bill_number', 'like', "%{$request->search}%")
                  ->orWhere('customer_name', 'like', "%{$request->search}%");
            });
        }
        if ($request->filled('customer')) {
            $query->where('customer_name', $request->customer);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        return response()->json($query->latest()->paginate(20));
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'customer_name'    => 'required|string|max:255',
            'customer_phone'   => 'required|string|max:20',
            'customer_address' => 'required|string',
            'items'            => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price'    => 'required|numeric|min:0',
            'items.*.discount' => 'nullable|numeric|min:0',
            'discount'         => 'nullable|numeric|min:0',
            'tax'              => 'nullable|numeric|min:0',
            'paid_amount'      => 'required|numeric|min:0',
            'payment_method'   => 'required|in:cash,card,upi,credit',
            'notes'            => 'nullable|string',
        ]);

        if (!empty($data['customer_phone']) && !empty($data['customer_name'])) {
            $existing = Bill::where('customer_phone', $data['customer_phone'])
                            ->where('customer_name', '!=', $data['customer_name'])
                            ->first();
            if ($existing) {
                return response()->json(['message' => "Mobile {$data['customer_phone']} is already registered under the name: {$existing->customer_name}. Please use matching details."], 422);
            }
        }

        $bill = DB::transaction(function () use ($data) {
            $subtotal = 0;
            $itemsData = [];

            foreach ($data['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);

                if ($product->quantity < $item['quantity']) {
                    throw new \Exception("Insufficient stock for: {$product->name}");
                }

                $itemDiscount = $item['discount'] ?? 0;
                $lineTotal = ($item['price'] * $item['quantity']) - $itemDiscount;
                $subtotal += $lineTotal;

                $itemsData[] = [
                    'product_id'   => $product->id,
                    'product_name' => $product->name,
                    'price'        => $item['price'],
                    'quantity'     => $item['quantity'],
                    'discount'     => $itemDiscount,
                    'total'        => $lineTotal,
                ];

                // Deduct from stock
                $product->decrement('quantity', $item['quantity']);
                StockTransaction::create([
                    'product_id' => $product->id,
                    'type'       => 'sale',
                    'quantity'   => -$item['quantity'],
                    'price'      => $item['price'],
                ]);
            }

            $discount = $data['discount'] ?? 0;
            $tax      = $data['tax'] ?? 0;
            $total    = $subtotal - $discount + $tax;
            $paid     = $data['paid_amount'];
            
            // Allow negative due for overpayments (Customer credits)
            $due      = $total - $paid; 
            
            // If due < 0, customer has a credit balance (advance)
            // If due > 0, customer owes us
            $status   = $due == 0 ? 'paid' : ($paid > 0 && $due > 0 ? 'partial' : 'pending');

            $bill = Bill::create([
                'bill_number'    => Bill::generateBillNumber(),
                'customer_name'  => $data['customer_name'],
                'customer_phone' => $data['customer_phone'],
                'customer_address'=> $data['customer_address'],
                'subtotal'       => $subtotal,
                'discount'       => $discount,
                'tax'            => $tax,
                'total'          => $total,
                'paid_amount'    => $paid,
                'due_amount'     => $due,
                'payment_method' => $data['payment_method'],
                'status'         => $status,
                'notes'          => $data['notes'] ?? null,
            ]);

            foreach ($itemsData as $item) {
                $item['bill_id'] = $bill->id;
                BillItem::create($item);
            }

            return $bill;
        });

        return response()->json($bill->load('items'), 201);
    }

    public function show(Bill $bill): JsonResponse
    {
        return response()->json($bill->load('items.product'));
    }

    public function update(Request $request, Bill $bill): JsonResponse
    {
        $data = $request->validate([
            'customer_name'    => 'required|string|max:255',
            'customer_phone'   => 'required|string|max:20',
            'customer_address' => 'required|string',
            'items'            => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price'    => 'required|numeric|min:0',
            'items.*.discount' => 'nullable|numeric|min:0',
            'discount'         => 'nullable|numeric|min:0',
            'tax'              => 'nullable|numeric|min:0',
            'paid_amount'      => 'required|numeric|min:0',
            'payment_method'   => 'required|in:cash,upi,card,credit',
            'notes'            => 'nullable|string',
        ]);

        if (!empty($data['customer_phone']) && !empty($data['customer_name'])) {
            $existing = Bill::where('customer_phone', $data['customer_phone'])
                            ->where('customer_name', '!=', $data['customer_name'])
                            ->where('id', '!=', $bill->id)
                            ->first();
            if ($existing) {
                return response()->json(['message' => "Mobile {$data['customer_phone']} is already registered under the name: {$existing->customer_name}. Please use matching details."], 422);
            }
        }

        $updatedBill = DB::transaction(function () use ($data, $bill) {
            // Restore previous stock
            foreach ($bill->items as $item) {
                Product::where('id', $item->product_id)->increment('quantity', $item->quantity);
            }
            $bill->items()->delete();

            $subtotal = 0;
            $itemsData = [];

            foreach ($data['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);

                if ($product->quantity < $item['quantity']) {
                    throw new \Exception("Insufficient stock for: {$product->name}");
                }

                $itemDiscount = $item['discount'] ?? 0;
                $lineTotal = ($item['price'] * $item['quantity']) - $itemDiscount;
                $subtotal += $lineTotal;

                $itemsData[] = [
                    'bill_id'      => $bill->id,
                    'product_id'   => $product->id,
                    'product_name' => $product->name,
                    'price'        => $item['price'],
                    'quantity'     => $item['quantity'],
                    'discount'     => $itemDiscount,
                    'total'        => $lineTotal,
                ];

                $product->decrement('quantity', $item['quantity']);
            }

            $discount = $data['discount'] ?? 0;
            $tax      = $data['tax'] ?? 0;
            $total    = $subtotal - $discount + $tax;
            $paid     = $data['paid_amount'];
            $due      = $total - $paid; 
            
            $status   = $due == 0 ? 'paid' : ($paid > 0 && $due > 0 ? 'partial' : 'pending');

            $bill->update([
                'customer_name'  => $data['customer_name'],
                'customer_phone' => $data['customer_phone'],
                'customer_address'=> $data['customer_address'],
                'subtotal'       => $subtotal,
                'discount'       => $discount,
                'tax'            => $tax,
                'total'          => $total,
                'paid_amount'    => $paid,
                'due_amount'     => $due,
                'payment_method' => $data['payment_method'],
                'status'         => $status,
                'notes'          => $data['notes'] ?? null,
            ]);

            BillItem::insert($itemsData);

            return $bill;
        });

        return response()->json($updatedBill->load('items'), 200);
    }

    public function repay(Request $request, Bill $bill): JsonResponse
    {
        $data = $request->validate([
            'amount' => 'required|numeric|min:1',
            'method' => 'required|in:cash,upi,card',
            'upi_digits' => 'nullable|string'
        ]);

        if ($data['amount'] > $bill->due_amount && $bill->due_amount > 0) {
            return response()->json(['message' => 'Repayment cannot exceed the due amount.'], 422);
        }

        DB::transaction(function () use ($bill, $data) {
            // Update original bill
            $bill->paid_amount += $data['amount'];
            $bill->due_amount -= $data['amount'];
            if ($bill->due_amount <= 0) $bill->status = 'paid';
            $bill->save();

            // Create a receipt bill to ensure today's cash drawer captures the payment
            $notes = "Repayment for Bill #{$bill->bill_number}";
            if ($data['method'] === 'upi' && !empty($data['upi_digits'])) {
                $notes .= " | UPI Ref: {$data['upi_digits']}";
            }

            Bill::create([
                'bill_number'    => Bill::generateBillNumber(),
                'customer_name'  => $bill->customer_name,
                'customer_phone' => $bill->customer_phone,
                'subtotal'       => 0,
                'discount'       => 0,
                'tax'            => 0,
                'total'          => 0,
                'paid_amount'    => $data['amount'],
                'due_amount'     => 0,  // Stays zero so we don't double sum the khata
                'payment_method' => $data['method'],
                'status'         => 'paid',
                'notes'          => $notes,
            ]);
        });

        return response()->json(['message' => 'Repayment processed successfully.']);
    }

    public function destroy(Bill $bill): JsonResponse
    {
        // Restore stock on delete
        DB::transaction(function () use ($bill) {
            foreach ($bill->items as $item) {
                Product::find($item->product_id)?->increment('quantity', $item->quantity);
                StockTransaction::create([
                    'product_id' => $item->product_id,
                    'type'       => 'return',
                    'quantity'   => $item->quantity,
                    'reference'  => "Bill #{$bill->bill_number} deleted",
                ]);
            }
            $bill->delete();
        });

        return response()->json(['message' => 'Bill deleted and stock restored.']);
    }
}
