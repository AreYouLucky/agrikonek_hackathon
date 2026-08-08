import { useCallback, useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactElement } from 'react';

import { useTransactionChannel } from '@/hooks/useTransactionChannel';
import { sendMessage, type TransactionMessage } from '@/services/transactionChannel';
import { MessageCircle, Send } from 'lucide-react';

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
        <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 bg-white px-4 py-4 sm:px-5">
                <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                        <MessageCircle size={19} />
                    </span>
                    <div>
                        <h2 className="font-bold text-stone-900">Conversation</h2>
                        <p className="text-xs font-medium text-stone-500">Transaction #{transactionId}</p>
                    </div>
                </div>

                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Live messages
                </span>
            </header>

            <div
                className="flex max-h-[28rem] min-h-72 flex-col gap-3 overflow-y-auto bg-gradient-to-b from-stone-50/80 to-emerald-50/30 p-4 sm:p-5"
                aria-live="polite"
            >
                {messages.length === 0 ? (
                    <div className="m-auto text-center text-stone-500">
                        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-sm ring-1 ring-emerald-100"><MessageCircle size={22} /></span>
                        <p className="mt-3 text-sm font-bold text-stone-700">Start the conversation</p>
                        <p className="mt-1 max-w-xs text-xs leading-5">Ask about availability, pickup schedules, pricing, or processing requirements.</p>
                    </div>
                ) : (
                    messages.map((item) => {
                        const isOwnMessage = item.sender_id === currentUserId;

                        return (
                        <div
                            key={item.id}
                        className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm shadow-sm sm:max-w-[75%] ${
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

            <form onSubmit={handleSubmit} className="border-t border-stone-200 bg-white p-3 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                    <label htmlFor="transaction-message" className="sr-only">
                        Message
                    </label>
                    <input
                        id="transaction-message"
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        placeholder="Write a message to continue the transaction..."
                        autoComplete="off"
                        className="h-12 min-w-0 flex-1 rounded-xl border-stone-300 bg-stone-50 px-4 text-sm focus:border-emerald-600 focus:bg-white focus:ring-emerald-600"
                    />
                    <button
                        type="submit"
                        disabled={isSending || message.trim().length === 0}
                        className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-bold text-white transition hover:bg-emerald-800 focus:outline-none focus:ring-4 focus:ring-emerald-600/20 disabled:cursor-not-allowed disabled:opacity-60 sm:px-5"
                    >
                        <Send size={17} />
                        <span className="hidden sm:inline">{isSending ? 'Sending...' : 'Send'}</span>
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
