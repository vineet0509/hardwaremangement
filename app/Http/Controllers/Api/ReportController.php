<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\Product;
use App\Models\StockTransaction;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function salesReport(Request $request): JsonResponse
    {
        $from = $request->get('date_from', now()->startOfMonth()->toDateString());
        $to   = $request->get('date_to', now()->toDateString());

        $summary = Bill::whereBetween(DB::raw('DATE(created_at)'), [$from, $to])
            ->selectRaw('COUNT(*) as total_bills, SUM(total) as revenue, SUM(discount) as total_discount, SUM(due_amount) as total_due')
            ->first();

        $daily = Bill::whereBetween(DB::raw('DATE(created_at)'), [$from, $to])
            ->selectRaw('DATE(created_at) as date, COUNT(*) as bills, SUM(total) as revenue')
            ->groupBy('date')->orderBy('date')->get();

        $byPayment = Bill::whereBetween(DB::raw('DATE(created_at)'), [$from, $to])
            ->selectRaw('payment_method, COUNT(*) as count, SUM(total) as revenue')
            ->groupBy('payment_method')->get();

        $topProducts = DB::table('bill_items')
            ->join('bills', 'bill_items.bill_id', '=', 'bills.id')
            ->join('products', 'bill_items.product_id', '=', 'products.id')
            ->where('bill_items.shop_id', auth('sanctum')->user()->shop_id)
            ->whereBetween(DB::raw('DATE(bills.created_at)'), [$from, $to])
            ->selectRaw('products.name, SUM(bill_items.quantity) as sold, SUM(bill_items.total) as revenue')
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('revenue')->limit(10)->get();

        return response()->json(compact('summary', 'daily', 'byPayment', 'topProducts'));
    }

    public function stockReport(): JsonResponse
    {
        $overview = [
            'total_products'  => Product::count(),
            'low_stock'       => Product::whereColumn('quantity', '<=', 'min_stock_alert')->count(),
            'out_of_stock'    => Product::where('quantity', 0)->count(),
            'stock_value'     => round(Product::selectRaw('SUM(quantity * purchase_price) as v')->value('v') ?? 0, 2),
            'selling_value'   => round(Product::selectRaw('SUM(quantity * selling_price) as v')->value('v') ?? 0, 2),
        ];

        $products = Product::with('category')
            ->orderBy('quantity')
            ->get()
            ->map(fn ($p) => [
                'id'              => $p->id,
                'name'            => $p->name,
                'sku'             => $p->sku,
                'category'        => $p->category?->name,
                'quantity'        => $p->quantity,
                'unit'            => $p->unit,
                'purchase_price'  => $p->purchase_price,
                'selling_price'   => $p->selling_price,
                'min_stock_alert' => $p->min_stock_alert,
                'low_stock'       => $p->quantity <= $p->min_stock_alert,
                'stock_value'     => round($p->quantity * $p->purchase_price, 2),
            ]);

        $transactions = StockTransaction::with('product')
            ->latest()->limit(50)->get();

        return response()->json(compact('overview', 'products', 'transactions'));
    }

    public function salaryReport(Request $request): JsonResponse
    {
        $month = $request->get('month', now()->month);
        $year  = $request->get('year', now()->year);

        $records = DB::table('salary_records')
            ->join('staff', 'salary_records.staff_id', '=', 'staff.id')
            ->where('salary_records.shop_id', auth('sanctum')->user()->shop_id)
            ->where('salary_records.month', $month)
            ->where('salary_records.year', $year)
            ->select('staff.name', 'staff.role', 'salary_records.*')
            ->get();

        $advances = DB::table('advance_payments')
            ->join('staff', 'advance_payments.staff_id', '=', 'staff.id')
            ->where('advance_payments.shop_id', auth('sanctum')->user()->shop_id)
            ->whereYear('advance_date', $year)->whereMonth('advance_date', $month)
            ->select('staff.name', 'staff.role', 'advance_payments.*')
            ->orderByDesc('advance_date')->get();

        $summary = [
            'total_basic'    => $records->sum('basic_salary'),
            'total_bonus'    => $records->sum('bonus'),
            'total_deductions'=> $records->sum('deductions'),
            'total_net'      => $records->sum('net_salary'),
            'total_paid'     => $records->sum('paid_amount'),
            'total_pending'  => $records->where('status', 'pending')->sum('net_salary'),
            'total_advances' => $advances->sum('amount'),
        ];

        return response()->json(compact('records', 'advances', 'summary'));
    }
}
