'use client'

import { useEffect, useState } from 'react'
import { syncManager } from '@/lib/pwa/sync'
import { dbManager } from '@/lib/pwa/indexedDB'

export default function PWAInstaller() {
    const [isOnline, setIsOnline] = useState(true)
    const [updateAvailable, setUpdateAvailable] = useState(false)
    const [pendingCount, setPendingCount] = useState(0)
    const [isSyncing, setIsSyncing] = useState(false)

    useEffect(() => {
        // Initialize IndexedDB
        dbManager.init().catch(console.error)

        // Register Service Worker
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker
                    .register('/sw.js')
                    .then((registration) => {
                        console.log('[PWA] Service Worker registered:', registration.scope)

                        // Check for updates
                        registration.addEventListener('updatefound', () => {
                            const newWorker = registration.installing
                            if (newWorker) {
                                newWorker.addEventListener('statechange', () => {
                                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                        setUpdateAvailable(true)
                                    }
                                })
                            }
                        })
                    })
                    .catch((error) => {
                        console.error('[PWA] Service Worker registration failed:', error)
                    })
            })
        }

        // Monitor online/offline status
        const handleOnline = async () => {
            console.log('[PWA] Back online')
            setIsOnline(true)

            // Auto-sync when coming back online
            const hasPending = await syncManager.hasPendingData()
            if (hasPending) {
                await handleSync()
            }
        }

        const handleOffline = () => {
            console.log('[PWA] Gone offline')
            setIsOnline(false)
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        // Set initial state
        setIsOnline(navigator.onLine)

        // Check pending count periodically
        const checkPending = async () => {
            try {
                const count = await syncManager.getPendingCount()
                setPendingCount(count)
            } catch (error) {
                console.error('[PWA] Error checking pending count:', error)
                setPendingCount(0)
            }
        }

        checkPending()
        const interval = setInterval(checkPending, 10000) // Check every 10 seconds

        // Listen to sync status changes
        syncManager.onSyncStatusChange((status) => {
            setIsSyncing(status === 'syncing')
        })

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
            clearInterval(interval)
        }
    }, [])

    const handleUpdate = () => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.getRegistration().then((registration) => {
                if (registration?.waiting) {
                    registration.waiting.postMessage({ type: 'SKIP_WAITING' })
                    window.location.reload()
                }
            })
        }
    }

    const handleSync = async () => {
        setIsSyncing(true)
        try {
            const result = await syncManager.syncAll()
            console.log('[PWA] Sync result:', result)

            if (result.success) {
                setPendingCount(0)
            }
        } catch (error) {
            console.error('[PWA] Sync error:', error)
        } finally {
            setIsSyncing(false)
        }
    }

    return (
        <>
            {/* Offline Indicator */}
            {!isOnline && (
                <div className="fixed top-0 left-0 right-0 z-50 bg-orange-600 text-white px-4 py-2 text-center text-sm font-medium">
                    🔌 Sin conexión - Trabajando en modo offline
                    {pendingCount > 0 && ` (${pendingCount} cambios pendientes)`}
                </div>
            )}

            {/* Syncing Indicator */}
            {isSyncing && (
                <div className="fixed top-0 left-0 right-0 z-50 bg-blue-600 text-white px-4 py-2 text-center text-sm font-medium">
                    🔄 Sincronizando datos...
                </div>
            )}

            {/* Pending Sync Banner (when online but has pending) */}
            {isOnline && pendingCount > 0 && !isSyncing && (
                <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-600 text-white px-4 py-2 text-center text-sm font-medium flex items-center justify-center gap-3">
                    <span>⏳ {pendingCount} cambios pendientes de sincronizar</span>
                    <button
                        onClick={handleSync}
                        className="px-3 py-1 bg-white text-yellow-600 rounded font-medium hover:bg-yellow-50 transition-colors"
                    >
                        Sincronizar ahora
                    </button>
                </div>
            )}

            {/* Update Available Banner */}
            {updateAvailable && (
                <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 bg-violet-600 text-white rounded-lg shadow-lg p-4">
                    <div className="flex items-center justify-between gap-4">
                        <div>
                            <p className="font-semibold">Nueva versión disponible</p>
                            <p className="text-sm text-violet-100">Actualiza para obtener las últimas mejoras</p>
                        </div>
                        <button
                            onClick={handleUpdate}
                            className="px-4 py-2 bg-white text-violet-600 rounded-lg font-medium hover:bg-violet-50 transition-colors whitespace-nowrap"
                        >
                            Actualizar
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}
