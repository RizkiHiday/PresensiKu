<?php

namespace App\Exports;

use App\Models\User;
use App\Models\Attendance;
use App\Models\Leave;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Carbon\Carbon;

class MonthlyAttendanceExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $month;
    protected $year;
    protected $timezone = 'Asia/Jakarta';

    public function __construct($month, $year)
    {
        $this->month = $month;
        $this->year = $year;
    }

    public function collection()
    {
        return User::where('role', '!=', 'admin')->with(['shift'])->orderBy('name', 'asc')->get();
    }

    public function headings(): array
    {
        Carbon::setLocale('id');
        $monthName = Carbon::create($this->year, $this->month, 1)->translatedFormat('F');
        
        return [
            ['LAPORAN REKAPITULASI ABSENSI KARYAWAN'],
            ['Bulan: ' . $monthName . ' ' . $this->year],
            ['Dicetak pada: ' . Carbon::now()->timezone($this->timezone)->format('d F Y H:i:s')],
            [],
            [
                'No.',
                'Nama Karyawan',
                'Email',
                'Shift Bekerja',
                'Hadir (Hari)',
                'Terlambat (Hari)',
                'Total Menit Telat',
                'Cuti / Izin (Hari)',
                'Alfa / Tanpa Keterangan (Hari)',
                'Total Kehadiran Efektif'
            ]
        ];
    }

    public function map($user): array
    {
        static $row = 0;
        $row++;

        // Menghitung jumlah hari kerja dalam bulan tersebut
        // Normalnya diasumsikan Senin-Jumat, tapi untuk simplifikasi kita hitung 22 hari atau sesuai jumlah absensi maksimal
        // Agar adil, kita hitung kehadiran murni:
        
        $attendances = Attendance::where('user_id', $user->id)
            ->whereMonth('check_in', $this->month)
            ->whereYear('check_in', $this->year)
            ->get();

        $presentCount = $attendances->where('status', 'on_time')->count();
        $lateCount = $attendances->where('status', 'late')->count();
        
        $totalLateMinutes = 0;
        foreach ($attendances->where('status', 'late') as $att) {
            
            if ($user->shift) {
                // Carbon parsing dari string misal "09:00:00"
                $shiftTime = Carbon::parse($user->shift->start_time);
                $checkIn = Carbon::parse($att->check_in)->timezone($this->timezone);
                
                $shiftToday = Carbon::create($checkIn->year, $checkIn->month, $checkIn->day, $shiftTime->hour, $shiftTime->minute, 0, $this->timezone);
                $shiftToday->addMinutes($user->shift->late_tolerance);

                if ($checkIn->greaterThan($shiftToday)) {
                    $totalLateMinutes += $checkIn->diffInMinutes($shiftToday);
                }
            } else {
                // Default fallback jika tidak ada shift (anggep jam 9 pagi)
                $checkIn = Carbon::parse($att->check_in)->timezone($this->timezone);
                $defaultStart = Carbon::create($checkIn->year, $checkIn->month, $checkIn->day, 9, 0, 0, $this->timezone);
                if ($checkIn->greaterThan($defaultStart)) {
                    $totalLateMinutes += $checkIn->diffInMinutes($defaultStart);
                }
            }
        }

        // Ambil data cuti di bulan ini
        $leaves = Leave::where('user_id', $user->id)
            ->where('status', 'approved')
            ->where(function($query) {
                $query->whereMonth('start_date', $this->month)
                      ->orWhereMonth('end_date', $this->month);
            })
            ->where(function($query) {
                $query->whereYear('start_date', $this->year)
                      ->orWhereYear('end_date', $this->year);
            })
            ->get();

        // Hitung eksak hari cuti yg jatuh pada bulan terpilih
        $leaveDaysInMonth = 0;
        foreach ($leaves as $leave) {
            $start = Carbon::parse($leave->start_date);
            $end = Carbon::parse($leave->end_date);
            
            while ($start->lte($end)) {
                if ($start->month == $this->month && $start->year == $this->year) {
                    $leaveDaysInMonth++;
                }
                $start->addDay();
            }
        }

        // Estimasi Alfa (Asumsi standar rata-rata 22 hari kerja rutin dlm sebulan)
        // Jika kehadiran + cuti sudah > 22, maka alfa 0.
        $totalHadir = $presentCount + $lateCount;
        $totalAktif = $totalHadir + $leaveDaysInMonth;
        $alfa = max(0, 22 - $totalAktif);

        return [
            $row,
            $user->name,
            $user->email,
            $user->shift ? $user->shift->name : 'Shift Default (09:00)',
            $presentCount,
            $lateCount,
            $totalLateMinutes,
            $leaveDaysInMonth,
            $alfa,
            $totalHadir // Kehadiran Efektif total
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true, 'size' => 14]],
            2 => ['font' => ['bold' => true, 'italic' => true]],
            5 => ['font' => ['bold' => true], 'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'E5E7EB']
            ]],
        ];
    }
}
