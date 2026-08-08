import MessageBox from '@/Components/Transaction/MessageBox';
import { useTransactionChannel } from '@/hooks/useTransactionChannel';
import FarmersDashboardLayout from '@/Layouts/FarmerDashboardLayout';
import type { TransactionMessage } from '@/services/transactionChannel';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    Bell,
    CalendarDays,
    ChevronRight,
    Inbox,
    MapPin,
    Package,
    PhilippinePeso,
    Sparkles,
    Store,
    Warehouse,
} from 'lucide-react';
import { type FormEvent, type ReactElement, useCallback, useEffect, useMemo, useState } from 'react';

type ListingSummary = {
    id: number;
    resource_name: string;
    quantity: number;
    price: number | null;
    img: string | null;
    harvested_at: string;
    preservation_method: string;
    estimated_price: number | null;
    fresh_until: string | null;
    freshness_status: string | null;
    ai_analysis_message: string | null;
};

type FarmerListing = ListingSummary & {
    created_at: string;
    transactions_count: number;
};

type TransactionSummary = {
    id: number;
    status: string;
    quantity: number;
    price: number | null;
    updated_at: string;
    unread_messages_count: number;
    processor: {
        business_name: string;
        business_type: string;
        complete_address: string;
    };
    listing: ListingSummary;
};

type Props = {
    currentUserId: number;
    listings: FarmerListing[];
    transactions: TransactionSummary[];
    selectedTransactionId: number | null;
    selectedMessages: TransactionMessage[];
};

type TransactionListenerProps = {
    transactionId: number;
    onMessage: (message: TransactionMessage) => void;
};

function TransactionListener({ transactionId, onMessage }: TransactionListenerProps): null {
    useTransactionChannel(transactionId, { onMessage });

    return null;
}

function csrfToken(): string | null {
    return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? null;
}

function listingImageUrl(path: string | null): string | null {
    if (!path) {
        return null;
    }

    if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
        return path;
    }

    return `/storage/${path}`;
}

function formatPrice(price: number | null): string {
    return price === null
        ? 'Not set'
        : `₱${price.toLocaleString('en-PH', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })} / kg`;
}

