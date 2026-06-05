<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\BillController;
use App\Http\Controllers\Api\QuotationController;
use App\Http\Controllers\Api\StaffController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SuperAdminController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\ExpenseController;
use App\Http\Controllers\Api\ChildBusinessController;
use App\Http\Controllers\Api\AttendanceController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/contact', [AuthController::class, 'contactSubmit']);
Route::get('/verify-gst', [App\Http\Controllers\Api\GstController::class, 'verify']);

Route::middleware(['auth:sanctum', 'check.subscription', 'domain.tenant'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/user/password', [AuthController::class, 'changePassword']);
    Route::delete('/user', [AuthController::class, 'deleteAccount']);

// Settings
Route::get('/settings', [SettingsController::class, 'index']);
Route::post('/settings', [SettingsController::class, 'update']);
Route::post('/subscription-request', [SettingsController::class, 'submitSubscriptionRequest']);

// Dashboard
Route::get('/dashboard', [DashboardController::class, 'index']);

// Child Shops
Route::get('/child-businesses', [ChildBusinessController::class, 'index']);
Route::post('/child-businesses', [ChildBusinessController::class, 'store']);
Route::patch('/child-businesses/{id}/toggle-status', [ChildBusinessController::class, 'toggleStatus']);

// Products & Categories
Route::get('/products/export',      [ProductController::class, 'exportCSV']);
Route::post('/products/import',     [ProductController::class, 'importCSV']);
Route::get('/categories',           [ProductController::class, 'categories']);
Route::post('/categories',          [ProductController::class, 'storeCategory']);
Route::apiResource('products',      ProductController::class);
Route::post('/products/{product}/add-stock',    [ProductController::class, 'addStock']);
Route::post('/products/{product}/remove-stock', [ProductController::class, 'removeStock']);

// Bills & Khata
Route::get('/customers', [BillController::class, 'customersList']);
Route::get('/customers/search', [BillController::class, 'searchCustomer']);
Route::put('/customers/{phone}', [BillController::class, 'updateCustomer']);
Route::post('/customers/{phone}/send-reminder', [BillController::class, 'sendUdharReminder']);
Route::get('/udhar', [BillController::class, 'udharList']);
Route::get('/advances', [BillController::class, 'advancesList']);
Route::post('/advances', [BillController::class, 'storeAdvance']);
Route::post('/bills/{bill}/repay', [BillController::class, 'repay']);
Route::post('/bills/{bill}/return', [BillController::class, 'returnItems']);
Route::get('/bills/{bill}/pdf', [BillController::class, 'downloadPDF']);
Route::get('/bills/export', [BillController::class, 'exportCSV']);
Route::post('/bills/send-whatsapp', [BillController::class, 'sendWhatsApp']);
Route::apiResource('bills', BillController::class);
Route::apiResource('quotations', QuotationController::class);
Route::post('/quotations/{quotation}/convert-to-bill', [QuotationController::class, 'convertToBill']);

// Staff
Route::apiResource('staff', StaffController::class);
Route::get('/staff-advances',                           [StaffController::class, 'allAdvances']);
Route::get('/staff/{staff}/salary-records',             [StaffController::class, 'salaryRecords']);
Route::post('/staff/{staff}/salary-records',            [StaffController::class, 'storeSalary']);
Route::patch('/staff/{staff}/salary-records/{record}',  [StaffController::class, 'updateSalary']);
Route::get('/staff/{staff}/advance-payments',           [StaffController::class, 'advancePayments']);
Route::post('/staff/{staff}/advance-payments',          [StaffController::class, 'storeAdvance']);
Route::patch('/advance-payments/{advance}/deducted',    [StaffController::class, 'markAdvanceDeducted']);
Route::delete('/advance-payments/{advance}',            [StaffController::class, 'destroyAdvance']);
Route::get('/salary-records',                           [StaffController::class, 'allSalaryRecords']);
Route::get('/staff/{staff}/performance',                [StaffController::class, 'performance']);

// Attendance
Route::get('/attendance/status', [AttendanceController::class, 'status']);
Route::post('/attendance/clock-in', [AttendanceController::class, 'clockIn']);
Route::post('/attendance/clock-out', [AttendanceController::class, 'clockOut']);
Route::get('/attendance/all', [AttendanceController::class, 'allAttendances']);
Route::get('/staff/{staff}/attendances', [AttendanceController::class, 'index']);
    
    // Suppliers
    Route::apiResource('suppliers', SupplierController::class);
    Route::get('/suppliers/{supplier}/transactions', [SupplierController::class, 'transactions']);
    Route::post('/suppliers/{supplier}/transactions', [SupplierController::class, 'storeTransaction']);

    // Expenses
    Route::apiResource('expenses', ExpenseController::class)->except(['show', 'update']);

    // Reports
    Route::get('/reports/sales',        [ReportController::class, 'salesReport']);
    Route::get('/reports/stock',        [ReportController::class, 'stockReport']);
    Route::get('/reports/salary',       [ReportController::class, 'salaryReport']);
    Route::get('/reports/gst-export',   [ReportController::class, 'gstrExport']);
    Route::get('/reports/profit-loss',  [ReportController::class, 'profitAndLoss']);

    // Super Admin
    Route::get('/super-admin/shops', [SuperAdminController::class, 'index']);
    Route::post('/super-admin/shops/{shop}/toggle-status', [SuperAdminController::class, 'toggleStatus']);
    Route::post('/super-admin/shops/{shop}/extend-plan', [SuperAdminController::class, 'extendPlan']);
    Route::delete('/super-admin/shops/{shop}', [SuperAdminController::class, 'deleteShop']);
    Route::get('/super-admin/login-logs', [SuperAdminController::class, 'loginLogs']);
    
    Route::get('/super-admin/subscription-requests', [SuperAdminController::class, 'subscriptionRequests']);
    Route::post('/super-admin/subscription-requests/{id}/approve', [SuperAdminController::class, 'approveSubscriptionRequest']);
    Route::post('/super-admin/subscription-requests/{id}/reject', [SuperAdminController::class, 'rejectSubscriptionRequest']);
});
