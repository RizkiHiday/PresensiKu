<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        $user  = auth()->user();
        $today = Carbon::today();
        $now   = Carbon::now();

        // Today's attendance record
        $todayAttendance = Attendance::where('user_id', $user->id)
            ->whereDate('check_in', $today)
            ->first();

        // Monthly summary (current month)
        $monthStart = $now->copy()->startOfMonth();
        $monthlyRecords = Attendance::where('user_id', $user->id)
            ->where('check_in', '>=', $monthStart)
            ->get();

        $totalPresent = $monthlyRecords->count();
        $totalLate    = $monthlyRecords->where('status', 'late')->count();

        // Minutes late (if applicable)
        $minutesLate = 0;
        $workStart = null;
        
        if ($user->shift_id) {
            $workStart = Carbon::parse($today->format('Y-m-d') . ' ' . $user->shift->start_time);
        } else {
            $workStart = Carbon::parse($today->format('Y-m-d') . ' 09:00:00');
        }

        if ($todayAttendance && $todayAttendance->status === 'late' && $todayAttendance->check_in) {
            $checkInTime = Carbon::parse($todayAttendance->check_in);
            if ($checkInTime->greaterThan($workStart)) {
                $minutesLate = (int) $workStart->diffInMinutes($checkInTime);
            }
        }

        // Recent 5 attendance records
        $recentAttendances = Attendance::where('user_id', $user->id)
            ->latest()
            ->take(5)
            ->get();

        // Generate heat map data for the last 365 days (GitHub Style)
        $heatmapStart = $today->copy()->subDays(364);
        
        $heatmapRecords = Attendance::where('user_id', $user->id)
            ->whereDate('check_in', '>=', $heatmapStart)
            ->get(['check_in', 'status']);
            
        $heatmapMap = [];
        foreach ($heatmapRecords as $record) {
            $dateString = Carbon::parse($record->check_in)->format('Y-m-d');
            $heatmapMap[$dateString] = ($record->status === 'present') ? 1 : 2; 
        }

        $leavesMap = \App\Models\Leave::where('user_id', $user->id)
            ->where('status', 'approved')
            ->whereDate('end_date', '>=', $heatmapStart)
            ->get();
            
        $leaveDates = [];
        foreach ($leavesMap as $leave) {
            $start = Carbon::parse($leave->start_date);
            $end = Carbon::parse($leave->end_date);
            while ($start->lte($end)) {
                $leaveDates[$start->format('Y-m-d')] = true;
                $start->addDay();
            }
        }

        $heatmapData = [];
        
        // Pad the array with invisible elements so that the first real date aligns to its correct day of week
        // Carbon dayOfWeek returns 0 (Sunday) to 6 (Saturday).
        $startDayOfWeek = $heatmapStart->dayOfWeek;
        for ($i = 0; $i < $startDayOfWeek; $i++) {
            $heatmapData[] = [
                'date'   => null,
                'status' => -1 // Invisible block
            ];
        }

        $iterator = $heatmapStart->copy();
        while ($iterator->lte($today)) {
            $dateString = $iterator->format('Y-m-d');
            $status = 0; // Empty/Holiday (Gray)

            if (isset($heatmapMap[$dateString])) {
                $status = $heatmapMap[$dateString]; // 1 Present (Green), 2 Late (Yellow)
            } else if (isset($leaveDates[$dateString])) {
                $status = 4; // Leave / Cuti (Blue)
            } else {
                if ($iterator->isWeekday() && $iterator->isBefore($today)) {
                    if ($iterator->greaterThanOrEqualTo(Carbon::parse($user->created_at)->startOfDay())) {
                        $status = 3; // Alfa (Red)
                    }
                }
            }
            
            $heatmapData[] = [
                'date'   => $dateString,
                'status' => $status
            ];
            $iterator->addDay();
        }

        return Inertia::render('Dashboard', [
            'serverTime'        => $now->timestamp * 1000,
            'todayAttendance'   => $todayAttendance,
            'stats'             => [
                'present_month' => $totalPresent,
                'late_month'    => $totalLate,
                'minutes_late'  => $minutesLate,
            ],
            'userShift'         => $user->shift ?: [
                'name' => 'Default',
                'start_time' => '09:00:00',
                'end_time' => '17:00:00',
                'late_tolerance' => 0
            ],
            'recentAttendances' => $recentAttendances,
            'heatmapData'       => $heatmapData,
        ]);
    }
}

