import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const reverbKey = import.meta.env.VITE_REVERB_APP_KEY;

if (reverbKey && reverbKey !== 'null' && reverbKey !== 'undefined') {
    try {
        window.Echo = new Echo({
            broadcaster: 'reverb',
            key: reverbKey,
            wsHost: import.meta.env.VITE_REVERB_HOST ?? window.location.hostname,
            wsPort: import.meta.env.VITE_REVERB_PORT ?? 80,
            wssPort: import.meta.env.VITE_REVERB_PORT ?? 443,
            forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? 'http') === 'https',
            enabledTransports: ['ws', 'wss'],
        });

        // If the WebSocket server is unavailable or fails, disconnect to prevent error flooding
        if (window.Echo?.connector?.pusher?.connection) {
            window.Echo.connector.pusher.connection.bind('unavailable', () => {
                window.Echo?.disconnect();
            });
            window.Echo.connector.pusher.connection.bind('failed', () => {
                window.Echo?.disconnect();
            });
        }
    } catch (e) {
        window.Echo = null;
    }
} else {
    window.Echo = null;
}

export default window.Echo;