function FarmerListings({ listings }: { listings: FarmerListing[] }): ReactElement {
    return (
        <section className="mb-8 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Resource inventory</p>
                    <h2 className="mt-1 text-xl font-extrabold text-stone-900">Your resource listings</h2>
                    <p className="mt-1 text-sm text-stone-500">
                        All surplus and waste resources you have listed, including those without buyers yet.
                    </p>
                </div>
                <Link
                    href="/create-agri-resource-listing"
                    className="rounded-xl bg-emerald-800 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-900 focus:outline-none focus:ring-4 focus:ring-emerald-600/20"
                >
                    Add listing
                </Link>
            </div>

            {listings.length === 0 ? (
                <div className="mt-5 rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/40 px-5 py-10 text-center">
                    <Package className="mx-auto text-emerald-600" size={28} />
                    <p className="mt-3 font-bold text-stone-900">No resource listings yet</p>
                    <p className="mt-1 text-sm text-stone-500">Create your first surplus or waste resource listing.</p>
                </div>
            ) : (
                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {listings.map((listing) => {
                        const imageUrl = listingImageUrl(listing.img);
                        const freshnessLabel = listing.freshness_status?.replaceAll('_', ' ');

                        return (
                            <article key={listing.id} className="overflow-hidden rounded-2xl border border-stone-200 bg-stone-50/60 transition hover:border-emerald-300 hover:shadow-sm">
                                <div className="flex gap-3 p-3">
                                    <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-emerald-100">
                                        {imageUrl ? (
                                            <img src={imageUrl} alt={`${listing.resource_name} listing`} className="h-full w-full object-cover" />
                                        ) : (
                                            <span className="flex h-full items-center justify-center text-emerald-700"><Package size={24} /></span>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0">
                                                <p className="truncate font-extrabold text-stone-900">{listing.resource_name}</p>
                                                <p className="mt-0.5 text-xs font-semibold text-stone-400">Listing #{listing.id}</p>
                                            </div>
                                            {freshnessLabel ? (
                                                <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-1 text-[10px] font-bold uppercase text-emerald-800">{freshnessLabel}</span>
                                            ) : null}
                                        </div>
                                        <p className="mt-2 text-sm font-bold text-emerald-800">{listing.quantity} kg</p>
                                        <p className="mt-0.5 text-xs font-semibold text-stone-600">{formatPrice(listing.price)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-2 border-t border-stone-200 bg-white px-3 py-2.5 text-xs">
                                    <span className="text-stone-500">Added {new Date(listing.created_at).toLocaleDateString('en-PH')}</span>
                                    <span className={`rounded-full px-2.5 py-1 font-bold ${listing.transactions_count > 0 ? 'bg-sky-100 text-sky-800' : 'bg-amber-100 text-amber-800'}`}>
                                        {listing.transactions_count > 0
                                            ? `${listing.transactions_count} transaction${listing.transactions_count === 1 ? '' : 's'}`
                                            : 'Waiting for buyer'}
                                    </span>
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </section>
    );
}

function ListingDetails({ listing }: { listing: ListingSummary }): ReactElement {
    const imageUrl = listingImageUrl(listing.img);
    const freshnessLabel = listing.freshness_status?.replaceAll('_', ' ');

    return (
        <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
            <div className="border-b border-emerald-100 bg-emerald-50/70 px-5 py-4">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Associated listing #{listing.id}</p>
                <h2 className="mt-1 text-xl font-extrabold text-stone-900">{listing.resource_name}</h2>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-[180px_minmax(0,1fr)]">
                <div className="aspect-square overflow-hidden rounded-2xl bg-emerald-50">
                    {imageUrl ? (
                        <img src={imageUrl} alt={`${listing.resource_name} listing`} className="h-full w-full object-cover" />
                    ) : (
                        <span className="flex h-full items-center justify-center text-emerald-300"><Package size={40} /></span>
                    )}
                </div>

                <div className="min-w-0">
                    <dl className="grid gap-3 sm:grid-cols-2">
                        <div className="flex gap-3 rounded-xl bg-stone-50 p-3"><Package className="mt-0.5 shrink-0 text-emerald-700" size={18} /><div><dt className="text-xs font-semibold text-stone-400">Available quantity</dt><dd className="mt-1 font-bold text-stone-800">{listing.quantity} kg</dd></div></div>
                        <div className="flex gap-3 rounded-xl bg-stone-50 p-3"><PhilippinePeso className="mt-0.5 shrink-0 text-emerald-700" size={18} /><div><dt className="text-xs font-semibold text-stone-400">Listing price</dt><dd className="mt-1 font-bold text-stone-800">{formatPrice(listing.price)}</dd></div></div>
                        <div className="flex gap-3 rounded-xl bg-stone-50 p-3"><CalendarDays className="mt-0.5 shrink-0 text-emerald-700" size={18} /><div><dt className="text-xs font-semibold text-stone-400">Collected / harvested</dt><dd className="mt-1 font-bold text-stone-800">{new Date(`${listing.harvested_at}T00:00:00`).toLocaleDateString('en-PH')}</dd></div></div>
                        <div className="flex gap-3 rounded-xl bg-stone-50 p-3"><Warehouse className="mt-0.5 shrink-0 text-emerald-700" size={18} /><div><dt className="text-xs font-semibold text-stone-400">Preservation</dt><dd className="mt-1 font-bold capitalize text-stone-800">{listing.preservation_method.replaceAll('_', ' ')}</dd></div></div>
                    </dl>

                    {listing.freshness_status || listing.estimated_price || listing.ai_analysis_message ? (
                        <div className="mt-3 rounded-xl border border-sky-100 bg-sky-50 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="flex items-center gap-2 text-sm font-bold text-sky-900"><Sparkles size={16} /> AI listing analysis</p>
                                {freshnessLabel ? <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-sky-800 ring-1 ring-sky-200">{freshnessLabel}</span> : null}
                            </div>
                            <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                                <div><p className="text-xs font-semibold text-sky-700">Estimated price</p><p className="mt-1 font-bold text-stone-800">{formatPrice(listing.estimated_price)}</p></div>
                                <div><p className="text-xs font-semibold text-sky-700">Fresh until</p><p className="mt-1 font-bold text-stone-800">{listing.fresh_until ?? 'Not available'}</p></div>
                            </div>
                            {listing.ai_analysis_message ? <p className="mt-3 border-t border-sky-100 pt-3 text-sm leading-6 text-stone-600">{listing.ai_analysis_message}</p> : null}
                        </div>
                    ) : null}
                </div>
            </div>
        </section>
    );
}

function TransactionPriceEditor({ transaction }: { transaction: TransactionSummary }): ReactElement {
    const { data, setData, patch, processing, errors, recentlySuccessful } = useForm({
        price: transaction.price?.toString() ?? '',
    });
    const isPurchased = transaction.status === 'purchased';

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        patch(route('farmer.transactions.price.update', transaction.id), {
            preserveScroll: true,
        });
    };

    return (
        <section className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-700">Negotiated transaction price</p>
                    <h3 className="mt-1 font-extrabold text-stone-900">Set the price the processor can buy at</h3>
                    <p className="mt-1 text-sm text-stone-500">This only updates this conversation and does not change your public listing price.</p>
                </div>
                <span className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ${isPurchased ? 'bg-emerald-100 text-emerald-800' : 'bg-white text-amber-800 ring-1 ring-amber-200'}`}>
                    {transaction.status.replaceAll('_', ' ')}
                </span>
            </div>

            <form onSubmit={submit} className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1">
                    <label htmlFor={`transaction-price-${transaction.id}`} className="sr-only">Transaction price per kilogram</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-stone-500">₱</span>
                        <input
                            id={`transaction-price-${transaction.id}`}
                            type="number"
                            min="0.01"
                            step="0.01"
                            value={data.price}
                            onChange={(event) => setData('price', event.target.value)}
                            disabled={isPurchased}
                            className="h-12 w-full rounded-xl border-stone-300 bg-white pl-9 pr-16 text-base font-bold text-stone-900 focus:border-amber-500 focus:ring-amber-500 disabled:bg-stone-100"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-stone-400">/ kg</span>
                    </div>
                    {errors.price ? <p className="mt-1.5 text-sm font-semibold text-rose-600">{errors.price}</p> : null}
                    {recentlySuccessful ? <p className="mt-1.5 text-sm font-semibold text-emerald-700">Price updated for the processor.</p> : null}
                </div>
                <button
                    type="submit"
                    disabled={processing || isPurchased || Number(data.price) <= 0}
                    className="h-12 rounded-xl bg-amber-500 px-5 text-sm font-extrabold text-stone-950 transition hover:bg-amber-400 focus:outline-none focus:ring-4 focus:ring-amber-400/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {processing ? 'Saving...' : isPurchased ? 'Price finalized' : 'Update price'}
                </button>
            </form>
        </section>
    );
}

export default function Transactions({
    currentUserId,
    listings,
    transactions: initialTransactions,
    selectedTransactionId,
    selectedMessages,
}: Props): ReactElement {
    const [transactions, setTransactions] = useState(initialTransactions);
    const [notice, setNotice] = useState<string | null>(null);

    useEffect(() => {
        setTransactions(initialTransactions);
    }, [initialTransactions]);

    const selectedTransaction = useMemo(
        () => transactions.find((transaction) => transaction.id === selectedTransactionId) ?? null,
        [selectedTransactionId, transactions],
    );

    const showMessageNotice = useCallback((message: TransactionMessage): void => {
        const transaction = initialTransactions.find((item) => item.id === message.transaction_id);
        setNotice(`New message from ${message.sender_name}${transaction ? ` about ${transaction.listing.resource_name}` : ''}.`);

        setTransactions((current) => current.map((item) =>
            item.id === message.transaction_id && item.id !== selectedTransactionId
                ? { ...item, unread_messages_count: item.unread_messages_count + 1 }
                : item,
        ));
    }, [initialTransactions, selectedTransactionId]);

    useEffect(() => {
        if (!notice) {
            return;
        }

        const timeout = window.setTimeout(() => setNotice(null), 5000);

        return () => window.clearTimeout(timeout);
    }, [notice]);

    useEffect(() => {
        if (!selectedTransactionId) {
            return;
        }

        const token = csrfToken();

        if (!token) {
            return;
        }

        void fetch(route('farmer.transactions.read', selectedTransactionId), {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                Accept: 'application/json',
                'X-CSRF-TOKEN': token,
            },
        }).then((response) => {
            if (response.ok) {
                setTransactions((current) => current.map((item) =>
                    item.id === selectedTransactionId
                        ? { ...item, unread_messages_count: 0 }
                        : item,
                ));
            }
        });
    }, [selectedTransactionId, selectedMessages]);

    return (
        <FarmersDashboardLayout title="Transactions & messages">
            <Head title="Farmer transactions" />

            {transactions
                .filter((transaction) => transaction.id !== selectedTransactionId)
                .map((transaction) => (
                    <TransactionListener
                        key={transaction.id}
                        transactionId={transaction.id}
                        onMessage={showMessageNotice}
                    />
                ))}

            {notice ? (
                <div className="fixed right-4 top-20 z-50 flex max-w-sm items-start gap-3 rounded-2xl border border-emerald-200 bg-white p-4 text-sm text-stone-700 shadow-xl" role="status">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                        <Bell size={18} />
                    </span>
                    <div>
                        <p className="font-bold text-stone-900">New transaction message</p>
                        <p className="mt-0.5 leading-5">{notice}</p>
                    </div>
                </div>
            ) : null}

            <div className="mb-5">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-700">Your marketplace activity</p>
                <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-stone-900 sm:text-3xl">Transactions and messages</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-500">Track offers on your surplus listings and talk directly with processors.</p>
            </div>

            <FarmerListings listings={listings} />

            <div className="mb-4">
                <h2 className="text-xl font-extrabold text-stone-900">Buyer transactions</h2>
                <p className="mt-1 text-sm text-stone-500">Open a transaction to review the buyer and continue the conversation.</p>
            </div>

            {transactions.length === 0 ? (
                <section className="rounded-3xl border border-dashed border-emerald-200 bg-white px-6 py-16 text-center shadow-sm">
                    <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><Inbox size={25} /></span>
                    <h2 className="mt-4 text-lg font-bold text-stone-900">No transactions yet</h2>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">When a processor starts a transaction for one of your listings, it will appear here.</p>
                    <Link href="/create-agri-resource-listing" className="mt-5 inline-flex rounded-xl bg-emerald-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-900">Create a listing</Link>
                </section>
            ) : (
                <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
                    <aside className="space-y-3 lg:max-h-[680px] lg:overflow-y-auto lg:pr-1">
                        {transactions.map((transaction) => {
                            const isSelected = transaction.id === selectedTransactionId;

                            return (
                                <Link
                                    key={transaction.id}
                                    href={`/farmer/transactions?transaction=${transaction.id}`}
                                    preserveScroll
                                    className={`block rounded-2xl border p-4 transition focus:outline-none focus:ring-4 focus:ring-emerald-600/15 ${isSelected ? 'border-emerald-600 bg-emerald-50 shadow-sm' : 'border-stone-200 bg-white hover:border-emerald-300 hover:shadow-sm'}`}
                                >
                                    <div className="flex items-start gap-3">
                                        <span className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-emerald-100">
                                            {listingImageUrl(transaction.listing.img) ? (
                                                <img src={listingImageUrl(transaction.listing.img) ?? undefined} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <span className="flex h-full items-center justify-center text-emerald-700"><Package size={19} /></span>
                                            )}
                                        </span>
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-bold text-stone-900">{transaction.listing.resource_name}</p>
                                            <p className="mt-1 truncate text-sm text-stone-500">{transaction.processor.business_name}</p>
                                            <p className="mt-1 text-xs font-semibold text-emerald-700">{transaction.quantity} kg · {formatPrice(transaction.price)}</p>
                                        </div>
                                        {transaction.unread_messages_count > 0 ? (
                                            <span className="flex min-w-6 items-center justify-center rounded-full bg-rose-500 px-2 py-1 text-xs font-bold text-white">{transaction.unread_messages_count}</span>
                                        ) : <ChevronRight className="shrink-0 text-stone-300" size={18} />}
                                    </div>
                                    <div className="mt-3 flex items-center justify-between text-xs">
                                        <span className="rounded-full bg-white px-2.5 py-1 font-semibold capitalize text-emerald-700 ring-1 ring-emerald-100">{transaction.status}</span>
                                        <span className="text-stone-400">{new Date(transaction.updated_at).toLocaleDateString()}</span>
                                    </div>
                                </Link>
                            );
                        })}
                    </aside>

                    {selectedTransaction ? (
                        <div className="min-w-0 space-y-4">
                            <ListingDetails listing={selectedTransaction.listing} />

                            <TransactionPriceEditor key={selectedTransaction.id} transaction={selectedTransaction} />

                            <section className="grid gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-3">
                                <div className="flex gap-3"><Package className="mt-0.5 shrink-0 text-emerald-700" size={19} /><div><p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Resource</p><p className="mt-1 font-bold text-stone-900">{selectedTransaction.listing.resource_name}</p><p className="text-sm text-stone-500">{selectedTransaction.quantity} kg requested</p></div></div>
                                <div className="flex gap-3"><Store className="mt-0.5 shrink-0 text-emerald-700" size={19} /><div><p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Processor</p><p className="mt-1 font-bold text-stone-900">{selectedTransaction.processor.business_name}</p><p className="text-sm text-stone-500">{selectedTransaction.processor.business_type}</p></div></div>
                                <div className="flex gap-3"><MapPin className="mt-0.5 shrink-0 text-emerald-700" size={19} /><div><p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Location</p><p className="mt-1 text-sm font-semibold leading-5 text-stone-700">{selectedTransaction.processor.complete_address}</p></div></div>
                            </section>

                            <MessageBox
                                key={selectedTransaction.id}
                                transactionId={selectedTransaction.id}
                                currentUserId={currentUserId}
                                initialMessages={selectedMessages}
                                onIncomingMessage={showMessageNotice}
                            />
                        </div>
                    ) : null}
                </div>
            )}
        </FarmersDashboardLayout>
    );
}
