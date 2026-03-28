import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';
import { UserCircle } from 'lucide-react';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-2 text-slate-800">
                    <UserCircle className="w-5 h-5 text-emerald-600" />
                    <h2 className="font-semibold text-xl leading-tight">Pengaturan Profil</h2>
                </div>
            }
        >
            <Head title="Profile" />

            <div className="py-12 bg-slate-50 min-h-screen">
                <div className="mx-auto max-w-5xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-6 shadow-sm border border-slate-100 sm:rounded-[2.5rem] sm:p-10">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="bg-white p-6 shadow-sm border border-slate-100 sm:rounded-[2.5rem] sm:p-10">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="bg-white p-6 shadow-sm border border-rose-100 sm:rounded-[2.5rem] sm:p-10">
                        <DeleteUserForm className="max-w-xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
