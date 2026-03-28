import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { LayoutDashboard, LogOut, Settings2, UserCircle, ScanFace, Menu, X, MonitorCog } from 'lucide-react';

export default function AuthenticatedLayout({ header, children }) {
    const user = usePage().props.auth.user;

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    return (
        <div className="min-h-screen bg-slate-50">
            <nav className="border-b border-slate-200 bg-white sticky top-0 z-50">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center">
                                <Link href="/" className="flex items-center gap-2 group">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform shadow-md shadow-emerald-200">
                                        <ScanFace className="w-6 h-6" />
                                    </div>
                                    <span className="font-black text-xl text-slate-800 tracking-tight hidden sm:block">Presensi<span className="text-emerald-500">Ku</span></span>
                                </Link>
                            </div>

                            <div className="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                                <NavLink
                                    href={route('dashboard')}
                                    active={route().current('dashboard')}
                                    className="flex items-center gap-2"
                                >
                                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                                </NavLink>
                                {user.role === 'admin' && (
                                    <NavLink
                                        href={route('admin.dashboard')}
                                        active={route().current('admin.dashboard')}
                                        className="flex items-center gap-2 text-emerald-600 border-emerald-500 hover:text-emerald-700 hover:border-emerald-600 focus:text-emerald-700"
                                    >
                                        <MonitorCog className="w-4 h-4" /> Admin Panel
                                    </NavLink>
                                )}
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center">
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-1.5 text-sm font-bold leading-4 text-slate-600 transition duration-150 ease-in-out hover:text-slate-900 focus:outline-none hover:bg-slate-100"
                                            >
                                                <div className="w-6 h-6 rounded-full overflow-hidden bg-emerald-100 text-emerald-600 flex justify-center items-center shadow-sm">
                                                    {user.avatar ? (
                                                        <img src={`/storage/${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <span className="text-[10px] font-black">{user.name[0]}</span>
                                                    )}
                                                </div>
                                                <span className="hidden sm:inline-block">{user.name}</span>

                                                <svg
                                                    className="-me-0.5 h-4 w-4 text-slate-400"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link href={route('profile.edit')} className="flex items-center gap-2">
                                            <UserCircle className="w-4 h-4 text-slate-400" /> Profil
                                        </Dropdown.Link>
                                        <Dropdown.Link href={route('face.enrollment.show')} className="flex items-center gap-2">
                                            <ScanFace className="w-4 h-4 text-slate-400" /> Daftarkan Wajah
                                        </Dropdown.Link>
                                        <Dropdown.Link href={route('logout')} method="post" as="button" className="flex items-center gap-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50">
                                            <LogOut className="w-4 h-4" /> Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center p-2 rounded-xl text-slate-500 hover:bg-slate-100 focus:bg-slate-100 focus:outline-none transition-colors"
                            >
                                {showingNavigationDropdown ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>
                </div>

                <div className={(showingNavigationDropdown ? 'block' : 'hidden') + ' sm:hidden'}>
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink href={route('dashboard')} active={route().current('dashboard')}>
                            <div className="flex items-center gap-2">
                                <LayoutDashboard className="w-5 h-5" /> Dashboard
                            </div>
                        </ResponsiveNavLink>
                        {user.role === 'admin' && (
                            <ResponsiveNavLink href={route('admin.dashboard')} active={route().current('admin.dashboard')} className="!text-emerald-700 !border-emerald-500 !bg-emerald-50">
                                <div className="flex items-center gap-2">
                                    <MonitorCog className="w-5 h-5" /> Admin Panel
                                </div>
                            </ResponsiveNavLink>
                        )}
                    </div>

                    <div className="border-t border-slate-200 pb-1 pt-4">
                        <div className="px-5 mb-3 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-black overflow-hidden shadow-sm border border-emerald-200">
                                {user.avatar ? (
                                    <img src={`/storage/${user.avatar}`} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    user.name[0]
                                )}
                            </div>
                            <div>
                                <div className="text-sm font-black text-slate-800">{user.name}</div>
                                <div className="text-xs font-medium text-slate-500">{user.email}</div>
                            </div>
                        </div>

                        <div className="mt-3 space-y-1 pb-4">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                <div className="flex items-center gap-2"><UserCircle className="w-5 h-5 text-slate-400" /> Profil</div>
                            </ResponsiveNavLink>
                            <ResponsiveNavLink href={route('face.enrollment.show')}>
                                <div className="flex items-center gap-2"><ScanFace className="w-5 h-5 text-slate-400" /> Pengaturan Wajah</div>
                            </ResponsiveNavLink>
                            <ResponsiveNavLink method="post" href={route('logout')} as="button">
                                <div className="flex items-center gap-2 text-rose-500"><LogOut className="w-5 h-5" /> Keluar</div>
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow-[0_4px_20px_rgba(0,0,0,0.02)] relative z-40">
                    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main className="relative z-10">{children}</main>
        </div>
    );
}
