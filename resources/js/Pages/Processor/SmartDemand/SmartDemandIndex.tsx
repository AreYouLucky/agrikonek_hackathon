import ProcessorLayouts from '@/Layouts/ProcessorLayouts';
import { Head, Link } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarDays,
    Filter,
    Leaf,
    MapPin,
    PackageSearch,
    PhilippinePeso,
    Search,
    SlidersHorizontal,
    Sparkles,
    Sprout,
    Weight,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type ProcessorProfile = {
    business_name: string;
    complete_address: string;
};

type ResourceOption = {
    id: number;
    name: string;
};

type FarmerListing = {
    id: number;
    resource_id: number;
    resource: string;
    farmer: string;
    quantity: number | null;
    price: number | null;
    estimated_price: number | null;
    target_price: number | null;
    distance_km: number | null;
    harvested_at: string | null;
    fresh_until: string | null;
    freshness_status: string | null;
    preservation_method: string;
    is_demand_match: boolean;
    match_score: number;
    posted_at: string | null;
};

type Summary = {
    posted_resources: number;
    matched_resources: number;
};

type SmartDemandIndexProps = {
    processorProfile: ProcessorProfile | null;
    resources: ResourceOption[];
    listings: FarmerListing[];
    summary: Summary;
};

function formatNumber(value: number | null): string {
    if (value === null) {
        return 'Not set';
    }

    return Number(value).toLocaleString(undefined, {
        maximumFractionDigits: 2,
    });
}

function formatPrice(value: number | null): string {
    if (value === null) {
        return 'Negotiable';
    }

    return `PHP ${formatNumber(value)}`;
}

function scoreTone(score: number): string {
    if (score >= 80) {
        return 'bg-[#03592f] text-white';
    }

    if (score >= 55) {
        return 'bg-[#6ab225]/15 text-[#03592f]';
    }

    return 'bg-stone-100 text-stone-600';
}

