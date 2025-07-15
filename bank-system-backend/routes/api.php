<?php

use App\Http\Controllers\API\KaryawanController;
use App\Http\Controllers\API\DepartemenController;
use App\Http\Controllers\API\JabatanController;
use App\Http\Controllers\API\KomponenGajiController;
use App\Http\Controllers\API\PayrollRunController;
use App\Http\Controllers\API\SlipGajiController;
use App\Http\Controllers\API\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\DashboardController;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/verify-otp', [AuthController::class, 'verifyOtp']);

Route::middleware(['auth:sanctum', 'api-typer'])->group(function () {
    Route::apiResource('karyawan', KaryawanController::class);
    Route::get('karyawan/profile', [KaryawanController::class, 'profile']);
    Route::apiResource('departemen', DepartemenController::class);
    Route::apiResource('jabatan', JabatanController::class);
    Route::apiResource('komponen-gaji', KomponenGajiController::class);
    Route::apiResource('payroll-run', PayrollRunController::class);
    Route::apiResource('slip-gaji', SlipGajiController::class);
    Route::get('slip-gaji/export/pdf', [SlipGajiController::class, 'exportPdf']);
    Route::get('slip-gaji/export/excel', [SlipGajiController::class, 'exportExcel']);
    Route::get('dashboard', [DashboardController::class, 'index']);
    Route::post('logout', [AuthController::class, 'logout']);
});
