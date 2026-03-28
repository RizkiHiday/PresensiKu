import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import { FileText, Plus, CheckCircle2, Clock, XCircle, FilePlus, CalendarDays, ClipboardList, Info, Trash2 } from 'lucide-react';

export default function LeaveIndex({ auth, leaves }) {
    const [showModal, setShowModal] = useState(false);

    const { data, setData, post, processing, reset, errors, clearErrors } = useForm({
        start_date: '',
        end_date: '',
        type: 'leave',
        reason: '',
        attachment: null,
    });

    const openModal = () => {
        clearErrors();
        reset();
        setShowModal(true);
    };

    const submitForm = (e) => {
        e.preventDefault();
        post(route('leaves.store'), {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setShowModal(false);
            }
        });
    };

    const deleteLeave = (id) => {
        if (confirm('Batalkan pengajuan ini?')) {
            router.delete(route('leaves.destroy', id));
        }
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
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 ${cls} border shadow-sm`}>
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
                    <h2 className="font-semibold text-xl leading-tight">Pengajuan Cuti & Izin</h2>
                </div>
            }
        >
            <Head title="Cuti & Izin" />

            <div className="py-12 bg-slate-50 min-h-screen">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100">
                        <div className="w-full sm:w-auto text-center sm:text-left">
                            <h3 className="font-black text-xl text-slate-900 border-l-4 border-emerald-500 pl-3">Riwayat Pengajuan</h3>
                            <p className="text-slate-500 text-sm mt-1">Status dokumen Cuti, Sakit, atau Izin absen Anda</p>
                        </div>
                        <button 
                            onClick={openModal}
                            className="w-full sm:w-auto px-8 py-3.5 bg-emerald-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 flex items-center justify-center gap-2"
                        >
                            <FilePlus className="w-4 h-4" /> Ajukan Izin
                        </button>
                    </div>

                    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="divide-y divide-slate-50">
                            {leaves.map((leave) => (
                                <div key={leave.id} className="p-6 md:p-8 hover:bg-slate-50/50 transition-colors group relative">
                                    <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                                        
                                        <div className="flex gap-5 flex-1">
                                            <div className="hidden sm:flex flex-shrink-0 w-12 h-12 bg-teal-50 text-teal-600 rounded-xl items-center justify-center border border-teal-100 mt-1">
                                                <ClipboardList className="w-6 h-6" />
                                            </div>
                                            <div className="w-full">
                                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                                    <span className="font-black text-lg text-slate-900 capitalize border-b-2 border-slate-100 pb-1 pr-2">
                                                        Izin {leave.type === 'leave' ? 'Cuti' : leave.type === 'sick' ? 'Sakit' : 'Spesial'}
                                                    </span>
                                                    {statusBadge(leave.status)}
                                                </div>

                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-3 bg-slate-50 inline-flex px-3 py-1.5 rounded-lg border border-slate-100">
                                                    <CalendarDays className="w-3.5 h-3.5 text-slate-300" /> 
                                                    {new Date(leave.start_date).toLocaleDateString('id-ID', { month: 'long', day: 'numeric', year: 'numeric' })} 
                                                    <span className="text-slate-300 mx-1">—</span> 
                                                    {new Date(leave.end_date).toLocaleDateString('id-ID', { month: 'long', day: 'numeric', year: 'numeric' })}
                                                </p>

                                                <p className="text-slate-600 text-sm leading-relaxed p-4 bg-slate-50 rounded-2xl border border-slate-100 relative shadow-sm">
                                                    <span className="absolute -top-3 left-4 bg-white px-2 text-[9px] uppercase font-black text-slate-400 tracking-widest">Alasan Pengajuan</span>
                                                    "{leave.reason}"
                                                </p>

                                                {leave.admin_note && (
                                                    <div className="mt-4 bg-teal-50 p-4 rounded-2xl border border-teal-100 flex gap-3 text-teal-800 shadow-sm relative">
                                                        <Info className="w-5 h-5 flex-shrink-0 text-teal-500 mt-0.5" />
                                                        <div>
                                                            <strong className="block text-[10px] uppercase font-black tracking-widest text-teal-600 mb-1">Catatan HRD/Admin</strong> 
                                                            <span className="text-sm font-medium">{leave.admin_note}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {leave.status === 'pending' && (
                                            <div className="md:border-l md:border-slate-100 md:pl-6 md:ml-2 flex items-center shrink-0 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t border-slate-100">
                                                <button 
                                                    onClick={() => deleteLeave(leave.id)}
                                                    className="w-full md:w-auto px-5 py-2.5 bg-white border border-rose-200 text-rose-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-rose-50 hover:border-rose-300 transition-colors flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" /> Batalkan
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                            
                            {leaves.length === 0 && (
                                <div className="p-16 text-center">
                                    <div className="w-20 h-20 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-5 border border-slate-100">
                                        <FileText className="w-10 h-10" />
                                    </div>
                                    <h4 className="font-black text-lg text-slate-900 mb-1">Belum Ada Riwayat</h4>
                                    <p className="text-slate-400 font-medium text-sm">Ajukan cuti atau izin melalui tombol di atas.</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            <Modal show={showModal} onClose={() => setShowModal(false)} maxWidth="md">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center border border-teal-100">
                            <FilePlus className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Form Pengajuan Izin</h2>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cuti, Sakit, atau Keperluan Lain</p>
                        </div>
                    </div>

                    <form onSubmit={submitForm} className="space-y-5" encType="multipart/form-data">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Jenis Pengajuan</label>
                            <select 
                                value={data.type} 
                                onChange={e => setData('type', e.target.value)}
                                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-sm font-black text-slate-700 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-300 focus:border-teal-400 cursor-pointer outline-none transition-colors"
                            >
                                <option value="leave">🏝️ Cuti Liburan / Tahunan</option>
                                <option value="sick">🤒 Izin Sakit</option>
                                <option value="permit">📝 Izin Keperluan Lain</option>
                            </select>
                            {errors.type && <p className="text-rose-500 text-xs mt-1.5 font-semibold">{errors.type}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Mulai Tanggal</label>
                                <input 
                                    type="date" 
                                    value={data.start_date} 
                                    onChange={e => setData('start_date', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-teal-300 focus:border-teal-400 outline-none bg-slate-50 focus:bg-white transition-colors"
                                />
                                {errors.start_date && <p className="text-rose-500 text-xs mt-1.5 font-semibold">{errors.start_date}</p>}
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Sampai Tanggal</label>
                                <input 
                                    type="date" 
                                    value={data.end_date} 
                                    onChange={e => setData('end_date', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-teal-300 focus:border-teal-400 outline-none bg-slate-50 focus:bg-white transition-colors"
                                />
                                {errors.end_date && <p className="text-rose-500 text-xs mt-1.5 font-semibold">{errors.end_date}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Alasan / Keterangan Lengkap</label>
                            <textarea 
                                value={data.reason} 
                                onChange={e => setData('reason', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-teal-300 focus:border-teal-400 outline-none bg-slate-50 focus:bg-white transition-colors leading-relaxed"
                                rows="3"
                                placeholder="Tuliskan keterangan mendetail di sini..."
                            ></textarea>
                            {errors.reason && <p className="text-rose-500 text-xs mt-1.5 font-semibold">{errors.reason}</p>}
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 flex justify-between">
                                Lampiran Pendukung
                                <span className="text-teal-500 font-bold bg-teal-50 px-2 rounded-full">Bila Perlu (PDF/IMG)</span>
                            </label>
                            <input 
                                type="file" 
                                accept=".pdf,image/*"
                                onChange={e => setData('attachment', e.target.files[0])}
                                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-[10px] file:uppercase file:tracking-widest file:font-black file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100 bg-slate-50 transition-colors file:transition-colors file:cursor-pointer cursor-pointer"
                            />
                            {errors.attachment && <p className="text-rose-500 text-xs mt-1.5 font-semibold">{errors.attachment}</p>}
                        </div>

                        <div className="mt-8 flex gap-3 pt-8 border-t border-slate-100">
                            <button 
                                type="button" 
                                onClick={() => setShowModal(false)}
                                className="flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                            >
                                Batal
                            </button>
                            <button 
                                type="submit" 
                                disabled={processing}
                                className="flex-[2] py-4 rounded-xl font-black text-[10px] uppercase tracking-widest bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition-all shadow-xl shadow-emerald-200 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed"
                            >
                                {processing ? 'Tunggu Sebentar...' : 'Kirim Pengajuan Sekarang'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
