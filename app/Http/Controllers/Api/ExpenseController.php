<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    public function index(Request $request)
    {
        $settings = \App\Models\Setting::first();
        if ($settings && !\App\Helpers\PlanHelper::hasFeature($settings->subscription_plan, 'expense_tracking')) {
            return response()->json(['message' => 'Expense Tracking is not available on your current plan. Please upgrade.'], 403);
        }

        $query = Expense::query();

        if ($request->date_from) {
            $query->whereDate('expense_date', '>=', $request->date_from);
        }
        if ($request->date_to) {
            $query->whereDate('expense_date', '<=', $request->date_to);
        }

        $expenses = $query->orderBy('expense_date', 'desc')->orderBy('id', 'desc')->get();
        return response()->json($expenses);
    }

    public function store(Request $request)
    {
        $settings = \App\Models\Setting::first();
        if ($settings && !\App\Helpers\PlanHelper::hasFeature($settings->subscription_plan, 'expense_tracking')) {
            return response()->json(['message' => 'Expense Tracking is not available on your current plan. Please upgrade.'], 403);
        }

        $validated = $request->validate([
            'expense_date' => 'required|date',
            'amount' => 'required|numeric|min:0',
            'description' => 'required|string|max:255',
        ]);

        $expense = Expense::create($validated);

        return response()->json([
            'message' => 'Expense logged successfully',
            'expense' => $expense
        ], 201);
    }

    public function destroy(Expense $expense)
    {
        $expense->delete();
        return response()->json(['message' => 'Expense deleted successfully']);
    }
}
