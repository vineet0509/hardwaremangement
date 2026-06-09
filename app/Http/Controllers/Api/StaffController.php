<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Staff;
use App\Models\SalaryRecord;
use App\Models\AdvancePayment;
use App\Models\Bill;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Carbon\Carbon;

class StaffController extends Controller
{
    // ─── Staff ───────────────────────────────────────────────────────────────

    public function index(Request $request): JsonResponse
    {
        $settings = \App\Models\Setting::first();
        if ($settings && !\App\Helpers\PlanHelper::hasFeature($settings->subscription_plan, 'staff_management')) {
            return response()->json(['message' => 'Staff Management is not available on your current plan. Please upgrade.'], 403);
        }

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
        $settings = \App\Models\Setting::first();
        if ($settings) {
            if (!\App\Helpers\PlanHelper::hasFeature($settings->subscription_plan, 'staff_management')) {
                return response()->json(['message' => 'Staff Management is not available on your current plan. Please upgrade.'], 403);
            }
            if (!\App\Helpers\PlanHelper::checkLimit($settings->subscription_plan, 'staff', Staff::count())) {
                return response()->json(['message' => 'Staff limit reached for your current plan. Please upgrade to add more staff.'], 403);
            }
            if ($request->enable_login) {
                // Admin is 1 user + staff with enable_login
                $currentUsersCount = \App\Models\User::where('business_id', $request->user()->business_id)->count();
                if (!\App\Helpers\PlanHelper::checkLimit($settings->subscription_plan, 'users', $currentUsersCount)) {
                    return response()->json(['message' => 'User (login) limit reached for your current plan. Please upgrade to create more users.'], 403);
                }
            }
        }

        $data = $request->validate([
            'name'           => 'required|string|max:255',
            'phone'          => 'required_if:enable_login,true|nullable|string|max:20' . ($request->enable_login ? '|unique:users,mobile' : ''),
            'role'           => 'required|string|max:100',
            'address'        => 'nullable|string',
            'aadhar_number'  => 'nullable|string|max:12',
            'monthly_salary' => 'required|numeric|min:0',
            'joining_date'   => 'required|date',
            'status'         => 'in:active,inactive',
            'emergency_contact'  => 'nullable|string|max:50',
            'commission_percent' => 'nullable|numeric|min:0|max:100',
            'permissions'    => 'nullable|array',
            'enable_login'   => 'boolean',
            'password'       => 'required_if:enable_login,true|nullable|string|min:6',
        ]);

        $staffData = collect($data)->except(['enable_login', 'password', 'permissions'])->toArray();
        $staff = Staff::create($staffData);

        if ($request->enable_login && $request->phone) {
            $user = \App\Models\User::create([
                'name'        => $request->name,
                'email'       => $request->phone . '@staff.local',
                'mobile'      => $request->phone,
                'password'    => \Illuminate\Support\Facades\Hash::make($request->password),
                'role'        => 'staff',
                'permissions' => $request->permissions ?? [],
                'business_id' => $request->user()->business_id,
            ]);
            $staff->update(['user_id' => $user->id]);
        }

        return response()->json($staff, 201);
    }

    public function show(Staff $staff): JsonResponse
    {
        $staff->load(['salaryRecords' => fn($q) => $q->latest(), 'advancePayments' => fn($q) => $q->latest()]);
        if ($staff->user_id) {
            $user = \App\Models\User::find($staff->user_id);
            $staff->permissions = $user ? $user->permissions : [];
        }
        return response()->json($staff);
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
            'emergency_contact'  => 'nullable|string|max:50',
            'commission_percent' => 'nullable|numeric|min:0|max:100',
            'permissions'    => 'nullable|array',
            'password'       => 'nullable|string|min:6',
        ]);

        $staffData = collect($data)->except(['permissions', 'password'])->toArray();
        $staff->update($staffData);

        if ($staff->user_id) {
            $user = \App\Models\User::find($staff->user_id);
            if ($user) {
                $userUpdates = [];
                if (isset($data['permissions'])) {
                    $userUpdates['permissions'] = $data['permissions'];
                }
                if (!empty($data['password'])) {
                    $userUpdates['password'] = \Illuminate\Support\Facades\Hash::make($data['password']);
                }
                if (!empty($userUpdates)) {
                    $user->update($userUpdates);
                }
            }
        }

        return response()->json($staff);
    }

    public function destroy(Staff $staff): JsonResponse
    {
        if ($staff->user_id) {
            \App\Models\User::where('id', $staff->user_id)->delete();
        }
        $staff->delete();
        return response()->json(['message' => 'Staff deleted.']);
    }

    public function performance(Staff $staff): JsonResponse
    {
        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();

        if (!$staff->user_id) {
            return response()->json([
                'bills_today' => 0,
                'bills_month' => 0,
                'revenue_today' => 0,
                'revenue_month' => 0,
                'commission_earned_month' => 0,
            ]);
        }

        $billsToday = Bill::where('user_id', $staff->user_id)
            ->whereDate('created_at', $today)
            ->get();
            
        $billsMonth = Bill::where('user_id', $staff->user_id)
            ->where('created_at', '>=', $startOfMonth)
            ->get();

        $revenueToday = $billsToday->sum('net_amount');
        $revenueMonth = $billsMonth->sum('net_amount');
        
        $commissionPercent = $staff->commission_percent ?? 0;
        $commissionEarned = ($revenueMonth * $commissionPercent) / 100;

        return response()->json([
            'bills_today' => $billsToday->count(),
            'bills_month' => $billsMonth->count(),
            'revenue_today' => $revenueToday,
            'revenue_month' => $revenueMonth,
            'commission_earned_month' => $commissionEarned,
        ]);
    }

    // ─── Salary Records ───────────────────────────────────────────────────────

    public function salaryRecords(Staff $staff): JsonResponse
    {
        return response()->json($staff->salaryRecords()->orderByDesc('year')->orderByDesc('month')->get());
    }

    public function storeSalary(Request $request, Staff $staff): JsonResponse
    {
        $data = $request->validate([
            'month'          => 'required|integer|between:1,12',
            'year'           => 'required|integer|min:2020',
            'basic_salary'   => 'required|numeric|min:0',
            'bonus'          => 'nullable|numeric|min:0',
            'deductions'     => 'nullable|numeric|min:0',
            'paid_amount'    => 'nullable|numeric|min:0',
            'payment_date'   => 'nullable|date',
            'notes'          => 'nullable|string',
            'clear_advances' => 'nullable|boolean',
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

        if (!empty($data['clear_advances']) && $data['clear_advances'] === true) {
            $staff->advancePayments()->where('status', 'pending')->update(['status' => 'deducted']);
        }

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
