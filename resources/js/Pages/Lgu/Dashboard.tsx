import LguLayout from '@/Layouts/LguLayout';
import { Head } from '@inertiajs/react';
import {
    Activity,
    ArrowDownRight,
    ArrowUpRight,
    Banknote,
    BarChart3,
    Factory,
    Landmark,
    Leaf,
    MapPin,
    PackageCheck,
    PackageSearch,
    PhilippinePeso,
    Recycle,
    Scale,
    Sparkles,
    TrendingUp,
    type LucideIcon,
} from 'lucide-react';

type Overview = {
    surplus_utilized_kg: number;
    estimated_income: number;
    available_supply_kg: number;
    processor_demand_kg: number;
    supply_gap_kg: number;
    waste_diverted_kg: number;
    potential_waste_diversion_kg: number;
    potential_supply_value: number;
    utilization_rate: number;
    active_supply_listings: number;
    active_processor_demands: number;
    resource_shortages: number;
    resource_surpluses: number;
};

type GapRow = {
    resource: string;
    supply_quantity: number;
    demand_quantity: number;
    gap_quantity: number;
    status: 'Shortage' | 'Surplus' | 'Balanced';
};

type TopResource = {
    resource: string;
    supply_quantity: number;
    demand_quantity: number;
    utilized_quantity: number;
    activity_score: number;
};

type MarketPrice = {
    resource: string;
    average_price: number;
    minimum_price: number;
    maximum_price: number;
    markets_count: number;
    area: string;
};

type GeoPoint = {
    type: 'Supply' | 'Demand';
    name: string;
    address: string;
    latitude: string | null;
    longitude: string | null;
    quantity_kg: number;
    records_count: number;
};

type ActivityRow = {
    id: number;
    resource: string;
    source?: string;
    farmer?: string;
    processor?: string;
    quantity: number | null;
    price: number | null;
    status: string;
    posted_at?: string | null;
    updated_at?: string | null;
};

type AiInsight = {
    source: 'AI' | 'Computed';
    summary: string;
    actions: string[];
};

type DashboardProps = {
    overview: Overview;
    supplyDemandGaps: GapRow[];
    topResources: TopResource[];
    marketPrices: MarketPrice[];
    geoDistribution: {
        supply: GeoPoint[];
        demand: GeoPoint[];
    };
    recentListings: ActivityRow[];
    recentTransactions: ActivityRow[];
    aiInsight: AiInsight;
};

function formatNumber(value: number | null): string {
    if (value === null) {
        return '0';
    }

    return Number(value).toLocaleString(undefined, {
        maximumFractionDigits: 2,
    });
}

function formatCurrency(value: number | null): string {
    if (value === null) {
        return 'Negotiable';
    }

    return `PHP ${formatNumber(value)}`;
}

function barWidth(value: number, max: number): string {
    if (max <= 0) {
        return '0%';
    }

    return `${Math.max(8, Math.min(100, (value / max) * 100))}%`;
}

