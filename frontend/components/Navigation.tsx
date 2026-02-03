'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, CreditCard, Receipt, PieChart, LogOut, Target, Bell, Wallet, User, Plus, TrendingUp, TrendingDown, MoreHorizontal, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Image from 'next/image'

const TransactionModal = dynamic(() => import('./TransactionModal'), { ssr: false })

const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Transacciones', href: '/transactions', icon: Receipt },
    { label: 'Cuentas', href: '/accounts', icon: CreditCard },
    { label: 'Presupuestos', href: '/budgets', icon: PieChart },
    { label: 'Metas', href: '/goals', icon: Target },
    { label: 'Recordatorios', href: '/reminders', icon: Bell },
    { label: 'Perfil', href: '/profile', icon: User },
]

// ==========================================
// NUEVO SVG: EFECTO LIQUID (Color Corregido)
// ==========================================
const NavBarCurve = () => (
    <svg
        viewBox="0 0 375 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute bottom-0 left-0 w-full h-[70px] drop-shadow-[0_-5px_10px_rgba(0,0,0,0.3)] z-0"
        preserveAspectRatio="none"
    >
        {/* COLOR CAMBIADO: fill-zinc-900 (Gris oscuro visible) en lugar de 950 (Negro) */}
        <path
            d="M0,0 L130,0 C155,0 160,50 187.5,50 C215,50 220,0 245,0 L375,0 V80 H0 Z"
            className="fill-zinc-900"
        />
    </svg>
)

