'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, CreditCard, Receipt, PieChart, LogOut, Target, Bell, Wallet, MoreHorizontal, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react' // Import useState for mobile menu

const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Transacciones', href: '/transactions', icon: Receipt },
    { label: 'Cuentas', href: '/accounts', icon: CreditCard },
    { label: 'Presupuestos', href: '/budgets', icon: PieChart },
    { label: 'Metas', href: '/goals', icon: Target },
    { label: 'Recordatorios', href: '/reminders', icon: Bell },
    { label: 'Perfil', href: '/profile', icon: User },
]

export default function Navigation() {
    const pathname = usePathname()
    const router = useRouter()
    const [showMobileMoreMenu, setShowMobileMoreMenu] = useState(false)

    // Don't show navigation on login page
    if (pathname === '/login') return null

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
    }

    // Items to show directly in mobile bottom nav (e.g., first 3)
    const mobileDirectNavItems = navItems.slice(0, 3)
    // Items to show in the "More" menu
    const mobileMoreMenuItems = navItems.slice(3)

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 glass-effect border-r border-slate-800 z-50">
                <div className="flex flex-col flex-1 p-6">
                    {/* Logo */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 flex items-center justify-center">
                            <Wallet className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">FinanzasPro</span>
                    </div>

                    {/* Navigation Links (All items for desktop) */}
                    <nav className="flex-1 space-y-2">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive
                                        ? 'bg-violet-600 text-white'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all mt-4"
                    >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-effect border-t border-slate-800 z-50">
                <div className="flex justify-around items-center h-16 px-2">
                    {mobileDirectNavItems.map((item) => {
                        const Icon = item.icon
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all ${isActive
                                    ? 'text-violet-400'
                                    : 'text-slate-400'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="text-xs font-medium">{item.label}</span>
                            </Link>
                        )
                    })}
                    {/* More button for mobile */}
                    <button
                        onClick={() => setShowMobileMoreMenu(true)}
                        className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all ${showMobileMoreMenu ? 'text-violet-400' : 'text-slate-400'
                            }`}
                    >
                        <MoreHorizontal className="w-5 h-5" />
                        <span className="text-xs font-medium">Más</span>
                    </button>
                </div>

                {/* Mobile More Menu Modal - Elegant Dark Design */}
                {showMobileMoreMenu && (
                    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-end justify-center" onClick={() => setShowMobileMoreMenu(false)}>
                        <div className="bg-slate-900/95 backdrop-blur-xl border-t border-slate-700 p-6 w-full max-w-md rounded-t-3xl shadow-2xl" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white">Más Opciones</h3>
                                <button
                                    onClick={() => setShowMobileMoreMenu(false)}
                                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                                >
                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="space-y-3">
                                {mobileMoreMenuItems.map((item) => {
                                    const Icon = item.icon
                                    const isActive = pathname === item.href
                                    // Subtle accent colors
                                    const iconColorClass = item.label === 'Presupuestos'
                                        ? 'text-purple-400'
                                        : item.label === 'Metas'
                                            ? 'text-blue-400'
                                            : 'text-orange-400'

                                    const bgColorClass = item.label === 'Presupuestos'
                                        ? 'bg-purple-500/10'
                                        : item.label === 'Metas'
                                            ? 'bg-blue-500/10'
                                            : 'bg-orange-500/10'

                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setShowMobileMoreMenu(false)}
                                            className={`flex items-center gap-4 p-4 rounded-xl transition-all ${isActive
                                                    ? 'bg-slate-800 border border-slate-700'
                                                    : 'bg-slate-800/50 hover:bg-slate-800 border border-transparent hover:border-slate-700'
                                                }`}
                                        >
                                            <div className={`w-12 h-12 rounded-lg ${bgColorClass} flex items-center justify-center`}>
                                                <Icon className={`w-6 h-6 ${iconColorClass}`} />
                                            </div>
                                            <div className="flex-1">
                                                <span className="text-base font-semibold text-white block">{item.label}</span>
                                                <span className="text-xs text-slate-400">
                                                    {item.label === 'Presupuestos' && 'Controla tus gastos'}
                                                    {item.label === 'Metas' && 'Ahorra para tus objetivos'}
                                                    {item.label === 'Recordatorios' && 'No olvides tus pagos'}
                                                </span>
                                            </div>
                                            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </Link>
                                    )
                                })}
                                {/* Logout button */}
                                <button
                                    onClick={() => {
                                        handleLogout()
                                        setShowMobileMoreMenu(false)
                                    }}
                                    className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 transition-all w-full"
                                >
                                    <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center">
                                        <LogOut className="w-6 h-6 text-red-400" />
                                    </div>
                                    <div className="flex-1 text-left">
                                        <span className="text-base font-semibold text-white block">Cerrar Sesión</span>
                                        <span className="text-xs text-slate-400">Salir de tu cuenta</span>
                                    </div>
                                    <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Spacer for desktop sidebar */}
            <div className="hidden md:block md:w-64" />
        </>
    )
}
