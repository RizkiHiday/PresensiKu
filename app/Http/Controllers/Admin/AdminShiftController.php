<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AdminShiftController extends Controller
{
    public function index()
    {
        return \Inertia\Inertia::render('Admin/Shifts', [
            'shifts' => \App\Models\Shift::withCount('users')->latest()->get()
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'start_time'     => 'required|date_format:H:i',
            'end_time'       => 'required|date_format:H:i',
            'late_tolerance' => 'required|integer|min:0',
        ]);

        \App\Models\Shift::create($validated);

        return back()->with('message', 'Shift berhasil ditambahkan.');
    }

    public function update(Request $request, \App\Models\Shift $shift)
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'start_time'     => 'required|date_format:H:i',
            'end_time'       => 'required|date_format:H:i',
            'late_tolerance' => 'required|integer|min:0',
        ]);

        $shift->update($validated);

        return back()->with('message', 'Shift berhasil diperbarui.');
    }

    public function destroy(\App\Models\Shift $shift)
    {
        $shift->delete();
        return back()->with('message', 'Shift berhasil dihapus.');
    }
}
