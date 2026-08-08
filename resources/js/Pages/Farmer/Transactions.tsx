import MessageBox from '@/Components/Transaction/MessageBox';
import { useTransactionChannel } from '@/hooks/useTransactionChannel';
import FarmersDashboardLayout from '@/Layouts/FarmerDashboardLayout';
import type { TransactionMessage } from '@/services/transactionChannel';
import { Head, Link } from '@inertiajs/react';
import { Bell, ChevronRight, Inbox, MapPin, Package, Store } from 'lucide-react';
import { type ReactElement, useCallback, useEffect, useMemo, useState } from 'react';

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
    listing: {
        resource_name: string;
        quantity: number;
        price: number;
        img: string | null;
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

function csrfToken(): string | null {
    return document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? null;
}

export default function Transactions({
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
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            <p className="truncate font-bold text-stone-900">{transaction.listing.resource_name}</p>
                                            <p className="mt-1 truncate text-sm text-stone-500">{transaction.processor.business_name}</p>
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
