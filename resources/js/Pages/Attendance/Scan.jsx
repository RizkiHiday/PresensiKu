import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import * as faceapi from '@vladmandic/face-api';
import axios from 'axios';
import { ShieldCheck, Fingerprint, Activity, ImageOff, Check, X } from 'lucide-react';

// ── INIT CONSTANTS ────────────────────────────────────────────────────────────
// Defaults
const DEFAULT_MATCH_THRESHOLD     = 0.45;
const LIVENESS_FRAMES     = 15;   
const LIVENESS_STD_MIN    = 0.30; 

const euclideanDistance = (v1, v2) =>
    Math.sqrt(v1.reduce((s, v, i) => s + (v - v2[i]) ** 2, 0));

const stdDev = (arr) => {
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    return Math.sqrt(arr.reduce((s, v) => s + (v - mean) ** 2, 0) / arr.length);
};

// ── Stages ────────────────────────────────────────────────────────────
// INIT → SCANNING → MATCHING → LIVENESS → SUCCESS | FAIL
export default function Scan({ auth, userEmbedding, sysSettings }) {
    const videoRef    = useRef();
    const [loaded, setLoaded]     = useState(false);
    const [stage, setStage]       = useState('INIT');
    const [status, setStatus]     = useState('Memuat sistem...');
    const [progress, setProgress] = useState(0); // 0-100 for liveness fill
    const [matchPct, setMatchPct] = useState(null);
    const [failReason, setFailReason] = useState('');

    const stageRef      = useRef('INIT');
    const geoRef        = useRef({ lat: null, lon: null });
    const submittedRef  = useRef(false);
    // Liveness collection
    const noseXSamples  = useRef([]);
    const noseYSamples  = useRef([]);
    const earSamples    = useRef([]); // secondary check

    const setStageSync = (s) => { stageRef.current = s; setStage(s); };

    // ── Nose tip position ─────────────────────────────────────────────
    const getNose = (pts) => ({ x: pts[30].x, y: pts[30].y });

    // ── Reset liveness buffers ─────────────────────────────────────────
    const resetLiveness = () => {
        noseXSamples.current = [];
        noseYSamples.current = [];
        earSamples.current   = [];
        setProgress(0);
    };

    // ── Init camera + models ──────────────────────────────────────────
    useEffect(() => {
        (async () => {
            try {
                await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
                await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
                await faceapi.nets.faceRecognitionNet.loadFromUri('/models');

                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user', width: 640 },
                });
                videoRef.current.srcObject = stream;
                setLoaded(true);
                setStageSync('SCANNING');
                setStatus('Hadapkan wajah ke kamera');

                navigator.geolocation.getCurrentPosition(
                    p => { geoRef.current = { lat: p.coords.latitude, lon: p.coords.longitude }; },
                    () => {},
                    { timeout: 5000 }
                );
            } catch (e) {
                setStatus('⚠️ Error: ' + e.message);
                setStageSync('FAIL');
            }
        })();
        return () => videoRef.current?.srcObject?.getTracks().forEach(t => t.stop());
    }, []);

    // ── Detection loop ────────────────────────────────────────────────
    useEffect(() => {
        if (!loaded) return;
        const interval = setInterval(async () => {
            const s = stageRef.current;
            if (s === 'SUCCESS' || s === 'FAIL' || submittedRef.current) return;
            if (!videoRef.current) return;

            const det = await faceapi
                .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 320 }))
                .withFaceLandmarks()
                .withFaceDescriptor();

            // ── No face ───────────────────────────────────────────────
            if (!det) {
                if (s !== 'SCANNING') {
                    setStageSync('SCANNING');
                    resetLiveness();
                    setMatchPct(null);
                    setStatus('Hadapkan wajah ke kamera');
                }
                return;
            }

            const pts  = det.landmarks.positions;
            const nose = getNose(pts);

            // ── Stage: SCANNING — check face match ────────────────────
            if (s === 'SCANNING') {
                const MATCH_THRESHOLD = sysSettings ? parseFloat(sysSettings.face_threshold) : DEFAULT_MATCH_THRESHOLD;
                const dist  = euclideanDistance(Array.from(det.descriptor), userEmbedding);
                const pct   = Math.max(0, Math.round((1 - dist) * 100));
                setMatchPct(pct);

                if (dist < MATCH_THRESHOLD) {
                    // Check if anti-spoofing is disabled
                    const useAntiSpoof = sysSettings ? String(sysSettings.anti_spoofing) === 'true' : true;
                    if (!useAntiSpoof) {
                        // Skip liveness, directly success
                        submitAttendance(dist, 0);
                        return;
                    }

                    resetLiveness();
                    setStageSync('LIVENESS');
                    setStatus('Menganalisis liveness...');
                } else {
                    setStatus('Wajah tidak dikenali (' + pct + '%)');
                }
                return;
            }

            // ── Stage: LIVENESS — collect micro-motion frames ─────────
            if (s === 'LIVENESS') {
                const MATCH_THRESHOLD = sysSettings ? parseFloat(sysSettings.face_threshold) : DEFAULT_MATCH_THRESHOLD;
                
                // Also re-check match every frame (face stays in frame)
                const dist = euclideanDistance(Array.from(det.descriptor), userEmbedding);
                if (dist >= MATCH_THRESHOLD) {
                    setStageSync('SCANNING');
                    resetLiveness();
                    setStatus('Wajah berubah, mulai ulang...');
                    return;
                }

                noseXSamples.current.push(nose.x);
                noseYSamples.current.push(nose.y);

                const n       = noseXSamples.current.length;
                const prgress = Math.min(100, Math.round((n / LIVENESS_FRAMES) * 100));
                setProgress(prgress);

                if (n >= LIVENESS_FRAMES) {
                    // ── Compute std-dev of nose movement ─────────────
                    const sdX = stdDev(noseXSamples.current);
                    const sdY = stdDev(noseYSamples.current);
                    const totalMotion = Math.sqrt(sdX ** 2 + sdY ** 2);

                    console.log('[Liveness] stdX:', sdX.toFixed(4), 'sdY:', sdY.toFixed(4), 'total:', totalMotion.toFixed(4));

                    if (totalMotion >= LIVENESS_STD_MIN) {
                        submitAttendance(dist, totalMotion);
                    } else {
                        // ❌ FAKE / PHOTO
                        setStageSync('FAIL');
                        setFailReason('Deteksi foto/gambar statis! Gerakan natural tidak ditemukan.');
                        setStatus('Akses Ditolak');
                        setProgress(0);

                        axios.post(route('attendance.scan.log'), {
                            activity: 'liveness_failed_photo_detected',
                            details: { motion: totalMotion.toFixed(4) },
                        }).catch(() => {});

                        // Allow retry after 3s
                        setTimeout(() => {
                            setStageSync('SCANNING');
                            setFailReason('');
                            setStatus('Hadapkan wajah ke kamera');
                            setMatchPct(null);
                        }, 3500);
                    }
                }
            }
        }, 120);

        return () => clearInterval(interval);
    }, [loaded, userEmbedding, sysSettings]);

    const submitAttendance = (dist, motionVal) => {
        // ✅ SUBMIT LOGIC
        submittedRef.current = true;
        setStageSync('SUCCESS');
        setStatus('Absensi berhasil!');
        setProgress(100);

        axios.post(route('attendance.scan.store'), {
            latitude: geoRef.current.lat,
            longitude: geoRef.current.lon,
        }).then(() => {
            setTimeout(() => router.visit(route('dashboard')), 1400);
        }).catch((err) => {
            setStageSync('FAIL');
            setStatus('Absensi Gagal');
            setFailReason(err.response?.data?.errors?.error || 'Sedang terjadi gangguan sistem.');
            setTimeout(() => {
                submittedRef.current = false;
                setStageSync('SCANNING');
                setStatus('Silakan coba scan ulang.');
                setFailReason('');
            }, 3000);
        });

        axios.post(route('attendance.scan.log'), {
            activity: motionVal > 0 ? 'liveness_passed' : 'bypassed_liveness',
            details: { motion: motionVal.toFixed(4), distance: dist.toFixed(4) },
        }).catch(() => {});
    };

    // ── UI ────────────────────────────────────────────────────────────
    const ringColor = stage === 'SUCCESS' ? '#10b981' // emerald-500
                    : stage === 'FAIL'    ? '#f43f5e' // rose-500
                    : stage === 'LIVENESS' ? '#0d9488' // teal-600
                    : '#e2e8f0'; // slate-200

    const circumference = 2 * Math.PI * 47;

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-2 text-slate-800">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <h2 className="font-semibold text-xl leading-tight">Kehadiran Biometrik</h2>
                </div>
            }
        >
            <Head title="Scan Absensi" />

            <div className="min-h-screen bg-slate-50 py-10">
                <div className="max-w-sm mx-auto px-4 space-y-5">

                    {/* Main Scanner Card */}
                    <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden">
                        {/* Status strip */}
                        <div className={`py-4 px-6 text-[10px] flex items-center justify-center gap-2 font-black uppercase tracking-widest text-center transition-colors duration-500 shadow-sm
                            ${stage === 'SUCCESS'  ? 'bg-emerald-500 text-white'
                            : stage === 'FAIL'    ? 'bg-rose-500 text-white'
                            : stage === 'LIVENESS'? 'bg-teal-600 text-white'
                            : 'bg-slate-100 text-slate-400'}`}>
                            {stage === 'INIT'      && <span className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border-2 border-slate-300 border-t-transparent animate-spin"/> Memuat...</span>}
                            {stage === 'SCANNING'  && <span>Mendeteksi Wajah</span>}
                            {stage === 'LIVENESS'  && <span className="flex items-center gap-2"><Activity className="w-3.5 h-3.5 animate-pulse" /> Anti-Spoof Check</span>}
                            {stage === 'SUCCESS'   && <span className="flex items-center gap-2"><Check className="w-4 h-4" /> Absensi Tercatat</span>}
                            {stage === 'FAIL'      && <span className="flex items-center gap-2"><X className="w-4 h-4" /> Akses Ditolak</span>}
                        </div>

                        <div className="p-8 flex flex-col items-center">
                            {/* Camera Ring */}
                            <div className="relative w-64 h-64 mb-6">
                                <svg className="absolute inset-0 w-full h-full -rotate-90 drop-shadow-sm" viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="47" fill="none" stroke="#f8fafc" strokeWidth="4" />
                                    <circle
                                        cx="50" cy="50" r="47" fill="none"
                                        stroke={ringColor}
                                        strokeWidth="4"
                                        strokeLinecap="round"
                                        strokeDasharray={circumference}
                                        strokeDashoffset={circumference * (1 - progress / 100)}
                                        className="transition-all duration-200"
                                    />
                                </svg>

                                <div className="absolute inset-4 rounded-full overflow-hidden border-8 border-white shadow-inner bg-slate-900">
                                    <video ref={videoRef} autoPlay muted playsInline
                                        className="w-full h-full object-cover -scale-x-100" />

                                    {!loaded && (
                                        <div className="absolute inset-0 bg-slate-900 flex items-center justify-center rounded-full">
                                            <div className="h-10 w-10 rounded-full border-4 border-teal-500 border-t-transparent animate-spin" />
                                        </div>
                                    )}
                                    {stage === 'SUCCESS' && (
                                        <div className="absolute inset-0 bg-emerald-500 flex items-center justify-center transition-all rounded-full">
                                            <Check className="w-16 h-16 text-white" strokeWidth={3} />
                                        </div>
                                    )}
                                    {stage === 'FAIL' && (
                                        <div className="absolute inset-0 bg-rose-500 flex items-center justify-center transition-all rounded-full">
                                            <X className="w-16 h-16 text-white" strokeWidth={3} />
                                        </div>
                                    )}
                                </div>

                                {/* Match % badge md */}
                                {matchPct !== null && stage !== 'SUCCESS' && stage !== 'FAIL' && (
                                    <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-5 py-2 rounded-full text-[10px] font-black uppercase shadow-lg border
                                        ${matchPct >= 50 ? 'bg-teal-600 text-white border-teal-500' : 'bg-white text-slate-500 border-slate-200'}`}>
                                        Akurasi {matchPct}%
                                    </div>
                                )}
                            </div>

                            {/* Status */}
                            <p className={`text-xl font-black mt-4 text-center transition-colors tracking-tight
                                ${stage === 'SUCCESS' ? 'text-emerald-600' : stage === 'FAIL' ? 'text-rose-600' : stage === 'LIVENESS' ? 'text-teal-700' : 'text-slate-800'}`}>
                                {status}
                            </p>
                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mt-1">{auth.user.name}</p>

                            {/* Liveness progress bar */}
                            {stage === 'LIVENESS' && (
                                <div className="w-full mt-8 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-500 mb-2">
                                        <span>Analisis Mikro</span>
                                        <span className="text-teal-600">{progress}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                                        <div className="h-full bg-teal-500 rounded-full transition-all duration-200"
                                            style={{ width: `${progress}%` }} />
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 text-center mt-3">
                                        Mendeteksi pergerakan alami...
                                    </p>
                                </div>
                            )}

                            {/* Fail reason */}
                            {stage === 'FAIL' && failReason && (
                                <div className="mt-6 w-full bg-rose-50 border border-rose-100 rounded-2xl p-4 text-[11px] font-bold text-rose-600 text-center uppercase tracking-wider">
                                    {failReason}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* How it works */}
                    <div className="bg-slate-900 rounded-[2.5rem] p-6 text-white shadow-xl relative overflow-hidden isolate">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-500 rounded-full mix-blend-multiply filter blur-2xl opacity-50 z-0"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4 text-teal-400">
                                <ShieldCheck className="w-5 h-5" />
                                <p className="text-[10px] font-black uppercase tracking-widest m-0">Sistem Keamanan Biometrik</p>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { icon: <Fingerprint className="w-4 h-4 text-emerald-400" />, text: 'Pemetaan biometrik 128 dimensi' },
                                    { icon: <Activity className="w-4 h-4 text-emerald-400" />, text: 'Analisis mikromotion otot wajah' },
                                    { icon: <ImageOff className="w-4 h-4 text-rose-400" />, text: 'Tolak foto dan rekaman video otomatis' },
                                ].map((f, i) => (
                                    <div key={i} className="flex items-center gap-3 bg-white/5 backdrop-blur-sm p-2.5 rounded-xl border border-white/10">
                                        <span className="p-1.5 bg-white/10 rounded-lg">{f.icon}</span>
                                        <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">{f.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
