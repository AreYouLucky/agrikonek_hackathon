import axios from 'axios';

export type TransactionMessage = {
    transaction_id: number;
    message: string;
};

type SuccessResponse = {
    success: true;
};

export async function sendMessage(
    transactionId: number,
    message: string,
): Promise<TransactionMessage> {
    const response = await axios.post<TransactionMessage>(
        '/api/transactions/messages',
        {
            transaction_id: transactionId,
            message,
        },
    );

    return response.data;
}

export async function triggerTransactionAlert(
    transactionId: number,
): Promise<void> {
    await axios.post<SuccessResponse>('/api/transactions/alert', {
        transaction_id: transactionId,
    });
}

export async function pingTransaction(transactionId: number): Promise<void> {
    await axios.post<SuccessResponse>('/api/transactions/ping', {
        transaction_id: transactionId,
    });
}
