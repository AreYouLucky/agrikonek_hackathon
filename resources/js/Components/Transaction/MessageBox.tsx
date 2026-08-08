import { useCallback, useState } from 'react';
import type { FormEvent } from 'react';

import { useTransactionChannel } from '@/hooks/useTransactionChannel';
import {
    pingTransaction,
    sendMessage,
    triggerTransactionAlert,
    type TransactionMessage,
} from '@/services/transactionChannel';

type MessageBoxProps = {
    transactionId: number;
    initialMessages?: TransactionMessage[];
};

export default function MessageBox({
    transactionId,
    initialMessages = [],
}: MessageBoxProps) {
    const [messages, setMessages] = useState(initialMessages);
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleMessage = useCallback((data: TransactionMessage): void => {
        setMessages((currentMessages) => [...currentMessages, data]);
    }, []);

    useTransactionChannel(transactionId, { onMessage: handleMessage });

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmedMessage = message.trim();

        if (!trimmedMessage || isSending) {
            return;
        }

        setIsSending(true);
        setError(null);

        try {
            const sentMessage = await sendMessage(
                transactionId,
                trimmedMessage,
            );

            setMessages((currentMessages) => [
                ...currentMessages,
                sentMessage,
            ]);
            setMessage('');
        } catch {
            setError('The message could not be sent. Please try again.');
        } finally {
            setIsSending(false);
        }
    };

    const handleAlertClick = async (): Promise<void> => {
        setError(null);

        try {
            await triggerTransactionAlert(transactionId);
        } catch {
            setError('The transaction alert could not be sent.');
        }
    };

    const handlePingClick = async (): Promise<void> => {
        setError(null);

        try {
            await pingTransaction(transactionId);
        } catch {
            setError('The transaction ping could not be sent.');
        }
    };

    return (
        <section className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 px-5 py-4">
                <div>
                    <h2 className="font-semibold text-stone-900">
                        Transaction messages
                    </h2>
                    <p className="text-sm text-stone-500">
                        Transaction #{transactionId}
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => void handleAlertClick()}
                        className="rounded-lg border border-stone-200 px-3 py-2 text-xs font-medium text-stone-700 transition hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                    >
                        Send update alert
                    </button>
                    <button
                        type="button"
                        onClick={() => void handlePingClick()}
                        className="rounded-lg bg-emerald-700 px-3 py-2 text-xs font-medium text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/30"
                    >
                        Ping transaction
                    </button>
                </div>
            </header>

            <div
                className="flex max-h-80 min-h-48 flex-col gap-3 overflow-y-auto bg-stone-50/70 p-5"
                aria-live="polite"
            >
                {messages.length === 0 ? (
                    <p className="m-auto text-sm text-stone-500">
                        No messages yet.
                    </p>
                ) : (
                    messages.map((item, index) => (
                        <div
                            key={`${item.transaction_id}-${index}`}
                            className="max-w-[85%] self-start rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm text-stone-700 shadow-sm ring-1 ring-stone-200"
                        >
                            {item.message}
                        </div>
                    ))
                )}
            </div>

            <form onSubmit={handleSubmit} className="border-t border-stone-200 p-4">
                <div className="flex gap-3">
                    <label htmlFor="transaction-message" className="sr-only">
                        Message
                    </label>
                    <input
                        id="transaction-message"
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        placeholder="Write a message..."
                        className="h-11 min-w-0 flex-1 rounded-xl border-stone-300 text-sm focus:border-emerald-600 focus:ring-emerald-600"
                    />
                    <button
                        type="submit"
                        disabled={isSending || message.trim().length === 0}
                        className="rounded-xl bg-emerald-700 px-5 text-sm font-semibold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-600/30 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isSending ? 'Sending...' : 'Send'}
                    </button>
                </div>

                {error ? (
                    <p className="mt-2 text-sm text-red-600" role="alert">
                        {error}
                    </p>
                ) : null}
            </form>
        </section>
    );
}
