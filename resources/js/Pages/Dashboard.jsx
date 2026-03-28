import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import {
    Camera, FileText, Calendar, LogOut,
    CheckCircle, AlertCircle, Clock,
    Activity, ChevronRight, ShieldCheck, Clock4, ScanFace, FileClock
} from 'lucide-react';

export default function Dashboard({ auth, todayAttendance, stats, recentAttendances, userShift, serverTime, heatmapData }) {
    const user  = auth.user;
    
    // Sinkronize time
    const [currentTime, setCurrentTime] = useState(new Date(serverTime || Date.now()));

    useEffect(() => {
        const offset = (serverTime || Date.now()) - Date.now();
        const timer = setInterval(() => {
            setCurrentTime(new Date(Date.now() + offset));
        }, 1000);
        return () => clearInterval(timer);
    }, [serverTime]);

    const todayDate = currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Asia/Jakarta' });
    const liveTime = currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Asia/Jakarta' });

    const hasCheckedIn  = !!todayAttendance;
    const hasCheckedOut = !!todayAttendance?.check_out;
    const isLate        = todayAttendance?.status === 'late';

    const formatTime = (dt) => dt
        ? new Date(dt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        : '--:--';

    return (
        <AuthenticatedLayout
            user={user}
            header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">Dashboard Karyawan</h2>}
        >
            <Head title="Dashboard — PresensiKu" />

            <div className="min-h-screen bg-slate-50 py-8 lg:py-10">
                <div className="max-w-4xl mx-auto px-4 space-y-6 lg:space-y-8">

                    {/* Greeting & Time Card - Emerald/Teal Theme */}
                    <div className="relative bg-emerald-700 rounded-3xl p-6 lg:p-8 text-white shadow-xl shadow-emerald-200 overflow-hidden isolate">
                        {/* Decorative background circle */}
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-emerald-600/50 mix-blend-multiply blur-3xl z-[-1]" />
                        
                        <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="w-4 h-4 text-emerald-200" />
                                    <p className="text-emerald-200 text-sm font-semibold uppercase tracking-widest">{todayDate}</p>
                                </div>
                                <h1 className="text-3xl lg:text-4xl font-black">Halo, {user.name.split(' ')[0]}!</h1>
                                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-emerald-500/30">
                                    {!hasCheckedIn ? (
                                        <><AlertCircle className="w-4 h-4 text-amber-300" /> <span className="text-sm font-medium">Anda belum absen hari ini.</span></>
                                    ) : !hasCheckedOut ? (
                                        <><Clock className="w-4 h-4 text-emerald-300" /> <span className="text-sm font-medium">Anda sedang dalam jam kerja. Jangan lupa Check-out nanti!</span></>
                                    ) : (
                                        <><CheckCircle className="w-4 h-4 text-emerald-300" /> <span className="text-sm font-medium">Absensi hari ini sudah lengkap.</span></>
                                    )}
                                </div>
                            </div>
                            <div className="md:text-right mt-2 md:mt-0 pb-2 border-b border-emerald-600/50 md:border-none md:pb-0">
                                <div className="text-4xl lg:text-6xl font-black tracking-tighter font-mono text-white drop-shadow-md">
                                    {liveTime}
                                </div>
                                <div className="text-emerald-300 text-xs font-bold uppercase tracking-widest mt-1">
                                    Waktu Server Saat Ini
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Primary Actions (CTA) - Layout improved for informativeness */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
                        <div className="md:col-span-2">
                            {user.face_enrolled ? (
                                <Link
                                    href={route('attendance.scan.show')}
                                    className={`relative overflow-hidden group flex items-center justify-between w-full p-6 lg:p-7 rounded-3xl transition-all shadow-lg active:scale-[0.98] ${
                                        !hasCheckedIn ? 'bg-slate-900 hover:bg-black text-white shadow-slate-200' :
                                        !hasCheckedOut ? 'bg-slate-800 hover:bg-slate-900 text-white shadow-slate-200' :
                                        'bg-white border-2 border-slate-200 text-slate-800 hover:bg-slate-50'
                                    }`}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`p-4 rounded-2xl ${!hasCheckedIn || !hasCheckedOut ? 'bg-white/10' : 'bg-slate-100'} backdrop-blur-md`}>
                                            <ScanFace className={`w-8 h-8 ${!hasCheckedIn || !hasCheckedOut ? 'text-white' : 'text-slate-700'}`} />
                                        </div>
                                        <div className="text-left">
                                            <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${!hasCheckedIn || !hasCheckedOut ? 'text-slate-400' : 'text-slate-500'}`}>
                                                Akses Kamera Masuk
                                            </p>
                                            <h2 className="text-xl lg:text-2xl font-black">
                                                {!hasCheckedIn ? 'Lakukan Absen Sekarang' : !hasCheckedOut ? 'Lakukan Check-Out' : 'Lihat Log Absensi Hari Ini'}
                                            </h2>
                                        </div>
                                    </div>
                                    <ChevronRight className={`w-8 h-8 opacity-50 group-hover:opacity-100 transition-transform group-hover:translate-x-1 ${!hasCheckedIn || !hasCheckedOut ? 'text-white' : 'text-slate-400'}`} />
                                </Link>
                            ) : (
                                <Link
                                    href={route('face.enrollment.show')}
                                    className="flex items-center justify-between w-full p-6 lg:p-7 rounded-3xl bg-amber-50 border-2 border-amber-200 text-amber-800 hover:bg-amber-100 transition-all active:scale-[0.98] shadow-sm uppercase tracking-tight"
                                >
                                    <div className="flex items-center gap-4">
                                        <AlertCircle className="w-10 h-10 text-amber-500" />
                                        <div className="text-left">
                                            <p className="text-xs font-bold tracking-widest text-amber-600 mb-1">Peringatan</p>
                                            <h2 className="text-xl font-black">Daftarkan Wajah Anda Dulu</h2>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-6 h-6" />
                                </Link>
                            )}
                        </div>
                        <div className="md:col-span-1">
                            <Link
                                href={route('leaves.index')}
                                className="flex flex-row md:flex-col items-center md:items-start justify-start md:justify-center gap-4 w-full h-full p-6 lg:p-7 rounded-3xl bg-white border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all active:scale-[0.98]"
                            >
                                <div className="p-3 bg-teal-50 rounded-xl text-teal-600">
                                    <FileClock className="w-8 h-8" />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-lg font-black text-slate-800">Cuti & Izin</h3>
                                    <p className="text-xs font-semibold text-slate-500 mt-1 line-clamp-2">Ajukan ketidakhadiran resmi.</p>
                                </div>
                            </Link>
                        </div>
                    </div>

                    {/* Today's Status Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-2">
                                <Clock4 className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Check In</p>
                                <p className="text-xl font-black text-slate-800">{formatTime(todayAttendance?.check_in)}</p>
                                <p className="text-[10px] font-bold mt-1 max-w-full">
                                    {!hasCheckedIn ? <span className="text-slate-400">Belum absen</span> : 
                                      isLate ? <span className="text-rose-600">Terlambat {stats.minutes_late} mnt</span> : 
                                      <span className="text-emerald-600">Tepat Waktu</span>}
                                </p>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-2">
                                <LogOut className="w-5 h-5 text-slate-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Check Out</p>
                                <p className="text-xl font-black text-slate-800">{formatTime(todayAttendance?.check_out)}</p>
                                <p className="text-[10px] font-bold mt-1 text-slate-500">
                                    {hasCheckedOut ? 'Selesai' : hasCheckedIn ? 'Dalam Sesi' : '--'}
                                </p>
                            </div>
                        </div>
                        
                        <div className="bg-teal-50 rounded-2xl p-5 border border-teal-100 shadow-sm flex flex-col justify-between min-h-24 md:col-span-2">
                           <div className="flex justify-between items-center mb-1">
                               <ShieldCheck className="w-5 h-5 text-teal-600" />
                               <span className="text-[10px] font-black uppercase tracking-widest text-teal-600/60 ">{userShift?.name || 'Shift Aktif'}</span>
                           </div>
                           <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-teal-600/80 mb-1">Jam Tuntutan Kerja</p>
                                    <p className="text-xl font-black text-teal-800">
                                        {(userShift?.start_time || '09:00:00').substring(0,5)} - {(userShift?.end_time || '17:00:00').substring(0,5)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-teal-700/80">Toleransi: <span className="font-black">{userShift?.late_tolerance || 0}m</span></p>
                                </div>
                           </div>
                        </div>
                    </div>

                    {/* GitHub Style Heatmap Calendars */}
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 lg:p-8">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-2">
                            <div className="flex items-center gap-3">
                                <Activity className="w-6 h-6 text-emerald-500" />
                                <div>
                                    <h3 className="font-black text-slate-800 text-lg">Aktivitas Kehadiran Tahunan</h3>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">Pantau terus rekor hijau Anda</p>
                                </div>
                            </div>
                            <div className="hidden md:flex text-right flex-col items-end">
                                <div className="text-2xl font-black text-slate-800">{stats.present_month}</div>
                                <div className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Hadir Bln Ini ({stats.late_month} Telat)</div>
                            </div>
                        </div>

                        <div className="w-full overflow-x-auto pb-6">
                            <div className="min-w-max">
                                <div className="grid grid-rows-7 grid-flow-col gap-[3px]">
                                    {heatmapData?.map((day, ix) => {
                                        let bgClass = "bg-slate-100/70";  
                                        if (day.status === -1) bgClass = "bg-transparent"; 
                                        else if (day.status === 1) bgClass = "bg-emerald-500 shadow-sm shadow-emerald-200/50"; 
                                        else if (day.status === 2) bgClass = "bg-amber-400 shadow-sm shadow-amber-200/50"; 
                                        else if (day.status === 3) bgClass = "bg-rose-500 shadow-sm shadow-rose-200/50"; 
                                        else if (day.status === 4) bgClass = "bg-sky-400 shadow-sm shadow-sky-200/50"; 
                                        
                                        let tooltipMsg = day.date ? new Date(day.date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short', year: 'numeric'}) : '';
                                        if (day.status === 1) tooltipMsg += ' — Hadir Tepat Waktu';
                                        if (day.status === 2) tooltipMsg += ' — Hadir Namun Terlambat';
                                        if (day.status === 3) tooltipMsg += ' — Alfa (Tanpa Keterangan)';
                                        if (day.status === 4) tooltipMsg += ' — Cuti / Izin / Off';
                                        else if (day.status === 0 && day.date) tooltipMsg += ' — Libur Akhir Pekan';
                                        
                                        return (
                                            <div 
                                                key={ix} 
                                                title={day.status !== -1 ? tooltipMsg : undefined}
                                                className={`w-[13px] h-[13px] sm:w-[14px] sm:h-[14px] rounded-[3px] ${bgClass} ${day.status !== -1 ? 'hover:scale-[1.6] hover:z-10 hover:ring-2 hover:ring-white transition-all cursor-crosshair' : ''}`}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-4 text-xs font-bold text-slate-500 border-t border-slate-50 pt-4">
                            <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-[3px] bg-emerald-500" /> Hadir</span>
                            <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-[3px] bg-amber-400" /> Telat</span>
                            <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-[3px] bg-sky-400" /> Cuti / Izin</span>
                            <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-[3px] bg-rose-500" /> Alfa</span>
                            <span className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-[3px] bg-slate-100" /> Libur</span>
                        </div>
                    </div>

                    {/* Recent Attendance */}
                    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-6 lg:px-8 py-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                            <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                                <FileText className="w-5 h-5 text-slate-400" /> Riwayat Kehadiran
                            </h3>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white px-2 py-1 rounded-md shadow-sm border border-slate-100">5 Terakhir</span>
                        </div>
                        
                        {recentAttendances.length === 0 ? (
                            <div className="px-8 py-10 flex flex-col items-center justify-center text-slate-400 text-center">
                                <FileText className="w-12 h-12 mb-3 text-slate-200" />
                                <span className="font-bold text-sm">Belum ada catatan keberangkatan.</span>
                                <span className="text-xs mt-1">Lakukan absen wajah pertama Anda.</span>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-50">
                                {recentAttendances.map((rec) => (
                                    <div key={rec.id} className="px-6 lg:px-8 py-5 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black shadow-sm border
                                                ${rec.status === 'present' ? 'bg-emerald-50 border-emerald-100 text-emerald-600' : 'bg-rose-50 border-rose-100 text-rose-600'}`}>
                                                {rec.status === 'present' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="font-black text-slate-800 text-sm">
                                                    {new Date(rec.check_in).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5 text-xs font-bold text-slate-500">
                                                    <span className="flex items-center gap-1"><Clock4 className="w-3.5 h-3.5" /> In: {formatTime(rec.check_in)}</span>
                                                    <span className="text-slate-300">|</span>
                                                    <span className="flex items-center gap-1">Out: {rec.check_out ? formatTime(rec.check_out) : '--:--'}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="hidden sm:block">
                                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase shadow-sm
                                                ${rec.status === 'present' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                {rec.status === 'present' ? 'Hadir' : 'Telat'}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center hover:bg-slate-100 transition-colors">
                            <Link href={route('attendance.history')} className="w-full inline-flex items-center justify-center gap-1 text-xs font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 py-1">
                                Lihat Semua Riwayat <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
