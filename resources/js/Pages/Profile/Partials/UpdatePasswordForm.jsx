import InputError from '@/Components/InputError';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { Lock, KeyRound, ShieldAlert, Key } from 'lucide-react';
import { useRef, useState } from 'react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();

    const [showPassword, setShowPassword] = useState(false);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header className="mb-8">
                <h2 className="text-xl font-black text-slate-900 border-l-4 border-amber-500 pl-3">
                    Perbarui Kata Sandi
                </h2>
                <p className="mt-1 text-sm text-slate-500 font-medium ml-4 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                    Pastikan akun Anda menggunakan kata sandi yang panjang & acak untuk keamanan.
                </p>
            </header>

            <form onSubmit={updatePassword} className="space-y-6">
                <div>
                    <label htmlFor="current_password" className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                        <Lock className="w-3.5 h-3.5" /> Kata Sandi Saat Ini
                    </label>
                    <input
                        id="current_password"
                        ref={currentPasswordInput}
                        value={data.current_password}
                        onChange={(e) => setData('current_password', e.target.value)}
                        type={showPassword ? 'text' : 'password'}
                        className="block w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-amber-300 outline-none bg-slate-50 focus:bg-white transition-colors"
                        autoComplete="current-password"
                    />
                    <InputError message={errors.current_password} className="mt-2 text-rose-500 font-bold text-[10px] uppercase" />
                </div>

                <div>
                    <label htmlFor="password" className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                        <Key className="w-3.5 h-3.5" /> Kata Sandi Baru
                    </label>
                    <input
                        id="password"
                        ref={passwordInput}
                        value={data.password}
                        onChange={(e) => setData('password', e.target.value)}
                        type={showPassword ? 'text' : 'password'}
                        className="block w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-amber-300 outline-none bg-slate-50 focus:bg-white transition-colors"
                        autoComplete="new-password"
                    />
                    <InputError message={errors.password} className="mt-2 text-rose-500 font-bold text-[10px] uppercase" />
                </div>

                <div>
                    <label htmlFor="password_confirmation" className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                        <KeyRound className="w-3.5 h-3.5" /> Konfirmasi Kata Sandi Baru
                    </label>
                    <input
                        id="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) => setData('password_confirmation', e.target.value)}
                        type={showPassword ? 'text' : 'password'}
                        className="block w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-amber-300 outline-none bg-slate-50 focus:bg-white transition-colors"
                        autoComplete="new-password"
                    />
                    <InputError message={errors.password_confirmation} className="mt-2 text-rose-500 font-bold text-[10px] uppercase" />
                </div>

                <div className="flex items-center gap-2">
                    <input 
                        type="checkbox" 
                        id="showPass"
                        checked={showPassword} 
                        onChange={() => setShowPassword(!showPassword)}
                        className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 cursor-pointer"
                    />
                    <label htmlFor="showPass" className="text-xs font-bold text-slate-500 cursor-pointer">Tampilkan Kata Sandi</label>
                </div>

                <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
                    <button 
                        type="submit" 
                        disabled={processing}
                        className="px-8 py-3.5 bg-amber-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-200 hover:bg-amber-600 active:scale-95 transition-all flex items-center gap-2 border border-transparent disabled:opacity-50"
                    >
                        {processing ? (
                            <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                        ) : (
                            <KeyRound className="w-4 h-4" />
                        )} 
                        Ganti Kata Sandi
                    </button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-out duration-300"
                        enterFrom="opacity-0 translate-y-2"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <p className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 shadow-sm flex items-center gap-1.5">
                            ✓ Kata Sandi Diperbarui.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
