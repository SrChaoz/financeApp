// Offline detection and handling utilities

export function isOnline(): boolean {
    return navigator.onLine;
}

export function isOffline(): boolean {
    return !navigator.onLine;
}

// Wait for online connection
export function waitForOnline(timeout = 30000): Promise<void> {
    return new Promise((resolve, reject) => {
        if (isOnline()) {
            resolve();
            return;
        }

        const timeoutId = setTimeout(() => {
            window.removeEventListener('online', handleOnline);
            reject(new Error('Timeout waiting for online connection'));
        }, timeout);

        const handleOnline = () => {
            clearTimeout(timeoutId);
            window.removeEventListener('online', handleOnline);
            resolve();
        };

        window.addEventListener('online', handleOnline);
    });
}

// Check if Service Worker is supported
export function isServiceWorkerSupported(): boolean {
    return 'serviceWorker' in navigator;
}

// Check if IndexedDB is supported
export function isIndexedDBSupported(): boolean {
    return 'indexedDB' in window;
}

// Check if PWA is installed
export function isPWAInstalled(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
}

// Get connection type (if available)
export function getConnectionType(): string {
    const connection = (navigator as any).connection ||
        (navigator as any).mozConnection ||
        (navigator as any).webkitConnection;

    return connection?.effectiveType || 'unknown';
}

// Check if connection is slow
export function isSlowConnection(): boolean {
    const type = getConnectionType();
    return type === 'slow-2g' || type === '2g';
}

// Estimate if user can sync (good connection)
export function canSync(): boolean {
    if (isOffline()) return false;
    if (isSlowConnection()) return false;
    return true;
}
