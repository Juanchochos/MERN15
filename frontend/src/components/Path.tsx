const port = import.meta.env.VITE_BACKEND_PORT || '8000';
export const SERVER_URL = `http://localhost:${port}`;

export function buildPath(route: string): string {
    const path = route.replace(/^\//, '');
    const configuredBase = import.meta.env.VITE_API_BASE_URL?.trim().replace(/\/+$/, '');

    if (configuredBase) {
        return path ? `${configuredBase}/${path}` : configuredBase;
    }

    if (import.meta.env.DEV) {
        // boardgame.io needs an absolute backend URL for Socket.IO in local development.
        if (!path) {
            return SERVER_URL;
        }

        // Vite proxies /api requests to the local backend.
        return `/${path}`;
    }

    // In production, send requests back to the current site and let the reverse proxy
    // handle TLS termination and forwarding to the backend service.
    return path ? `${window.location.origin}/${path}` : window.location.origin;
}
