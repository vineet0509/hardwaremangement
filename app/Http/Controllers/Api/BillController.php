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
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Setting;

class BillController extends Controller
{
    public function searchCustomer(Request $request): JsonResponse
    {
        $query = $request->query('q');
        if (!$query) return response()->json([]);

        $user = auth()->user();

        $billQuery = Bill::select('customer_name', 'customer_phone', 'customer_address')
            ->whereNotNull('customer_name')
            ->where(function($q) use ($query) {
                $q->where('customer_phone', 'like', "%{$query}%")
                  ->orWhere('customer_name', 'like', "%{$query}%");
            });

        // Staff only see customers from their own bills
        if ($user->role === 'staff') {
            $billQuery->where('user_id', $user->id);
        }

        $customers = $billQuery
            ->groupBy('customer_name', 'customer_phone', 'customer_address')
            ->limit(10)
            ->get();
            
        return response()->json($customers);
    }

    public function customersList(Request $request): JsonResponse
    {
        $user = auth()->user();

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
            ->where('customer_phone', '!=', '');

        // Staff only see their own customers
        if ($user->role === 'staff') {
            $query->where('user_id', $user->id);
        }

        $query->groupBy('customer_phone');

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
        $user = auth()->user();

        $query = Bill::select('customer_name', 'customer_phone', DB::raw('SUM(due_amount) as total_due'))
            ->where('due_amount', '!=', 0)
            ->whereNotNull('customer_name')
            ->groupBy('customer_name', 'customer_phone')
            ->orderByDesc('total_due');

        // Staff only see udhar from their own bills
        if ($user->role === 'staff') {
            $query->where('user_id', $user->id);
        }

        return response()->json($query->get());
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
            'user_id'        => auth()->id(),
            'created_at'     => $data['date'],
            'updated_at'     => $data['date']
        ]);

        return response()->json(['message' => 'Advance recorded successfully!', 'data' => $bill]);
    }

    public function index(Request $request): JsonResponse
    {
        $query = Bill::with(['items', 'creator']);

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

        $totalsQuery = clone $query;
        $summaryTotalSale = $totalsQuery->sum('total');
        $summaryTotalDue = $totalsQuery->where('due_amount', '>', 0)->sum('due_amount');

        $paginated = $query->latest()->paginate(20);
        $response = $paginated->toArray();
        $response['summary_total_sale'] = $summaryTotalSale;
        $response['summary_total_due'] = $summaryTotalDue;

        return response()->json($response);
    }

    public function exportCSV(Request $request)
    {
        $query = Bill::query();

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

        $bills = $query->latest()->get();

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=bills_history.csv",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = ['Bill Number', 'Customer Name', 'Phone', 'Date', 'Total', 'Paid', 'Due', 'Payment Method', 'Status'];

        $callback = function() use($bills, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($bills as $bill) {
                fputcsv($file, [
                    $bill->bill_number,
                    $bill->customer_name,
                    $bill->customer_phone,
                    $bill->created_at->format('Y-m-d H:i'),
                    $bill->total,
                    $bill->paid_amount,
                    $bill->due_amount,
                    strtoupper($bill->payment_method),
                    strtoupper($bill->status),
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'customer_name'    => 'required|string|max:255',
            'customer_phone'   => 'required|string|max:20',
            'customer_address' => 'required|string',
            'items'            => 'required|array|min:1',
            'items.*.product_id' => [
                'required',
                \Illuminate\Validation\Rule::exists('products', 'id')->where(function ($query) {
                    return $query->where('business_id', auth()->user()->business_id);
                }),
            ],
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price'    => 'required|numeric|min:0',
            'items.*.discount' => 'nullable|numeric|min:0',
            'discount'         => 'nullable|numeric|min:0',
            'tax'              => 'nullable|numeric|min:0',
            'paid_amount'      => 'required|numeric|min:0',
            'payment_method'   => 'required|in:cash,card,upi,credit',
            'notes'            => 'nullable|string',
            'is_gst'           => 'nullable|boolean',
            'type'             => 'nullable|in:sale,return',
            'parent_bill_id'   => 'nullable|exists:bills,id',
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
                    'description'  => $product->description,
                    'unit'         => $product->unit,
                    'price'        => $item['price'],
                    'quantity'     => $item['quantity'],
                    'discount'     => $itemDiscount,
                    'total'        => $lineTotal,
                ];

                $isReturn = ($data['type'] ?? 'sale') === 'return';
                if ($isReturn) {
                    $product->increment('quantity', $item['quantity']);
                    StockTransaction::create([
                        'product_id' => $product->id,
                        'type'       => 'return',
                        'quantity'   => $item['quantity'],
                        'price'      => $item['price'],
                        'notes'      => 'Return against bill #' . ($data['parent_bill_id'] ?? ''),
                    ]);
                } else {
                    $product->decrement('quantity', $item['quantity']);
                    StockTransaction::create([
                        'product_id' => $product->id,
                        'type'       => 'sale',
                        'quantity'   => -$item['quantity'],
                        'price'      => $item['price'],
                    ]);
                }
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
                'is_gst'         => $data['is_gst'] ?? false,
                'user_id'        => auth()->id(),
                'type'           => $data['type'] ?? 'sale',
                'parent_bill_id' => $data['parent_bill_id'] ?? null,
            ]);

            foreach ($itemsData as $item) {
                $item['bill_id'] = $bill->id;
                $item['business_id'] = $bill->business_id;
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
            'items.*.product_id' => [
                'required',
                \Illuminate\Validation\Rule::exists('products', 'id')->where(function ($query) {
                    return $query->where('business_id', auth()->user()->business_id);
                }),
            ],
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.price'    => 'required|numeric|min:0',
            'items.*.discount' => 'nullable|numeric|min:0',
            'discount'         => 'nullable|numeric|min:0',
            'tax'              => 'nullable|numeric|min:0',
            'paid_amount'      => 'required|numeric|min:0',
            'payment_method'   => 'required|in:cash,upi,card,credit',
            'notes'            => 'nullable|string',
            'is_gst'           => 'nullable|boolean',
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
                    'description'  => $product->description,
                    'unit'         => $product->unit,
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
                'is_gst'         => $data['is_gst'] ?? false,
            ]);

            foreach ($itemsData as $item) {
                $item['business_id'] = $bill->business_id;
                BillItem::create($item);
            }

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

    public function returnItems(Request $request, Bill $bill): JsonResponse
    {
        $data = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.id' => 'required|exists:bill_items,id',
            'items.*.return_qty' => 'required|integer|min:1',
        ]);

        $bill->load('items');
        
        $totalDeduction = 0;

        try {
            DB::transaction(function () use ($data, $bill, &$totalDeduction) {
                foreach ($data['items'] as $returnItem) {
                    $billItem = $bill->items->firstWhere('id', $returnItem['id']);
                    
                    if (!$billItem) continue;

                    $maxReturnable = $billItem->quantity - $billItem->returned_quantity;
                    if ($returnItem['return_qty'] > $maxReturnable) {
                        throw new \Exception("Cannot return more than originally purchased for item: {$billItem->product_name}");
                    }

                    // Update bill item returned quantity
                    $billItem->increment('returned_quantity', $returnItem['return_qty']);

                    // Calculate value deducted from bill
                    // $itemDiscount in store() was total discount for the line.
                    $unitDiscount = $billItem->quantity > 0 ? ($billItem->discount / $billItem->quantity) : 0;
                    $deduction = ($billItem->price * $returnItem['return_qty']) - ($unitDiscount * $returnItem['return_qty']);
                    
                    // The tax is calculated on the subtotal. If `is_gst` is true, tax = 18% of (subtotal - discount).
                    // In `store()`, we just used `$tax = $data['tax'] ?? 0;`.
                    // So let's proportionately reduce the tax as well.
                    $totalDeduction += $deduction;

                    // Restore stock
                    $product = Product::find($billItem->product_id);
                    if ($product) {
                        $product->increment('quantity', $returnItem['return_qty']);
                        StockTransaction::create([
                            'product_id' => $product->id,
                            'type'       => 'return',
                            'quantity'   => $returnItem['return_qty'],
                            'price'      => $billItem->price,
                            'reference'  => "Return from Bill #{$bill->bill_number}",
                        ]);
                    }
                }

                $taxDeduction = 0;
                if ($bill->subtotal > 0 && $bill->tax > 0) {
                    $taxRatio = $bill->tax / $bill->subtotal;
                    $taxDeduction = $totalDeduction * $taxRatio;
                }

                $billDiscountDeduction = 0;
                if ($bill->subtotal > 0 && $bill->discount > 0) {
                    $discountRatio = $bill->discount / $bill->subtotal;
                    $billDiscountDeduction = $totalDeduction * $discountRatio;
                }
                
                $finalDeduction = $totalDeduction - $billDiscountDeduction + $taxDeduction;

                // Create a new return bill
                $returnBill = Bill::create([
                    'bill_number'    => Bill::generateBillNumber(),
                    'customer_name'  => $bill->customer_name,
                    'customer_phone' => $bill->customer_phone,
                    'customer_address'=> $bill->customer_address,
                    'subtotal'       => $totalDeduction,
                    'discount'       => $billDiscountDeduction,
                    'tax'            => $taxDeduction,
                    'total'          => $finalDeduction,
                    'paid_amount'    => $finalDeduction, // assume fully refunded
                    'due_amount'     => 0,
                    'payment_method' => 'cash', // Default refund method
                    'status'         => 'paid',
                    'notes'          => 'Return/Refund against Bill #' . $bill->bill_number,
                    'is_gst'         => $bill->is_gst,
                    'user_id'        => auth()->id(),
                    'type'           => 'return',
                    'parent_bill_id' => $bill->id,
                ]);

                // Create items for the return bill
                foreach ($data['items'] as $returnItem) {
                    $billItem = $bill->items->firstWhere('id', $returnItem['id']);
                    if (!$billItem) continue;

                    \App\Models\BillItem::create([
                        'bill_id'      => $returnBill->id,
                        'product_id'   => $billItem->product_id,
                        'product_name' => $billItem->product_name,
                        'description'  => $billItem->description,
                        'unit'         => $billItem->unit,
                        'price'        => $billItem->price,
                        'quantity'     => $returnItem['return_qty'],
                        'discount'     => ($billItem->quantity > 0 ? ($billItem->discount / $billItem->quantity) : 0) * $returnItem['return_qty'],
                        'total'        => ($billItem->price * $returnItem['return_qty']) - (($billItem->quantity > 0 ? ($billItem->discount / $billItem->quantity) : 0) * $returnItem['return_qty']),
                        'business_id'  => $bill->business_id,
                    ]);
                }

            });

            return response()->json(['message' => 'Items returned successfully. A Return Bill has been generated and stock has been restored.', 'bill' => $bill->fresh('items')]);
        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }
    }

    public function sendWhatsApp(Request $request): JsonResponse
    {
        $request->validate([
            'bill_id' => 'required|exists:bills,id',
            'phone' => 'required|string',
            'message' => 'required|string',
        ]);

        $bill = Bill::findOrFail($request->bill_id);
        
        // This is a placeholder for your actual WhatsApp API integration.
        // You can replace this logic with calls to Twilio, Meta Cloud API, or any WhatsApp Gateway.
        
        \Log::info("WhatsApp API Call for Bill #{$bill->bill_number} to {$request->phone}");
        \Log::info("Message: " . $request->message);

        // Integration Example:
        // Http::post('https://api.whatsapp-provider.com/v1/send', [
        //     'phone' => $request->phone,
        //     'body' => $request->message,
        //     'api_key' => config('services.whatsapp.key')
        // ]);

        return response()->json([
            'success' => true,
            'message' => 'WhatsApp message has been sent to the processing API.'
        ]);
    }

    public function sendUdharReminder(Request $request, $phone): JsonResponse
    {
        $phone = urldecode($phone);
        
        $customer = Bill::where('customer_phone', $phone)->first();
        if (!$customer) {
            return response()->json(['message' => 'Customer not found.'], 404);
        }

        $totalDue = Bill::where('customer_phone', $phone)->sum('due_amount');
        
        if ($totalDue <= 0) {
            return response()->json(['message' => 'Customer has no pending dues.'], 400);
        }

        $message = "Dear {$customer->customer_name},\nThis is a gentle reminder that your pending Udhar Khata balance is ₹{$totalDue}. Please clear the dues at your earliest convenience.\nThank you!";

        \Log::info("WhatsApp Udhar Reminder to {$phone}: " . $message);

        return response()->json([
            'message' => 'WhatsApp Udhar reminder sent successfully.',
            'total_due' => $totalDue
        ]);
    }

    public function destroy(Bill $bill): JsonResponse
    {
        abort_if(auth()->user()->role === 'staff', 403, 'Unauthorized action. Only admins can delete bills.');
        
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

    public function downloadPDF(Bill $bill)
    {
        $bill->load('items');
        $settings = Setting::where('business_id', $bill->business_id)->first();
        $business = \App\Models\Business::find($bill->business_id);
        
        $pdf = Pdf::loadView('pdf.bill', compact('bill', 'settings', 'business'));
        return $pdf->download("bill-{$bill->bill_number}.pdf");
    }
}
