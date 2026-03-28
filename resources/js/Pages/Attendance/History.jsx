import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { History as HistoryIcon, MapPin, Database, Filter, RefreshCcw, LayoutList } from 'lucide-react';

export default function History({ auth, attendances, filters }) {
    const [form, setForm] = useState({
        date_from: filters.date_from || '',
        date_to:   filters.date_to   || '',
        status:    filters.status    || '',
    });

    const applyFilter = (e) => {
        e.preventDefault();
        router.get(route('attendance.history'), form, { preserveScroll: true });
    };

    const clearFilter = () => {
        setForm({ date_from: '', date_to: '', status: '' });
        router.get(route('attendance.history'));
    };

    const fmt = (dt) => dt
        ? new Date(dt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        : '--';
    const fmtDate = (dt) => dt
        ? new Date(dt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        : '--';

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-2 text-slate-800">
                    <HistoryIcon className="w-5 h-5 text-emerald-600" />
                    <h2 className="font-semibold text-xl leading-tight">Riwayat Absensi</h2>
                </div>
            }
        >
            <Head title="Riwayat Absensi" />

            <div className="py-10 bg-slate-50 min-h-screen">
                <div className="max-w-5xl mx-auto px-4 space-y-6">

                    {/* Filter Bar */}
                    <form onSubmit={applyFilter} className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[160px]">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Dari Tanggal</label>
                            <input
                                type="date"
                                value={form.date_from}
                                onChange={e => setForm({ ...form, date_from: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-teal-300 focus:border-teal-400 outline-none bg-slate-50 focus:bg-white transition-colors"
                            />
                        </div>
                        <div className="flex-1 min-w-[160px]">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Sampai Tanggal</label>
                            <input
                                type="date"
                                value={form.date_to}
                                onChange={e => setForm({ ...form, date_to: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-teal-300 focus:border-teal-400 outline-none bg-slate-50 focus:bg-white transition-colors"
                            />
                        </div>
                        <div className="flex-1 min-w-[140px]">
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Status</label>
                            <select
                                value={form.status}
                                onChange={e => setForm({ ...form, status: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-teal-300 focus:border-teal-400 outline-none bg-slate-50 focus:bg-white transition-colors cursor-pointer"
                            >
                                <option value="">Semua Status</option>
                                <option value="present">Tepat Waktu</option>
                                <option value="late">Terlambat</option>
                            </select>
                        </div>
                        <div className="flex flex-wrap sm:flex-nowrap gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                            <button type="submit" className="flex items-center justify-center gap-1.5 px-6 py-3.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm w-full sm:w-auto">
                                <Filter className="w-3.5 h-3.5" /> Filter
                            </button>
                            <button type="button" onClick={clearFilter} className="flex items-center justify-center gap-1.5 px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-black uppercase tracking-widest transition-all w-full sm:w-auto">
                                <RefreshCcw className="w-3.5 h-3.5" /> Reset
                            </button>
                        </div>
                    </form>

                    {/* Table */}
                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-white">
                            <h3 className="font-black text-slate-900 flex items-center gap-2">
                                <span className="bg-teal-50 text-teal-600 p-2 rounded-xl">
                                    <LayoutList className="w-5 h-5" />
                                </span>
                                Catatan Kehadiran Pribadi
                            </h3>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 border border-slate-200 bg-slate-50 px-3 py-1.5 rounded-lg shadow-sm">
                                Total: {attendances.total} Data
                            </span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                                        <th className="px-8 py-5 text-left">Tanggal</th>
                                        <th className="px-6 py-5 text-center">Jam Masuk</th>
                                        <th className="px-6 py-5 text-center">Jam Keluar</th>
                                        <th className="px-6 py-5 text-center">Lokasi Scan</th>
                                        <th className="px-8 py-5 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {attendances.data.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="py-20 text-center">
                                                <Database className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                                                <p className="text-slate-400 font-bold">Tidak ada riwayat absensi yang ditemukan.</p>
                                            </td>
                                        </tr>
                                    )}
                                    {attendances.data.map((rec) => (
                                        <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-8 py-5 font-black text-slate-900 text-sm">
                                                {fmtDate(rec.check_in)}
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className="text-sm font-black text-teal-700 font-mono tracking-tighter bg-teal-50 px-3 py-1.5 rounded-lg border border-teal-100">
                                                    {fmt(rec.check_in)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                <span className="text-sm font-black text-slate-500 font-mono tracking-tighter bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                                                    {rec.check_out ? fmt(rec.check_out) : '--:--'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 text-center">
                                                {rec.latitude ? (
                                                    <a href={`https://maps.google.com/?q=${rec.latitude},${rec.longitude}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-100 text-[10px] font-black text-teal-600 hover:bg-teal-600 hover:text-white uppercase transition-all shadow-sm">
                                                        <MapPin className="w-3 h-3" /> Lihat Peta
                                                    </a>
                                                ) : (
                                                    <span className="text-slate-300 text-[10px] font-bold">Tidak ada lokasi</span>
                                                )}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-block shadow-sm border
                                                    ${rec.status === 'present' 
                                                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                                        : 'bg-rose-50 border-rose-200 text-rose-600'}`}>
                                                    {rec.status === 'present' ? 'Tepat Waktu' : 'Terlambat'}
                                                </span>
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
                                    className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase transition-all shadow-sm border
                                        ${link.active ? 'bg-emerald-600 text-white border-transparent shadow-emerald-200' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:text-teal-600'}`}
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
