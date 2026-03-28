import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Camera, Save, User as UserIcon, Mail, Phone, MapPin } from 'lucide-react';
import { useState, useRef } from 'react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}) {
    const user = usePage().props.auth.user;
    const fileInputRef = useRef(null);
    const [previewPhoto, setPreviewPhoto] = useState(user.avatar ? `/storage/${user.avatar}` : null);

    const { data, setData, post, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
            phone: user.phone || '',
            address: user.address || '',
            avatar: null,
            _method: 'patch',
        });

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('avatar', file);
            setPreviewPhoto(URL.createObjectURL(file));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('profile.update'), {
            preserveScroll: true,
            forceFormData: true,
        });
    };

    return (
        <section className={className}>
            <header className="mb-8">
                <h2 className="text-xl font-black text-slate-900 border-l-4 border-emerald-500 pl-3">
                    Informasi Profil
                </h2>
                <p className="mt-1 text-sm text-slate-500 font-medium ml-4">
                    Perbarui informasi akun, alamat email, dan foto profil Anda.
                </p>
            </header>

            <form onSubmit={submit} className="space-y-6" encType="multipart/form-data">
                {/* Photo Upload Section */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-100">
                    <div className="relative group shrink-0">
                        <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-xl bg-teal-50 flex items-center justify-center text-teal-300">
                            {previewPhoto ? (
                                <img src={previewPhoto} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon className="w-12 h-12" />
                            )}
                        </div>
                        <button 
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 p-2.5 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 hover:scale-110 active:scale-95 transition-all border-2 border-white"
                        >
                            <Camera className="w-4 h-4" />
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef}
                            className="hidden" 
                            accept="image/*"
                            onChange={handlePhotoChange}
                        />
                    </div>
                    <div className="text-center sm:text-left pt-2 pb-2">
                        <h4 className="font-black text-slate-800 text-lg">{user.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">NIP/ID: {user.employee_id || '-'}</p>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                                {user.role === 'admin' ? 'Administrator' : 'Karyawan'}
                            </span>
                            {user.department && (
                                <span className="text-[11px] font-bold tracking-widest text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                                    Divisi: <span className="font-black">{user.department}</span>
                                </span>
                            )}
                            {user.position && (
                                <span className="text-[11px] font-bold tracking-widest text-slate-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                                    Jabatan: <span className="font-black">{user.position}</span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <InputLabel htmlFor="name" className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                            <UserIcon className="w-3.5 h-3.5" /> Nama Lengkap
                        </InputLabel>
                        <TextInput
                            id="name"
                            className="block w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-teal-300 outline-none bg-slate-50 focus:bg-white transition-colors"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            isFocused
                            autoComplete="name"
                        />
                        <InputError className="mt-2 text-rose-500 font-bold text-[10px] uppercase" message={errors.name} />
                    </div>

                    <div>
                        <InputLabel htmlFor="email" className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                            <Mail className="w-3.5 h-3.5" /> Email
                        </InputLabel>
                        <TextInput
                            id="email"
                            type="email"
                            className="block w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-teal-300 outline-none bg-slate-50 focus:bg-white transition-colors"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                        />
                        <InputError className="mt-2 text-rose-500 font-bold text-[10px] uppercase" message={errors.email} />
                    </div>

                    <div>
                        <InputLabel htmlFor="phone" className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                            <Phone className="w-3.5 h-3.5" /> No. HP / WhatsApp
                        </InputLabel>
                        <TextInput
                            id="phone"
                            className="block w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-teal-300 outline-none bg-slate-50 focus:bg-white transition-colors"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            autoComplete="tel"
                        />
                        <InputError className="mt-2 text-rose-500 font-bold text-[10px] uppercase" message={errors.phone} />
                    </div>
                </div>

                <div>
                    <InputLabel htmlFor="address" className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                        <MapPin className="w-3.5 h-3.5" /> Alamat Lengkap
                    </InputLabel>
                    <textarea
                        id="address"
                        className="block w-full px-4 py-3 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-teal-300 focus:border-teal-400 outline-none bg-slate-50 focus:bg-white transition-colors"
                        value={data.address}
                        onChange={(e) => setData('address', e.target.value)}
                        rows="3"
                    ></textarea>
                    <InputError className="mt-2 text-rose-500 font-bold text-[10px] uppercase" message={errors.address} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                        <p className="text-sm text-amber-800 font-bold flex flex-col gap-2">
                            <span>Email Anda belum diverifikasi.</span>
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="w-max px-4 py-2 bg-amber-500 text-white rounded-lg text-xs font-black uppercase tracking-widest hover:bg-amber-600 transition-colors shadow-sm"
                            >
                                Kirim Ulang Link Verifikasi
                            </Link>
                        </p>
                        {status === 'verification-link-sent' && (
                            <div className="mt-3 text-[11px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                                ✓ Link verifikasi baru telah dikirimkan.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
                    <button 
                        type="submit" 
                        disabled={processing}
                        className="px-8 py-3.5 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-200 hover:bg-emerald-700 active:scale-95 transition-all flex items-center gap-2 border border-transparent disabled:opacity-50"
                    >
                        {processing ? (
                            <div className="w-4 h-4 border-2 border-white rounded-full border-t-transparent animate-spin"></div>
                        ) : (
                            <Save className="w-4 h-4" />
                        )} 
                        Simpan Profil
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
                            ✓ Berhasil Disimpan.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
