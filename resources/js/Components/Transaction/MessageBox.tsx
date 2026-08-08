import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactElement } from 'react';

import { useTransactionChannel } from '@/hooks/useTransactionChannel';
import { sendMessage, type TransactionMessage } from '@/services/transactionChannel';

type MessageBoxProps = {
    transactionId: number;
    currentUserId?: number;
    initialMessages?: TransactionMessage[];
    onIncomingMessage?: (message: TransactionMessage) => void;
};

export default function MessageBox({
    transactionId,
    currentUserId = 0,
    initialMessages = [],
    onIncomingMessage,
}: MessageBoxProps): ReactElement {
    const [messages, setMessages] = useState(initialMessages);
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const messageEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        setMessages(initialMessages);
    }, [initialMessages, transactionId]);

    useEffect(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleMessage = useCallback((data: TransactionMessage): void => {
        setMessages((currentMessages) =>
            currentMessages.some((item) => item.id === data.id)
                ? currentMessages
                : [...currentMessages, data],
        );
        onIncomingMessage?.(data);
    }, [onIncomingMessage]);

    useTransactionChannel(transactionId, { onMessage: handleMessage });

    const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
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

                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Live messages
                </span>
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
                    messages.map((item) => {
                        const isOwnMessage = item.sender_id === currentUserId;

                        return (
                        <div
                            key={item.id}
                            className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                                isOwnMessage
                                    ? 'self-end rounded-br-md bg-emerald-700 text-white'
                                    : 'self-start rounded-bl-md bg-white text-stone-700 ring-1 ring-stone-200'
                            }`}
                        >
                            <p className={`mb-1 text-[11px] font-semibold ${isOwnMessage ? 'text-emerald-100' : 'text-stone-500'}`}>
                                {isOwnMessage ? 'You' : item.sender_name}
                            </p>
                            <p className="whitespace-pre-wrap break-words">{item.message}</p>
                            <p className={`mt-1.5 text-[10px] ${isOwnMessage ? 'text-emerald-100' : 'text-stone-400'}`}>
                                {new Date(item.created_at).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </p>
                        </div>
                        );
                    })
                )}
                <div ref={messageEndRef} />
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
