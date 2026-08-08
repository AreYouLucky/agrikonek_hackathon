import { FormEventHandler } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import ProcessorLayouts from '@/Layouts/ProcessorLayouts';
import {
    ArrowLeft,
    ClipboardList,
    Leaf,
    PackagePlus,
    PhilippinePeso,
    Scale,
} from 'lucide-react';

type AgriResourceOption = {
    id: number;
    name: string;
};

type MyDemandsCreateEditProps = {
    resources: AgriResourceOption[];
};

export default function CreateEditMyDemandsIndex({
    resources,
}: MyDemandsCreateEditProps) {
    const { data, setData, post, processing, errors } = useForm({
        agri_resource_id: '',
        quantity: '',
        price: '',
        remarks: '',
    });

    const submit: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();

        post(route('processors.agri-resources.my-demands.store'));
    };

    return (
        <>
            <Head title="Add Demand" />

            <ProcessorLayouts>
                <main className="bg-[#f7fbf3]">
                    <section className="mx-auto flex w-full max-w-5xl flex-col gap-5 px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
                        <div className="flex flex-col gap-4 rounded-2xl bg-[#03592f] p-5 text-white shadow-lg shadow-[#03592f]/15 sm:p-6">
                            <Link
                                href={route(
                                    'processors.agri-resources.my-demands',
                                )}
                                className="inline-flex w-fit items-center gap-2 rounded-xl bg-white/10 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to My Demands
                            </Link>

                            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                                <div>
                                    <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#f2bd11]">
                                        Resource request
                                    </span>
                                    <h1 className="mt-3 text-2xl font-bold sm:text-3xl">
                                        Add what you are looking for
                                    </h1>
                                    <p className="mt-2 max-w-2xl text-sm leading-6 text-white/80">
                                        Post a crop demand so farmers with
                                        surplus resources can match with your
                                        processing needs.
                                    </p>
                                </div>

                                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#f2bd11] text-[#03592f]">
                                    <PackagePlus className="h-7 w-7" />
                                </span>
                            </div>
                        </div>

                        <div className="grid gap-5 lg:grid-cols-[1fr_18rem]">
                            <form
                                onSubmit={submit}
                                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200 sm:p-6"
                            >
                                <div className="grid gap-5 sm:grid-cols-2">
                                    <div className="sm:col-span-2">
                                        <label
                                            htmlFor="agri_resource_id"
                                            className="mb-2 block text-sm font-bold text-stone-800"
                                        >
                                            Agri resource
                                        </label>
                                        <div className="relative">
                                            <Leaf className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6ab225]" />
                                            <select
                                                id="agri_resource_id"
                                                value={data.agri_resource_id}
                                                onChange={(event) =>
                                                    setData(
                                                        'agri_resource_id',
                                                        event.target.value,
                                                    )
                                                }
                                                className="h-12 w-full rounded-xl border border-stone-200 bg-white pl-11 pr-4 text-sm text-stone-900 outline-none transition focus:border-[#6ab225] focus:ring-4 focus:ring-[#6ab225]/15"
                                            >
                                                <option value="">
                                                    Select crop or resource
                                                </option>
                                                {resources.map((resource) => (
                                                    <option
                                                        key={resource.id}
                                                        value={resource.id}
                                                    >
                                                        {resource.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        {errors.agri_resource_id ? (
                                            <p className="mt-2 text-sm text-red-600">
                                                {errors.agri_resource_id}
                                            </p>
                                        ) : null}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="quantity"
                                            className="mb-2 block text-sm font-bold text-stone-800"
                                        >
                                            Quantity needed
                                        </label>
                                        <div className="relative">
                                            <Scale className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6ab225]" />
                                            <input
                                                id="quantity"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={data.quantity}
                                                onChange={(event) =>
                                                    setData(
                                                        'quantity',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Example: 100"
                                                className="h-12 w-full rounded-xl border border-stone-200 bg-white pl-11 pr-14 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#6ab225] focus:ring-4 focus:ring-[#6ab225]/15"
                                            />
                                            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold uppercase tracking-wide text-stone-500">
                                                KG
                                            </span>
                                        </div>
                                        {errors.quantity ? (
                                            <p className="mt-2 text-sm text-red-600">
                                                {errors.quantity}
                                            </p>
                                        ) : null}
                                    </div>

                                    <div>
                                        <label
                                            htmlFor="price"
                                            className="mb-2 block text-sm font-bold text-stone-800"
                                        >
                                            Target price per kg
                                        </label>
                                        <div className="relative">
                                            <PhilippinePeso className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6ab225]" />
                                            <input
                                                id="price"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={data.price}
                                                onChange={(event) =>
                                                    setData(
                                                        'price',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="Example: 45"
                                                className="h-12 w-full rounded-xl border border-stone-200 bg-white pl-11 pr-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#6ab225] focus:ring-4 focus:ring-[#6ab225]/15"
                                            />
                                        </div>
                                        {errors.price ? (
                                            <p className="mt-2 text-sm text-red-600">
                                                {errors.price}
                                            </p>
                                        ) : null}
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label
                                            htmlFor="remarks"
                                            className="mb-2 block text-sm font-bold text-stone-800"
                                        >
                                            Remarks
                                        </label>
                                        <textarea
                                            id="remarks"
                                            value={data.remarks}
                                            onChange={(event) =>
                                                setData(
                                                    'remarks',
                                                    event.target.value,
                                                )
                                            }
                                            rows={5}
                                            placeholder="Add preferred quality, pickup notes, or processing requirements."
                                            className="w-full resize-none rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#6ab225] focus:ring-4 focus:ring-[#6ab225]/15"
                                        />
                                        {errors.remarks ? (
                                            <p className="mt-2 text-sm text-red-600">
                                                {errors.remarks}
                                            </p>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="mt-6 flex flex-col-reverse gap-3 border-t border-stone-100 pt-5 sm:flex-row sm:justify-end">
                                    <Link
                                        href={route(
                                            'processors.agri-resources.my-demands',
                                        )}
                                        className="inline-flex h-12 items-center justify-center rounded-xl border border-stone-200 px-5 text-sm font-bold text-stone-700 transition hover:bg-stone-50"
                                    >
                                        Cancel
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#03592f] px-5 text-sm font-bold text-white shadow-md shadow-[#03592f]/15 transition hover:bg-[#024525] focus:outline-none focus:ring-4 focus:ring-[#6ab225]/30 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <PackagePlus className="h-5 w-5" />
                                        {processing
                                            ? 'Saving demand...'
                                            : 'Save demand'}
                                    </button>
                                </div>
                            </form>

                            <aside className="rounded-2xl border border-[#f2bd11]/40 bg-white p-5 shadow-sm">
                                <ClipboardList className="h-10 w-10 text-[#f2bd11]" />
                                <h2 className="mt-3 font-bold text-stone-950">
                                    Demand details
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-stone-500">
                                    Keep the request specific so farmer surplus
                                    can be matched faster.
                                </p>

                                <div className="mt-5 space-y-3 text-sm text-stone-600">
                                    <p className="rounded-xl bg-[#f7fbf3] p-3">
                                        Use kilograms for quantity while we are
                                        standardizing demand posts.
                                    </p>
                                    <p className="rounded-xl bg-[#f2bd11]/15 p-3">
                                        Target price can be zero if you still
                                        need to negotiate.
                                    </p>
                                </div>
                            </aside>
                        </div>
                    </section>
                </main>
            </ProcessorLayouts>
        </>
    );
}
