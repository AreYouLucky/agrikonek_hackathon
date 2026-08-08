import { Head, Link } from '@inertiajs/react';
import ProcessorLayouts from '@/Layouts/ProcessorLayouts';
import axios from 'axios';
import {
    CalendarDays,
    ClipboardList,
    Filter,
    PackagePlus,
    Pencil,
    Search,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

type Demand = {
    id: number;
    resource: string;
    quantity: number;
    price: number;
    remarks: string | null;
    posted_at: string | null;
};

const statusStyles: Record<string, string> = {
    Open: 'bg-[#6ab225]/10 text-[#03592f]',
    Reviewing: 'bg-[#f2bd11]/20 text-[#7a5a00]',
    Matched: 'bg-[#03592f]/10 text-[#03592f]',
};

export default function MyDemandsIndex() {
    const [demands, setDemands] = useState<Demand[]>([]);
    const [search, setSearch] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function loadDemands(): Promise<void> {
            setIsLoading(true);
            setError(null);

            try {
                const response = await axios.get<Demand[]>(
                    route('processors.agri-resources.my-demands.getdata'),
                );

                if (isMounted) {
                    setDemands(response.data);
                }
            } catch {
                if (isMounted) {
                    setError('Unable to load your demand records.');
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        void loadDemands();

        return () => {
            isMounted = false;
        };
    }, []);

    const filteredDemands = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) {
            return demands;
        }

        return demands.filter((demand) =>
            [demand.resource, demand.remarks ?? '']
                .join(' ')
                .toLowerCase()
                .includes(keyword),
        );
    }, [demands, search]);

    const totalDemands = demands.length;

    return (
        <>
            <Head title="My Demands" />

            <ProcessorLayouts>
                <main className="bg-[#f7fbf3]">
                    <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
                        <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#6ab225]/20 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <span className="inline-flex rounded-full bg-[#03592f]/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#03592f]">
                                    Processor demands
                                </span>
                                <h1 className="mt-3 text-2xl font-bold text-stone-950 sm:text-3xl">
                                    My resource needs
                                </h1>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">
                                    Manage the crops and agri resources your
                                    processing business is looking for.
                                </p>
                            </div>

                            <Link
                                href={route(
                                    'processors.agri-resources.my-demands.create',
                                )}
                                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#03592f] px-5 text-sm font-bold text-white shadow-md shadow-[#03592f]/15 transition hover:bg-[#024525] focus:outline-none focus:ring-4 focus:ring-[#6ab225]/30 sm:w-auto"
                            >
                                <PackagePlus className="h-5 w-5" />
                                Add demand
                            </Link>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            <div className="rounded-xl border border-[#6ab225]/20 bg-white p-4 shadow-sm">
                                <p className="text-sm text-stone-500">
                                    Active demands
                                </p>
                                <p className="mt-2 text-2xl font-bold text-[#03592f]">
                                    {totalDemands}
                                </p>
                            </div>
                            <div className="rounded-xl border border-[#6ab225]/20 bg-white p-4 shadow-sm">
                                <p className="text-sm text-stone-500">
                                    Search results
                                </p>
                                <p className="mt-2 text-2xl font-bold text-[#03592f]">
                                    {filteredDemands.length}
                                </p>
                            </div>
                            <div className="rounded-xl border border-[#f2bd11]/40 bg-white p-4 shadow-sm">
                                <p className="text-sm text-stone-500">
                                    Measurement
                                </p>
                                <p className="mt-2 text-2xl font-bold text-[#03592f]">
                                    KG
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-stone-200">
                            <div className="flex flex-col gap-3 border-b border-stone-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                                <div className="relative w-full sm:max-w-sm">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                                    <input
                                        type="search"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        placeholder="Search crop or remarks"
                                        className="h-11 w-full rounded-xl border border-stone-200 bg-white pl-10 pr-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#6ab225] focus:ring-4 focus:ring-[#6ab225]/15"
                                    />
                                </div>

                                <button
                                    type="button"
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-stone-200 px-4 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 focus:outline-none focus:ring-4 focus:ring-[#6ab225]/15"
                                >
                                    <Filter className="h-4 w-4" />
                                    Filter
                                </button>
                            </div>

                            {isLoading ? (
                                <div className="p-5">
                                    <div className="grid gap-3 sm:hidden">
                                        {[1, 2].map((item) => (
                                            <div
                                                key={item}
                                                className="h-40 animate-pulse rounded-xl bg-stone-100"
                                            />
                                        ))}
                                    </div>
                                    <div className="hidden space-y-3 sm:block">
                                        {[1, 2, 3].map((item) => (
                                            <div
                                                key={item}
                                                className="h-14 animate-pulse rounded-xl bg-stone-100"
                                            />
                                        ))}
                                    </div>
                                </div>
                            ) : error ? (
                                <div className="p-6 text-center">
                                    <p className="text-sm font-semibold text-red-600">
                                        {error}
                                    </p>
                                </div>
                            ) : filteredDemands.length === 0 ? (
                                <div className="p-6 text-center">
                                    <ClipboardList className="mx-auto h-10 w-10 text-[#6ab225]" />
                                    <h2 className="mt-3 font-bold text-stone-950">
                                        No demand records found
                                    </h2>
                                    <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-stone-500">
                                        Add your first demand or adjust your
                                        search keyword.
                                    </p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid gap-3 p-4 sm:hidden">
                                        {filteredDemands.map((demand) => (
                                            <article
                                                key={demand.id}
                                                className="rounded-xl border border-stone-200 p-4"
                                            >
                                                <div className="flex items-start justify-between gap-3">
                                                    <div>
                                                        <h2 className="font-bold text-stone-950">
                                                            {demand.resource}
                                                        </h2>
                                                        <p className="mt-1 text-sm text-stone-500">
                                                            {demand.remarks ??
                                                                'No remarks added'}
                                                        </p>
                                                    </div>
                                                    <span
                                                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles.Open}`}
                                                    >
                                                        Open
                                                    </span>
                                                </div>

                                                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                                    <div>
                                                        <dt className="text-stone-500">
                                                            Quantity
                                                        </dt>
                                                        <dd className="font-semibold text-stone-900">
                                                            {Number(
                                                                demand.quantity,
                                                            ).toLocaleString()}{' '}
                                                            KG
                                                        </dd>
                                                    </div>
                                                    <div>
                                                        <dt className="text-stone-500">
                                                            Price
                                                        </dt>
                                                        <dd className="font-semibold text-stone-900">
                                                            PHP{' '}
                                                            {Number(
                                                                demand.price,
                                                            ).toLocaleString()}{' '}
                                                            /kg
                                                        </dd>
                                                    </div>
                                                </dl>

                                                <div className="mt-4 flex items-center justify-between gap-3 border-t border-stone-100 pt-3 text-sm text-stone-500">
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <CalendarDays className="h-4 w-4" />
                                                        {demand.posted_at ??
                                                            'Recently'}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        className="inline-flex items-center gap-1.5 font-semibold text-[#03592f]"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                        Edit
                                                    </button>
                                                </div>
                                            </article>
                                        ))}
                                    </div>

                                    <div className="hidden overflow-x-auto sm:block">
                                        <table className="min-w-full divide-y divide-stone-200 text-left text-sm">
                                            <thead className="bg-stone-50 text-xs font-bold uppercase tracking-wide text-stone-500">
                                                <tr>
                                                    <th className="px-5 py-4">
                                                        Resource
                                                    </th>
                                                    <th className="px-5 py-4">
                                                        Quantity
                                                    </th>
                                                    <th className="px-5 py-4">
                                                        Price
                                                    </th>
                                                    <th className="px-5 py-4">
                                                        Status
                                                    </th>
                                                    <th className="px-5 py-4">
                                                        Posted
                                                    </th>
                                                    <th className="px-5 py-4 text-right">
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-stone-100 bg-white">
                                                {filteredDemands.map(
                                                    (demand) => (
                                                        <tr key={demand.id}>
                                                            <td className="px-5 py-4">
                                                                <div className="font-semibold text-stone-950">
                                                                    {
                                                                        demand.resource
                                                                    }
                                                                </div>
                                                                <div className="mt-1 text-xs text-stone-500">
                                                                    {demand.remarks ??
                                                                        'No remarks added'}
                                                                </div>
                                                            </td>
                                                            <td className="px-5 py-4 text-stone-700">
                                                                {Number(
                                                                    demand.quantity,
                                                                ).toLocaleString()}{' '}
                                                                KG
                                                            </td>
                                                            <td className="px-5 py-4 text-stone-700">
                                                                PHP{' '}
                                                                {Number(
                                                                    demand.price,
                                                                ).toLocaleString()}{' '}
                                                                /kg
                                                            </td>
                                                            <td className="px-5 py-4">
                                                                <span
                                                                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles.Open}`}
                                                                >
                                                                    Open
                                                                </span>
                                                            </td>
                                                            <td className="px-5 py-4 text-stone-500">
                                                                {demand.posted_at ??
                                                                    'Recently'}
                                                            </td>
                                                            <td className="px-5 py-4 text-right">
                                                                <button
                                                                    type="button"
                                                                    className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-[#03592f] transition hover:bg-[#6ab225]/10"
                                                                >
                                                                    <Pencil className="h-4 w-4" />
                                                                    Edit
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ),
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="rounded-2xl border border-dashed border-[#6ab225]/40 bg-white p-6 text-center shadow-sm">
                            <ClipboardList className="mx-auto h-10 w-10 text-[#6ab225]" />
                            <h2 className="mt-3 font-bold text-stone-950">
                                Demand records are loaded from your database
                            </h2>
                            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-stone-500">
                                This table now uses your Processor demand API
                                endpoint and shows only records owned by the
                                logged-in processor.
                            </p>
                        </div>
                    </section>
                </main>
            </ProcessorLayouts>
        </>
    );
}
