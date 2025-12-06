// Synchronization Manager for FinanzasPro
// Handles syncing offline data with the server

import { dbManager, STORES } from './indexedDB';
import api from '../api';

class SyncManager {
    private isSyncing = false;
    private syncCallbacks: Array<(status: string) => void> = [];

    // Register callback for sync status updates
    onSyncStatusChange(callback: (status: string) => void) {
        this.syncCallbacks.push(callback);
    }

    private notifyStatusChange(status: string) {
        this.syncCallbacks.forEach(cb => cb(status));
    }

    // Main sync function
    async syncAll(): Promise<{ success: boolean; synced: number; failed: number }> {
        if (this.isSyncing) {
            console.log('[Sync] Already syncing, skipping...');
            return { success: false, synced: 0, failed: 0 };
        }

        if (!navigator.onLine) {
            console.log('[Sync] Offline, cannot sync');
            return { success: false, synced: 0, failed: 0 };
        }

        this.isSyncing = true;
        this.notifyStatusChange('syncing');

        let totalSynced = 0;
        let totalFailed = 0;

        try {
            // Sync in order: Accounts → Transactions → Budgets → Goals
            const accountsResult = await this.syncPendingAccounts();
            totalSynced += accountsResult.synced;
            totalFailed += accountsResult.failed;

            const transactionsResult = await this.syncPendingTransactions();
            totalSynced += transactionsResult.synced;
            totalFailed += transactionsResult.failed;

            const budgetsResult = await this.syncPendingBudgets();
            totalSynced += budgetsResult.synced;
            totalFailed += budgetsResult.failed;

            const goalsResult = await this.syncPendingGoals();
            totalSynced += goalsResult.synced;
            totalFailed += goalsResult.failed;

            // Clean up synced items
            await this.cleanupSyncedItems();

            console.log(`[Sync] Complete: ${totalSynced} synced, ${totalFailed} failed`);
            this.notifyStatusChange('idle');

            return {
                success: totalFailed === 0,
                synced: totalSynced,
                failed: totalFailed,
            };
        } catch (error) {
            console.error('[Sync] Error during sync:', error);
            this.notifyStatusChange('error');
            return { success: false, synced: totalSynced, failed: totalFailed };
        } finally {
            this.isSyncing = false;
        }
    }

    // Sync pending transactions
    private async syncPendingTransactions(): Promise<{ synced: number; failed: number }> {
        const pending = await dbManager.getPending(STORES.PENDING_TRANSACTIONS);
        let synced = 0;
        let failed = 0;

        for (const item of pending) {
            try {
                const response = await api.post('/api/transactions', {
                    amount: item.amount,
                    type: item.type,
                    date: item.date,
                    category: item.category,
                    notes: item.notes,
                    accountId: item.accountId,
                    isRecurring: item.isRecurring,
                });

                await dbManager.markAsSynced(
                    STORES.PENDING_TRANSACTIONS,
                    item.tempId,
                    response.data.transaction.id
                );

                synced++;
                console.log('[Sync] Transaction synced:', item.tempId);
            } catch (error) {
                console.error('[Sync] Failed to sync transaction:', error);
                failed++;
            }
        }

        return { synced, failed };
    }

    // Sync pending accounts
    private async syncPendingAccounts(): Promise<{ synced: number; failed: number }> {
        const pending = await dbManager.getPending(STORES.PENDING_ACCOUNTS);
        let synced = 0;
        let failed = 0;

        for (const item of pending) {
            try {
                const response = await api.post('/api/accounts', {
                    name: item.name,
                    type: item.type,
                });

                await dbManager.markAsSynced(
                    STORES.PENDING_ACCOUNTS,
                    item.tempId,
                    response.data.account.id
                );

                synced++;
                console.log('[Sync] Account synced:', item.tempId);
            } catch (error) {
                console.error('[Sync] Failed to sync account:', error);
                failed++;
            }
        }

        return { synced, failed };
    }

    // Sync pending budgets
    private async syncPendingBudgets(): Promise<{ synced: number; failed: number }> {
        const pending = await dbManager.getPending(STORES.PENDING_BUDGETS);
        let synced = 0;
        let failed = 0;

        for (const item of pending) {
            try {
                const response = await api.post('/api/budgets', {
                    category: item.category,
                    limitAmount: item.limitAmount,
                });

                await dbManager.markAsSynced(
                    STORES.PENDING_BUDGETS,
                    item.tempId,
                    response.data.budget.id
                );

                synced++;
                console.log('[Sync] Budget synced:', item.tempId);
            } catch (error) {
                console.error('[Sync] Failed to sync budget:', error);
                failed++;
            }
        }

        return { synced, failed };
    }

    // Sync pending goals
    private async syncPendingGoals(): Promise<{ synced: number; failed: number }> {
        const pending = await dbManager.getPending(STORES.PENDING_GOALS);
        let synced = 0;
        let failed = 0;

        for (const item of pending) {
            try {
                const response = await api.post('/api/goals', {
                    name: item.name,
                    targetAmount: item.targetAmount,
                    currentAmount: item.currentAmount,
                    deadline: item.deadline,
                    description: item.description,
                });

                await dbManager.markAsSynced(
                    STORES.PENDING_GOALS,
                    item.tempId,
                    response.data.goal.id
                );

                synced++;
                console.log('[Sync] Goal synced:', item.tempId);
            } catch (error) {
                console.error('[Sync] Failed to sync goal:', error);
                failed++;
            }
        }

        return { synced, failed };
    }

    // Clean up synced items older than 7 days
    private async cleanupSyncedItems(): Promise<void> {
        const stores = [
            STORES.PENDING_TRANSACTIONS,
            STORES.PENDING_ACCOUNTS,
            STORES.PENDING_BUDGETS,
            STORES.PENDING_GOALS,
        ];

        for (const store of stores) {
            await dbManager.deleteSynced(store);
        }

        console.log('[Sync] Cleanup complete');
    }

    // Get pending count
    async getPendingCount(): Promise<number> {
        const stores = [
            STORES.PENDING_TRANSACTIONS,
            STORES.PENDING_ACCOUNTS,
            STORES.PENDING_BUDGETS,
            STORES.PENDING_GOALS,
        ];

        let total = 0;
        for (const store of stores) {
            const pending = await dbManager.getPending(store);
            total += pending.length;
        }

        return total;
    }

    // Check if there's pending data
    async hasPendingData(): Promise<boolean> {
        const count = await this.getPendingCount();
        return count > 0;
    }
}

// Export singleton instance
export const syncManager = new SyncManager();
