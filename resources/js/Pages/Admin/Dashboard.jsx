import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    Users, ShieldCheck, CheckCircle, AlertCircle, Clock, 
    Calendar, ScanFace, Activity, Settings, 
    FileText, CalendarDays, KeyRound, UserCheck, MonitorPlay
} from 'lucide-react';

export default function Dashboard({ auth, stats, recent_logs }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">Admin Dashboard</h2>}
        >
            <Head title="Admin Dashboard" />

            <div className="py-8 lg:py-12 bg-slate-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 lg:space-y-8">
                    
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
                        <AdminStatCard title="Total Karyawan" value={stats.total_users} icon={Users} color="sky" />
                        <AdminStatCard title="Hadir Hari Ini" value={stats.present_today} icon={CheckCircle} color="emerald" />
                        <AdminStatCard title="Terlambat" value={stats.late_today} icon={Clock} color="rose" />
                        <AdminStatCard title="Wajah Terdaftar" value={stats.enrolled_faces} icon={ScanFace} color="teal" />
                    </div>

                    {/* Live Monitor Callout */}
                    <div className="bg-slate-900 rounded-[2rem] p-6 md:p-8 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-xl shadow-slate-200 border border-slate-800 relative overflow-hidden isolate">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none z-0"></div>
                        <div className="relative z-10 flex-1">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="relative flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                </span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sistem Real-time Aktif</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black mb-1">Live Attendance Monitor</h2>
                            <p className="text-slate-400 font-medium text-xs md:text-sm max-w-lg">
                                Buka mode layar penuh untuk memantau scan wajah karyawan secara langsung di lobi atau layar kantor HRD.
                            </p>
                        </div>
                        <Link 
                            href={route('admin.live')}
                            className="relative z-10 w-full md:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs md:text-sm uppercase tracking-widest rounded-2xl transition-all shadow-lg active:scale-95 text-center flex items-center justify-center gap-2"
                        >
                            <MonitorPlay className="w-5 h-5" /> Live Monitor
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                        {/* Quick Actions */}
                        <div className="bg-white p-6 lg:p-8 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col h-full">
                            <h3 className="text-lg lg:text-xl font-black mb-6 flex items-center gap-3 text-slate-800">
                                <div className="bg-teal-50 p-2 rounded-xl text-teal-600">
                                    <Activity className="w-5 h-5 lg:w-6 lg:h-6" />
                                </div>
                                Akses Cepat Menu
                            </h3>
                            <div className="space-y-3 flex-1">
                                <QuickActionLink href={route('admin.users')} label="Kelola Database Karyawan" desc="Tambah, edit, dan atur kredensial pengguna" icon={Users} />
                                <QuickActionLink href={route('admin.attendances')} label="Audit Data Absensi HRD" desc="Cek riwayat log presensi & cetak laporan bulanan" icon={FileText} />
                                <QuickActionLink href={route('admin.shifts')} label="Manajemen Jadwal Shift" desc="Konfigurasi jam masuk, pulang, dan batas toleransi" icon={Clock} />
                                <QuickActionLink href={route('admin.leaves.index')} label="Persetujuan Cuti & Izin" desc="Tinjau dan proses permohonan ketidakhadiran" icon={CalendarDays} />
                                <QuickActionLink href={route('admin.settings')} label="Pengaturan Sistem & Lokasi" desc="Atur akurasi wajah, anti-spoofing & radius lokasi GPS" icon={Settings} />
                            </div>
                        </div>

                        {/* Recent Activity Logs */}
                        <div className="bg-white p-6 lg:p-8 rounded-[2rem] shadow-sm border border-slate-100">
                            <h3 className="text-lg lg:text-xl font-black mb-6 flex items-center gap-3 text-slate-800">
                                <div className="bg-amber-50 p-2 rounded-xl text-amber-600">
                                    <ShieldCheck className="w-5 h-5 lg:w-6 lg:h-6" />
                                </div>
                                Anti-Gravity Audit Log
                            </h3>
                            <div className="space-y-3">
                                {recent_logs.length === 0 ? (
                                    <div className="text-center text-slate-400 py-6 text-sm font-medium">Beban log audit masih kosong.</div>
                                ) : (
                                    recent_logs.map((log) => (
                                        <div key={log.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100/50 rounded-2xl hover:bg-slate-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-slate-700 shadow-sm">
                                                    {log.user.name[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{log.user.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter max-w-[120px] sm:max-w-xs extract-truncate">{log.activity}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">{new Date(log.created_at).toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit'})}</p>
                                                <p className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full inline-flex border ${log.activity.includes('fail') ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>
                                                    {log.activity.includes('fail') ? 'GAGAL' : 'SUKSES'}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function AdminStatCard({ title, value, icon: Icon, color }) {
    const colorClasses = {
        sky: "text-sky-600 bg-sky-50 shadow-sky-100/50",
        emerald: "text-emerald-600 bg-emerald-50 shadow-emerald-100/50",
        rose: "text-rose-600 bg-rose-50 shadow-rose-100/50",
        teal: "text-teal-600 bg-teal-50 shadow-teal-100/50",
    }
    const iconColors = {
        sky: "text-sky-500",
        emerald: "text-emerald-500",
        rose: "text-rose-500",
        teal: "text-teal-500",
    }
    return (
        <div className={`p-5 lg:p-6 rounded-[2rem] shadow-sm border border-white ${colorClasses[color]} flex flex-col justify-between`}>
            <div className="flex justify-between items-start mb-4">
                <Icon className={`w-6 h-6 lg:w-8 lg:h-8 ${iconColors[color]}`} />
                <span className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest opacity-60">Status</span>
            </div>
            <div>
                <h4 className="text-3xl lg:text-4xl font-black mb-1">{value}</h4>
                <p className="text-[10px] lg:text-xs font-bold uppercase tracking-tight opacity-70">{title}</p>
            </div>
        </div>
    )
}

const QuickActionLink = ({ href, label, desc, icon: Icon }) => {
    return (
        <Link href={href} className="flex items-start gap-4 p-4 lg:p-5 bg-white border border-slate-200 rounded-2xl hover:bg-teal-50 hover:border-teal-300 hover:shadow-md transition-all group active:scale-[0.98] w-full">
            <div className="bg-slate-50 p-3 rounded-xl group-hover:bg-teal-600 group-hover:text-white text-slate-500 transition-colors shadow-sm shrink-0">
                <Icon className="w-5 h-5 lg:w-6 lg:h-6" />
            </div>
            <div className="flex-1 text-left">
                <span className="block text-sm font-black text-slate-700 group-hover:text-teal-800 transition-colors">{label}</span>
                <span className="block text-xs font-medium text-slate-500 mt-0.5 leading-relaxed group-hover:text-teal-600 transition-colors">{desc}</span>
            </div>
            <div className="text-slate-300 group-hover:text-teal-500 transition-colors shrink-0 self-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </div>
        </Link>
    )
}
