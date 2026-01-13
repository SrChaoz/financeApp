import type { Metadata, Viewport } from 'next'
import './globals.css'
import { Inter } from 'next/font/google'
import { ToastProvider } from '@/components/ToastProvider'

import PWAInstaller from '@/components/PWAInstaller'
import InstallPrompt from '@/components/InstallPrompt'
import ConnectionStatus from '@/components/ConnectionStatus'


const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
    themeColor: '#8b5cf6',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
}

export const metadata: Metadata = {
    title: 'FinanzasPro - Gestión Financiera Personal',
    description: 'Administra tus finanzas personales de manera inteligente',
    manifest: '/manifest.json',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'FinanzasPro',
    },
    icons: {
        icon: [
            { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
            { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
        apple: [
            { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
            { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
        ],
    },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es" className="dark">
            <body className={inter.className}>
                <ToastProvider>
                    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                        {children}
                    </div>
                    <PWAInstaller />
                    <InstallPrompt />
                    <ConnectionStatus />
                </ToastProvider>
            </body>
        </html>
    )
}
