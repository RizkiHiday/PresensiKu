<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Attendance;
use Inertia\Inertia;

class UserAttendanceController extends Controller
{
    public function index(Request $request)
    {
        $query = Attendance::where('user_id', auth()->id())->latest('check_in');

        if ($request->filled('date_from')) {
            $query->whereDate('check_in', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $query->whereDate('check_in', '<=', $request->date_to);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        return Inertia::render('Attendance/History', [
            'attendances' => $query->paginate(15)->withQueryString(),
            'filters'     => $request->only(['date_from', 'date_to', 'status']),
        ]);
    }
}
