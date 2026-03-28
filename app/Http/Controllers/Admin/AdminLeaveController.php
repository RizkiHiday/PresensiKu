<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AdminLeaveController extends Controller
{
    public function index(\Illuminate\Http\Request $request)
    {
        $query = \App\Models\Leave::with('user')->latest();

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return \Inertia\Inertia::render('Admin/Leaves', [
            'leaves' => $query->paginate(15)->withQueryString(),
            'filters' => $request->only(['status']),
        ]);
    }

    public function update(\Illuminate\Http\Request $request, \App\Models\Leave $leave)
    {
        $validated = $request->validate([
            'status'     => 'required|in:approved,rejected',
            'admin_note' => 'nullable|string'
        ]);

        $leave->update($validated);

        return back()->with('message', 'Status pengajuan berhasil diupdate.');
    }
}
