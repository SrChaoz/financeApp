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

                {/* Mobile More Menu Modal/Popover */}
                {showMobileMoreMenu && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-end justify-center" onClick={() => setShowMobileMoreMenu(false)}>
                        <div className="glass-effect border-t border-slate-800 p-4 w-full max-w-md rounded-t-lg" onClick={(e) => e.stopPropagation()}>
                            <h3 className="text-lg font-semibold text-white mb-4">Más Opciones</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {mobileMoreMenuItems.map((item) => {
                                    const Icon = item.icon
                                    const isActive = pathname === item.href
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setShowMobileMoreMenu(false)}
                                            className={`flex flex-col items-center justify-center gap-2 p-4 rounded-lg transition-all ${isActive
                                                ? 'bg-violet-600 text-white'
                                                : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                                }`}
                                        >
                                            <Icon className="w-6 h-6" />
                                            <span className="text-sm font-medium text-center">{item.label}</span>
                                        </Link>
                                    )
                                })}
                                {/* Logout button in More menu */}
                                <button
                                    onClick={() => {
                                        handleLogout()
                                        setShowMobileMoreMenu(false)
                                    }}
                                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
                                >
                                    <LogOut className="w-6 h-6" />
                                    <span className="text-sm font-medium text-center">Cerrar Sesión</span>
                                </button>
                            </div>
                            <button
                                onClick={() => setShowMobileMoreMenu(false)}
                                className="mt-6 w-full py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                )}
            </nav>

            {/* Spacer for desktop sidebar */}
            <div className="hidden md:block md:w-64" />
        </>
    )
}
