<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class LeaveController extends Controller
{
    public function index()
    {
        $leaves = \App\Models\Leave::where('user_id', auth()->id())->latest()->get();
        return \Inertia\Inertia::render('Leave/Index', [
            'leaves' => $leaves
        ]);
    }

    public function store(\Illuminate\Http\Request $request)
    {
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date'   => 'required|date|after_or_equal:start_date',
            'type'       => 'required|in:sick,leave,permit',
            'reason'     => 'required|string',
            'attachment' => 'nullable|file|mimes:pdf,jpg,png,jpeg|max:2048'
        ]);

        if ($request->hasFile('attachment')) {
            $validated['attachment'] = $request->file('attachment')->store('leave_attachments', 'public');
        }

        $validated['user_id'] = auth()->id();
        $validated['status']  = 'pending';

        \App\Models\Leave::create($validated);
        return back()->with('message', 'Pengajuan cuti/izin berhasil dikirim.');
    }

    public function destroy(\App\Models\Leave $leave)
    {
        if ($leave->user_id === auth()->id() && $leave->status === 'pending') {
            $leave->delete();
            return back()->with('message', 'Pengajuan cuti dibatalkan.');
        }
        return back()->with('error', 'Tidak dapat membatalkan cuti.');
    }
}
