import type { Metadata } from 'next'
import './globals.css'
import { Inter } from 'next/font/google'
import Navigation from '@/components/Navigation'
import { ToastProvider } from '@/components/ToastProvider'
import PageTransition from '@/components/PageTransition'
import PWAInstaller from '@/components/PWAInstaller'
import InstallPrompt from '@/components/InstallPrompt'
import ConnectionStatus from '@/components/ConnectionStatus'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'FinanzasPro - Gestión Financiera Personal',
    description: 'Administra tus finanzas personales de manera inteligente',
    manifest: '/manifest.json',
    themeColor: '#8b5cf6',
    appleWebApp: {
        capable: true,
        statusBarStyle: 'black-translucent',
        title: 'FinanzasPro',
    },
    viewport: {
        width: 'device-width',
        initialScale: 1,
        maximumScale: 1,
        userScalable: false,
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
                        <Navigation />
                        <PageTransition>
                            <main className="pb-20 md:pb-0 md:ml-64">
                                {children}
                            </main>
                        </PageTransition>
                    </div>
                    <PWAInstaller />
                    <InstallPrompt />
                    <ConnectionStatus />
                </ToastProvider>
            </body>
        </html>
    )
}
