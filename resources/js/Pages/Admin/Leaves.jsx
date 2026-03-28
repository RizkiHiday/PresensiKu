import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import { FileText, ClipboardCheck, Hourglass, CheckCircle2, XCircle, Paperclip, CheckSquare, XSquare, Clock, Filter } from 'lucide-react';

export default function AdminLeaves({ auth, leaves, filters }) {
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    
    // Approval modal state
    const [showModal, setShowModal] = useState(false);
    const [selectedLeave, setSelectedLeave] = useState(null);

    const { data, setData, put, processing, reset, errors, clearErrors } = useForm({
        status: '',
        admin_note: '',
    });

    const handleFilter = (e) => {
        setStatusFilter(e.target.value);
        router.get(route('admin.leaves.index'), { status: e.target.value }, { preserveState: true });
    };

    const openModal = (leave) => {
        setSelectedLeave(leave);
        clearErrors();
        setData({
            status: leave.status,
            admin_note: leave.admin_note || '',
        });
        setShowModal(true);
    };

    const submitForm = (e) => {
        e.preventDefault();
        put(route('admin.leaves.update', selectedLeave.id), {
            onSuccess: () => setShowModal(false)
        });
    };

    const statusBadge = (s) => {
        const cls = {
            'pending': 'bg-amber-100 text-amber-700 border-amber-200',
            'approved': 'bg-emerald-100 text-emerald-700 border-emerald-200',
            'rejected': 'bg-rose-100 text-rose-700 border-rose-200',
        }[s] || 'bg-slate-100 text-slate-500 border-slate-200';
        
        const label = {
            'pending': 'Menunggu',
            'approved': 'Disetujui',
            'rejected': 'Ditolak',
        }[s] || s;

        const icon = {
            'pending': <Clock className="w-3 h-3" />,
            'approved': <CheckCircle2 className="w-3 h-3" />,
            'rejected': <XCircle className="w-3 h-3" />,
        }[s] || null;

        return (
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 border shadow-sm ${cls}`}>
                {icon} {label}
            </span>
        );
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-2 text-slate-800">
                    <FileText className="w-5 h-5 text-emerald-600" />
                    <h2 className="font-semibold text-xl leading-tight">Manajemen Cuti & Izin</h2>
                </div>
            }
        >
            <Head title="Manajemen Cuti & Izin" />

            <div className="py-12 bg-slate-50 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                        <div className="w-full md:w-auto text-center md:text-left">
                            <h3 className="font-black text-xl text-slate-900 border-l-4 border-emerald-500 pl-3">Daftar Pengajuan</h3>
                            <p className="text-slate-500 text-sm font-medium mt-1">Validasi dokumen dan keterangan cuti / sakit karyawan</p>
                        </div>
                        <div className="flex items-center gap-3 w-full md:w-auto bg-slate-50 p-2 rounded-2xl border border-slate-100">
                            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-black flex items-center gap-1 pl-2">
                                <Filter className="w-3 h-3" /> Status:
                            </span>
                            <select 
                                value={statusFilter}
                                onChange={handleFilter}
                                className="px-5 py-2.5 rounded-xl border-slate-200 text-sm font-bold shadow-sm focus:border-teal-500 focus:ring-teal-500 outline-none w-full md:w-auto cursor-pointer"
                            >
                                <option value="">Semua Status</option>
                                <option value="pending">Menunggu Validasi</option>
                                <option value="approved">Disetujui</option>
                                <option value="rejected">Ditolak</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-slate-100">
                        <div className="overflow-x-auto text-left">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                                        <th className="px-8 py-6 rounded-tl-[2rem]">Karyawan</th>
                                        <th className="px-6 py-6">Tipe & Tanggal</th>
                                        <th className="px-6 py-6 border-x border-slate-100 w-1/3">Keterangan Dokumen</th>
                                        <th className="px-6 py-6 text-center">Status</th>
                                        <th className="px-8 py-6 text-right rounded-tr-[2rem]">Aksi Validasi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {leaves.data.map((leave) => (
                                        <tr key={leave.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 font-black flex items-center justify-center text-sm border border-teal-100 shadow-sm group-hover:bg-teal-600 group-hover:text-white transition-colors">
                                                        {leave.user.name[0]}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-900">{leave.user.name}</p>
                                                        <p className="text-[10px] font-bold tracking-widest uppercase text-slate-400 mt-0.5">{leave.user.employee_id || 'NO NIP'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-black text-slate-800 capitalize mb-1">{leave.type}</p>
                                                <p className="text-xs text-slate-500 font-bold bg-slate-50 inline-block px-2.5 py-1.5 rounded-lg border border-slate-100 shadow-sm">
                                                    {new Date(leave.start_date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' })} 
                                                    <span className="mx-2 text-slate-300">-</span>
                                                    {new Date(leave.end_date).toLocaleDateString('id-ID', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                </p>
                                            </td>
                                            <td className="px-6 py-4 border-x border-slate-50">
                                                <p className="text-xs text-slate-600 leading-relaxed font-medium line-clamp-3" title={leave.reason}>
                                                    {leave.reason}
                                                </p>
                                                {leave.attachment && (
                                                    <a 
                                                        href={`/storage/${leave.attachment}`} 
                                                        target="_blank" 
                                                        className="mt-3 inline-flex items-center gap-1 text-[10px] uppercase font-black tracking-widest text-teal-600 hover:text-teal-800 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-100 transition-colors"
                                                    >
                                                        <Paperclip className="w-3 h-3" /> Lihat Lampiran Dokumen
                                                    </a>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {statusBadge(leave.status)}
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                <button 
                                                    onClick={() => openModal(leave)}
                                                    className={`inline-flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all shadow-sm active:scale-95 border
                                                        ${leave.status === 'pending' 
                                                            ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200 border-emerald-500' 
                                                            : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'}`}
                                                >
                                                    <ClipboardCheck className="w-3 h-3" /> Tinjau
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {leaves.data.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-16 text-center">
                                                <FileText className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                                <p className="text-slate-500 font-bold text-sm">Belum ada pengajuan cuti/izin ditemukan untuk filter ini.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {leaves.links.length > 3 && (
                        <div className="mt-8 flex justify-center gap-2">
                            {leaves.links.map((link, i) => (
                                link.url ? (
                                    <Link 
                                        key={i} 
                                        href={link.url} 
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className={`px-5 py-3 rounded-2xl font-black text-xs uppercase transition-all shadow-sm ${link.active ? 'bg-emerald-600 text-white shadow-emerald-200 border border-transparent' : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-teal-600 border border-slate-200'}`}
                                    />
                                ) : (
                                    <span 
                                        key={i} 
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                        className="px-5 py-3 rounded-2xl font-black text-xs uppercase bg-slate-50 text-slate-300 border border-slate-200 cursor-not-allowed shadow-none"
                                    />
                                )
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Validasi */}
            <Modal show={showModal} onClose={() => setShowModal(false)} maxWidth="md">
                <div className="p-8">
                    <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-3">
                        <span className="bg-teal-50 border border-teal-100 text-teal-600 rounded-xl p-2 w-10 h-10 flex items-center justify-center">
                            <ClipboardCheck className="w-5 h-5" />
                        </span>
                        Validasi Pengajuan
                    </h2>

                    {selectedLeave && (
                        <div className="mb-6 bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-inner">
                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Karyawan</p>
                            <p className="text-slate-900 font-bold mb-4">{selectedLeave.user.name}</p>
                            
                            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400 mb-1">Keterangan / Alasan</p>
                            <p className="text-sm font-medium text-slate-700 leading-relaxed bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                                "{selectedLeave.reason}"
                            </p>
                        </div>
                    )}

                    <form onSubmit={submitForm} className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3">Keputusan Validasi Administrator</label>
                            <div className="grid grid-cols-3 gap-3">
                                <label className={`border-2 rounded-xl text-center py-4 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${data.status === 'pending' ? 'border-amber-500 bg-amber-50 text-amber-700 shadow-sm' : 'border-slate-200 text-slate-400 hover:bg-slate-50'}`}>
                                    <input type="radio" name="status" value="pending" className="hidden" checked={data.status === 'pending'} onChange={e => setData('status', e.target.value)} />
                                    <Hourglass className={`w-6 h-6 ${data.status === 'pending' ? 'text-amber-500 animate-pulse' : 'text-slate-300'}`} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Tunda</span>
                                </label>
                                <label className={`border-2 rounded-xl text-center py-4 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${data.status === 'approved' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm' : 'border-slate-200 text-slate-400 hover:bg-slate-50'}`}>
                                    <input type="radio" name="status" value="approved" className="hidden" checked={data.status === 'approved'} onChange={e => setData('status', e.target.value)} />
                                    <CheckSquare className={`w-6 h-6 ${data.status === 'approved' ? 'text-emerald-500' : 'text-slate-300'}`} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Setujui</span>
                                </label>
                                <label className={`border-2 rounded-xl text-center py-4 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${data.status === 'rejected' ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-sm' : 'border-slate-200 text-slate-400 hover:bg-slate-50'}`}>
                                    <input type="radio" name="status" value="rejected" className="hidden" checked={data.status === 'rejected'} onChange={e => setData('status', e.target.value)} />
                                    <XSquare className={`w-6 h-6 ${data.status === 'rejected' ? 'text-rose-500' : 'text-slate-300'}`} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Tolak</span>
                                </label>
                            </div>
                            {errors.status && <p className="text-rose-500 text-xs mt-2 font-semibold">{errors.status}</p>}
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 mt-4">Catatan Penolakan / Administrator (Opsional)</label>
                            <textarea 
                                value={data.admin_note} 
                                onChange={e => setData('admin_note', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-teal-300 focus:border-teal-400 outline-none bg-slate-50 focus:bg-white transition-colors"
                                rows="3"
                                placeholder="Cth: Dokumen kurang jelas, mohon diperbarui..."
                            ></textarea>
                            {errors.admin_note && <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.admin_note}</p>}
                        </div>

                        <div className="mt-8 flex gap-3 pt-6 border-t border-slate-100">
                            <button 
                                type="button" 
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-4 rounded-xl font-black text-xs uppercase bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                            >
                                Batal
                            </button>
                            <button 
                                type="submit" 
                                disabled={processing}
                                className="flex-1 py-4 rounded-xl font-black text-xs uppercase bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition-all shadow-xl shadow-emerald-200 disabled:opacity-50"
                            >
                                {processing ? 'Menyimpan...' : 'Simpan Keputusan'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
