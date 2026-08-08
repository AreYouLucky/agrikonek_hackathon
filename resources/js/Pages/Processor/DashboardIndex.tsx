import { Head, Link } from '@inertiajs/react';
import ProcessorLayouts from '@/Layouts/ProcessorLayouts';
import {
    ArrowRight,
    Building2,
    CalendarDays,
    ClipboardList,
    Leaf,
    PackageSearch,
    PhilippinePeso,
    Scale,
    TrendingDown,
} from 'lucide-react';

type ProcessorProfile = {
    business_name: string;
    business_type: string;
    complete_address: string;
    contact_number: string | null;
};

type DashboardStats = {
    total_demands: number;
    total_quantity: number;
    average_price: number;
};

type RecentDemand = {
    id: number;
    resource: string;
    quantity: number;
    price: number;
    remarks: string | null;
    posted_at: string | null;
};

type DashboardIndexProps = {
    processorProfile: ProcessorProfile | null;
    stats: DashboardStats;
    recentDemands: RecentDemand[];
};

function formatNumber(value: number): string {
    return Number(value).toLocaleString(undefined, {
        maximumFractionDigits: 2,
    });
}

function formatCurrency(value: number): string {
    return `PHP ${formatNumber(value)}`;
}

export default function DashboardIndex({
    processorProfile,
    stats,
    recentDemands,
}: DashboardIndexProps) {
    const summaryCards = [
        {
            label: 'Active demands',
            value: stats.total_demands.toString(),
            helper: 'Resource requests you have posted',
            icon: PackageSearch,
        },
        {
            label: 'Total quantity',
            value: `${formatNumber(stats.total_quantity)} KG`,
            helper: 'Combined demand volume',
            icon: Scale,
        },
        {
            label: 'Average price',
            value: `${formatCurrency(stats.average_price)}/kg`,
            helper: 'Across your posted demands',
            icon: PhilippinePeso,
        },
    ];

    return (
        <>
            <Head title="Processor Dashboard" />

            <ProcessorLayouts>
                <main className="bg-[#f7fbf3]">
                    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
                        <div className="overflow-hidden rounded-2xl bg-[#03592f] text-white shadow-lg shadow-[#03592f]/15">
                            <div className="flex flex-col gap-6 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
                                <div className="max-w-2xl">
                                    <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#f2bd11]">
                                        Processor workspace
                                    </span>
                                    <h1 className="mt-4 text-2xl font-bold sm:text-3xl">
                                        {processorProfile?.business_name ??
                                            'Processor dashboard'}
                                    </h1>
                                    <p className="mt-3 max-w-xl text-sm leading-6 text-white/80 sm:text-base">
                                        Track your resource demands, review
                                        recent crop needs, and prepare to match
                                        with farmer surplus at practical prices.
                                    </p>
                                    {processorProfile ? (
                                        <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-white/85">
                                            <span className="rounded-full bg-white/10 px-3 py-1">
                                                {processorProfile.business_type}
                                            </span>
                                            <span className="rounded-full bg-white/10 px-3 py-1">
                                                {
                                                    processorProfile.complete_address
                                                }
                                            </span>
                                        </div>
                                    ) : null}
                                </div>

                                <Link
                                    href={route(
                                        'processors.agri-resources.my-demands.create',
                                    )}
                                    className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#f2bd11] px-5 text-sm font-bold text-[#03592f] shadow-md shadow-black/10 transition hover:bg-[#ffd04a] focus:outline-none focus:ring-4 focus:ring-[#f2bd11]/30 sm:w-auto"
                                >
                                    <PackageSearch className="h-5 w-5" />
                                    I'm looking for
                                </Link>
                            </div>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-3">
                            {summaryCards.map((card) => {
                                const Icon = card.icon;

                                return (
                                    <article
                                        key={card.label}
                                        className="rounded-xl border border-[#6ab225]/20 bg-white p-4 shadow-sm"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-medium text-stone-500">
                                                    {card.label}
                                                </p>
                                                <p className="mt-2 text-2xl font-bold text-[#03592f] sm:text-3xl">
                                                    {card.value}
                                                </p>
                                            </div>
                                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#6ab225]/10 text-[#03592f]">
                                                <Icon className="h-5 w-5" />
                                            </span>
                                        </div>
                                        <p className="mt-3 text-sm text-stone-500">
                                            {card.helper}
                                        </p>
                                    </article>
                                );
                            })}
                        </div>

                        <div className="grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
                            <section className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <h2 className="text-lg font-bold text-stone-900">
                                            Demand board
                                        </h2>
                                        <p className="mt-1 text-sm text-stone-500">
                                            Your latest posted crop and agri
                                            resource needs.
                                        </p>
                                    </div>

                                    <Link
                                        href={route(
                                            'processors.agri-resources.my-demands',
                                        )}
                                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#6ab225]/40 px-4 text-sm font-semibold text-[#03592f] transition hover:bg-[#6ab225]/10 focus:outline-none focus:ring-4 focus:ring-[#6ab225]/20"
                                    >
                                        View requests
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>

                                {recentDemands.length > 0 ? (
                                    <div className="mt-6 grid gap-3">
                                        {recentDemands.map((demand) => (
                                            <article
                                                key={demand.id}
                                                className="rounded-xl border border-stone-200 p-4 transition hover:border-[#6ab225]/50 hover:bg-[#f7fbf3]"
                                            >
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                    <div>
                                                        <h3 className="font-bold text-stone-950">
                                                            {demand.resource}
                                                        </h3>
                                                        <p className="mt-1 text-sm leading-6 text-stone-500">
                                                            {demand.remarks ??
                                                                'No remarks added'}
                                                        </p>
                                                    </div>
                                                    <span className="w-fit rounded-full bg-[#6ab225]/10 px-3 py-1 text-xs font-bold text-[#03592f]">
                                                        Open
                                                    </span>
                                                </div>

                                                <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                                                    <span className="inline-flex items-center gap-2 text-stone-600">
                                                        <Scale className="h-4 w-4 text-[#6ab225]" />
                                                        {formatNumber(
                                                            demand.quantity,
                                                        )}{' '}
                                                        KG
                                                    </span>
                                                    <span className="inline-flex items-center gap-2 text-stone-600">
                                                        <PhilippinePeso className="h-4 w-4 text-[#6ab225]" />
                                                        {formatCurrency(
                                                            demand.price,
                                                        )}
                                                        /kg
                                                    </span>
                                                    <span className="inline-flex items-center gap-2 text-stone-600">
                                                        <CalendarDays className="h-4 w-4 text-[#6ab225]" />
                                                        {demand.posted_at ??
                                                            'Recently'}
                                                    </span>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="mt-6 flex min-h-44 flex-col items-center justify-center rounded-xl border border-dashed border-[#6ab225]/35 bg-[#f7fbf3] px-4 py-8 text-center">
                                        <ClipboardList className="h-10 w-10 text-[#6ab225]" />
                                        <h3 className="mt-3 font-semibold text-stone-900">
                                            No resource needs posted yet
                                        </h3>
                                        <p className="mt-2 max-w-md text-sm leading-6 text-stone-500">
                                            Start with the crop name, quantity,
                                            target price, and remarks.
                                        </p>
                                    </div>
                                )}
                            </section>

                            <aside className="rounded-xl border border-[#f2bd11]/40 bg-white p-5 shadow-sm sm:p-6">
                                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f2bd11]/20 text-[#03592f]">
                                    <Building2 className="h-5 w-5" />
                                </span>
                                <h2 className="text-lg font-bold text-stone-900">
                                    Business profile
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-stone-500">
                                    {processorProfile?.business_name ??
                                        'No processor profile found'}
                                </p>

                                <div className="mt-5 rounded-xl bg-[#f2bd11]/15 p-4">
                                    <p className="text-sm font-semibold text-[#03592f]">
                                        Contact
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-stone-600">
                                        {processorProfile?.contact_number ??
                                            'Contact number not set'}
                                    </p>
                                </div>

                                <div className="mt-3 rounded-xl bg-[#6ab225]/10 p-4">
                                    <p className="text-sm font-semibold text-[#03592f]">
                                        Quick action
                                    </p>
                                    <Link
                                        href={route(
                                            'processors.agri-resources.my-demands.create',
                                        )}
                                        className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#03592f] px-4 text-sm font-bold text-white transition hover:bg-[#024525]"
                                    >
                                        Add new demand
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </aside>
                        </div>
                    </section>
                </main>
            </ProcessorLayouts>
        </>
    );
}
