import { Head, Link } from '@inertiajs/react';
import ProcessorLayouts from '@/Layouts/ProcessorLayouts';
import {
    ArrowRight,
    Factory,
    Handshake,
    Leaf,
    Recycle,
    Sprout,
    Target,
} from 'lucide-react';

const values = [
    {
        title: 'Reduce waste',
        description:
            'Move surplus crops into useful production instead of letting good harvests go unused.',
        icon: Recycle,
    },
    {
        title: 'Support farmers',
        description:
            'Create another market path for farmers who have extra supply after harvest.',
        icon: Sprout,
    },
    {
        title: 'Source smarter',
        description:
            'Help processors find available crops at practical prices for real production needs.',
        icon: Factory,
    },
];

const steps = [
    'Processors post the crops or agri resources they need.',
    'Farmers can match surplus harvests with active processor demand.',
    'Both sides coordinate toward a transaction that keeps produce in circulation.',
];

export default function AboutUs() {
    return (
        <>
            <Head title="About Us" />

            <ProcessorLayouts>
                <main className="bg-[#f7fbf3]">
                    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
                        <div className="overflow-hidden rounded-2xl bg-[#03592f] text-white shadow-lg shadow-[#03592f]/15">
                            <div className="grid gap-8 p-5 sm:p-7 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
                                <div>
                                    <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#f2bd11]">
                                        About AgriKonek
                                    </span>
                                    <h1 className="mt-4 text-3xl font-bold sm:text-4xl">
                                        Connecting processor demand with farmer
                                        surplus.
                                    </h1>
                                    <p className="mt-4 max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
                                        AgriKonek is built around a simple
                                        circular economy idea: crops that are
                                        still useful should find a buyer,
                                        processor, or purpose before they become
                                        waste.
                                    </p>

                                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                                        <Link
                                            href={route(
                                                'processors.agri-resources.my-demands.create',
                                            )}
                                            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#f2bd11] px-5 text-sm font-bold text-[#03592f] transition hover:bg-[#ffd04a]"
                                        >
                                            Post a demand
                                            <ArrowRight className="h-4 w-4" />
                                        </Link>
                                        <Link
                                            href={route(
                                                'processors.agri-resources.my-demands',
                                            )}
                                            className="inline-flex h-12 items-center justify-center rounded-xl bg-white/10 px-5 text-sm font-bold text-white transition hover:bg-white/15"
                                        >
                                            View my demands
                                        </Link>
                                    </div>
                                </div>

                                <div className="rounded-2xl bg-white/10 p-5 ring-1 ring-white/15">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f2bd11] text-[#03592f]">
                                        <Leaf className="h-8 w-8" />
                                    </div>
                                    <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-[#f2bd11]">
                                        Processor role
                                    </p>
                                    <p className="mt-2 text-2xl font-bold">
                                        Turn demand into opportunity.
                                    </p>
                                    <p className="mt-3 text-sm leading-6 text-white/75">
                                        By posting what your business needs, you
                                        help surface farmer surplus that can be
                                        transformed into snacks, preserved food,
                                        canned goods, frozen packs, sauces, and
                                        other value-added products.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                            {values.map((value) => {
                                const Icon = value.icon;

                                return (
                                    <article
                                        key={value.title}
                                        className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-[#6ab225]/20"
                                    >
                                        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#6ab225]/10 text-[#03592f]">
                                            <Icon className="h-5 w-5" />
                                        </span>
                                        <h2 className="mt-4 font-bold text-stone-950">
                                            {value.title}
                                        </h2>
                                        <p className="mt-2 text-sm leading-6 text-stone-500">
                                            {value.description}
                                        </p>
                                    </article>
                                );
                            })}
                        </div>

                        <div className="grid gap-5 lg:grid-cols-[0.8fr_1.2fr]">
                            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200 sm:p-6">
                                <Target className="h-10 w-10 text-[#6ab225]" />
                                <h2 className="mt-4 text-xl font-bold text-stone-950">
                                    Our goal
                                </h2>
                                <p className="mt-3 text-sm leading-7 text-stone-500">
                                    Make agricultural surplus visible,
                                    matchable, and useful so processors can
                                    source affordable inputs while farmers get
                                    more chances to earn from excess harvests.
                                </p>
                            </section>

                            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200 sm:p-6">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#f2bd11]/20 text-[#03592f]">
                                        <Handshake className="h-5 w-5" />
                                    </span>
                                    <div>
                                        <p className="text-sm font-bold uppercase tracking-wide text-[#6ab225]">
                                            How it works
                                        </p>
                                        <h2 className="text-xl font-bold text-stone-950">
                                            A simple matching flow
                                        </h2>
                                    </div>
                                </div>

                                <div className="mt-5 grid gap-3">
                                    {steps.map((step, index) => (
                                        <div
                                            key={step}
                                            className="flex gap-3 rounded-xl bg-[#f7fbf3] p-4"
                                        >
                                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#03592f] text-sm font-bold text-white">
                                                {index + 1}
                                            </span>
                                            <p className="text-sm leading-6 text-stone-600">
                                                {step}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </section>
                </main>
            </ProcessorLayouts>
        </>
    );
}