export default function Navigation() {
    const pathname = usePathname()
    const router = useRouter()
    const [showTransactionModal, setShowTransactionModal] = useState(false)
    const [initialTransactionType, setInitialTransactionType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
    const [showMobileMoreMenu, setShowMobileMoreMenu] = useState(false)

    useEffect(() => {
        const handleOpenModal = (event: any) => {
            const { type } = event.detail
            if (type) setInitialTransactionType(type)
            setShowTransactionModal(true)
        }
        window.addEventListener('openTransactionModal', handleOpenModal)
        return () => window.removeEventListener('openTransactionModal', handleOpenModal)
    }, [])

    if (pathname === '/login') return null

    const handleLogout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
    }

    const handleTransactionSuccess = () => {
        window.location.reload()
    }

    const mobileLeftItems = navItems.slice(0, 2)
    const mobileRightItems = [navItems[2], { label: 'Más', href: '#', icon: MoreHorizontal }]
    const mobileMoreItems = navItems.slice(3)

    return (
        <>
            {/* DESKTOP SIDEBAR - (Sin cambios) */}
            <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 bg-zinc-950 border-r border-zinc-800 z-50">
                <div className="flex flex-col h-full p-6">
                    {/* Logo Section */}
                    <div className="flex items-center gap-3 mb-12">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-glow-primary overflow-hidden bg-black">
                            <Image src="/logo.png" alt="Logo" width={48} height={48} className="object-cover w-full h-full" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white tracking-tight">VixFinanzas</h1>
                            <p className="text-xs text-zinc-500">Gestión Inteligente</p>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-2 mb-8">
                        <button
                            onClick={() => {
                                setInitialTransactionType('INCOME')
                                setShowTransactionModal(true)
                            }}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 transition-all group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <TrendingUp className="w-4 h-4 text-emerald-500" />
                            </div>
                            <span className="text-xs font-semibold text-emerald-500">Ingreso</span>
                        </button>
                        <button
                            onClick={() => {
                                setInitialTransactionType('EXPENSE')
                                setShowTransactionModal(true)
                            }}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all group"
                        >
                            <div className="w-8 h-8 rounded-lg bg-rose-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <TrendingDown className="w-4 h-4 text-rose-500" />
                            </div>
                            <span className="text-xs font-semibold text-rose-500">Gasto</span>
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <nav className="flex-1 space-y-1">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${isActive
                                        ? 'bg-primary/10 text-white'
                                        : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                                        }`}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 w-1 h-8 bg-primary rounded-r-full" />
                                    )}
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isActive ? 'bg-primary/20' : 'bg-zinc-900 group-hover:bg-zinc-800'
                                        }`}>
                                        <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : ''}`} />
                                    </div>
                                    <span className="font-medium text-sm">{item.label}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all group mt-4"
                    >
                        <div className="w-10 h-10 rounded-xl bg-zinc-900 group-hover:bg-rose-500/20 flex items-center justify-center transition-all">
                            <LogOut className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-sm">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* ========================================================= */}
            {/* MOBILE NAV: COLOR CORREGIDO */}
            {/* ========================================================= */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-[80px]">

                <NavBarCurve />

                <div className="relative w-full h-full z-10">

                    {/* BOTÓN CENTRAL */}
                    {/* border-zinc-950 es correcto si tu FONDO DE BODY es negro. 
                        Esto crea el "recorte" sobre la barra gris (zinc-900). 
                    */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20">
                        <button
                            onClick={() => setShowTransactionModal(true)}
                            className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center shadow-[0_4px_15px_rgba(99,102,241,0.4)] hover:scale-105 active:scale-95 transition-all text-white border-[4px] border-zinc-950"
                        >
                            <Plus size={30} strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* ICONOS */}
                    <div className="h-full flex items-end justify-between px-8 pb-4">

                        {/* Izquierda */}
                        <div className="flex items-center gap-6">
                            {mobileLeftItems.map((item) => {
                                const Icon = item.icon
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="flex flex-col items-center gap-1 w-12 group"
                                    >
                                        <div className={`transition-all duration-300 ${isActive ? 'text-indigo-400 -translate-y-1' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                                            <Icon className="w-7 h-7" strokeWidth={isActive ? 2.5 : 2} />
                                        </div>
                                        {isActive && (
                                            <span className="text-[10px] font-medium text-white animate-fade-in absolute -bottom-3">
                                                {item.label.split(' ')[0]}
                                            </span>
                                        )}
                                    </Link>
                                )
                            })}
                        </div>

                        {/* Espacio Central */}
                        <div className="w-20" />

                        {/* Derecha */}
                        <div className="flex items-center gap-6">
                            {mobileRightItems.map((item) => {
                                const Icon = item.icon
                                const isActive = pathname === item.href
                                const isMore = item.label === 'Más'

                                if (isMore) {
                                    return (
                                        <button
                                            key={item.label}
                                            onClick={() => setShowMobileMoreMenu(true)}
                                            className="flex flex-col items-center gap-1 w-12 group"
                                        >
                                            <div className="text-zinc-500 transition-all group-hover:text-zinc-300">
                                                <Icon className="w-7 h-7" strokeWidth={2} />
                                            </div>
                                        </button>
                                    )
                                }

                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className="flex flex-col items-center gap-1 w-12 group"
                                    >
                                        <div className={`transition-all duration-300 ${isActive ? 'text-indigo-400 -translate-y-1' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                                            <Icon className="w-7 h-7" strokeWidth={isActive ? 2.5 : 2} />
                                        </div>
                                        {isActive && (
                                            <span className="text-[10px] font-medium text-white animate-fade-in absolute -bottom-3">
                                                {item.label.split(' ')[0]}
                                            </span>
                                        )}
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile More Menu Modal */}
            {showMobileMoreMenu && (
                <div className="md:hidden fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileMoreMenu(false)}>
                    <div className="absolute bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 rounded-t-3xl p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-white">Más opciones</h3>
                            <button
                                onClick={() => setShowMobileMoreMenu(false)}
                                className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-all"
                            >
                                <X className="w-5 h-5 text-zinc-400" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {mobileMoreItems.map((item) => {
                                const Icon = item.icon
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setShowMobileMoreMenu(false)}
                                        className={`flex items-center gap-3 p-4 rounded-xl transition-all ${isActive
                                            ? 'bg-primary/10 border border-primary/20'
                                            : 'bg-zinc-800 border border-zinc-700 hover:bg-zinc-700'
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isActive ? 'bg-primary/20' : 'bg-zinc-700'
                                            }`}>
                                            <Icon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-zinc-400'}`} />
                                        </div>
                                        <span className={`font-medium text-sm ${isActive ? 'text-white' : 'text-zinc-300'}`}>{item.label}</span>
                                    </Link>
                                )
                            })}
                        </div>
                    </div>
                </div>
            )}

            <TransactionModal
                isOpen={showTransactionModal}
                onClose={() => setShowTransactionModal(false)}
                onSuccess={handleTransactionSuccess}
                initialType={initialTransactionType}
            />
        </>
    )
}