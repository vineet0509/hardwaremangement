<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\Product;
use App\Models\Staff;
use App\Models\SalaryRecord;
use App\Models\AdvancePayment;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(): JsonResponse
    {
        $today = now()->toDateString();
        $thisMonth = now()->month;
        $thisYear  = now()->year;

        // Sales stats consolidated
        $salesStats = Bill::selectRaw("
            SUM(CASE WHEN DATE(created_at) = ? THEN CASE WHEN type = 'return' THEN -total ELSE total END ELSE 0 END) as today_sales,
            SUM(CASE WHEN MONTH(created_at) = ? AND YEAR(created_at) = ? THEN CASE WHEN type = 'return' THEN -total ELSE total END ELSE 0 END) as month_sales,
            COUNT(id) as total_bills
        ", [$today, $thisMonth, $thisYear])->first();

        $todaySales = $salesStats->today_sales ?? 0;
        $monthSales = $salesStats->month_sales ?? 0;
        $totalBills = $salesStats->total_bills ?? 0;

        // Stock stats
        $totalProducts  = Product::count();
        $lowStockCount  = Product::whereColumn('quantity', '<=', 'min_stock_alert')->count();
        $totalStockValue = Product::selectRaw('SUM(quantity * purchase_price) as val')->value('val') ?? 0;

        // Staff stats
        $totalStaff      = Staff::where('status', 'active')->count();
        $pendingSalaries = SalaryRecord::where('status', 'pending')->sum('net_salary');
        $pendingAdvances = AdvancePayment::where('status', 'pending')->sum('amount');

        // Monthly sales chart (last 6 months)
        $monthlySales = Bill::selectRaw("MONTH(created_at) as month, YEAR(created_at) as year, SUM(CASE WHEN type = 'return' THEN -total ELSE total END) as total")
            ->where('created_at', '>=', now()->subMonths(6))
            ->groupBy('year', 'month')
            ->orderBy('year')->orderBy('month')
            ->get()
            ->map(fn ($r) => [
                'month' => date('M Y', mktime(0, 0, 0, $r->month, 1, $r->year)),
                'total' => (float) $r->total,
            ]);

        // Top selling products (exclude returns)
        $topProducts = DB::table('bill_items')
            ->join('products', 'bill_items.product_id', '=', 'products.id')
            ->join('bills', 'bill_items.bill_id', '=', 'bills.id')
            ->where('bill_items.business_id', auth('sanctum')->user()->business_id)
            ->where('bills.type', 'sale')
            ->selectRaw('products.name, SUM(bill_items.quantity) as sold, SUM(bill_items.total) as revenue')
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('sold')
            ->limit(5)
            ->get();

        // Recent bills
        $recentBills = Bill::latest()->limit(5)->get();

        $todayProfit = DB::table('bill_items')
            ->join('bills', 'bill_items.bill_id', '=', 'bills.id')
            ->join('products', 'bill_items.product_id', '=', 'products.id')
            ->where('bill_items.business_id', auth('sanctum')->user()->business_id)
            ->whereDate('bills.created_at', $today)
            ->selectRaw("SUM(CASE WHEN bills.type = 'return' THEN -1 ELSE 1 END * ((bill_items.price - products.purchase_price) * bill_items.quantity - bill_items.discount)) as profit")
            ->value('profit') ?? 0;

        $paymentBreakdown = Bill::whereDate('created_at', $today)
            ->where('type', 'sale')
            ->selectRaw('payment_method, SUM(total) as amount')
            ->groupBy('payment_method')
            ->get();

        $restockList = Product::with('category')
            ->whereColumn('quantity', '<=', 'min_stock_alert')
            ->orderBy('quantity')
            ->limit(5)
            ->get();

        $pendingDues = Bill::where('due_amount', '!=', 0)
            ->where('status', '!=', 'paid')
            ->select('id', 'customer_name', 'customer_phone', 'due_amount', 'bill_number', 'created_at')
            ->orderByDesc('due_amount')
            ->limit(5)
            ->get();

        $topCategories = DB::table('bill_items')
            ->join('products', 'bill_items.product_id', '=', 'products.id')
            ->join('bills', 'bill_items.bill_id', '=', 'bills.id')
            ->join('categories', 'products.category_id', '=', 'categories.id')
            ->where('bill_items.business_id', auth('sanctum')->user()->business_id)
            ->where('bills.type', 'sale')
            ->selectRaw('categories.name, SUM(bill_items.quantity) as sold, SUM(bill_items.total) as revenue')
            ->groupBy('categories.id', 'categories.name')
            ->orderByDesc('revenue')
            ->limit(4)
            ->get();

        $totalCustomerDue = Bill::where('due_amount', '>', 0)->sum('due_amount');
        $totalGivenToSupplier = \App\Models\SupplierTransaction::where('type', 'payment')->sum('amount');

        return response()->json([
            'today_sales'      => $todaySales,
            'today_profit'     => round($todayProfit, 2),
            'payment_breakdown'=> $paymentBreakdown,
            'month_sales'      => $monthSales,
            'total_bills'      => $totalBills,
            'total_products'   => $totalProducts,
            'low_stock_count'  => $lowStockCount,
            'restock_list'     => $restockList,
            'pending_dues'     => $pendingDues,
            'total_stock_value'=> round($totalStockValue, 2),
            'total_staff'      => $totalStaff,
            'pending_salaries' => $pendingSalaries,
            'pending_advances' => $pendingAdvances,
            'monthly_sales'    => $monthlySales,
            'top_products'     => $topProducts,
            'top_categories'   => $topCategories,
            'recent_bills'     => $recentBills,
            'total_customer_due'=> round($totalCustomerDue, 2),
            'total_given_to_supplier'=> round($totalGivenToSupplier, 2),
        ]);
    }
}
