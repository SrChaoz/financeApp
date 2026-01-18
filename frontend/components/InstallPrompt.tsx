'use client'

import { useEffect, useState } from 'react'
import { X, Download } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [showPrompt, setShowPrompt] = useState(false)
    const [isInstalled, setIsInstalled] = useState(false)

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true)
            return
        }

        // Check if user previously dismissed
        const dismissed = localStorage.getItem('pwa-install-dismissed')
        if (dismissed) {
            const dismissedDate = new Date(dismissed)
            const daysSinceDismissed = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)

            // Show again after 7 days
            if (daysSinceDismissed < 7) {
                return
            }
        }

        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault()
            const promptEvent = e as BeforeInstallPromptEvent
            setDeferredPrompt(promptEvent)

            // Show prompt after 30 seconds of usage
            setTimeout(() => {
                setShowPrompt(true)
            }, 30000)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

        // Detect if app was installed
        window.addEventListener('appinstalled', () => {
            console.log('[PWA] App installed successfully')
            setIsInstalled(true)
            setShowPrompt(false)
            setDeferredPrompt(null)
        })

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
        }
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return

        try {
            await deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice

            console.log('[PWA] User choice:', outcome)

            if (outcome === 'accepted') {
                console.log('[PWA] User accepted the install prompt')
            } else {
                console.log('[PWA] User dismissed the install prompt')
                localStorage.setItem('pwa-install-dismissed', new Date().toISOString())
            }

            setDeferredPrompt(null)
            setShowPrompt(false)
        } catch (error) {
            console.error('[PWA] Install prompt error:', error)
        }
    }

    const handleDismiss = () => {
        setShowPrompt(false)
        localStorage.setItem('pwa-install-dismissed', new Date().toISOString())
    }

    if (isInstalled || !showPrompt || !deferredPrompt) {
        return null
    }

    return (
        <div className="fixed bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-in slide-in-from-bottom duration-300">
            <div className="glass-effect rounded-xl p-4 border border-primary/20 shadow-xl">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                        <Download className="w-6 h-6 text-white" />
                    </div>

                    <div className="flex-1">
                        <h3 className="font-semibold text-white mb-1">
                            Instalar FinanzasPro
                        </h3>
                        <p className="text-sm text-slate-400 mb-3">
                            Instala la app en tu dispositivo para acceso rápido y funcionalidad offline
                        </p>

                        <div className="flex gap-2">
                            <button
                                onClick={handleInstall}
                                className="flex-1 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                            >
                                Instalar
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                            >
                                Ahora no
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handleDismiss}
                        className="flex-shrink-0 text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    )
}
