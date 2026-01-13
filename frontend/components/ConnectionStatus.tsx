'use client'

import { useEffect, useState } from 'react'
import { Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { getConnectionType, isSlowConnection } from '@/lib/pwa/offline'

export default function ConnectionStatus() {
    const [isOnline, setIsOnline] = useState(true)
    const [connectionType, setConnectionType] = useState('unknown')
    const [showStatus, setShowStatus] = useState(false)

    useEffect(() => {
        // Only run on client
        if (typeof window === 'undefined') return

        setIsOnline(navigator.onLine)
        setConnectionType(getConnectionType())

        const handleOnline = () => {
            setIsOnline(true)
            setConnectionType(getConnectionType())
            setShowStatus(true)
            setTimeout(() => setShowStatus(false), 3000)
        }

        const handleOffline = () => {
            setIsOnline(false)
            setShowStatus(true)
        }

        const handleConnectionChange = () => {
            setConnectionType(getConnectionType())
        }

        window.addEventListener('online', handleOnline)
        window.addEventListener('offline', handleOffline)

        // Listen to connection changes
        const connection = (navigator as any).connection ||
            (navigator as any).mozConnection ||
            (navigator as any).webkitConnection

        if (connection) {
            connection.addEventListener('change', handleConnectionChange)
        }

        // Handle pageshow event for bfcache
        const handlePageShow = (event: PageTransitionEvent) => {
            if (event.persisted) {
                // Page was restored from bfcache
                setIsOnline(navigator.onLine)
                setConnectionType(getConnectionType())
            }
        }

        window.addEventListener('pageshow', handlePageShow)

        return () => {
            window.removeEventListener('online', handleOnline)
            window.removeEventListener('offline', handleOffline)
            window.removeEventListener('pageshow', handlePageShow)
            if (connection) {
                connection.removeEventListener('change', handleConnectionChange)
            }
        }
    }, [])

    if (!showStatus && isOnline) return null

    const isSlow = isSlowConnection()

    return (
        <div className={`fixed bottom-24 md:bottom-8 right-4 z-40 transition-all duration-300 pointer-events-none ${showStatus ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg ${isOnline
                ? isSlow
                    ? 'bg-yellow-600 text-white'
                    : 'bg-green-600 text-white'
                : 'bg-red-600 text-white'
                }`}>
                {isOnline ? (
                    isSlow ? (
                        <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span className="text-sm font-medium">Conexión lenta ({connectionType})</span>
                        </>
                    ) : (
                        <>
                            <Wifi className="w-4 h-4" />
                            <span className="text-sm font-medium">Conectado</span>
                        </>
                    )
                ) : (
                    <>
                        <WifiOff className="w-4 h-4" />
                        <span className="text-sm font-medium">Sin conexión</span>
                    </>
                )}
            </div>
        </div>
    )
}
