<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\BillController;
use App\Http\Controllers\Api\StaffController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SuperAdminController;
use App\Http\Controllers\Api\SupplierController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware(['auth:sanctum', 'check.subscription', 'domain.tenant'])->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/user/password', [AuthController::class, 'changePassword']);

    // Settings
Route::get('/settings', [SettingsController::class, 'index']);
Route::post('/settings', [SettingsController::class, 'update']);

// Dashboard
Route::get('/dashboard', [DashboardController::class, 'index']);

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
Route::get('/udhar', [BillController::class, 'udharList']);
Route::get('/advances', [BillController::class, 'advancesList']);
Route::post('/advances', [BillController::class, 'storeAdvance']);
Route::post('/bills/{bill}/repay', [BillController::class, 'repay']);
Route::apiResource('bills', BillController::class);

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
    
    // Suppliers
    Route::apiResource('suppliers', SupplierController::class);

    // Reports
    Route::get('/reports/sales',        [ReportController::class, 'salesReport']);
    Route::get('/reports/stock',        [ReportController::class, 'stockReport']);
    Route::get('/reports/salary',       [ReportController::class, 'salaryReport']);

    // Super Admin
    Route::get('/super-admin/shops', [SuperAdminController::class, 'index']);
    Route::post('/super-admin/shops/{shop}/toggle-status', [SuperAdminController::class, 'toggleStatus']);
    Route::post('/super-admin/shops/{shop}/extend-plan', [SuperAdminController::class, 'extendPlan']);
});