export default function SmartDemandIndex({
    processorProfile,
    resources,
    listings,
    summary,
}: SmartDemandIndexProps) {
    const [search, setSearch] = useState('');
    const [resourceId, setResourceId] = useState('all');
    const [onlyMatches, setOnlyMatches] = useState(false);

    const filteredListings = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        return listings.filter((listing) => {
            const matchesSearch =
                keyword.length === 0 ||
                [
                    listing.resource,
                    listing.farmer,
                    listing.preservation_method,
                    listing.freshness_status ?? '',
                ]
                    .join(' ')
                    .toLowerCase()
                    .includes(keyword);
            const matchesResource =
                resourceId === 'all' ||
                listing.resource_id.toString() === resourceId;
            const matchesDemand =
                !onlyMatches || listing.is_demand_match;

            return matchesSearch && matchesResource && matchesDemand;
        });
    }, [listings, onlyMatches, resourceId, search]);

    const topMatches = filteredListings.filter(
        (listing) => listing.match_score >= 55,
    ).length;

    return (
        <>
            <Head title="Smart Demand" />

            <ProcessorLayouts>
                <main className="bg-[#f7fbf3]">
                    <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
                        <div className="overflow-hidden rounded-2xl bg-[#03592f] text-white shadow-lg shadow-[#03592f]/15">
                            <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_22rem] lg:items-end">
                                <div>
                                    <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#f2bd11]">
                                        <Sparkles className="h-3.5 w-3.5" />
                                        Smart processor matching
                                    </span>
                                    <h1 className="mt-4 text-2xl font-bold sm:text-3xl">
                                        Find farmer surplus that fits your
                                        demand
                                    </h1>
                                    <p className="mt-3 max-w-2xl text-sm leading-6 text-white/80 sm:text-base">
                                        Search posted agri resources from
                                        farmers and review smart suggestions
                                        based on your demand list, target price,
                                        freshness, and distance.
                                    </p>
                                </div>

                                <div className="rounded-xl bg-white/10 p-4">
                                    <p className="text-sm font-semibold text-white/75">
                                        Processor
                                    </p>
                                    <p className="mt-1 font-bold">
                                        {processorProfile?.business_name ??
                                            'Processor profile'}
                                    </p>
                                    <p className="mt-2 text-sm leading-6 text-white/70">
                                        {processorProfile?.complete_address ??
                                            'Set your processor profile location for better nearby ranking.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-3">
                            <article className="rounded-xl border border-[#6ab225]/20 bg-white p-4 shadow-sm">
                                <p className="text-sm text-stone-500">
                                    Posted farmer resources
                                </p>
                                <p className="mt-2 text-2xl font-bold text-[#03592f]">
                                    {summary.posted_resources}
                                </p>
                            </article>
                            <article className="rounded-xl border border-[#6ab225]/20 bg-white p-4 shadow-sm">
                                <p className="text-sm text-stone-500">
                                    Demand categories
                                </p>
                                <p className="mt-2 text-2xl font-bold text-[#03592f]">
                                    {summary.matched_resources}
                                </p>
                            </article>
                            <article className="rounded-xl border border-[#f2bd11]/40 bg-white p-4 shadow-sm">
                                <p className="text-sm text-stone-500">
                                    Suggested matches
                                </p>
                                <p className="mt-2 text-2xl font-bold text-[#03592f]">
                                    {topMatches}
                                </p>
                            </article>
                        </div>

                        <div className="rounded-2xl bg-white shadow-sm ring-1 ring-stone-200">
                            <div className="grid gap-3 border-b border-stone-200 p-4 lg:grid-cols-[1fr_16rem_auto] lg:items-center sm:p-5">
                                <div className="relative">
                                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                                    <input
                                        type="search"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        placeholder="Search crop, farm, preservation, freshness"
                                        className="h-11 w-full rounded-xl border border-stone-200 bg-white pl-10 pr-4 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-[#6ab225] focus:ring-4 focus:ring-[#6ab225]/15"
                                    />
                                </div>

                                <div className="relative">
                                    <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                                    <select
                                        value={resourceId}
                                        onChange={(event) =>
                                            setResourceId(event.target.value)
                                        }
                                        className="h-11 w-full rounded-xl border border-stone-200 bg-white pl-10 pr-4 text-sm text-stone-900 outline-none transition focus:border-[#6ab225] focus:ring-4 focus:ring-[#6ab225]/15"
                                    >
                                        <option value="all">
                                            All resources
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

                                <label className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-stone-200 px-4 text-sm font-semibold text-stone-700 transition hover:bg-stone-50">
                                    <input
                                        type="checkbox"
                                        checked={onlyMatches}
                                        onChange={(event) =>
                                            setOnlyMatches(event.target.checked)
                                        }
                                        className="h-4 w-4 rounded border-stone-300 text-[#03592f] focus:ring-[#6ab225]"
                                    />
                                    Demand matches
                                </label>
                            </div>

                            <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[18rem_1fr]">
                                <aside className="rounded-xl border border-[#6ab225]/20 bg-[#f7fbf3] p-4">
                                    <div className="flex items-center gap-3">
                                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#6ab225]/15 text-[#03592f]">
                                            <SlidersHorizontal className="h-5 w-5" />
                                        </span>
                                        <div>
                                            <h2 className="font-bold text-stone-950">
                                                Match logic
                                            </h2>
                                            <p className="text-sm text-stone-500">
                                                Ranked for processor needs
                                            </p>
                                        </div>
                                    </div>

                                    <div className="mt-5 grid gap-3 text-sm text-stone-600">
                                        <div className="rounded-xl bg-white p-3">
                                            <p className="font-semibold text-[#03592f]">
                                                Demand fit
                                            </p>
                                            <p className="mt-1 leading-6">
                                                Resources already in your My
                                                Demands list rank higher.
                                            </p>
                                        </div>
                                        <div className="rounded-xl bg-white p-3">
                                            <p className="font-semibold text-[#03592f]">
                                                Price fit
                                            </p>
                                            <p className="mt-1 leading-6">
                                                Listings at or below your
                                                target price get boosted.
                                            </p>
                                        </div>
                                        <div className="rounded-xl bg-white p-3">
                                            <p className="font-semibold text-[#03592f]">
                                                Fresh and nearby
                                            </p>
                                            <p className="mt-1 leading-6">
                                                Fresh-until date and distance
                                                help sort practical options.
                                            </p>
                                        </div>
                                    </div>
                                </aside>

                                {filteredListings.length === 0 ? (
                                    <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-dashed border-[#6ab225]/40 bg-white px-5 py-10 text-center">
                                        <PackageSearch className="h-11 w-11 text-[#6ab225]" />
                                        <h2 className="mt-3 font-bold text-stone-950">
                                            No farmer resources found
                                        </h2>
                                        <p className="mt-2 max-w-md text-sm leading-6 text-stone-500">
                                            Try another crop keyword, change the
                                            selected resource, or turn off
                                            demand-only filtering.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid gap-4">
                                        {filteredListings.map((listing) => (
                                            <article
                                                key={listing.id}
                                                className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm transition hover:border-[#6ab225]/50"
                                            >
                                                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <span
                                                                className={`rounded-full px-3 py-1 text-xs font-bold ${scoreTone(
                                                                    listing.match_score,
                                                                )}`}
                                                            >
                                                                {
                                                                    listing.match_score
                                                                }
                                                                % match
                                                            </span>
                                                            {listing.is_demand_match ? (
                                                                <span className="rounded-full bg-[#f2bd11]/20 px-3 py-1 text-xs font-bold text-[#7a5a00]">
                                                                    In your
                                                                    demand list
                                                                </span>
                                                            ) : null}
                                                        </div>

                                                        <h2 className="mt-3 text-lg font-bold text-stone-950">
                                                            {listing.resource}
                                                        </h2>
                                                        <p className="mt-1 text-sm text-stone-500">
                                                            Posted by{' '}
                                                            {listing.farmer}
                                                        </p>
                                                    </div>

                                                    <Link
                                                        href={route(
                                                            'processors.agri-resources.my-demands.create',
                                                        )}
                                                        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[#03592f] px-4 text-sm font-bold text-white transition hover:bg-[#024525] focus:outline-none focus:ring-4 focus:ring-[#6ab225]/25"
                                                    >
                                                        Create demand
                                                        <ArrowRight className="h-4 w-4" />
                                                    </Link>
                                                </div>

                                                <dl className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                                    <div className="rounded-xl bg-[#f7fbf3] p-3">
                                                        <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-stone-500">
                                                            <Weight className="h-4 w-4 text-[#6ab225]" />
                                                            Quantity
                                                        </dt>
                                                        <dd className="mt-2 font-bold text-stone-900">
                                                            {formatNumber(
                                                                listing.quantity,
                                                            )}{' '}
                                                            KG
                                                        </dd>
                                                    </div>
                                                    <div className="rounded-xl bg-[#f7fbf3] p-3">
                                                        <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-stone-500">
                                                            <PhilippinePeso className="h-4 w-4 text-[#6ab225]" />
                                                            Farmer price
                                                        </dt>
                                                        <dd className="mt-2 font-bold text-stone-900">
                                                            {formatPrice(
                                                                listing.price,
                                                            )}
                                                            /kg
                                                        </dd>
                                                    </div>
                                                    <div className="rounded-xl bg-[#f7fbf3] p-3">
                                                        <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-stone-500">
                                                            <Leaf className="h-4 w-4 text-[#6ab225]" />
                                                            Freshness
                                                        </dt>
                                                        <dd className="mt-2 font-bold text-stone-900">
                                                            {listing.freshness_status ??
                                                                'Not tagged'}
                                                        </dd>
                                                    </div>
                                                    <div className="rounded-xl bg-[#f7fbf3] p-3">
                                                        <dt className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-stone-500">
                                                            <MapPin className="h-4 w-4 text-[#6ab225]" />
                                                            Distance
                                                        </dt>
                                                        <dd className="mt-2 font-bold text-stone-900">
                                                            {listing.distance_km ===
                                                            null
                                                                ? 'Location pending'
                                                                : `${formatNumber(
                                                                      listing.distance_km,
                                                                  )} km`}
                                                        </dd>
                                                    </div>
                                                </dl>

                                                <div className="mt-4 grid gap-3 border-t border-stone-100 pt-4 text-sm text-stone-600 md:grid-cols-3">
                                                    <span className="inline-flex items-center gap-2">
                                                        <CalendarDays className="h-4 w-4 text-[#6ab225]" />
                                                        Harvested:{' '}
                                                        {listing.harvested_at ??
                                                            'Not set'}
                                                    </span>
                                                    <span className="inline-flex items-center gap-2">
                                                        <Sprout className="h-4 w-4 text-[#6ab225]" />
                                                        Fresh until:{' '}
                                                        {listing.fresh_until ??
                                                            'Not set'}
                                                    </span>
                                                    <span className="inline-flex items-center gap-2">
                                                        <PackageSearch className="h-4 w-4 text-[#6ab225]" />
                                                        {listing.preservation_method}
                                                    </span>
                                                </div>
                                            </article>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>
                </main>
            </ProcessorLayouts>
        </>
    );
}
