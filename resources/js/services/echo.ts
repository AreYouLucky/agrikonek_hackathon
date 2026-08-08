import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

type ChannelAuthorizationData = {
    auth: string;
    channel_data?: string;
    shared_secret?: string;
};

type ChannelAuthorizationParams = {
    socketId: string;
    channelName: string;
};

type ChannelAuthorizationCallback = (
    error: Error | null,
    data: ChannelAuthorizationData | null,
) => void;

let echoInstance: Echo<'pusher'> | null = null;

function getCsrfToken(): string | null {
    return document
        .querySelector<HTMLMetaElement>('meta[name="csrf-token"]')
        ?.getAttribute('content') ?? null;
}

async function authorizePrivateChannel(
    params: ChannelAuthorizationParams,
    callback: ChannelAuthorizationCallback,
): Promise<void> {
    const csrfToken = getCsrfToken();

    try {
        const response = await axios.post<ChannelAuthorizationData>(
            '/broadcasting/auth',
            new URLSearchParams({
                socket_id: params.socketId,
                channel_name: params.channelName,
            }),
            {
                withCredentials: true,
                withXSRFToken: true,
                headers: csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {},
            },
        );

        callback(null, response.data);
    } catch (error: unknown) {
        callback(
            error instanceof Error
                ? error
                : new Error('Private channel authorization failed.'),
            null,
        );
    }
}

export function getEcho(): Echo<'pusher'> | null {
    if (echoInstance) {
        return echoInstance;
    }

    const key = import.meta.env.VITE_PUSHER_APP_KEY?.trim();
    const cluster = import.meta.env.VITE_PUSHER_APP_CLUSTER?.trim();

    if (!key || !cluster) {
        return null;
    }

    echoInstance = new Echo<'pusher'>({
        broadcaster: 'pusher',
        key,
        cluster,
        forceTLS: true,
        Pusher,
        channelAuthorization: {
            customHandler: (params, callback): void => {
                void authorizePrivateChannel(params, callback);
            },
        },
    });

    return echoInstance;
}
