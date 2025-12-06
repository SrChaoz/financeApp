// FinanzasPro Service Worker
// Version 1.0.0

const CACHE_VERSION = 'finanzaspro-v1.0.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const API_CACHE = `${CACHE_VERSION}-api`;

// Files to cache immediately on install
const STATIC_ASSETS = [
    '/',
    '/dashboard',
    '/transactions',
    '/accounts',
    '/budgets',
    '/goals',
    '/reminders',
    '/profile',
    '/offline',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing Service Worker...', CACHE_VERSION);

    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then((cache) => {
                console.log('[SW] Precaching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('[SW] Skip waiting');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('[SW] Installation failed:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating Service Worker...', CACHE_VERSION);

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((cacheName) => {
                            // Delete old caches
                            return cacheName.startsWith('finanzaspro-') &&
                                cacheName !== STATIC_CACHE &&
                                cacheName !== DYNAMIC_CACHE &&
                                cacheName !== API_CACHE;
                        })
                        .map((cacheName) => {
                            console.log('[SW] Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        })
                );
            })
            .then(() => {
                console.log('[SW] Claiming clients');
                return self.clients.claim();
            })
    );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Skip chrome extensions and other origins
    if (!url.origin.includes(self.location.origin)) {
        return;
    }

    // API requests - Network First strategy
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(networkFirstStrategy(request, API_CACHE));
        return;
    }

    // Static assets (images, fonts, icons) - Cache First strategy
    if (request.destination === 'image' ||
        request.destination === 'font' ||
        url.pathname.startsWith('/icons/')) {
        event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
        return;
    }

    // Navigation requests - Network First with offline fallback
    if (request.mode === 'navigate') {
        event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE, '/offline'));
        return;
    }

    // Other requests - Stale While Revalidate
    event.respondWith(staleWhileRevalidate(request, DYNAMIC_CACHE));
});

// Cache First Strategy
async function cacheFirstStrategy(request, cacheName) {
    try {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.error('[SW] Cache First failed:', error);
        return new Response('Offline', { status: 503 });
    }
}

// Network First Strategy
async function networkFirstStrategy(request, cacheName, fallbackUrl = null) {
    try {
        const networkResponse = await fetch(request);

        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            cache.put(request, networkResponse.clone());
        }

        return networkResponse;
    } catch (error) {
        console.log('[SW] Network failed, trying cache:', request.url);

        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }

        // If navigation request and has fallback, return offline page
        if (fallbackUrl && request.mode === 'navigate') {
            const fallbackResponse = await caches.match(fallbackUrl);
            if (fallbackResponse) {
                return fallbackResponse;
            }
        }

        return new Response(
            JSON.stringify({
                error: 'No internet connection',
                offline: true
            }),
            {
                status: 503,
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
}

// Stale While Revalidate Strategy
async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await caches.match(request);

    const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(() => {
        // Network failed, return cached response if available
        return cachedResponse;
    });

    return cachedResponse || fetchPromise;
}

// Background Sync - for offline data synchronization
self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync triggered:', event.tag);

    if (event.tag === 'sync-transactions') {
        event.waitUntil(syncPendingTransactions());
    }
});

async function syncPendingTransactions() {
    try {
        // This will be implemented with IndexedDB
        console.log('[SW] Syncing pending transactions...');

        // Get pending transactions from IndexedDB
        // Send to server
        // Update local state

        return Promise.resolve();
    } catch (error) {
        console.error('[SW] Sync failed:', error);
        return Promise.reject(error);
    }
}

// Push notifications (optional - for reminders)
self.addEventListener('push', (event) => {
    console.log('[SW] Push notification received');

    const options = {
        body: event.data ? event.data.text() : 'Nueva notificación',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-72x72.png',
        vibrate: [200, 100, 200],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 1
        },
        actions: [
            {
                action: 'view',
                title: 'Ver',
                icon: '/icons/icon-96x96.png'
            },
            {
                action: 'close',
                title: 'Cerrar'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('FinanzasPro', options)
    );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked:', event.action);

    event.notification.close();

    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

console.log('[SW] Service Worker loaded');
