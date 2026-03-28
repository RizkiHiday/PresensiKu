<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use Carbon\Carbon;

class FilteredAttendanceExport implements FromCollection, WithHeadings, WithMapping, ShouldAutoSize, WithStyles
{
    protected $attendances;

    public function __construct($attendances)
    {
        $this->attendances = $attendances;
    }

    public function collection()
    {
        return $this->attendances;
    }

    public function headings(): array
    {
        return [
            'ID', 
            'Nama Karyawan', 
            'Email', 
            'Tanggal Log', 
            'Jam Check-In', 
            'Jam Check-Out', 
            'Status'
        ];
    }

    public function map($row): array
    {
        $checkIn = Carbon::parse($row->check_in);
        return [
            $row->id,
            $row->user->name,
            $row->user->email,
            $checkIn->format('d-m-Y'),
            $checkIn->format('H:i:s'),
            $row->check_out ? Carbon::parse($row->check_out)->format('H:i:s') : 'Belum Check-Out',
            strtoupper($row->status),
        ];
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