export default function Dashboard({
    overview,
    supplyDemandGaps,
    topResources,
    marketPrices,
    geoDistribution,
    recentListings,
    recentTransactions,
    aiInsight,
}: DashboardProps) {
    const maxGapValue = Math.max(
        ...supplyDemandGaps.map((gap) =>
            Math.max(gap.supply_quantity, gap.demand_quantity),
        ),
        1,
    );
    const maxActivity = Math.max(
        ...topResources.map((resource) => resource.activity_score),
        1,
    );

    const metricCards = [
        {
            label: 'Surplus utilized',
            value: `${formatNumber(overview.surplus_utilized_kg)} KG`,
            helper: 'Confirmed circular-economy volume',
            icon: PackageCheck,
        },
        {
            label: 'Income generated',
            value: formatCurrency(overview.estimated_income),
            helper: 'From utilized surplus transactions',
            icon: Banknote,
        },
        {
            label: 'Available supply',
            value: `${formatNumber(overview.available_supply_kg)} KG`,
            helper: `${overview.active_supply_listings} active farmer listings`,
            icon: Leaf,
        },
        {
            label: 'Processor demand',
            value: `${formatNumber(overview.processor_demand_kg)} KG`,
            helper: `${overview.active_processor_demands} posted demand records`,
            icon: Factory,
        },
        {
            label: 'Waste diverted',
            value: `${formatNumber(overview.waste_diverted_kg)} KG`,
            helper: `${formatNumber(
                overview.potential_waste_diversion_kg,
            )} KG still available to divert`,
            icon: Recycle,
        },
        {
            label: 'Supply gap',
            value: `${formatNumber(overview.supply_gap_kg)} KG`,
            helper:
                overview.supply_gap_kg >= 0
                    ? 'Supply is above posted demand'
                    : 'Demand is above posted supply',
            icon: Scale,
        },
    ];

    return (
        <>
            <Head title="LGU Dashboard" />

            <LguLayout>
                <section className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
                    <div className="overflow-hidden rounded-2xl bg-[#03592f] text-white shadow-lg shadow-[#03592f]/15">
                        <div className="grid gap-6 p-5 sm:p-7 lg:grid-cols-[1fr_22rem] lg:items-end">
                            <div>
                                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#f2bd11]">
                                    <Landmark className="h-3.5 w-3.5" />
                                    LGU agriculture intelligence
                                </span>
                                <h1 className="mt-4 text-2xl font-bold sm:text-3xl">
                                    Circular economy dashboard
                                </h1>
                                <p className="mt-3 max-w-3xl text-sm leading-6 text-white/80 sm:text-base">
                                    Monitor surplus utilization, income
                                    generation, processor demand, market prices,
                                    and supply gaps across AgriKonek.
                                </p>
                            </div>

                            <div className="rounded-xl bg-white/10 p-4">
                                <p className="text-sm font-semibold text-white/75">
                                    Utilization rate
                                </p>
                                <p className="mt-2 text-3xl font-bold text-[#f2bd11]">
                                    {formatNumber(overview.utilization_rate)}%
                                </p>
                                <p className="mt-2 text-sm leading-6 text-white/70">
                                    Share of visible circular volume already
                                    moved through transactions.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {metricCards.map((card) => {
                            const Icon = card.icon;

                            return (
                                <article
                                    key={card.label}
                                    className="rounded-xl border border-[#6ab225]/20 bg-white p-4 shadow-sm"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-stone-500">
                                                {card.label}
                                            </p>
                                            <p className="mt-2 break-words text-2xl font-bold text-[#03592f]">
                                                {card.value}
                                            </p>
                                        </div>
                                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#6ab225]/10 text-[#03592f]">
                                            <Icon className="h-5 w-5" />
                                        </span>
                                    </div>
                                    <p className="mt-3 text-sm leading-6 text-stone-500">
                                        {card.helper}
                                    </p>
                                </article>
                            );
                        })}
                    </div>

                    <section className="rounded-2xl border border-[#f2bd11]/40 bg-white p-5 shadow-sm sm:p-6">
                        <div className="flex items-start gap-3">
                            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f2bd11]/20 text-[#03592f]">
                                <Sparkles className="h-5 w-5" />
                            </span>
                            <div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <h2 className="text-lg font-bold text-stone-950">
                                        LGU analysis
                                    </h2>
                                    <span className="rounded-full bg-[#03592f]/10 px-2.5 py-1 text-xs font-bold text-[#03592f]">
                                        {aiInsight.source}
                                    </span>
                                </div>
                                <p className="mt-2 text-sm leading-6 text-stone-600">
                                    {aiInsight.summary}
                                </p>
                            </div>
                        </div>

                        <div className="mt-5 grid gap-3 md:grid-cols-3">
                            {aiInsight.actions.map((action) => (
                                <div
                                    key={action}
                                    className="rounded-xl bg-[#f7fbf3] p-4 text-sm font-medium leading-6 text-stone-700"
                                >
                                    {action}
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
                        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200 sm:p-6">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-bold text-stone-950">
                                        Supply vs demand gaps
                                    </h2>
                                    <p className="mt-1 text-sm text-stone-500">
                                        Shortages are priority coordination
                                        areas.
                                    </p>
                                </div>
                                <BarChart3 className="h-5 w-5 text-[#6ab225]" />
                            </div>

                            <div className="mt-5 grid gap-4">
                                {supplyDemandGaps.map((gap) => (
                                    <article
                                        key={gap.resource}
                                        className="rounded-xl border border-stone-200 p-4"
                                    >
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                            <h3 className="font-bold text-stone-950">
                                                {gap.resource}
                                            </h3>
                                            <span
                                                className={`w-fit rounded-full px-3 py-1 text-xs font-bold ${
                                                    gap.status === 'Shortage'
                                                        ? 'bg-red-50 text-red-700'
                                                        : gap.status ===
                                                            'Surplus'
                                                          ? 'bg-[#6ab225]/10 text-[#03592f]'
                                                          : 'bg-stone-100 text-stone-600'
                                                }`}
                                            >
                                                {gap.status}:{' '}
                                                {formatNumber(
                                                    Math.abs(gap.gap_quantity),
                                                )}{' '}
                                                KG
                                            </span>
                                        </div>

                                        <div className="mt-4 grid gap-3">
                                            <Bar
                                                label="Supply"
                                                value={gap.supply_quantity}
                                                max={maxGapValue}
                                                color="bg-[#6ab225]"
                                            />
                                            <Bar
                                                label="Demand"
                                                value={gap.demand_quantity}
                                                max={maxGapValue}
                                                color="bg-[#f2bd11]"
                                            />
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200 sm:p-6">
                            <div className="flex items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-lg font-bold text-stone-950">
                                        Top agricultural resources
                                    </h2>
                                    <p className="mt-1 text-sm text-stone-500">
                                        Ranked by supply, demand, and utilization
                                        volume.
                                    </p>
                                </div>
                                <TrendingUp className="h-5 w-5 text-[#6ab225]" />
                            </div>

                            <div className="mt-5 grid gap-3">
                                {topResources.map((resource) => (
                                    <article
                                        key={resource.resource}
                                        className="rounded-xl border border-stone-200 p-4"
                                    >
                                        <div className="flex items-center justify-between gap-3">
                                            <h3 className="font-bold text-stone-950">
                                                {resource.resource}
                                            </h3>
                                            <span className="text-sm font-bold text-[#03592f]">
                                                {formatNumber(
                                                    resource.activity_score,
                                                )}{' '}
                                                KG
                                            </span>
                                        </div>
                                        <div className="mt-3 h-2 rounded-full bg-stone-100">
                                            <div
                                                className="h-2 rounded-full bg-[#03592f]"
                                                style={{
                                                    width: barWidth(
                                                        resource.activity_score,
                                                        maxActivity,
                                                    ),
                                                }}
                                            />
                                        </div>
                                        <p className="mt-3 text-xs leading-5 text-stone-500">
                                            Supply{' '}
                                            {formatNumber(
                                                resource.supply_quantity,
                                            )}{' '}
                                            KG · Demand{' '}
                                            {formatNumber(
                                                resource.demand_quantity,
                                            )}{' '}
                                            KG · Utilized{' '}
                                            {formatNumber(
                                                resource.utilized_quantity,
                                            )}{' '}
                                            KG
                                        </p>
                                    </article>
                                ))}
                            </div>
                        </section>
                    </div>

                    <div className="grid gap-5 xl:grid-cols-2">
                        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200 sm:p-6">
                            <h2 className="text-lg font-bold text-stone-950">
                                Geographic distribution
                            </h2>
                            <p className="mt-1 text-sm text-stone-500">
                                Visible supply and processor demand by posted
                                profile location.
                            </p>

                            <div className="mt-5 grid gap-3 md:grid-cols-2">
                                <LocationColumn
                                    title="Supply locations"
                                    icon={Leaf}
                                    locations={geoDistribution.supply}
                                />
                                <LocationColumn
                                    title="Demand locations"
                                    icon={Factory}
                                    locations={geoDistribution.demand}
                                />
                            </div>
                        </section>

                        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200 sm:p-6">
                            <h2 className="text-lg font-bold text-stone-950">
                                Current market prices
                            </h2>
                            <p className="mt-1 text-sm text-stone-500">
                                Average retail market prices for reference.
                            </p>

                            <div className="mt-5 overflow-x-auto">
                                <table className="min-w-full text-left text-sm">
                                    <thead className="text-xs font-bold uppercase tracking-wide text-stone-500">
                                        <tr>
                                            <th className="py-3 pr-4">
                                                Resource
                                            </th>
                                            <th className="py-3 pr-4">
                                                Average
                                            </th>
                                            <th className="py-3 pr-4">
                                                Range
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-stone-100">
                                        {marketPrices.map((price) => (
                                            <tr key={price.resource}>
                                                <td className="py-3 pr-4 font-semibold text-stone-900">
                                                    {price.resource}
                                                    <p className="text-xs font-normal text-stone-500">
                                                        {price.markets_count}{' '}
                                                        markets · {price.area}
                                                    </p>
                                                </td>
                                                <td className="py-3 pr-4 font-bold text-[#03592f]">
                                                    {formatCurrency(
                                                        price.average_price,
                                                    )}
                                                </td>
                                                <td className="py-3 pr-4 text-stone-600">
                                                    {formatNumber(
                                                        price.minimum_price,
                                                    )}{' '}
                                                    -{' '}
                                                    {formatNumber(
                                                        price.maximum_price,
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>

                    <div className="grid gap-5 xl:grid-cols-2">
                        <ActivityList
                            title="Recent farmer listings"
                            icon={PackageSearch}
                            items={recentListings}
                            emptyText="No farmer listings yet."
                        />
                        <ActivityList
                            title="Recent transactions"
                            icon={Activity}
                            items={recentTransactions}
                            emptyText="No transactions yet."
                        />
                    </div>
                </section>
            </LguLayout>
        </>
    );
}

function Bar({
    label,
    value,
    max,
    color,
}: {
    label: string;
    value: number;
    max: number;
    color: string;
}) {
    return (
        <div>
            <div className="mb-1 flex items-center justify-between gap-3 text-xs font-semibold text-stone-500">
                <span>{label}</span>
                <span>{formatNumber(value)} KG</span>
            </div>
            <div className="h-2 rounded-full bg-stone-100">
                <div
                    className={`h-2 rounded-full ${color}`}
                    style={{ width: barWidth(value, max) }}
                />
            </div>
        </div>
    );
}

function LocationColumn({
    title,
    icon: Icon,
    locations,
}: {
    title: string;
    icon: LucideIcon;
    locations: GeoPoint[];
}) {
    return (
        <div className="grid gap-3">
            <div className="flex items-center gap-2 text-sm font-bold text-[#03592f]">
                <Icon className="h-4 w-4" />
                {title}
            </div>
            {locations.length === 0 ? (
                <div className="rounded-xl border border-dashed border-stone-200 p-4 text-sm text-stone-500">
                    No locations yet.
                </div>
            ) : (
                locations.slice(0, 6).map((location) => (
                    <article
                        key={`${location.type}-${location.name}`}
                        className="rounded-xl border border-stone-200 p-4"
                    >
                        <div className="flex gap-3">
                            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#6ab225]/10 text-[#03592f]">
                                <MapPin className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                                <h3 className="truncate font-bold text-stone-950">
                                    {location.name}
                                </h3>
                                <p className="mt-1 line-clamp-2 text-sm leading-5 text-stone-500">
                                    {location.address}
                                </p>
                                <p className="mt-2 text-xs font-semibold text-stone-600">
                                    {formatNumber(location.quantity_kg)} KG ·{' '}
                                    {location.records_count} records
                                </p>
                            </div>
                        </div>
                    </article>
                ))
            )}
        </div>
    );
}

function ActivityList({
    title,
    icon: Icon,
    items,
    emptyText,
}: {
    title: string;
    icon: LucideIcon;
    items: ActivityRow[];
    emptyText: string;
}) {
    return (
        <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-stone-200 sm:p-6">
            <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-bold text-stone-950">{title}</h2>
                <Icon className="h-5 w-5 text-[#6ab225]" />
            </div>

            <div className="mt-5 grid gap-3">
                {items.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-stone-200 p-6 text-center text-sm text-stone-500">
                        {emptyText}
                    </div>
                ) : (
                    items.map((item) => (
                        <article
                            key={`${title}-${item.id}`}
                            className="rounded-xl border border-stone-200 p-4"
                        >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <h3 className="font-bold text-stone-950">
                                        {item.resource}
                                    </h3>
                                    <p className="mt-1 text-sm text-stone-500">
                                        {item.source ??
                                            `${item.farmer} to ${item.processor}`}
                                    </p>
                                </div>
                                <span className="w-fit rounded-full bg-[#6ab225]/10 px-3 py-1 text-xs font-bold capitalize text-[#03592f]">
                                    {item.status}
                                </span>
                            </div>

                            <div className="mt-4 grid gap-2 text-sm text-stone-600 sm:grid-cols-3">
                                <span className="inline-flex items-center gap-2">
                                    <Scale className="h-4 w-4 text-[#6ab225]" />
                                    {formatNumber(item.quantity)} KG
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    <PhilippinePeso className="h-4 w-4 text-[#6ab225]" />
                                    {formatCurrency(item.price)}
                                </span>
                                <span className="inline-flex items-center gap-2">
                                    {item.status === 'Shortage' ? (
                                        <ArrowDownRight className="h-4 w-4 text-red-600" />
                                    ) : (
                                        <ArrowUpRight className="h-4 w-4 text-[#6ab225]" />
                                    )}
                                    {item.posted_at ?? item.updated_at}
                                </span>
                            </div>
                        </article>
                    ))
                )}
            </div>
        </section>
    );
}
