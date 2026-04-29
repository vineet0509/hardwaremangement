<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use App\Models\SalaryRecord;
use App\Models\AdvancePayment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class StaffController extends Controller
{
    // ─── Staff ───────────────────────────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $query = Staff::withSum(['advancePayments as pending_advance' => fn($q) => $q->where('status', 'pending')], 'amount');
        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        return response()->json($query->orderBy('name')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'           => 'required|string|max:255',
            'phone'          => 'nullable|string|max:20',
            'role'           => 'required|string|max:100',
            'address'        => 'nullable|string',
            'aadhar_number'  => 'nullable|string|max:12',
            'monthly_salary' => 'required|numeric|min:0',
            'joining_date'   => 'required|date',
            'status'         => 'in:active,inactive',
        ]);

        return response()->json(Staff::create($data), 201);
    }

    public function show(Staff $staff): JsonResponse
    {
        return response()->json($staff->load(['salaryRecords' => fn($q) => $q->latest(), 'advancePayments' => fn($q) => $q->latest()]));
    }

    public function update(Request $request, Staff $staff): JsonResponse
    {
        $data = $request->validate([
            'name'           => 'sometimes|string|max:255',
            'phone'          => 'nullable|string|max:20',
            'role'           => 'sometimes|string|max:100',
            'address'        => 'nullable|string',
            'aadhar_number'  => 'nullable|string|max:12',
            'monthly_salary' => 'sometimes|numeric|min:0',
            'joining_date'   => 'sometimes|date',
            'status'         => 'in:active,inactive',
        ]);

        $staff->update($data);
        return response()->json($staff);
    }

    public function destroy(Staff $staff): JsonResponse
    {
        $staff->delete();
        return response()->json(['message' => 'Staff deleted.']);
    }

    // ─── Salary Records ───────────────────────────────────────────────────────

    public function salaryRecords(Staff $staff): JsonResponse
    {
        return response()->json($staff->salaryRecords()->orderByDesc('year')->orderByDesc('month')->get());
    }

    public function storeSalary(Request $request, Staff $staff): JsonResponse
    {
        $data = $request->validate([
            'month'        => 'required|integer|between:1,12',
            'year'         => 'required|integer|min:2020',
            'basic_salary' => 'required|numeric|min:0',
            'bonus'        => 'nullable|numeric|min:0',
            'deductions'   => 'nullable|numeric|min:0',
            'paid_amount'  => 'nullable|numeric|min:0',
            'payment_date' => 'nullable|date',
            'notes'        => 'nullable|string',
        ]);

        $bonus      = $data['bonus'] ?? 0;
        $deductions = $data['deductions'] ?? 0;
        $netSalary  = $data['basic_salary'] + $bonus - $deductions;
        $paid       = $data['paid_amount'] ?? 0;
        $status     = $paid >= $netSalary ? 'paid' : ($paid > 0 ? 'partial' : 'pending');

        $record = $staff->salaryRecords()->create([
            'month'        => $data['month'],
            'year'         => $data['year'],
            'basic_salary' => $data['basic_salary'],
            'bonus'        => $bonus,
            'deductions'   => $deductions,
            'net_salary'   => $netSalary,
            'paid_amount'  => $paid,
            'status'       => $status,
            'payment_date' => $data['payment_date'] ?? null,
            'notes'        => $data['notes'] ?? null,
        ]);

        return response()->json($record, 201);
    }

    public function updateSalary(Request $request, Staff $staff, SalaryRecord $record): JsonResponse
    {
        $data = $request->validate([
            'paid_amount'  => 'required|numeric|min:0',
            'payment_date' => 'nullable|date',
            'notes'        => 'nullable|string',
        ]);

        $status = $data['paid_amount'] >= $record->net_salary ? 'paid' : ($data['paid_amount'] > 0 ? 'partial' : 'pending');
        $record->update([...$data, 'status' => $status]);

        return response()->json($record);
    }

    // ─── Advance Payments ─────────────────────────────────────────────────────

    public function allAdvances(Request $request): JsonResponse
    {
        $query = AdvancePayment::with('staff')->latest('advance_date');
        return response()->json($query->get());
    }

    public function advancePayments(Staff $staff): JsonResponse
    {
        return response()->json($staff->advancePayments()->latest('advance_date')->get());
    }

    public function storeAdvance(Request $request, Staff $staff): JsonResponse
    {
        $data = $request->validate([
            'amount'       => 'required|numeric|min:1',
            'advance_date' => 'required|date',
            'reason'       => 'nullable|string|max:500',
        ]);

        $advance = $staff->advancePayments()->create([...$data, 'status' => 'pending']);
        return response()->json($advance, 201);
    }

    public function markAdvanceDeducted(AdvancePayment $advance): JsonResponse
    {
        $advance->update(['status' => 'deducted']);
        return response()->json($advance);
    }

    public function destroyAdvance(AdvancePayment $advance): JsonResponse
    {
        $advance->delete();
        return response()->json(['message' => 'Advance deleted.']);
    }

    // ─── All Salary Records (for report) ─────────────────────────────────────

    public function allSalaryRecords(Request $request): JsonResponse
    {
        $query = SalaryRecord::with('staff');
        if ($request->filled('month')) $query->where('month', $request->month);
        if ($request->filled('year'))  $query->where('year',  $request->year);
        if ($request->filled('status')) $query->where('status', $request->status);
        return response()->json($query->orderByDesc('year')->orderByDesc('month')->get());
    }
}
