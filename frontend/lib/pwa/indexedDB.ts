// IndexedDB Manager for FinanzasPro
// Handles offline data storage and synchronization

const DB_NAME = 'FinanzasProDB';
const DB_VERSION = 2; // Incremented to add indexes to all stores

// Object stores (tables)
const STORES = {
    PENDING_TRANSACTIONS: 'pendingTransactions',
    PENDING_ACCOUNTS: 'pendingAccounts',
    PENDING_BUDGETS: 'pendingBudgets',
    PENDING_GOALS: 'pendingGoals',
    CACHED_DATA: 'cachedData',
    SYNC_QUEUE: 'syncQueue',
};

class IndexedDBManager {
    private db: IDBDatabase | null = null;

    // Initialize database
    async init(): Promise<void> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('[IndexedDB] Error opening database:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('[IndexedDB] Database opened successfully');
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                console.log('[IndexedDB] Upgrading database...');

                // Create object stores if they don't exist
                if (!db.objectStoreNames.contains(STORES.PENDING_TRANSACTIONS)) {
                    const store = db.createObjectStore(STORES.PENDING_TRANSACTIONS, {
                        keyPath: 'tempId',
                        autoIncrement: true,
                    });
                    store.createIndex('synced', 'synced', { unique: false });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }

                if (!db.objectStoreNames.contains(STORES.PENDING_ACCOUNTS)) {
                    const store = db.createObjectStore(STORES.PENDING_ACCOUNTS, {
                        keyPath: 'tempId',
                        autoIncrement: true,
                    });
                    store.createIndex('synced', 'synced', { unique: false });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }

                if (!db.objectStoreNames.contains(STORES.PENDING_BUDGETS)) {
                    const store = db.createObjectStore(STORES.PENDING_BUDGETS, {
                        keyPath: 'tempId',
                        autoIncrement: true,
                    });
                    store.createIndex('synced', 'synced', { unique: false });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }

                if (!db.objectStoreNames.contains(STORES.PENDING_GOALS)) {
                    const store = db.createObjectStore(STORES.PENDING_GOALS, {
                        keyPath: 'tempId',
                        autoIncrement: true,
                    });
                    store.createIndex('synced', 'synced', { unique: false });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                }

                if (!db.objectStoreNames.contains(STORES.CACHED_DATA)) {
                    db.createObjectStore(STORES.CACHED_DATA, { keyPath: 'key' });
                }

                if (!db.objectStoreNames.contains(STORES.SYNC_QUEUE)) {
                    const store = db.createObjectStore(STORES.SYNC_QUEUE, {
                        keyPath: 'id',
                        autoIncrement: true,
                    });
                    store.createIndex('timestamp', 'timestamp', { unique: false });
                    store.createIndex('type', 'type', { unique: false });
                }
            };
        });
    }

    // Add item to pending queue
    async addPending(storeName: string, data: any): Promise<number> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);

            const item = {
                ...data,
                synced: false,
                timestamp: Date.now(),
            };

            const request = store.add(item);

            request.onsuccess = () => {
                console.log('[IndexedDB] Item added to pending:', storeName);
                resolve(request.result as number);
            };

            request.onerror = () => {
                console.error('[IndexedDB] Error adding item:', request.error);
                reject(request.error);
            };
        });
    }

    // Get all pending items
    async getPending(storeName: string): Promise<any[]> {
        if (!this.db) await this.init();

        return new Promise((resolve) => {
            try {
                const transaction = this.db!.transaction([storeName], 'readonly');
                const store = transaction.objectStore(storeName);
                const request = store.getAll();

                request.onsuccess = () => {
                    try {
                        const allItems = request.result || [];
                        // Filter items where synced is false or undefined
                        const pendingItems = allItems.filter((item: any) => !item.synced);
                        resolve(pendingItems);
                    } catch (filterError) {
                        console.error('[IndexedDB] Error filtering items:', filterError);
                        resolve([]);
                    }
                };

                request.onerror = () => {
                    console.error('[IndexedDB] Error getting all items:', request.error);
                    resolve([]);
                };
            } catch (error) {
                console.error('[IndexedDB] Error in getPending:', error);
                resolve([]);
            }
        });
    }

    // Mark item as synced
    async markAsSynced(storeName: string, tempId: number, realId?: string): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.get(tempId);

            request.onsuccess = () => {
                const item = request.result;
                if (item) {
                    item.synced = true;
                    item.syncedAt = Date.now();
                    if (realId) item.realId = realId;

                    const updateRequest = store.put(item);
                    updateRequest.onsuccess = () => resolve();
                    updateRequest.onerror = () => reject(updateRequest.error);
                } else {
                    resolve();
                }
            };

            request.onerror = () => reject(request.error);
        });
    }

    // Delete synced items
    async deleteSynced(storeName: string): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve) => {
            try {
                const transaction = this.db!.transaction([storeName], 'readwrite');
                const store = transaction.objectStore(storeName);
                const request = store.openCursor();

                request.onsuccess = (event) => {
                    const cursor = (event.target as IDBRequest).result;
                    if (cursor) {
                        if (cursor.value.synced === true) {
                            cursor.delete();
                        }
                        cursor.continue();
                    } else {
                        resolve();
                    }
                };

                request.onerror = () => {
                    console.error('[IndexedDB] Error in deleteSynced:', request.error);
                    resolve();
                };
            } catch (error) {
                console.error('[IndexedDB] Error in deleteSynced:', error);
                resolve();
            }
        });
    }

    // Cache data
    async cacheData(key: string, data: any): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORES.CACHED_DATA], 'readwrite');
            const store = transaction.objectStore(STORES.CACHED_DATA);

            const item = {
                key,
                data,
                timestamp: Date.now(),
            };

            const request = store.put(item);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Get cached data
    async getCachedData(key: string): Promise<any | null> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORES.CACHED_DATA], 'readonly');
            const store = transaction.objectStore(STORES.CACHED_DATA);
            const request = store.get(key);

            request.onsuccess = () => {
                const result = request.result;
                if (result) {
                    resolve(result.data);
                } else {
                    resolve(null);
                }
            };

            request.onerror = () => reject(request.error);
        });
    }

    // Add to sync queue
    async addToSyncQueue(type: string, action: string, data: any): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORES.SYNC_QUEUE], 'readwrite');
            const store = transaction.objectStore(STORES.SYNC_QUEUE);

            const item = {
                type,
                action,
                data,
                timestamp: Date.now(),
                retries: 0,
            };

            const request = store.add(item);

            request.onsuccess = () => {
                console.log('[IndexedDB] Added to sync queue:', type, action);
                resolve();
            };

            request.onerror = () => reject(request.error);
        });
    }

    // Get sync queue
    async getSyncQueue(): Promise<any[]> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORES.SYNC_QUEUE], 'readonly');
            const store = transaction.objectStore(STORES.SYNC_QUEUE);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Remove from sync queue
    async removeFromSyncQueue(id: number): Promise<void> {
        if (!this.db) await this.init();

        return new Promise((resolve, reject) => {
            const transaction = this.db!.transaction([STORES.SYNC_QUEUE], 'readwrite');
            const store = transaction.objectStore(STORES.SYNC_QUEUE);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // Clear all data (for logout)
    async clearAll(): Promise<void> {
        if (!this.db) await this.init();

        const storeNames = Object.values(STORES);
        const transaction = this.db!.transaction(storeNames, 'readwrite');

        return new Promise((resolve, reject) => {
            let completed = 0;

            storeNames.forEach((storeName) => {
                const store = transaction.objectStore(storeName);
                const request = store.clear();

                request.onsuccess = () => {
                    completed++;
                    if (completed === storeNames.length) {
                        console.log('[IndexedDB] All data cleared');
                        resolve();
                    }
                };

                request.onerror = () => reject(request.error);
            });
        });
    }
}

// Export singleton instance
export const dbManager = new IndexedDBManager();
export { STORES };
