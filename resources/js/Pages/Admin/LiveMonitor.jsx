import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { 
    Users, Clock, AlertTriangle, CheckCircle, 
    Activity, PlaySquare, ScanFace, CalendarClock
} from 'lucide-react';

export default function LiveMonitor({ auth, stats, recentAttendances }) {
    const [currentTime, setCurrentTime] = useState(new Date());

    // Update real-time clock
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Poll data every 5 seconds
    useEffect(() => {
        const poll = setInterval(() => {
            router.reload({ only: ['stats', 'recentAttendances'], preserveState: true, preserveScroll: true });
        }, 5000);
        return () => clearInterval(poll);
    }, []);

    const formatTime = (dt) => {
        return new Date(dt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-slate-800 flex items-center gap-2">
                        <PlaySquare className="w-5 h-5 text-emerald-600" /> Live Monitor
                    </h2>
                    <div className="flex items-center gap-2 px-3 py-1 bg-rose-50 border border-rose-100 rounded-full">
                        <span className="w-2.5 h-2.5 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
                        <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Live</span>
                    </div>
                </div>
            }
        >
            <Head title="Live Monitor" />

            <div className="bg-slate-950 min-h-screen p-4 lg:p-8">
                <div className="max-w-[1400px] mx-auto space-y-6 lg:space-y-8">
                    
                    {/* Header Display */}
                    <div className="flex flex-col md:flex-row justify-between items-center bg-slate-900/80 p-6 lg:p-8 rounded-[2rem] border border-slate-800 shadow-2xl relative overflow-hidden isolate">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 z-0 pointer-events-none"></div>
                        <div className="relative z-10 w-full text-center md:text-left">
                            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">PresensiKu <span className="text-emerald-500">Live</span></h1>
                            <p className="text-slate-400 mt-2 text-sm lg:text-lg font-medium flex items-center justify-center md:justify-start gap-2">
                                <CalendarClock className="w-5 h-5" /> 
                                {currentTime.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                        <div className="relative z-10 text-center mt-6 md:mt-0 bg-slate-950/50 px-6 py-4 lg:px-8 lg:py-4 rounded-3xl border border-slate-800 shadow-inner w-full md:w-auto">
                            <p className="text-4xl md:text-6xl font-black text-emerald-400 font-mono tracking-tighter">
                                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
                        {/* Stats Sidebar */}
                        <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-4 lg:gap-6">
                            <div className="bg-slate-900/80 rounded-[2rem] p-5 lg:p-6 border border-slate-800 shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
                                <div className="flex justify-between items-start mb-2">
                                    <Users className="w-5 h-5 lg:w-6 lg:h-6 text-sky-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Total Karyawan</p>
                                    <p className="text-3xl lg:text-5xl font-black text-white">{stats.total_users}</p>
                                </div>
                            </div>
                            
                            <div className="bg-slate-900/80 rounded-[2rem] p-5 lg:p-6 border border-slate-800 shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
                                <div className="flex justify-between items-start mb-2">
                                    <CheckCircle className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Hadir (Hari Ini)</p>
                                    <p className="text-3xl lg:text-5xl font-black text-emerald-400">{stats.present_today}</p>
                                </div>
                            </div>

                            <div className="bg-slate-900/80 rounded-[2rem] p-5 lg:p-6 border border-slate-800 shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
                                <div className="flex justify-between items-start mb-2">
                                    <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-rose-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Terlambat</p>
                                    <p className="text-3xl lg:text-5xl font-black text-rose-400">{stats.late_today}</p>
                                </div>
                            </div>

                            <div className="bg-slate-900/80 rounded-[2rem] p-5 lg:p-6 border border-slate-800 shadow-lg relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl -mr-6 -mt-6"></div>
                                <div className="flex justify-between items-start mb-2">
                                    <AlertTriangle className="w-5 h-5 lg:w-6 lg:h-6 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">Belum Hadir / Cuti</p>
                                    <p className="text-3xl lg:text-5xl font-black text-amber-400">{stats.absent_today}</p>
                                </div>
                            </div>
                        </div>

                        {/* Recent Activity Live Feed */}
                        <div className="lg:col-span-3 bg-slate-900/80 rounded-[2rem] border border-slate-800 shadow-xl flex flex-col overflow-hidden">
                            <div className="px-6 lg:px-8 py-5 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                                <h3 className="text-lg lg:text-xl font-black text-white flex items-center gap-3">
                                    <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded-xl">
                                        <Activity className="w-5 h-5 lg:w-6 lg:h-6" />
                                    </div>
                                    Aktivitas Real-time
                                </h3>
                                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-full font-black uppercase tracking-widest animate-pulse border border-emerald-500/20 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Connected
                                </span>
                            </div>

                            <div className="flex-1 overflow-y-auto max-h-[500px] lg:max-h-[600px] p-4 lg:p-6 space-y-3 custom-scrollbar">
                                {recentAttendances.map((rec, idx) => (
                                    <div 
                                        key={rec.id} 
                                        className={`flex items-center justify-between p-4 lg:p-6 rounded-2xl border transition-all duration-[800ms] transform
                                            ${idx === 0 ? 'bg-emerald-500/10 border-emerald-500/30 scale-[1.01] shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-slate-950 border-slate-800'}`}
                                    >
                                        <div className="flex items-center gap-4 lg:gap-5">
                                            <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-2xl flex items-center justify-center text-lg lg:text-xl font-black shadow-lg
                                                ${idx === 0 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                                                {rec.user.name[0]}
                                            </div>
                                            <div>
                                                <p className={`text-lg lg:text-xl font-black ${idx === 0 ? 'text-white' : 'text-slate-200'}`}>
                                                    {rec.user.name}
                                                </p>
                                                <p className="text-[10px] lg:text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5 flex items-center gap-2">
                                                    <span>{rec.user.employee_id || '-'}</span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                                                    <span>{rec.user.department || 'N/A'}</span>
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right flex items-center gap-4 lg:gap-6">
                                            <div className="hidden sm:block">
                                                <p className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5 lg:mb-1">Check In</p>
                                                <p className="text-xl lg:text-2xl font-black text-slate-300 font-mono tracking-tighter">{formatTime(rec.check_in)}</p>
                                            </div>
                                            <div className={`px-3 py-1.5 lg:px-4 lg:py-2 flex items-center justify-center rounded-xl border ${rec.status === 'present' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
                                                <span className="text-[9px] lg:text-xs font-black uppercase tracking-widest">
                                                    {rec.status === 'present' ? 'Tepat Waktu' : 'Terlambat'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {recentAttendances.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-500 py-16 lg:py-20">
                                        <ScanFace className="w-16 h-16 xl:w-20 xl:h-20 mb-4 opacity-20" />
                                        <p className="text-sm lg:text-lg font-bold">Menunggu rekaman pertama hari ini...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
