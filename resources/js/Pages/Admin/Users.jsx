import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import Modal from '@/Components/Modal';
import { Users as UsersIcon, Search, Plus, Edit2, Trash2, ShieldAlert, KeyRound, MonitorCog } from 'lucide-react';

export default function Users({ auth, users, shifts, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    
    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    const { data, setData, post, put, delete: destroy, processing, reset, errors, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        employee_id: '',
        department: '',
        position: '',
        shift_id: '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('admin.users'), { search }, { preserveState: true });
    };

    const openAddModal = () => {
        setIsEditing(false);
        setSelectedUser(null);
        clearErrors();
        reset();
        setShowModal(true);
    };

    const openEditModal = (user) => {
        setIsEditing(true);
        setSelectedUser(user);
        clearErrors();
        setData({
            name: user.name,
            email: user.email,
            password: '',
            employee_id: user.employee_id || '',
            department: user.department || '',
            position: user.position || '',
            shift_id: user.shift_id || '',
        });
        setShowModal(true);
    };

    const submitForm = (e) => {
        e.preventDefault();
        if (isEditing) {
            put(route('admin.users.update', selectedUser.id), {
                onSuccess: () => setShowModal(false)
            });
        } else {
            post(route('admin.users.store'), {
                onSuccess: () => {
                    reset();
                    setShowModal(false);
                }
            });
        }
    };

    const deleteUser = (id) => {
        if (confirm('Apakah Anda yakin ingin menghapus user ini?')) {
            destroy(route('admin.users.destroy', id));
        }
    };

    const resetFace = (id) => {
        if (confirm('Are you sure you want to reset this user\'s face biometric?')) {
            post(route('admin.users.reset-face', id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex items-center gap-2 text-slate-800">
                    <UsersIcon className="w-5 h-5 text-emerald-600" />
                    <h2 className="font-semibold text-xl leading-tight">Manajemen Database Karyawan</h2>
                </div>
            }
        >
            <Head title="Manajemen Karyawan" />

            <div className="py-12 bg-slate-50 min-h-screen">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                        <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
                            <div className="relative w-full md:w-80">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className="w-4 h-4 text-slate-400" />
                                </div>
                                <input 
                                    type="text" 
                                    placeholder="Cari NIP, Nama, Email..." 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-11 pr-5 py-3 rounded-2xl border-slate-200 text-sm w-full shadow-sm focus:border-teal-500 focus:ring-teal-500 bg-slate-50"
                                />
                            </div>
                            <button type="submit" className="px-6 py-3 bg-teal-50 text-teal-700 font-black text-sm uppercase rounded-2xl hover:bg-teal-100 transition shadow-sm">
                                Cari
                            </button>
                        </form>
                        <button 
                            onClick={openAddModal}
                            className="w-full md:w-auto px-8 py-3 bg-emerald-600 text-white font-black text-sm uppercase rounded-2xl hover:bg-emerald-700 active:scale-95 transition-all shadow-xl shadow-emerald-200 flex items-center justify-center gap-2"
                        >
                            <Plus className="w-5 h-5" /> Tambah Karyawan
                        </button>
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-slate-100">
                        <div className="overflow-x-auto text-left">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b border-slate-100">
                                        <th className="px-8 py-6 rounded-tl-[2rem]">Profil Pekerja</th>
                                        <th className="px-6 py-6">Divisi & Jabatan</th>
                                        <th className="px-6 py-6 text-center">Biometrik Wajah</th>
                                        <th className="px-6 py-6 text-center">Hak Akses</th>
                                        <th className="px-8 py-6 text-right rounded-tr-[2rem]">Aksi Managerial</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {users.data.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-50/80 transition-colors group">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-700 font-black flex items-center justify-center text-lg shadow-sm group-hover:bg-teal-600 group-hover:text-white transition-colors overflow-hidden border border-teal-200">
                                                        {user.avatar ? (
                                                            <img src={`/storage/${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                                                        ) : (
                                                            user.name[0]
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-800">{user.name}</p>
                                                        <p className="text-xs font-bold text-slate-500">{user.email}</p>
                                                        <div className="mt-1 flex gap-2">
                                                            <span className="text-[10px] bg-white text-slate-500 px-2 py-0.5 rounded-md font-bold tracking-widest border border-slate-200 shadow-sm">{user.employee_id || 'NO NIP'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-6">
                                                <p className="text-sm font-black text-slate-700">{user.department || '-'}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.position || '-'}</p>
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <div className={`px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 text-[10px] font-black uppercase shadow-sm ${user.face_enrolled ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full ${user.face_enrolled ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></span>
                                                    {user.face_enrolled ? 'TERDAFTAR' : 'BELUM'}
                                                </div>
                                                {user.face_enrolled && (
                                                    <div className="mt-2">
                                                        <button 
                                                            onClick={() => resetFace(user.id)}
                                                            className="text-[10px] font-bold text-rose-500 hover:text-rose-700 uppercase underline flex items-center justify-center gap-1 w-full"
                                                        >
                                                            <ShieldAlert className="w-3 h-3" /> Reset Wajah
                                                        </button>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-6 text-center">
                                                <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase inline-flex items-center gap-1.5 shadow-sm border ${user.role === 'admin' ? 'bg-teal-50 text-teal-700 border-teal-100' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                                    {user.role === 'admin' ? <MonitorCog className="w-3 h-3" /> : <UsersIcon className="w-3 h-3" />}
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-8 py-6 text-right space-x-2">
                                                <button 
                                                    onClick={() => openEditModal(user)}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase bg-white border border-slate-200 text-slate-600 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 transition-all active:scale-95 shadow-sm"
                                                >
                                                    <Edit2 className="w-3 h-3" /> Edit
                                                </button>
                                                <button 
                                                    onClick={() => deleteUser(user.id)}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all active:scale-95 shadow-sm"
                                                >
                                                    <Trash2 className="w-3 h-3" /> Hapus
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {users.data.length === 0 && (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-16 text-center">
                                                <UsersIcon className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                                <p className="text-slate-500 font-bold text-sm">Belum ada user atau pegawai tidak ditemukan.</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Pagination */}
                    {users.links.length > 3 && (
                        <div className="mt-8 flex justify-center gap-2">
                            {users.links.map((link, i) => (
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

            {/* Modal Tambah/Edit User */}
            <Modal show={showModal} onClose={() => setShowModal(false)} maxWidth="lg">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
                            {isEditing ? <Edit2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        </div>
                        <h2 className="text-2xl font-black text-slate-900">
                            {isEditing ? 'Edit Karyawan' : 'Tambah Karyawan'}
                        </h2>
                    </div>

                    <form onSubmit={submitForm} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Nama Lengkap</label>
                                <input 
                                    type="text" 
                                    value={data.name} 
                                    onChange={e => setData('name', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-teal-300 focus:border-teal-400 outline-none bg-slate-50 focus:bg-white transition-colors"
                                />
                                {errors.name && <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.name}</p>}
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Email</label>
                                <input 
                                    type="email" 
                                    value={data.email} 
                                    onChange={e => setData('email', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-teal-300 focus:border-teal-400 outline-none bg-slate-50 focus:bg-white transition-colors"
                                />
                                {errors.email && <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.email}</p>}
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">NIP / NIM</label>
                                <input 
                                    type="text" 
                                    value={data.employee_id} 
                                    onChange={e => setData('employee_id', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-teal-300 focus:border-teal-400 outline-none bg-slate-50 focus:bg-white transition-colors"
                                />
                                {errors.employee_id && <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.employee_id}</p>}
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Divisi</label>
                                <input 
                                    type="text" 
                                    value={data.department} 
                                    onChange={e => setData('department', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-teal-300 focus:border-teal-400 outline-none bg-slate-50 focus:bg-white transition-colors"
                                />
                                {errors.department && <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.department}</p>}
                            </div>

                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Jabatan</label>
                                <input 
                                    type="text" 
                                    value={data.position} 
                                    onChange={e => setData('position', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-teal-300 focus:border-teal-400 outline-none bg-slate-50 focus:bg-white transition-colors"
                                />
                                {errors.position && <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.position}</p>}
                            </div>

                            <div className="col-span-2">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Shift Kerja (Opsional)</label>
                                <select 
                                    value={data.shift_id} 
                                    onChange={e => setData('shift_id', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-teal-300 focus:border-teal-400 outline-none bg-white transition-colors cursor-pointer"
                                >
                                    <option value="">-- Pilih Shift (Tidak Ada) --</option>
                                    {shifts.map(shift => (
                                        <option key={shift.id} value={shift.id}>
                                            {shift.name} ({shift.start_time.substring(0,5)} - {shift.end_time.substring(0,5)})
                                        </option>
                                    ))}
                                </select>
                                {errors.shift_id && <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.shift_id}</p>}
                            </div>

                            <div className="col-span-2">
                                <label className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                                    <KeyRound className="w-3 h-3" /> Password 
                                    {isEditing && <span className="font-normal text-slate-400 normal-case">(Kosongkan jika tidak mau diganti)</span>}
                                </label>
                                <input 
                                    type="password" 
                                    value={data.password} 
                                    onChange={e => setData('password', e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-teal-300 focus:border-teal-400 outline-none bg-slate-50 focus:bg-white transition-colors"
                                    placeholder={isEditing ? '********' : 'Minimal 8 karakter'}
                                />
                                {errors.password && <p className="text-rose-500 text-xs mt-1 font-semibold">{errors.password}</p>}
                            </div>
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
                                {processing ? 'Menyimpan...' : 'Simpan Pegawai'}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
