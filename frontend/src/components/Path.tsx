const app_name = 'rickymetral.xyz';

export function buildPath(route: string): string {
    const path = route.replace(/^\//, '');
    if (import.meta.env.MODE == 'development') {
        // boardgame.io client needs absolute server URL for Socket.IO
        if (!path) return 'https://localhost:5000';
        // Same-origin + Vite proxy → avoids cross-origin "Failed to fetch" for /api/*
        return '/' + path;
    }
    else {
        return 'https://' + app_name + ':5000/' + path;
    }
}