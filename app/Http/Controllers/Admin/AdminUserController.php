<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class AdminUserController extends Controller
{
    public function index(Request $request)
    {
        $query = \App\Models\User::withCount('attendances')->latest();
        if ($request->filled('search')) {
            $query->where(function($q) use ($request) {
                $q->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('email', 'like', '%' . $request->search . '%')
                  ->orWhere('employee_id', 'like', '%' . $request->search . '%');
            });
        }
        return \Inertia\Inertia::render('Admin/Users', [
            'users'   => $query->paginate(15)->withQueryString(),
            'shifts'  => \App\Models\Shift::orderBy('name')->get(['id', 'name', 'start_time', 'end_time']),
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'email'       => 'required|string|email|max:255|unique:users',
            'employee_id' => 'nullable|string|max:50|unique:users',
            'department'  => 'nullable|string|max:100',
            'position'    => 'nullable|string|max:100',
            'shift_id'    => 'nullable|exists:shifts,id',
            'password'    => 'required|string|min:8',
        ]);

        $validated['password'] = bcrypt($validated['password']);
        
        \App\Models\User::create($validated);

        return back()->with('message', 'User berhasil ditambahkan.');
    }

    public function update(Request $request, \App\Models\User $user)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'email'       => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'employee_id' => 'nullable|string|max:50|unique:users,employee_id,'.$user->id,
            'department'  => 'nullable|string|max:100',
            'position'    => 'nullable|string|max:100',
            'shift_id'    => 'nullable|exists:shifts,id',
        ]);

        if ($request->filled('password')) {
            $validated['password'] = bcrypt($request->password);
        }

        $user->update($validated);

        return back()->with('message', 'Data user berhasil diperbarui.');
    }

    public function destroy(\App\Models\User $user)
    {
        $user->delete();
        return back()->with('message', 'User berhasil dihapus.');
    }

    public function resetFace(\App\Models\User $user)
    {
        $user->update(['face_enrolled' => false, 'face_embedding' => null]);
        return back()->with('message', 'Data biometrik user berhasil direset.');
    }
}
