import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import { useForm } from '@inertiajs/react';
import { Trash2, AlertTriangle, UserX } from 'lucide-react';
import { useRef, useState } from 'react';

export default function DeleteUserForm({ className = '' }) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
    } = useForm({
        password: '',
    });

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header className="mb-8">
                <h2 className="text-xl font-black text-slate-900 border-l-4 border-rose-500 pl-3">
                    Hapus Akun
                </h2>
                <p className="mt-1 text-sm text-slate-500 font-medium ml-4">
                    Peringatan: Sekali akun Anda dihapus, semua data dan riwayat absensi akan dihilangkan secara permanen. Sebelum menghapus akun, harap unduh data apa pun yang ingin Anda pertahankan.
                </p>
            </header>

            <button 
                onClick={confirmUserDeletion}
                className="px-8 py-3.5 bg-white border border-rose-200 text-rose-500 rounded-xl font-black text-xs uppercase tracking-widest shadow-sm hover:bg-rose-50 hover:border-rose-300 active:scale-95 transition-all flex items-center gap-2"
            >
                <Trash2 className="w-4 h-4" /> Hapus Akun Secara Permanen
            </button>

            <Modal show={confirmingUserDeletion} onClose={closeModal} maxWidth="md">
                <div className="p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center border border-rose-100">
                            <AlertTriangle className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Apakah Anda Yakin?</h2>
                            <p className="text-[10px] font-bold text-rose-400 uppercase tracking-widest">Tindakan ini tidak dapat dibatalkan</p>
                        </div>
                    </div>

                    <p className="text-sm text-slate-500 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100 leading-relaxed font-medium">
                        Sekali akun dihapus, maka seluruh sumber daya, riwayat presensi, dan data cuti akan terhapus selamanya. Silakan masukkan kata sandi Anda untuk memastikan Anda ingin menghapus secara permanen.
                    </p>

                    <form onSubmit={deleteUser} className="space-y-6">
                        <div>
                            <label htmlFor="password" className="sr-only">Password</label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="block w-full px-4 py-3 rounded-xl border border-rose-200 text-sm font-medium focus:ring-2 focus:ring-rose-300 outline-none bg-rose-50/30 focus:bg-white transition-colors"
                                isFocused
                                placeholder="Masukkan Password Anda"
                            />
                            <InputError message={errors.password} className="mt-2 text-rose-500 font-bold text-[10px] uppercase" />
                        </div>

                        <div className="flex gap-3 pt-6 border-t border-slate-100">
                            <button 
                                type="button"
                                onClick={closeModal}
                                className="flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                            >
                                Batal
                            </button>
                            <button 
                                type="submit"
                                disabled={processing}
                                className="flex-[2] py-4 rounded-xl font-black text-[10px] uppercase tracking-widest bg-rose-500 text-white hover:bg-rose-600 active:scale-95 transition-all shadow-xl shadow-rose-200 disabled:opacity-50 disabled:active:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-transparent"
                            >
                                {processing ? 'Menghapus...' : <><UserX className="w-3.5 h-3.5" /> Hapus Akun</>}
                            </button>
                        </div>
                    </form>
                </div>
            </Modal>
        </section>
    );
}
