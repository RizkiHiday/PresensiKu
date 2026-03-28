import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import { Clock, Plus, Edit2, Trash2, Sunrise, Sunset, Timer, Users } from 'lucide-react';

export default function Shifts({ auth, shifts }) {
    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedShift, setSelectedShift] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, reset, errors, clearErrors } = useForm({
        name: '',
        start_time: '',
        end_time: '',
        late_tolerance: 0,
    });

    const openAddModal = () => {
        setIsEditing(false);
        setSelectedShift(null);
        clearErrors();
        reset();
        setShowModal(true);
    };

    const openEditModal = (shift) => {
        setIsEditing(true);
        setSelectedShift(shift);
        clearErrors();
        setData({
            name: shift.name,
            start_time: (shift.start_time || '').substring(0, 5), // '08:00:00' -> '08:00'
            end_time: (shift.end_time || '').substring(0, 5),
            late_tolerance: shift.late_tolerance || 0,
        });
        setShowModal(true);
    };

    const submitForm = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('admin.shifts.update', selectedShift.id), {
                onSuccess: () => setShowModal(false)
            });
        } else {
            post(route('admin.shifts.store'), {
                onSuccess: () => {
                    reset();
                    setShowModal(false);
                }
            });
        }
    };

    const deleteShift = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus shift ini? User terkait mungkin tidak punya shift logis.')) {
            destroy(route('admin.shifts.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-2 text-slate-800">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    <h2 className="font-semibold text-xl leading-tight">Manajemen Shift & Jadwal</h2>
                </div>
            }
        >
            <Head title="Manajemen Shift" />

            <div className="py-12 bg-slate-50 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row justify-between items-center sm:items-end gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                        <div className="w-full sm:w-auto text-center sm:text-left">
                            <h3 className="font-black text-xl text-slate-900 border-l-4 border-emerald-500 pl-3">Daftar Shift</h3>
                            <p className="text-slate-500 text-sm mt-1">Kelola aturan jam kerja masuk dan pulang karyawan.</p>
                        </div>
                        <button 
                            onClick={openAddModal}
                            className="w-full sm:w-auto px-8 py-3 bg-emerald-600 text-white font-black text-sm uppercase rounded-2xl hover:bg-emerald-700 active:scale-95 transition-all shadow-xl shadow-emerald-200 flex items-center justify-center gap-2"
                        >
                            <Plus className="w-5 h-5" /> Tambah Shift
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {shifts.map((shift) => (
                            <div key={shift.id} className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-sm border border-slate-100 relative group transition-all hover:shadow-lg hover:border-teal-100">
                                <h4 className="text-xl font-black text-slate-900 group-hover:text-teal-700 transition-colors">{shift.name}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 mb-6 flex items-center gap-1.5">
                                    <Users className="w-3 h-3 text-slate-300" /> {shift.users_count} Karyawan Terdaftar
                                </p>
                                
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                                                <Sunrise className="w-4 h-4" />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jam Masuk</span>
                                        </div>
                                        <span className="font-black text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 shadow-sm">{(shift.start_time || '').substring(0, 5)}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-4 border-b border-slate-50">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-orange-50 text-orange-500 flex items-center justify-center">
                                                <Sunset className="w-4 h-4" />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Jam Pulang</span>
                                        </div>
                                        <span className="font-black text-slate-700 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">{(shift.end_time || '').substring(0, 5)}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center">
                                                <Timer className="w-4 h-4" />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Toleransi</span>
                                        </div>
                                        <span className="font-black text-rose-600">{shift.late_tolerance} Menit</span>
                                    </div>
                                </div>

                                <div className="absolute top-6 right-6 flex opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 drop-shadow-sm border border-slate-100 rounded-xl overflow-hidden shadow-md">
                                    <button 
                                        onClick={() => openEditModal(shift)}
                                        className="w-10 h-10 flex items-center justify-center bg-white text-slate-500 hover:bg-teal-50 hover:text-teal-700 active:bg-teal-100 transition-colors border-r border-slate-100"
                                        title="Edit"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={() => deleteShift(shift.id)}
                                        className="w-10 h-10 flex items-center justify-center bg-white text-rose-400 hover:bg-rose-500 hover:text-white active:bg-rose-600 transition-colors"
                                        title="Hapus"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}

                        {shifts.length === 0 && (
                            <div className="col-span-1 md:col-span-2 lg:col-span-3 border-2 border-dashed border-slate-200 rounded-[2rem] p-16 text-center flex flex-col items-center justify-center bg-white">
                                <Clock className="w-16 h-16 text-slate-200 mb-4" />
                                <p className="text-slate-500 font-bold">Belum ada data shift operasional.</p>
                                <button onClick={openAddModal} className="mt-4 text-teal-600 font-black text-sm uppercase flex items-center gap-1 hover:underline hover:text-teal-700">
                                    <Plus className="w-4 h-4" /> Jadwalkan Shift Baru
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Tambah/Edit */}
            <Modal show={showModal} onClose={() => setShowModal(false)} maxWidth="md">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
                            {isEditing ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">
                            {isEditing ? 'Edit Shift' : 'Tambah Shift'}
                        </h2>
                    </div>

                    <form onSubmit={submitForm} className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Nama Shift</label>
                            <input 
                                type="text" 
                                value={data.name} 
                                onChange={e => setData('name', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-teal-300 focus:border-teal-400 outline-none bg-slate-50 focus:bg-white transition-colors"
                                placeholder="Contoh: Shift Pagi / Office Hour"
                            />
                            {errors.name && <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.name}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            {/* Jam Masuk */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600">
                                    <Sunrise className="w-3 h-3" /> Jam Masuk (24h)
                                </label>
                                <div className="flex items-center gap-1">
                                    <select 
                                        value={(data.start_time || '00:00').split(':')[0]}
                                        onChange={e => {
                                            const mins = (data.start_time || '00:00').split(':')[1];
                                            setData('start_time', `${e.target.value}:${mins}`);
                                        }}
                                        className="flex-1 py-3 px-2 rounded-xl border border-slate-200 text-sm font-black text-emerald-700 bg-white focus:ring-2 focus:ring-teal-300 focus:border-teal-400 outline-none appearance-none text-center"
                                    >
                                        {Array.from({length: 24}).map((_, i) => {
                                            const h = i.toString().padStart(2, '0');
                                            return <option key={h} value={h}>{h}</option>;
                                        })}
                                    </select>
                                    <span className="font-black text-slate-400">:</span>
                                    <select 
                                        value={(data.start_time || '00:00').split(':')[1]}
                                        onChange={e => {
                                            const hour = (data.start_time || '00:00').split(':')[0];
                                            setData('start_time', `${hour}:${e.target.value}`);
                                        }}
                                        className="flex-1 py-3 px-2 rounded-xl border border-slate-200 text-sm font-black text-emerald-700 bg-white focus:ring-2 focus:ring-teal-300 focus:border-teal-400 outline-none appearance-none text-center"
                                    >
                                        {Array.from({length: 60}).map((_, i) => {
                                            const m = i.toString().padStart(2, '0');
                                            return <option key={m} value={m}>{m}</option>;
                                        })}
                                    </select>
                                </div>
                                {errors.start_time && <p className="text-rose-500 text-[10px] mt-1 font-semibold">{errors.start_time}</p>}
                            </div>

                            {/* Jam Pulang */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    <Sunset className="w-3 h-3" /> Jam Pulang (24h)
                                </label>
                                <div className="flex items-center gap-1">
                                    <select 
                                        value={(data.end_time || '00:00').split(':')[0]}
                                        onChange={e => {
                                            const mins = (data.end_time || '00:00').split(':')[1];
                                            setData('end_time', `${e.target.value}:${mins}`);
                                        }}
                                        className="flex-1 py-3 px-2 rounded-xl border border-slate-200 text-sm font-black text-slate-700 bg-white focus:ring-2 focus:ring-teal-300 focus:border-teal-400 outline-none appearance-none text-center"
                                    >
                                        {Array.from({length: 24}).map((_, i) => {
                                            const h = i.toString().padStart(2, '0');
                                            return <option key={h} value={h}>{h}</option>;
                                        })}
                                    </select>
                                    <span className="font-black text-slate-400">:</span>
                                    <select 
                                        value={(data.end_time || '00:00').split(':')[1]}
                                        onChange={e => {
                                            const hour = (data.end_time || '00:00').split(':')[0];
                                            setData('end_time', `${hour}:${e.target.value}`);
                                        }}
                                        className="flex-1 py-3 px-2 rounded-xl border border-slate-200 text-sm font-black text-slate-700 bg-white focus:ring-2 focus:ring-teal-300 focus:border-teal-400 outline-none appearance-none text-center"
                                    >
                                        {Array.from({length: 60}).map((_, i) => {
                                            const m = i.toString().padStart(2, '0');
                                            return <option key={m} value={m}>{m}</option>;
                                        })}
                                    </select>
                                </div>
                                {errors.end_time && <p className="text-rose-500 text-[10px] mt-1 font-semibold">{errors.end_time}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                                <Timer className="w-3 h-3" /> Toleransi Keterlambatan (Menit)
                            </label>
                            <input 
                                type="number" 
                                value={data.late_tolerance} 
                                onChange={e => setData('late_tolerance', e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-teal-300 focus:border-teal-400 outline-none bg-slate-50 focus:bg-white transition-colors text-center"
                                placeholder="0"
                                min="0"
                            />
                            {errors.late_tolerance && <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.late_tolerance}</p>}
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
                                {processing ? 'Menyimpan...' : 'Simpan Shift'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
