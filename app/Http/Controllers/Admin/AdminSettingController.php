<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AdminSettingController extends Controller
{
    public function index()
    {
        $settings = \App\Models\Setting::pluck('value', 'key')->toArray();

        // Provide defaults if not exist
        $defaultSettings = [
            'face_threshold' => $settings['face_threshold'] ?? '0.45',
            'anti_spoofing'  => $settings['anti_spoofing'] ?? 'true',
            'delay_scan'     => $settings['delay_scan'] ?? '30', // minutes delay before scanning again
            'attendance_mode'=> $settings['attendance_mode'] ?? 'checkin_checkout', // or 'checkin_only'
            'office_lat'     => $settings['office_lat'] ?? '-6.200000',
            'office_lon'     => $settings['office_lon'] ?? '106.816666',
            'office_radius'  => $settings['office_radius'] ?? '0',
            'is_location_set'=> isset($settings['office_lat']) && !empty($settings['office_lat']),
        ];

        return \Inertia\Inertia::render('Admin/Settings', [
            'settings' => $defaultSettings
        ]);
    }

    public function update(\Illuminate\Http\Request $request)
    {
        $validated = $request->validate([
            'face_threshold' => 'required|numeric|min:0.1|max:0.9',
            'anti_spoofing'  => 'required|in:true,false',
            'delay_scan'     => 'required|integer|min:0',
            'attendance_mode'=> 'required|in:checkin_checkout,checkin_only',
            'office_lat'     => 'nullable|numeric',
            'office_lon'     => 'nullable|numeric',
            'office_radius'  => 'required|integer|min:0',
        ]);

        foreach ($validated as $key => $value) {
            \App\Models\Setting::updateOrCreate(
                ['key' => $key],
                ['value' => $value, 'group' => 'face_recognition']
            );
        }

        return back()->with('message', 'Pengaturan berhasil disimpan.');
    }
}
