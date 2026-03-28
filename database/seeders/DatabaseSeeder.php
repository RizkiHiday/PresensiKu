<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Shift;
use App\Models\Setting;
use App\Models\Attendance;
use App\Models\Leave;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    /**
     * Seeds the application's database with real, structured data, including varied attendance and leaves.
     */
    public function run(): void
    {
        // 1. Wipe everything
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('attendance_logs')->truncate();
        DB::table('attendances')->truncate();
        DB::table('leaves')->truncate();
        DB::table('users')->truncate();
        DB::table('shifts')->truncate();
        DB::table('settings')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // 2. Default System Settings
        $settings = [
            ['key' => 'face_threshold', 'value' => '0.45', 'group' => 'face_recognition'],
            ['key' => 'anti_spoofing', 'value' => 'true', 'group' => 'face_recognition'],
            ['key' => 'scan_delay', 'value' => '5', 'group' => 'face_recognition'],
            ['key' => 'attendance_mode', 'value' => 'in_out', 'group' => 'general'],
        ];
        foreach ($settings as $s) {
            Setting::create($s);
        }

        // 3. Operational Shifts
        $shiftPagi = Shift::create([
            'name' => 'Shift Pagi (Utama)',
            'start_time' => '08:00:00',
            'end_time' => '17:00:00',
            'late_tolerance' => 15,
        ]);

        $shiftSiang = Shift::create([
            'name' => 'Office Hour',
            'start_time' => '09:00:00',
            'end_time' => '18:00:00',
            'late_tolerance' => 30,
        ]);

        // 4. Administrator
        $admin = User::create([
            'name' => 'Admin PresensiKu',
            'email' => 'admin@presensiku.com',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'employee_id' => 'ADM-001',
            'department' => 'IT & Security',
            'position' => 'Superuser',
        ]);

        // 5. 10 Real Employees
        $employeesData = [
            ['name' => 'Budi Santoso', 'email' => 'budi@presensiku.com', 'id' => 'PK-2601', 'dept' => 'IT Support', 'pos' => 'Staff IT'],
            ['name' => 'Siti Aminah', 'email' => 'siti@presensiku.com', 'id' => 'PK-2602', 'dept' => 'Keuangan', 'pos' => 'Finance Staff'],
            ['name' => 'Ahmad Fauzi', 'email' => 'ahmad@presensiku.com', 'id' => 'PK-2603', 'dept' => 'SDM / HRD', 'pos' => 'Recruitment'],
            ['name' => 'Andi Wijaya', 'email' => 'andi@presensiku.com', 'id' => 'PK-2604', 'dept' => 'Operasional', 'pos' => 'Manager'],
            ['name' => 'Dewi Lestari', 'email' => 'dewi@presensiku.com', 'id' => 'PK-2605', 'dept' => 'Pemasaran', 'pos' => 'Digital Marketing'],
            ['name' => 'Muhammad Rizal', 'email' => 'rizal@presensiku.com', 'id' => 'PK-2606', 'dept' => 'Keamanan', 'pos' => 'Security'],
            ['name' => 'Eko Prasetyo', 'email' => 'eko@presensiku.com', 'id' => 'PK-2607', 'dept' => 'Pemeliharaan', 'pos' => 'Teknisi'],
            ['name' => 'Linda Kusumawati', 'email' => 'linda@presensiku.com', 'id' => 'PK-2608', 'dept' => 'Administrasi', 'pos' => 'Secretary'],
            ['name' => 'Agus Setiawan', 'email' => 'agus@presensiku.com', 'id' => 'PK-2609', 'dept' => 'Logistik', 'pos' => 'Warehouse Staff'],
            ['name' => 'Ratna Sari', 'email' => 'ratna@presensiku.com', 'id' => 'PK-2610', 'dept' => 'Layanan Pelanggan', 'pos' => 'Customer Service'],
        ];

        $users = [];
        foreach ($employeesData as $emp) {
            $users[] = User::create([
                'name' => $emp['name'],
                'email' => $emp['email'],
                'password' => Hash::make('password123'),
                'role' => 'user',
                'employee_id' => $emp['id'],
                'department' => $emp['dept'],
                'position' => $emp['pos'],
                'shift_id' => ($emp['pos'] === 'Manager' || $emp['dept'] === 'Administrasi') ? $shiftSiang->id : $shiftPagi->id,
            ]);
        }

        // 6. Varied Attendance (Last 7 Days)
        $now = Carbon::now();
        foreach ($users as $user) {
            $shift = $user->shift;
            for ($i = 6; $i >= 0; $i--) {
                $date = $now->copy()->subDays($i);
                if ($date->isWeekend()) continue; // Skip weekends for attendance

                // Probability: 10% absent (leave)
                if (rand(1, 100) > 90) continue; 

                $isLate = rand(1, 100) > 70; // 30% late
                $checkInTime = Carbon::createFromFormat('H:i:s', $shift->start_time);
                if ($isLate) {
                    $checkInTime->addMinutes(rand(10, 60));
                } else {
                    $checkInTime->subMinutes(rand(1, 15));
                }

                $checkOutTime = Carbon::createFromFormat('H:i:s', $shift->end_time)->addMinutes(rand(0, 30));

                Attendance::create([
                    'user_id' => $user->id,
                    'check_in' => $date->copy()->setTimeFrom($checkInTime),
                    'check_out' => $date->copy()->setTimeFrom($checkOutTime),
                    'status' => $isLate ? 'late' : 'on_time',
                    'latitude' => -6.200000 + (rand(-100, 100) / 10000),
                    'longitude' => 106.816666 + (rand(-100, 100) / 10000),
                    'notes' => $isLate ? 'Terlambat karena macet' : null,
                ]);
            }
        }

        // 7. Seed Leaves (Approvals)
        $leaveTypes = ['Cuti Tahunan', 'Sakit', 'Izin Penting'];
        foreach ($users as $index => $user) {
            if ($index % 3 === 0) { // Some users have leave requests
                Leave::create([
                    'user_id' => $user->id,
                    'start_date' => $now->copy()->addDays(rand(1, 5))->format('Y-m-d'),
                    'end_date' => $now->copy()->addDays(rand(6, 8))->format('Y-m-d'),
                    'type' => $leaveTypes[rand(0, 2)],
                    'reason' => 'Keperluan keluarga mendesak.',
                    'status' => 'pending',
                ]);
            }
            if ($index % 4 === 0) { // Some approved
                Leave::create([
                    'user_id' => $user->id,
                    'start_date' => $now->copy()->subDays(10)->format('Y-m-d'),
                    'end_date' => $now->copy()->subDays(8)->format('Y-m-d'),
                    'type' => 'Sakit',
                    'reason' => 'Demam tinggi, istirahat total.',
                    'status' => 'approved',
                    'admin_note' => 'Cepat sembuh, lampirkan surat dokter saat kembali.',
                ]);
            }
        }
    }
}
