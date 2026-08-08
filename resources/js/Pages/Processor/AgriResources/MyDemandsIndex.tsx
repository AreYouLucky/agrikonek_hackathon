import { Head } from '@inertiajs/react';
import ProcessorLayouts from '@/Layouts/ProcessorLayouts';
import {
    CalendarDays,
    ClipboardList,
    Filter,
    PackagePlus,
    Pencil,
    Search,
} from 'lucide-react';

const demandSamples = [
    {
        id: 1,
        resource: 'Tomato',
        quantity: '120 kg',
        price: 'PHP 45/kg',
        status: 'Open',
        remarks: 'For sauce production',
        postedAt: 'Today',
    },
    {
        id: 2,
        resource: 'Squash',
        quantity: '80 kg',
        price: 'PHP 32/kg',
        status: 'Reviewing',
        remarks: 'Prefer mature harvest',
        postedAt: 'Yesterday',
    },
    {
        id: 3,
        resource: 'Red Onion',
        quantity: '60 kg',
        price: 'PHP 70/kg',
        status: 'Matched',
        remarks: 'Flexible pickup schedule',
        postedAt: 'Aug 8',
    },
];

const statusStyles: Record<string, string> = {
    Open: 'bg-[#6ab225]/10 text-[#03592f]',
    Reviewing: 'bg-[#f2bd11]/20 text-[#7a5a00]',
    Matched: 'bg-[#03592f]/10 text-[#03592f]',
};

export default function MyDemandsIndex() {
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

                        <button
                            type="button"
                            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#03592f] px-5 text-sm font-bold text-white shadow-md shadow-[#03592f]/15 transition hover:bg-[#024525] focus:outline-none focus:ring-4 focus:ring-[#6ab225]/30 sm:w-auto"
                        >
                            <PackagePlus className="h-5 w-5" />
                            Add demand
                        </button>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                        <div className="rounded-xl border border-[#6ab225]/20 bg-white p-4 shadow-sm">
                            <p className="text-sm text-stone-500">
                                Active demands
                            </p>
                            <p className="mt-2 text-2xl font-bold text-[#03592f]">
                                3
                            </p>
                        </div>
                        <div className="rounded-xl border border-[#6ab225]/20 bg-white p-4 shadow-sm">
                            <p className="text-sm text-stone-500">
                                Awaiting matches
                            </p>
                            <p className="mt-2 text-2xl font-bold text-[#03592f]">
                                2
                            </p>
                        </div>
                        <div className="rounded-xl border border-[#f2bd11]/40 bg-white p-4 shadow-sm">
                            <p className="text-sm text-stone-500">
                                Matched demands
                            </p>
                            <p className="mt-2 text-2xl font-bold text-[#03592f]">
                                1
                            </p>
                        </div>
                    </div>

                    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-stone-200">
                        <div className="flex flex-col gap-3 border-b border-stone-200 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                            <div className="relative w-full sm:max-w-sm">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                                <input
                                    type="search"
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

                        <div className="grid gap-3 p-4 sm:hidden">
                            {demandSamples.map((demand) => (
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
                                                {demand.remarks}
                                            </p>
                                        </div>
                                        <span
                                            className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[demand.status]}`}
                                        >
                                            {demand.status}
                                        </span>
                                    </div>

                                    <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                        <div>
                                            <dt className="text-stone-500">
                                                Quantity
                                            </dt>
                                            <dd className="font-semibold text-stone-900">
                                                {demand.quantity}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-stone-500">
                                                Price
                                            </dt>
                                            <dd className="font-semibold text-stone-900">
                                                {demand.price}
                                            </dd>
                                        </div>
                                    </dl>

                                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-stone-100 pt-3 text-sm text-stone-500">
                                        <span className="inline-flex items-center gap-1.5">
                                            <CalendarDays className="h-4 w-4" />
                                            {demand.postedAt}
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
                                        <th className="px-5 py-4">Resource</th>
                                        <th className="px-5 py-4">Quantity</th>
                                        <th className="px-5 py-4">Price</th>
                                        <th className="px-5 py-4">Status</th>
                                        <th className="px-5 py-4">Posted</th>
                                        <th className="px-5 py-4 text-right">
                                            Action
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-stone-100 bg-white">
                                    {demandSamples.map((demand) => (
                                        <tr key={demand.id}>
                                            <td className="px-5 py-4">
                                                <div className="font-semibold text-stone-950">
                                                    {demand.resource}
                                                </div>
                                                <div className="mt-1 text-xs text-stone-500">
                                                    {demand.remarks}
                                                </div>
                                            </td>
                                            <td className="px-5 py-4 text-stone-700">
                                                {demand.quantity}
                                            </td>
                                            <td className="px-5 py-4 text-stone-700">
                                                {demand.price}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusStyles[demand.status]}`}
                                                >
                                                    {demand.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-stone-500">
                                                {demand.postedAt}
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
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-dashed border-[#6ab225]/40 bg-white p-6 text-center shadow-sm">
                        <ClipboardList className="mx-auto h-10 w-10 text-[#6ab225]" />
                        <h2 className="mt-3 font-bold text-stone-950">
                            Demand records will connect to your table next
                        </h2>
                        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-stone-500">
                            This is the index design first. The next step can
                            load your processor demand records and wire the add
                            and edit buttons to the form page.
                        </p>
                    </div>
                </section>
            </main>
            </ProcessorLayouts>
        </>
    );
}
