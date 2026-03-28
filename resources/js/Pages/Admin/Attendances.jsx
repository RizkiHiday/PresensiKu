import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { CalendarDays, Filter, RefreshCcw, Download, Trash2, MapPin, Database, Map } from 'lucide-react';

export default function Attendances({ auth, attendances, users, filters }) {
    const [form, setForm] = useState({
        date:    filters.date    || '',
        user_id: filters.user_id || '',
        status:  filters.status  || '',
    });

    const [exportForm, setExportForm] = useState({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    const applyFilter = (e) => {
        e.preventDefault();
        router.get(route('admin.attendances'), form, { preserveScroll: true });
    };

    const clearFilter = () => {
        setForm({ date: '', user_id: '', status: '' });
        router.get(route('admin.attendances'));
    };

    const deleteRecord = (id) => {
        if (!confirm('Hapus data absensi ini?')) return;
        router.delete(route('admin.attendances.delete', id), { preserveScroll: true });
    };

    const fmt = (dt) => dt
        ? new Date(dt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        : '--';
    const fmtDate = (dt) => dt
        ? new Date(dt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
        : '--';

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-2 text-slate-800">
                    <Database className="w-5 h-5 text-emerald-600" />
                    <h2 className="font-semibold text-xl leading-tight">Data Absensi Karyawan</h2>
                </div>
            }
        >
            <Head title="Admin — Data Absensi" />

            <div className="py-10 bg-slate-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 space-y-6">

                    {/* Export Bulanan Card */}
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-800 rounded-[2rem] shadow-xl shadow-emerald-200/50 p-6 lg:p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-white overflow-hidden relative isolate">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-300/20 rounded-full blur-3xl -mr-20 -mt-20 z-0"></div>
                        <div className="relative z-10 flex items-center justify-center gap-4 lg:gap-6 text-center md:text-left">
                            <div className="w-14 h-14 lg:w-16 lg:h-16 bg-white/20 rounded-2xl flex items-center justify-center shadow-inner backdrop-blur-md border border-white/20 shrink-0">
                                <Download className="w-7 h-7" />
                            </div>
                            <div>
                                <h3 className="text-xl lg:text-2xl font-black tracking-tight mb-1">Export Laporan HRD Bulanan</h3>
                                <p className="text-emerald-50 text-xs font-medium max-w-lg leading-relaxed">Secara otomatis menghasilkan rekapitulasi lengkap kehadiran, keterlambatan, cuti, dan alfa seluruh karyawan ke format Excel yang siap pakai.</p>
                            </div>
                        </div>
                        <div className="relative z-10 flex flex-wrap items-center justify-center md:justify-end gap-3 bg-white/10 p-2.5 rounded-2xl backdrop-blur-md border border-white/10 w-full md:w-auto">
                            <select 
                                value={exportForm.month}
                                onChange={e => setExportForm({...exportForm, month: e.target.value})}
                                className="bg-white/20 text-white border-transparent rounded-lg text-sm font-bold focus:ring-0 [&>option]:text-slate-900 cursor-pointer"
                            >
                                <option value="1">Januari</option>
                                <option value="2">Februari</option>
                                <option value="3">Maret</option>
                                <option value="4">April</option>
                                <option value="5">Mei</option>
                                <option value="6">Juni</option>
                                <option value="7">Juli</option>
                                <option value="8">Agustus</option>
                                <option value="9">September</option>
                                <option value="10">Oktober</option>
                                <option value="11">November</option>
                                <option value="12">Desember</option>
                            </select>
                            <input 
                                type="number" 
                                value={exportForm.year}
                                onChange={e => setExportForm({...exportForm, year: e.target.value})}
                                className="bg-white/20 text-white border-transparent rounded-lg text-sm font-bold focus:ring-0 w-24 text-center placeholder-white/50"
                                min="2020" max="2099"
                                placeholder="Tahun"
                            />
                            <a 
                                href={route('admin.attendances.export.monthly', exportForm)}
                                className="px-5 py-3 lg:px-6 rounded-xl bg-white hover:bg-slate-50 text-teal-700 text-xs font-black uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 border border-transparent"
                            >
                                <Download className="w-4 h-4" />
                                Cetak Excel
                            </a>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <form onSubmit={applyFilter} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[160px]">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Tanggal</label>
                            <input
                                type="date"
                                value={form.date}
                                onChange={e => setForm({ ...form, date: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-teal-300 focus:border-teal-400 outline-none bg-slate-50 focus:bg-white transition-colors"
                            />
                        </div>
                        <div className="flex-1 min-w-[160px]">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Pilih Karyawan</label>
                            <select
                                value={form.user_id}
                                onChange={e => setForm({ ...form, user_id: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-teal-300 focus:border-teal-400 outline-none bg-slate-50 focus:bg-white transition-colors cursor-pointer"
                            >
                                <option value="">Semua Karyawan</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                        <div className="flex-1 min-w-[140px]">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Status</label>
                            <select
                                value={form.status}
                                onChange={e => setForm({ ...form, status: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-teal-300 focus:border-teal-400 outline-none bg-slate-50 focus:bg-white transition-colors cursor-pointer"
                            >
                                <option value="">Semua Status</option>
                                <option value="present">Hadir</option>
                                <option value="late">Terlambat</option>
                            </select>
                        </div>
                        <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto">
                            <button type="submit" className="flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm w-full sm:w-auto">
                                <Filter className="w-3 h-3" /> Filter
                            </button>
                            <button type="button" onClick={clearFilter} className="flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-black uppercase tracking-widest transition-all w-full sm:w-auto">
                                <RefreshCcw className="w-3 h-3" /> Reset
                            </button>
                            <a 
                                href={route('admin.attendances.export', form)}
                                className="flex items-center justify-center gap-1.5 px-6 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-black uppercase tracking-widest transition-all active:scale-95 border border-emerald-200 shadow-sm w-full sm:w-auto"
                            >
                                <Download className="w-3 h-3" /> EXPORT HISTORI
                            </a>
                        </div>
                    </form>

                    {/* Table */}
                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
                            <h3 className="font-black text-slate-900 flex items-center gap-2">
                                <CalendarDays className="w-5 h-5 text-teal-600" /> Histori Absensi
                            </h3>
                            <span className="text-[10px] font-black uppercase text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                                Total: {attendances.total} Data
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                                        <th className="px-8 py-4 text-left">Pekerja</th>
                                        <th className="px-4 py-4 text-center">Tanggal</th>
                                        <th className="px-4 py-4 text-center">Check In</th>
                                        <th className="px-4 py-4 text-center">Check Out</th>
                                        <th className="px-4 py-4 text-center">Status</th>
                                        <th className="px-4 py-4 text-center">Lokasi</th>
                                        <th className="px-8 py-4 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {attendances.data.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="py-16 text-center">
                                                <Database className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                                                <p className="text-slate-400 font-bold text-sm">Belum ada histori absensi yang tercatat.</p>
                                            </td>
                                        </tr>
                                    )}
                                    {attendances.data.map((rec) => (
                                        <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-8 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 font-black flex items-center justify-center text-sm border border-teal-100 group-hover:bg-teal-600 group-hover:text-white transition-colors">
                                                        {rec.user.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-800">{rec.user.name}</p>
                                                        <p className="text-[10px] font-bold text-slate-500">{rec.user.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-center text-xs font-black text-slate-600">
                                                {fmtDate(rec.check_in)}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="text-sm font-black text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
                                                    {fmt(rec.check_in)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className="text-sm font-black text-slate-500">
                                                    {fmt(rec.check_out)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase inline-flex items-center gap-1 shadow-sm border
                                                    ${rec.status === 'present' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                                                    {rec.status === 'present' ? 'Hadir' : 'Terlambat'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                {rec.latitude ? (
                                                    <a href={`https://maps.google.com/?q=${rec.latitude},${rec.longitude}`}
                                                        target="_blank"
                                                        className="inline-flex items-center gap-1 text-[10px] font-black text-teal-600 hover:text-teal-800 uppercase bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100 hover:border-teal-300 transition-colors">
                                                        <Map className="w-3 h-3" /> Maps
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-300 text-[10px] font-bold">--</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                <button
                                                    onClick={() => deleteRecord(rec.id)}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase bg-white border border-slate-200 text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-all active:scale-95 shadow-sm">
                                                    <Trash2 className="w-3 h-3" /> Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-center gap-2 mt-6 pb-6">
                        {attendances.links.map((link, i) => (
                            link.url ? (
                                <Link
                                    key={i}
                                    href={link.url}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase transition-all shadow-sm
                                        ${link.active ? 'bg-emerald-600 text-white shadow-emerald-200 border border-transparent' : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-teal-600'}`}
                                />
                            ) : (
                                <span
                                    key={i}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                    className="px-4 py-2.5 rounded-xl text-xs font-black uppercase bg-slate-50 text-slate-300 border border-slate-200 cursor-not-allowed shadow-none"
                                />
                            )
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
