<?php

namespace App\Http\Controllers\Profile;


use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;

class FaceEnrollmentController extends Controller
{
    public function show(\Illuminate\Http\Request $request)
    {
        if ($request->user()->face_enrolled) {
            return redirect()->route('dashboard')->with('error', 'Wajah sudah terdaftar. Tidak dapat mendaftarkan ulang.');
        }
        return Inertia::render('Profile/FaceEnrollment');
    }

    public function update(Request $request)
    {
        if ($request->user()->face_enrolled) {
            return redirect()->route('dashboard')->with('error', 'Wajah sudah terdaftar.');
        }

        $request->validate([
            'embedding' => 'required|array',
        ]);
        
        $newEmbedding = $request->embedding;

        // Ambil pengaturan threshold wajah dari database atau gunakan default 0.45
        $settings = \App\Models\Setting::pluck('value', 'key')->toArray();
        $threshold = (float) ($settings['face_threshold'] ?? 0.45);

        // Ambil semua user lain yang sudah enroll (kecuali user ini jika entah bagaimana lolos)
        $enrolledUsers = \App\Models\User::where('face_enrolled', true)
            ->where('id', '!=', $request->user()->id)
            ->get(['id', 'name', 'face_embedding']);

        foreach ($enrolledUsers as $otherUser) {
            if (!$otherUser->face_embedding) continue;
            
            $existingEmbedding = json_decode($otherUser->face_embedding, true);
            if (!is_array($existingEmbedding) || count($existingEmbedding) !== count($newEmbedding)) continue;

            // Hitung Euclidean Distance secara manual
            $distance = 0;
            for ($i = 0; $i < count($newEmbedding); $i++) {
                $distance += pow($newEmbedding[$i] - $existingEmbedding[$i], 2);
            }
            $distance = sqrt($distance);

            // Jika jarak kurang dari threshold, berarti ini adalah wajah yang sama/sangat mirip
            if ($distance < $threshold) {
                return back()->withErrors(['embedding' => 'Wajah ini sudah terdaftar pada akun milik ' . $otherUser->name . '. 1 Wajah hanya untuk 1 Akun!']);
            }
        }

        $user = $request->user();
        $user->update([
            'face_embedding' => json_encode($request->embedding),
            'face_enrolled' => true,
        ]);

        return back()->with('message', 'Face enrollment successful!');
    }
}

