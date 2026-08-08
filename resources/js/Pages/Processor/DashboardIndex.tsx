import { Head } from '@inertiajs/react';
import {
    ArrowRight,
    ClipboardList,
    Leaf,
    PackageSearch,
    TrendingDown,
} from 'lucide-react';

const summaryCards = [
    {
        label: 'Looking for',
        value: '0',
        helper: 'Demand posts ready to create',
        icon: PackageSearch,
    },
    {
        label: 'Potential matches',
        value: '0',
        helper: 'Farmer surplus to review soon',
        icon: Leaf,
    },
    {
        label: 'Target savings',
        value: '0%',
        helper: 'Lower-price sourcing tracker',
        icon: TrendingDown,
    },
];

export default function DashboardIndex() {
    return (
        <>
            <Head title="Processor Dashboard" />

            <main className="min-h-screen bg-[#f7fbf3]">
                <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
                    <div className="overflow-hidden rounded-2xl bg-[#03592f] text-white shadow-lg shadow-[#03592f]/15">
                        <div className="flex flex-col gap-6 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between">
                            <div className="max-w-2xl">
                                <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#f2bd11]">
                                    Processor workspace
                                </span>
                                <h1 className="mt-4 text-2xl font-bold sm:text-3xl">
                                    Find surplus crops for your next production
                                    need.
                                </h1>
                                <p className="mt-3 max-w-xl text-sm leading-6 text-white/80 sm:text-base">
                                    Post the agri resources you are looking for
                                    and prepare to match with available farmer
                                    surplus at practical prices.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#f2bd11] px-5 text-sm font-bold text-[#03592f] shadow-md shadow-black/10 transition hover:bg-[#ffd04a] focus:outline-none focus:ring-4 focus:ring-[#f2bd11]/30 sm:w-auto"
                            >
                                <PackageSearch className="h-5 w-5" />
                                I'm looking for
                            </button>
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
                                            <p className="mt-2 text-3xl font-bold text-[#03592f]">
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
                                        Your crop requests will appear here once
                                        the posting module is added.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-[#6ab225]/40 px-4 text-sm font-semibold text-[#03592f] transition hover:bg-[#6ab225]/10 focus:outline-none focus:ring-4 focus:ring-[#6ab225]/20"
                                >
                                    View requests
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="mt-6 flex min-h-44 flex-col items-center justify-center rounded-xl border border-dashed border-[#6ab225]/35 bg-[#f7fbf3] px-4 py-8 text-center">
                                <ClipboardList className="h-10 w-10 text-[#6ab225]" />
                                <h3 className="mt-3 font-semibold text-stone-900">
                                    No resource needs posted yet
                                </h3>
                                <p className="mt-2 max-w-md text-sm leading-6 text-stone-500">
                                    Start with the crop name, quantity, target
                                    price, and remarks when the form is ready.
                                </p>
                            </div>
                        </section>

                        <aside className="rounded-xl border border-[#f2bd11]/40 bg-white p-5 shadow-sm sm:p-6">
                            <h2 className="text-lg font-bold text-stone-900">
                                Next step
                            </h2>
                            <p className="mt-2 text-sm leading-6 text-stone-500">
                                Build the "I'm looking for" form so processors
                                can post demand listings for surplus crops.
                            </p>

                            <div className="mt-5 rounded-xl bg-[#f2bd11]/15 p-4">
                                <p className="text-sm font-semibold text-[#03592f]">
                                    Suggested fields
                                </p>
                                <p className="mt-2 text-sm leading-6 text-stone-600">
                                    Agri resource, quantity, price, and remarks.
                                </p>
                            </div>
                        </aside>
                    </div>
                </section>
            </main>
        </>
    );
}
