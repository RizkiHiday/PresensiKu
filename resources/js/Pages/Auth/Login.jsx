import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import { Head, Link, useForm } from '@inertiajs/react';
import { ShieldCheck, Eye, MapPin, ScanFace, LogIn } from 'lucide-react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen flex bg-slate-950">
            <Head title="Login — PresensiKu" />

            {/* Left Branding Panel */}
            <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 flex-col items-center justify-center p-16 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-300/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-80 h-80 bg-teal-400/20 rounded-full translate-x-1/4 translate-y-1/4 blur-3xl"></div>

                <div className="relative z-10 text-center w-full max-w-lg">
                    {/* Logo Icon */}
                    <div className="w-24 h-24 bg-white/10 border border-white/20 backdrop-blur-xl rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl">
                        <ScanFace className="w-12 h-12 text-white" />
                    </div>

                    <h1 className="text-5xl font-black text-white mb-4 tracking-tight">PresensiKu</h1>
                    <p className="text-emerald-100 text-xl font-medium mb-12">Sistem Absensi Wajah<br />Anti-Kecurangan Generasi Baru</p>

                    {/* Feature list */}
                    <div className="space-y-4 text-left">
                        {[
                            { icon: ShieldCheck, text: 'Anti-Gravity Multi-Layer Security' },
                            { icon: Eye, text: 'Liveness Detection (Blink Check)' },
                            { icon: MapPin, text: 'Validasi Lokasi GPS Real-time' },
                        ].map((f, i) => (
                            <div key={i} className="flex items-center gap-4 bg-black/10 border border-white/10 rounded-2xl px-6 py-4 backdrop-blur-sm shadow-sm hover:bg-black/20 transition-colors">
                                <f.icon className="w-6 h-6 text-emerald-300" />
                                <span className="text-white shadow-sm font-semibold text-sm tracking-wide">{f.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Login Panel */}
            <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
                <div className="w-full max-w-md space-y-8">
                    {/* Mobile logo */}
                    <div className="lg:hidden text-center flex flex-col items-center">
                        <ScanFace className="w-16 h-16 text-emerald-600 mb-3" />
                        <h1 className="text-3xl font-black text-emerald-600 mb-2">PresensiKu</h1>
                    </div>

                    <div>
                        <h2 className="text-4xl font-black text-gray-900 tracking-tight">Masuk</h2>
                        <p className="text-gray-400 font-medium mt-2">Selamat datang kembali. Masuk ke akun Anda.</p>
                    </div>

                    {status && (
                        <div className="p-4 rounded-2xl bg-green-50 border border-green-100 text-sm font-bold text-green-600">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                autoComplete="username"
                                autoFocus
                                onChange={(e) => setData('email', e.target.value)}
                                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 bg-white focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all outline-none font-medium text-slate-900 placeholder-slate-300 shadow-sm"
                                placeholder="email@perusahaan.com"
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                autoComplete="current-password"
                                onChange={(e) => setData('password', e.target.value)}
                                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 bg-white focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 transition-all outline-none font-medium text-slate-900 placeholder-slate-300 shadow-sm"
                                placeholder="••••••••"
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                />
                                <span className="text-sm font-bold text-slate-600">Ingat saya</span>
                            </label>

                            {canResetPassword && (
                                <Link href={route('password.request')} className="text-sm font-bold text-teal-600 hover:text-teal-700 transition-colors">
                                    Lupa password?
                                </Link>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full py-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg tracking-tight transition-all shadow-xl shadow-emerald-200 active:scale-[0.98] disabled:opacity-60 flex items-center justify-center gap-3"
                        >
                            {processing ? (
                                <>
                                    <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                                    Memverifikasi...
                                </>
                            ) : (
                                <><LogIn className="w-6 h-6" /> Masuk ke PresensiKu</>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-gray-400 font-medium">
                        Sistem Absensi Internal. Hubungi HRD untuk masalah akun.
                    </p>
                </div>
            </div>
        </div>
    );
}
