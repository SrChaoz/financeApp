// Custom hook for offline functionality
// Use this in components that need offline support

import { useState, useEffect } from 'react';
import { dbManager, STORES } from '../pwa/indexedDB';
import { syncManager } from '../pwa/sync';

export function useOffline() {
    const [isOnline, setIsOnline] = useState(true);
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        // Set initial state
        setIsOnline(navigator.onLine);

        // Monitor online/offline
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Update pending count
        const updatePendingCount = async () => {
            const count = await syncManager.getPendingCount();
            setPendingCount(count);
        };

        updatePendingCount();
        const interval = setInterval(updatePendingCount, 5000);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(interval);
        };
    }, []);

    // Save data offline
    const saveOffline = async (type: 'transaction' | 'account' | 'budget' | 'goal', data: any) => {
        const storeMap = {
            transaction: STORES.PENDING_TRANSACTIONS,
            account: STORES.PENDING_ACCOUNTS,
            budget: STORES.PENDING_BUDGETS,
            goal: STORES.PENDING_GOALS,
        };

        const store = storeMap[type];
        const tempId = await dbManager.addPending(store, data);

        console.log(`[useOffline] Saved ${type} offline:`, tempId);
        return tempId;
    };

    // Trigger manual sync
    const triggerSync = async () => {
        if (!isOnline) {
            throw new Error('Cannot sync while offline');
        }

        return await syncManager.syncAll();
    };

    return {
        isOnline,
        pendingCount,
        saveOffline,
        triggerSync,
        hasPendingData: pendingCount > 0,
    };
}
