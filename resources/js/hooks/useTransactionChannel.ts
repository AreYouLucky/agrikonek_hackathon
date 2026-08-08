import { useEffect, useRef } from 'react';

import { getEcho } from '@/services/echo';
import type { TransactionMessage } from '@/services/transactionChannel';

type TransactionChannelHandlers = {
    onMessage: (data: TransactionMessage) => void;
    onAlert?: () => void;
    onPing?: () => void;
};

function isTransactionMessage(data: unknown): data is TransactionMessage {
    if (typeof data !== 'object' || data === null) {
        return false;
    }

    const payload = data as Record<string, unknown>;

    return (
        typeof payload.transaction_id === 'number' &&
        typeof payload.id === 'number' &&
        typeof payload.message === 'string' &&
        typeof payload.sender_id === 'number' &&
        typeof payload.sender_name === 'string' &&
        typeof payload.created_at === 'string'
    );
}

export function useTransactionChannel(
    transactionId: number,
    handlers: TransactionChannelHandlers,
): void {
    const handlersRef = useRef(handlers);

    useEffect(() => {
        handlersRef.current = handlers;
    }, [handlers]);

    useEffect(() => {
        const echo = getEcho();

        if (!echo) {
            return;
        }

        const transactionChannelName = `transaction.${transactionId}`;
        const pingChannelName = `transaction-ping.${transactionId}`;
        const transactionChannel = echo.channel(transactionChannelName);
        const pingChannel = echo.channel(pingChannelName);

        const handleMessage = (data: unknown): void => {
            if (isTransactionMessage(data)) {
                handlersRef.current.onMessage(data);
            }
        };
        const handleAlert = (): void => {
            if (handlersRef.current.onAlert) {
                handlersRef.current.onAlert();
                return;
            }

            window.alert('Transaction updated');
        };
        const handlePing = (): void => {
            if (handlersRef.current.onPing) {
                handlersRef.current.onPing();
                return;
            }

            window.alert('You have been pinged!');
        };

        transactionChannel
            .listen('.transaction-message-sent', handleMessage)
            .listen('.transaction-alert', handleAlert);
        pingChannel.listen('.transaction-pinged', handlePing);

        return () => {
            transactionChannel
                .stopListening('.transaction-message-sent', handleMessage)
                .stopListening('.transaction-alert', handleAlert);
            pingChannel.stopListening('.transaction-pinged', handlePing);
            echo.leave(transactionChannelName);
            echo.leave(pingChannelName);
        };
    }, [transactionId]);
}
