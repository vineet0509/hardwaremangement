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
            ->where('bill_items.business_id', auth('sanctum')->user()->business_id)
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
            ->where('salary_records.business_id', auth('sanctum')->user()->business_id)
            ->where('salary_records.month', $month)
            ->where('salary_records.year', $year)
            ->select('staff.name', 'staff.role', 'salary_records.*')
            ->get();

        $advances = DB::table('advance_payments')
            ->join('staff', 'advance_payments.staff_id', '=', 'staff.id')
            ->where('advance_payments.business_id', auth('sanctum')->user()->business_id)
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

    public function gstrExport(Request $request)
    {
        $settings = \App\Models\Setting::first();
        if ($settings && !\App\Helpers\PlanHelper::hasFeature($settings->subscription_plan, 'gst_reports')) {
            return response()->json(['message' => 'GST Reports are not available on your current plan. Please upgrade to STARTER or higher.'], 403);
        }

        $from = $request->get('date_from', now()->startOfMonth()->toDateString());
        $to   = $request->get('date_to', now()->toDateString());

        $bills = Bill::whereBetween(DB::raw('DATE(created_at)'), [$from, $to])
            ->orderBy('created_at')
            ->get();

        $csvFileName = 'gstr1_export_' . now()->format('Ymd_His') . '.csv';
        
        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$csvFileName",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $columns = [
            'Invoice No.', 'Invoice Date', 'Customer Name', 'Phone', 'Is GST Bill', 
            'Taxable Value', 'Total Tax', 'Total Invoice Value'
        ];

        $callback = function() use($bills, $columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            foreach ($bills as $bill) {
                fputcsv($file, [
                    $bill->bill_number,
                    $bill->created_at->format('Y-m-d'),
                    $bill->customer_name,
                    $bill->customer_phone,
                    $bill->is_gst ? 'Yes' : 'No',
                    $bill->subtotal - $bill->discount,
                    $bill->tax,
                    $bill->total
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function profitAndLoss(Request $request): JsonResponse
    {
        $from = $request->get('date_from', now()->startOfMonth()->toDateString());
        $to   = $request->get('date_to', now()->toDateString());

        $revenue = Bill::whereBetween(DB::raw('DATE(created_at)'), [$from, $to])->sum('total');
        
        $cogs = DB::table('bill_items')
            ->join('bills', 'bill_items.bill_id', '=', 'bills.id')
            ->join('products', 'bill_items.product_id', '=', 'products.id')
            ->where('bills.business_id', auth('sanctum')->user()->business_id)
            ->whereBetween(DB::raw('DATE(bills.created_at)'), [$from, $to])
            ->selectRaw('SUM(bill_items.quantity * products.purchase_price) as cogs')
            ->value('cogs') ?? 0;

        $expenses = \App\Models\Expense::whereBetween(DB::raw('DATE(expense_date)'), [$from, $to])->sum('amount');
        
        $salaries = DB::table('salary_records')
            ->where('business_id', auth('sanctum')->user()->business_id)
            ->whereBetween(DB::raw('DATE(created_at)'), [$from, $to])
            ->sum('paid_amount');

        $netProfit = $revenue - $cogs - $expenses - $salaries;

        return response()->json([
            'date_from' => $from,
            'date_to' => $to,
            'revenue' => round($revenue, 2),
            'cogs' => round($cogs, 2),
            'gross_profit' => round($revenue - $cogs, 2),
            'expenses' => round($expenses, 2),
            'salaries' => round($salaries, 2),
            'net_profit' => round($netProfit, 2)
        ]);
    }
}
