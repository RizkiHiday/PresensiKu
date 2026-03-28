<?php

namespace App\Http\Controllers\Admin;


use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\User;
use App\Models\AttendanceLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class AdminAttendanceController extends Controller
{
    public function index()
    {
        $today = Carbon::today();
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'total_users'    => User::where('role', 'user')->count(),
                'present_today'  => Attendance::whereDate('check_in', $today)->count(),
                'late_today'     => Attendance::whereDate('check_in', $today)->where('status', 'late')->count(),
                'enrolled_faces' => User::where('face_enrolled', true)->count(),
            ],
            'recent_logs' => AttendanceLog::with('user')->latest()->take(10)->get(),
        ]);
    }

    public function live()
    {
        $today = Carbon::today();
        
        $stats = [
            'total_users'   => User::where('role', 'user')->count(),
            'present_today' => Attendance::whereDate('check_in', $today)->count(),
            'late_today'    => Attendance::whereDate('check_in', $today)->where('status', 'late')->count(),
        ];
        
        $stats['absent_today'] = $stats['total_users'] - $stats['present_today'];

        $recentAttendances = Attendance::with(['user' => function($q) {
                $q->select('id', 'name', 'employee_id', 'department', 'position');
            }])
            ->whereDate('check_in', $today)
            ->orderBy('check_in', 'desc')
            ->take(15)
            ->get();

        return Inertia::render('Admin/LiveMonitor', [
            'stats'             => $stats,
            'recentAttendances' => $recentAttendances,
        ]);
    }

    public function attendances(Request $request)
    {
        $query = Attendance::with('user')->latest();

        if ($request->filled('date')) {
            $query->whereDate('check_in', $request->date);
        }
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return Inertia::render('Admin/Attendances', [
            'attendances' => $query->paginate(15)->withQueryString(),
            'users'       => User::where('role', 'user')->orderBy('name')->get(['id', 'name']),
            'filters'     => $request->only(['date', 'user_id', 'status']),
        ]);
    }

    public function deleteAttendance(Attendance $attendance)
    {
        $attendance->delete();
        return back()->with('message', 'Data absensi berhasil dihapus.');
    }

    public function export(Request $request)
    {
        $query = Attendance::with('user')->orderBy('check_in', 'desc');

        if ($request->filled('date')) {
            $query->whereDate('check_in', $request->date);
        }
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $attendances = $query->get();

        $filename = "Export_Data_Absensi_" . date('d_m_Y') . ".xlsx";

        return \Maatwebsite\Excel\Facades\Excel::download(new \App\Exports\FilteredAttendanceExport($attendances), $filename);
    }

    public function exportMonthly(Request $request)
    {
        $month = $request->input('month', date('n'));
        $year = $request->input('year', date('Y'));

        Carbon::setLocale('id');
        $monthName = Carbon::create($year, $month, 1)->translatedFormat('F');
        $fileName = 'Rekap_Absensi_' . $monthName . '_' . $year . '.xlsx';

        return \Maatwebsite\Excel\Facades\Excel::download(new \App\Exports\MonthlyAttendanceExport($month, $year), $fileName);
    }
}


