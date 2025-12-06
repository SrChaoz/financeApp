import './globals.css'
import { Inter } from 'next/font/google'
import Navigation from '@/components/Navigation'
import { ToastProvider } from '@/components/ToastProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
    title: 'FinanzasPro - Gestión Financiera Personal',
    description: 'Administra tus finanzas personales de manera inteligente',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es" className="dark">
            <body className={inter.className}>
                <ToastProvider>
                    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                        <Navigation />
                        <main className="pb-20 md:pb-0 md:ml-64">
                            {children}
                        </main>
                    </div>
                </ToastProvider>
            </body>
        </html>
    )
}
