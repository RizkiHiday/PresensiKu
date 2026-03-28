<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\AttendanceLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class AttendanceController extends Controller
{
    public function showScan()
    {
        $settings = \App\Models\Setting::pluck('value', 'key')->toArray();
        $defaultSettings = [
            'face_threshold' => $settings['face_threshold'] ?? '0.45',
            'anti_spoofing'  => $settings['anti_spoofing'] ?? 'true',
            'attendance_mode'=> $settings['attendance_mode'] ?? 'checkin_checkout'
        ];

        return Inertia::render('Attendance/Scan', [
            'userEmbedding' => json_decode(auth()->user()->face_embedding),
            'sysSettings'   => $defaultSettings
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
        ]);

        $user = auth()->user();
        $today = Carbon::today();

        // Get settings
        $settings = \App\Models\Setting::pluck('value', 'key')->toArray();
        $delayScan = (int) ($settings['delay_scan'] ?? 30);
        $attendanceMode = $settings['attendance_mode'] ?? 'checkin_checkout';

        // Check if already checked in today
        $attendance = Attendance::where('user_id', $user->id)
            ->whereDate('check_in', $today)
            ->first();

        // Delay Scan Logic Check
        if ($delayScan > 0) {
            $lastLog = AttendanceLog::where('user_id', $user->id)
                ->where('activity', 'like', '%check-in%')
                ->orWhere('activity', 'like', '%check-out%')
                ->latest()
                ->first();
            
            if ($lastLog && now()->diffInMinutes($lastLog->created_at) < $delayScan) {
                return response()->json(['errors' => ['error' => "Beri jeda {$delayScan} menit sebelum scan ulang untuk menghindari double tap."]], 422);
            }
        }

        // --- Geofencing Validation (Radius Kantor) ---
        $officeLat = (float) ($settings['office_lat'] ?? 0);
        $officeLon = (float) ($settings['office_lon'] ?? 0);
        $officeRadius = (int) ($settings['office_radius'] ?? 0);

        if ($officeRadius > 0) {
            if (!$request->latitude || !$request->longitude) {
                return response()->json(['errors' => ['error' => 'Akses GPS dibutuhkan untuk memvalidasi lokasi Anda. Pastikan GPS HP Anda menyala.']], 422);
            }

            // Haversine formula to calculate distance in meters
            $latFrom = deg2rad((float)$request->latitude);
            $lonFrom = deg2rad((float)$request->longitude);
            $latTo = deg2rad($officeLat);
            $lonTo = deg2rad($officeLon);

            $latDelta = $latTo - $latFrom;
            $lonDelta = $lonTo - $lonFrom;

            $angle = 2 * asin(sqrt(pow(sin($latDelta / 2), 2) + cos($latFrom) * cos($latTo) * pow(sin($lonDelta / 2), 2)));
            $distanceMeters = $angle * 6371000;

            if ($distanceMeters > $officeRadius) {
                return response()->json(['errors' => ['error' => 'Anda berada di luar jangkauan area kantor! (Jarak Anda: ' . round($distanceMeters) . ' meter. Maksimal: ' . $officeRadius . ' meter)']], 422);
            }
        }

        if (!$attendance) {
            // Predict if late based on User's Shift
            $status = 'present';
            if ($user->shift_id) {
                // Parse shift time as today's Carbon instance
                $shiftStart = Carbon::parse($user->shift->start_time);
                // Add tolerance
                $shiftLimit = $shiftStart->copy()->addMinutes($user->shift->late_tolerance);
                
                if (now()->greaterThan($shiftLimit)) {
                    $status = 'late';
                }
            } else {
                // Fallback default: 09:00 check in limit
                if (now()->hour >= 9) {
                    $status = 'late';
                }
            }

            // Check-in
            Attendance::create([
                'user_id' => $user->id,
                'check_in' => now(),
                'status' => $status,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
            ]);
            $msg = 'Check-in successful!';
        } else if (!$attendance->check_out) {
            if ($attendanceMode === 'checkin_only') {
                return response()->json(['errors' => ['error' => 'Mode absensi saat ini: HANYA CHECK-IN. Anda sudah diverifikasi hari ini.']], 422);
            }
            // Check-out
            $attendance->update([
                'check_out' => now(),
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
            ]);
            $msg = 'Check-out successful!';
        } else {
            return response()->json(['errors' => ['error' => 'You have already completed your attendance for today.']], 422);
        }

        return response()->json(['message' => $msg]);
    }

    public function logActivity(Request $request)
    {
        $request->validate([
            'activity' => 'required|string',
            'details' => 'nullable|array',
        ]);

        AttendanceLog::create([
            'user_id' => auth()->id(),
            'activity' => $request->activity,
            'details' => $request->details,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json(['status' => 'success']);
    }
}

