import MessageBox from '@/Components/Transaction/MessageBox';
import { useTransactionChannel } from '@/hooks/useTransactionChannel';
import ProcessorLayouts from '@/Layouts/ProcessorLayouts';
import type { TransactionMessage } from '@/services/transactionChannel';
import { Head, Link, useForm } from '@inertiajs/react';
import axios from 'axios';
import {
    Bell,
    BadgeCheck,
    CalendarDays,
    ChevronRight,
    Inbox,
    MapPin,
    MessageCircle,
    Package,
    PhilippinePeso,
    Sprout,
    ShoppingCart,
    Warehouse,
} from 'lucide-react';
import { type FormEvent, type ReactElement, useCallback, useEffect, useMemo, useState } from 'react';

type TransactionSummary = {
    id: number;
    status: string;
    quantity: number;
    price: number | null;
    updated_at: string;
    unread_messages_count: number;
    farmer: {
        name: string;
        farm_name: string;
        complete_address: string;
    };
    listing: {
        id: number;
        resource_name: string;
        quantity: number;
        price: number | null;
        img: string | null;
        harvested_at: string;
        preservation_method: string;
        fresh_until: string | null;
        freshness_status: string | null;
    };
};

type Props = {
    currentUserId: number;
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
        ? 'Negotiable'
        : `₱${price.toLocaleString('en-PH', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
          })} / kg`;
}

function PurchasePanel({ transaction }: { transaction: TransactionSummary }): ReactElement {
    const { post, processing, errors } = useForm<Record<string, never>>({});
    const isPurchased = transaction.status === 'purchased';
    const canPurchase = transaction.price !== null && transaction.price > 0;

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        post(route('processors.transactions.purchase', transaction.id), {
            preserveScroll: true,
        });
    };

    return (
        <section className={`rounded-2xl border p-4 shadow-sm sm:p-5 ${isPurchased ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-gradient-to-r from-amber-50 to-white'}`}>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                    <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${isPurchased ? 'bg-emerald-700 text-white' : 'bg-amber-400 text-stone-950'}`}>
                        {isPurchased ? <BadgeCheck size={21} /> : <ShoppingCart size={21} />}
                    </span>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-[0.14em] text-stone-500">Transaction offer</p>
                        <h3 className="mt-1 text-xl font-extrabold text-stone-900">{formatPrice(transaction.price)}</h3>
                        <p className="mt-1 text-sm text-stone-600">
                            {isPurchased
                                ? `${transaction.quantity} kg marked as purchased from this farmer.`
                                : canPurchase
                                  ? `Buy ${transaction.quantity} kg at the farmer's negotiated transaction price.`
                                  : 'Ask the farmer to set a transaction price in the chat.'}
                        </p>
                    </div>
                </div>

                <form onSubmit={submit}>
                    <button
                        type="submit"
                        disabled={processing || isPurchased || !canPurchase}
                        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#03592f] px-5 text-sm font-extrabold text-white transition hover:bg-[#024525] focus:outline-none focus:ring-4 focus:ring-[#6ab225]/25 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                    >
                        {isPurchased ? <BadgeCheck size={18} /> : <ShoppingCart size={18} />}
                        {processing ? 'Processing...' : isPurchased ? 'Purchased' : 'Buy resource'}
                    </button>
                </form>
            </div>
            {errors.purchase ? <p className="mt-3 text-sm font-semibold text-rose-600">{errors.purchase}</p> : null}
        </section>
    );
}

