import FarmersDashboardLayout from '@/Layouts/FarmerDashboardLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import {
    BadgeCheck,
    MapPin,
    Phone,
    Sprout,
    UserRound,
} from 'lucide-react';
import type { ReactElement } from 'react';

type FarmerProfile = {
    farm_name: string;
    farm_complete_address: string;
    latitude: string | null;
    longitude: string | null;
    contact_number: string;
};

type Props = {
    farmerProfile: FarmerProfile | null;
};

export default function Profile({ farmerProfile }: Props): ReactElement {
    const { auth } = usePage().props;

    return (
        <FarmersDashboardLayout title="My Profile">
            <Head title="Farmer Profile" />

            <div className="mx-auto max-w-3xl space-y-5">
                <section className="overflow-hidden rounded-3xl bg-emerald-950 text-white shadow-lg shadow-emerald-950/15">
                    <div className="bg-[radial-gradient(circle_at_top_right,_rgba(106,178,37,0.38),_transparent_45%)] p-6 sm:p-8">
                        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25">
                                    <UserRound size={31} />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-emerald-100">
                                        Farmer profile
                                    </p>
                                    <h1 className="mt-1 truncate text-2xl font-extrabold tracking-tight">
                                        {auth.user.name}
                                    </h1>
                                    <p className="mt-1 truncate text-sm text-emerald-100">
                                        {auth.user.email}
                                    </p>
                                </div>
                            </div>

                            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#6ab225] px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-emerald-950">
                                <BadgeCheck size={16} />
                                Farmer account
                            </span>
                        </div>
                    </div>
                </section>

                {farmerProfile ? (
                    <>
                        <section className="rounded-3xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-7">
                            <div className="flex items-start gap-4">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#6ab225]/10 text-[#03592f]">
                                    <Sprout size={22} />
                                </div>

                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-500">
                                        Farm
                                    </p>
                                    <h2 className="mt-1 text-xl font-bold text-gray-900">
                                        {farmerProfile.farm_name}
                                    </h2>
                                </div>
                            </div>

                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <ProfileDetail
                                    icon={MapPin}
                                    label="Farm address"
                                    value={farmerProfile.farm_complete_address}
                                />
                                <ProfileDetail
                                    icon={Phone}
                                    label="Contact number"
                                    value={farmerProfile.contact_number}
                                />
                            </div>

                            {farmerProfile.latitude && farmerProfile.longitude && (
                                <p className="mt-5 text-xs text-gray-400">
                                    Location: {farmerProfile.latitude},{' '}
                                    {farmerProfile.longitude}
                                </p>
                            )}
                        </section>

                        <Link
                            href="/create-agri-resource-listing"
                            className="flex items-center justify-between rounded-2xl bg-[#6ab225] px-5 py-4 font-bold text-white shadow-sm transition hover:bg-[#5d9e20] focus:outline-none focus:ring-4 focus:ring-[#6ab225]/25"
                        >
                            Create a resource listing
                            <Sprout size={20} />
                        </Link>
                    </>
                ) : (
                    <section className="rounded-3xl border border-dashed border-emerald-200 bg-white p-8 text-center shadow-sm">
                        <Sprout className="mx-auto text-[#6ab225]" size={34} />
                        <h2 className="mt-4 text-lg font-bold text-gray-900">
                            Your farm profile is not set up yet
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-gray-500">
                            Add your farm details to help processors understand
                            where your surplus resources come from.
                        </p>
                    </section>
                )}
            </div>
        </FarmersDashboardLayout>
    );
}

function ProfileDetail({
    icon: Icon,
    label,
    value,
}: {
    icon: typeof MapPin;
    label: string;
    value: string;
}): ReactElement {
    return (
        <div className="flex gap-3 rounded-2xl bg-[#f7faf7] p-4">
            <Icon className="mt-0.5 shrink-0 text-[#03592f]" size={19} />
            <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {label}
                </p>
                <p className="mt-1 break-words text-sm font-semibold text-gray-800">
                    {value}
                </p>
            </div>
        </div>
    );
}
