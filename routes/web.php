<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    if (auth()->check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
});


Route::get('/dashboard', [DashboardController::class, 'index'])
    ->middleware(['auth', 'verified'])
    ->name('dashboard');

use App\Http\Controllers\Profile\FaceEnrollmentController;
use App\Http\Controllers\AttendanceController;

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Face Enrollment
    Route::get('/profile/face', [FaceEnrollmentController::class, 'show'])->name('face.enrollment.show');
    Route::post('/profile/face', [FaceEnrollmentController::class, 'update'])->name('face.enrollment.update');

    // Attendance Scanning
    Route::get('/scan', [AttendanceController::class, 'showScan'])->name('attendance.scan.show');
    Route::get('/attendance/history', [\App\Http\Controllers\UserAttendanceController::class, 'index'])->name('attendance.history');
    Route::post('/attendance/scan', [AttendanceController::class, 'store'])->name('attendance.scan.store');
    Route::post('/attendance/log', [AttendanceController::class, 'logActivity'])->name('attendance.scan.log');

    // Leaves (User)
    Route::get('/leaves', [\App\Http\Controllers\LeaveController::class, 'index'])->name('leaves.index');
    Route::post('/leaves', [\App\Http\Controllers\LeaveController::class, 'store'])->name('leaves.store');
    Route::delete('/leaves/{leave}', [\App\Http\Controllers\LeaveController::class, 'destroy'])->name('leaves.destroy');
});
use App\Http\Controllers\Admin\AdminAttendanceController;

use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminShiftController;

Route::middleware(['auth', 'admin'])->prefix('admin')->group(function () {
    Route::get('/dashboard', [AdminAttendanceController::class, 'index'])->name('admin.dashboard');
    
    // Shift Management
    Route::get('/shifts', [AdminShiftController::class, 'index'])->name('admin.shifts');
    Route::post('/shifts', [AdminShiftController::class, 'store'])->name('admin.shifts.store');
    Route::put('/shifts/{shift}', [AdminShiftController::class, 'update'])->name('admin.shifts.update');
    Route::delete('/shifts/{shift}', [AdminShiftController::class, 'destroy'])->name('admin.shifts.destroy');
    
    // User Management
    Route::get('/users', [AdminUserController::class, 'index'])->name('admin.users');
    Route::post('/users', [AdminUserController::class, 'store'])->name('admin.users.store');
    Route::put('/users/{user}', [AdminUserController::class, 'update'])->name('admin.users.update');
    Route::delete('/users/{user}', [AdminUserController::class, 'destroy'])->name('admin.users.destroy');
    Route::post('/users/{user}/reset-face', [AdminUserController::class, 'resetFace'])->name('admin.users.reset-face');
    
    // Attendance
    Route::get('/attendances', [AdminAttendanceController::class, 'attendances'])->name('admin.attendances');
    Route::get('/attendances/export', [AdminAttendanceController::class, 'export'])->name('admin.attendances.export');
    Route::get('/attendances/export/monthly', [AdminAttendanceController::class, 'exportMonthly'])->name('admin.attendances.export.monthly');
    Route::delete('/attendances/{attendance}', [AdminAttendanceController::class, 'deleteAttendance'])->name('admin.attendances.delete');
    
    // Live Monitor
    Route::get('/live', [AdminAttendanceController::class, 'live'])->name('admin.live');

    // Leaves Management (Admin)
    Route::get('/leaves', [\App\Http\Controllers\Admin\AdminLeaveController::class, 'index'])->name('admin.leaves.index');
    Route::put('/leaves/{leave}', [\App\Http\Controllers\Admin\AdminLeaveController::class, 'update'])->name('admin.leaves.update');

    // Settings (Face Recognition, General)
    Route::get('/settings', [\App\Http\Controllers\Admin\AdminSettingController::class, 'index'])->name('admin.settings');
    Route::post('/settings', [\App\Http\Controllers\Admin\AdminSettingController::class, 'update'])->name('admin.settings.update');
});

require __DIR__.'/auth.php';