export default function SearchAgriResources({
    currentUserId,
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

        if (message.sender_id !== currentUserId) {
            setNotice(`New message from ${message.sender_name}${transaction ? ` about ${transaction.listing.resource_name}` : ''}.`);
        }

        setTransactions((current) => current.map((item) =>
            item.id === message.transaction_id &&
            item.id !== selectedTransactionId &&
            message.sender_id !== currentUserId
                ? { ...item, unread_messages_count: item.unread_messages_count + 1 }
                : item,
        ));
    }, [currentUserId, initialTransactions, selectedTransactionId]);

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

        void axios.post(route('processors.transactions.read', selectedTransactionId))
            .then(() => {
                setTransactions((current) => current.map((item) =>
                    item.id === selectedTransactionId
                        ? { ...item, unread_messages_count: 0 }
                        : item,
                ));
            })
            .catch(() => undefined);
    }, [selectedMessages, selectedTransactionId]);

    return (
        <ProcessorLayouts>
            <Head title="Farmer messages" />

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
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><Bell size={18} /></span>
                    <div>
                        <p className="font-bold text-stone-900">New farmer message</p>
                        <p className="mt-0.5 leading-5">{notice}</p>
                    </div>
                </div>
            ) : null}

            <main className="min-h-[calc(100vh-4rem)] bg-[#f7fbf3]">
                <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
                    <section className="mb-5 overflow-hidden rounded-3xl bg-[#03592f] p-5 text-white shadow-lg shadow-[#03592f]/15 sm:p-7">
                        <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-[#f2bd11]"><MessageCircle size={14} /> Direct farmer conversations</span>
                        <h1 className="mt-4 text-2xl font-extrabold sm:text-3xl">Messages and resource inquiries</h1>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">Discuss quantity, pricing, pickup, and processing requirements directly with the farmer who posted each resource.</p>
                    </section>

                    {transactions.length === 0 ? (
                        <section className="rounded-3xl border border-dashed border-emerald-200 bg-white px-6 py-16 text-center shadow-sm">
                            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"><Inbox size={26} /></span>
                            <h2 className="mt-4 text-lg font-bold text-stone-900">No farmer conversations yet</h2>
                            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-stone-500">Browse smart demand matches and select “Message farmer” on a resource listing.</p>
                            <Link href={route('processors.smart-demands')} className="mt-5 inline-flex rounded-xl bg-[#03592f] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#024525]">Browse farmer resources</Link>
                        </section>
                    ) : (
                        <div className="grid gap-5 lg:grid-cols-[330px_minmax(0,1fr)]">
                            <aside className="space-y-3 lg:max-h-[760px] lg:overflow-y-auto lg:pr-1">
                                <div className="flex items-center justify-between px-1">
                                    <h2 className="font-bold text-stone-900">Conversations</h2>
                                    <span className="text-xs font-semibold text-stone-500">{transactions.length} total</span>
                                </div>
                                {transactions.map((transaction) => {
                                    const isSelected = transaction.id === selectedTransactionId;
                                    const imageUrl = listingImageUrl(transaction.listing.img);

                                    return (
                                        <Link
                                            key={transaction.id}
                                            href={route('processors.transactions', { transaction: transaction.id })}
                                            preserveScroll
                                            className={`block rounded-2xl border p-4 transition focus:outline-none focus:ring-4 focus:ring-[#6ab225]/20 ${isSelected ? 'border-[#6ab225] bg-emerald-50 shadow-sm' : 'border-stone-200 bg-white hover:border-[#6ab225]/60 hover:shadow-sm'}`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <span className="h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-emerald-100">
                                                    {imageUrl ? <img src={imageUrl} alt="" className="h-full w-full object-cover" /> : <span className="flex h-full items-center justify-center text-emerald-700"><Package size={20} /></span>}
                                                </span>
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-bold text-stone-900">{transaction.listing.resource_name}</p>
                                                    <p className="mt-0.5 truncate text-sm text-stone-500">{transaction.farmer.farm_name}</p>
                                                    <p className="mt-1 text-xs font-semibold text-emerald-700">{transaction.quantity} kg · {formatPrice(transaction.price)}</p>
                                                </div>
                                                {transaction.unread_messages_count > 0 ? (
                                                    <span className="flex min-w-6 items-center justify-center rounded-full bg-rose-500 px-2 py-1 text-xs font-bold text-white">{transaction.unread_messages_count}</span>
                                                ) : <ChevronRight className="shrink-0 text-stone-300" size={18} />}
                                            </div>
                                            <div className="mt-3 flex items-center justify-between text-xs">
                                                <span className="rounded-full bg-white px-2.5 py-1 font-semibold capitalize text-emerald-700 ring-1 ring-emerald-100">{transaction.status}</span>
                                                <span className="text-stone-400">{new Date(transaction.updated_at).toLocaleDateString('en-PH')}</span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </aside>

                            {selectedTransaction ? (
                                <div className="min-w-0 space-y-4">
                                    <section className="overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm">
                                        <div className="grid gap-5 p-5 sm:grid-cols-[160px_minmax(0,1fr)]">
                                            <div className="aspect-square overflow-hidden rounded-2xl bg-emerald-50">
                                                {listingImageUrl(selectedTransaction.listing.img) ? (
                                                    <img src={listingImageUrl(selectedTransaction.listing.img) ?? undefined} alt={`${selectedTransaction.listing.resource_name} listing`} className="h-full w-full object-cover" />
                                                ) : <span className="flex h-full items-center justify-center text-emerald-300"><Package size={42} /></span>}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-700">Resource listing #{selectedTransaction.listing.id}</p>
                                                <h2 className="mt-1 text-xl font-extrabold text-stone-900">{selectedTransaction.listing.resource_name}</h2>
                                                <p className="mt-1 text-sm font-semibold text-stone-600">{selectedTransaction.farmer.farm_name} · {selectedTransaction.farmer.name}</p>
                                                <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                                                    <div className="flex gap-2 rounded-xl bg-stone-50 p-3"><Package className="shrink-0 text-emerald-700" size={17} /><div><dt className="text-xs text-stone-400">Available</dt><dd className="font-bold text-stone-800">{selectedTransaction.listing.quantity} kg</dd></div></div>
                                                    <div className="flex gap-2 rounded-xl bg-stone-50 p-3"><PhilippinePeso className="shrink-0 text-emerald-700" size={17} /><div><dt className="text-xs text-stone-400">Farmer price</dt><dd className="font-bold text-stone-800">{formatPrice(selectedTransaction.listing.price)}</dd></div></div>
                                                    <div className="flex gap-2 rounded-xl bg-stone-50 p-3"><CalendarDays className="shrink-0 text-emerald-700" size={17} /><div><dt className="text-xs text-stone-400">Collected</dt><dd className="font-bold text-stone-800">{selectedTransaction.listing.harvested_at}</dd></div></div>
                                                    <div className="flex gap-2 rounded-xl bg-stone-50 p-3"><Warehouse className="shrink-0 text-emerald-700" size={17} /><div><dt className="text-xs text-stone-400">Preservation</dt><dd className="font-bold capitalize text-stone-800">{selectedTransaction.listing.preservation_method.replaceAll('_', ' ')}</dd></div></div>
                                                </dl>
                                                <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-stone-600">
                                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5"><MapPin size={13} /> {selectedTransaction.farmer.complete_address}</span>
                                                    {selectedTransaction.listing.fresh_until ? <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1.5 text-sky-800"><Sprout size={13} /> Fresh until {selectedTransaction.listing.fresh_until}</span> : null}
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    <PurchasePanel key={selectedTransaction.id} transaction={selectedTransaction} />

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
                </div>
            </main>
        </ProcessorLayouts>
    );
}
