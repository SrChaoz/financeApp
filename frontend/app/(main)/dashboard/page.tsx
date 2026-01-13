'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    RefreshCw,
    ChevronDown,
    ChevronUp
} from 'lucide-react'
import dynamic from 'next/dynamic'

const DashboardCharts = dynamic(() => import('@/components/DashboardCharts'), {
    loading: () => <div className="h-[250px] w-full animate-pulse bg-slate-800/50 rounded-2xl" />,
    ssr: false
})
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import WelcomeWizard from '@/components/WelcomeWizard'
import PullToRefresh from '@/components/PullToRefresh'
import AnimatedNumber from '@/components/AnimatedNumber'
import { getGreeting } from '@/lib/avatarUtils'



export default function DashboardPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [statistics, setStatistics] = useState<any>(null)
    const [transactions, setTransactions] = useState<any[]>([])
    const [dateRange, setDateRange] = useState<'7days' | '30days' | 'thisMonth' | 'all'>('30days')
    const [refreshing, setRefreshing] = useState(false)
    const [showCharts, setShowCharts] = useState(false)
    const [userProfile, setUserProfile] = useState<any>(null)
    const [showWelcomeWizard, setShowWelcomeWizard] = useState(false)
    const [showBalance, setShowBalance] = useState(true)
    const [todayStats, setTodayStats] = useState({ income: 0, expense: 0 })

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/login')
            return
        }
        fetchData()
        fetchUserProfile()
    }, [dateRange])

    // Handle back button - "Press twice to exit"
    useEffect(() => {
        let lastBackPress = 0

        const handleBackButton = () => {
            const now = Date.now()
            if (now - lastBackPress < 2000) {
                // Try to close the app (works in PWA)
                if (window.matchMedia('(display-mode: standalone)').matches) {
                    window.close()
                }
            } else {
                lastBackPress = now
                // Show toast notification
                const toast = document.createElement('div')
                toast.className = 'fixed bottom-20 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in slide-in-from-bottom'
                toast.textContent = 'Presiona de nuevo para salir'
                document.body.appendChild(toast)

                setTimeout(() => {
                    toast.remove()
                }, 2000)

                // Prevent navigation by pushing current state again
                window.history.pushState(null, '', window.location.pathname)
            }
        }

        // Push initial state to prevent going back
        window.history.pushState(null, '', window.location.pathname)
        window.addEventListener('popstate', handleBackButton)

        return () => {
            window.removeEventListener('popstate', handleBackButton)
        }
    }, [])


    const fetchData = async () => {
        try {
            setLoading(true)
            const [statsRes, transactionsRes] = await Promise.all([
                api.get('/api/transactions/statistics', {
                    params: { period: dateRange }
                }),
                api.get('/api/transactions', {
                    params: { limit: 10 }
                })
            ])

            setStatistics(statsRes.data.statistics)
            setTransactions(transactionsRes.data.transactions)

            // Calculate today's stats
            calculateTodayStats(transactionsRes.data.transactions)
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const calculateTodayStats = (allTransactions: any[]) => {
        const today = new Date().toISOString().split('T')[0]
        const todayTransactions = allTransactions.filter(t =>
            t.date.startsWith(today)
        )

        const income = todayTransactions
            .filter(t => t.type === 'INCOME')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0)

        const expense = todayTransactions
            .filter(t => t.type === 'EXPENSE')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0)

        setTodayStats({ income, expense })
    }

    const fetchUserProfile = async () => {
        try {
            const response = await api.get('/api/user/profile')
            setUserProfile(response.data)

            // Check if user has completed onboarding
            if (!response.data.profileCompleted) {
                setShowWelcomeWizard(true)
            }
        } catch (error) {
            console.error('Error fetching user profile:', error)
        }
    }

    const handleRefresh = async () => {
        setRefreshing(true)
        await fetchData()
        setRefreshing(false)
    }

    const toggleBalance = () => {
        const newValue = !showBalance
        setShowBalance(newValue)
        localStorage.setItem('showBalance', newValue.toString())
    }

    // Load balance visibility preference
    useEffect(() => {
        const saved = localStorage.getItem('showBalance')
        if (saved !== null) {
            setShowBalance(saved === 'true')
        }
    }, [])
    // Generate chart data for cash flow (last 7 or 30 days)
    const getCashFlowData = () => {
        const days = dateRange === '7days' ? 7 : dateRange === 'thisMonth' ? 30 : 30
        const data = []

        for (let i = days - 1; i >= 0; i--) {
            const date = subDays(new Date(), i)
            const dateStr = format(date, 'yyyy-MM-dd')

            const dayTransactions = transactions.filter(t =>
                format(new Date(t.date), 'yyyy-MM-dd') === dateStr
            )

            const income = dayTransactions
                .filter(t => t.type === 'INCOME')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0)

            const expense = dayTransactions
                .filter(t => t.type === 'EXPENSE')
                .reduce((sum, t) => sum + parseFloat(t.amount), 0)

            data.push({
                date: format(date, 'dd/MM'),
                income,
                expense
            })
        }

        return data
    }

    // Generate data for expenses by category
    const getExpensesByCategoryData = () => {
        const categoryMap: { [key: string]: number } = {}

        transactions
            .filter(t => t.type === 'EXPENSE')
            .forEach(t => {
                categoryMap[t.category] = (categoryMap[t.category] || 0) + parseFloat(t.amount)
            })

        return Object.entries(categoryMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8) // Top 8 categories
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    const balance = statistics?.balance || 0
    const totalIncome = statistics?.totalIncome || 0
    const totalExpenses = statistics?.totalExpenses || 0
    const cashFlowData = getCashFlowData()
    const expensesByCategoryData = getExpensesByCategoryData()

    return (
        <>
            <PullToRefresh onRefresh={handleRefresh}>
                <div className="container mx-auto px-4 py-8 max-w-7xl">
                    {/* Dynamic Greeting */}
                    {userProfile && (
                        <div className="glass-effect rounded-2xl p-6 mb-6 md:mb-8">
                            <div className="flex items-center gap-3">
                                <span className="text-4xl">{getGreeting(new Date().getHours(), userProfile.firstName).emoji}</span>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">
                                        {getGreeting(new Date().getHours(), userProfile.firstName).message}
                                    </h2>
                                    <p className="text-slate-400 text-sm mt-1">
                                        {format(new Date(), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main Balance Card - Condensed */}
                    <div className="glass-effect rounded-2xl p-6 mb-6 md:mb-8">
                        {/* Header with Balance Total and Eye Icon */}
                        <div className="flex justify-between items-start mb-6">
                            <span className="text-slate-400 text-xs font-medium uppercase tracking-wide">BALANCE TOTAL</span>
                            <button
                                onClick={toggleBalance}
                                className="p-2 hover:bg-slate-700/50 rounded-lg transition-colors"
                                title={showBalance ? "Ocultar balance" : "Mostrar balance"}
                            >
                                {showBalance ? (
                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {/* Balance Amount */}
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-8">
                            {showBalance ? (
                                <AnimatedNumber value={balance} prefix="$" decimals={2} duration={0.8} />
                            ) : (
                                "****"
                            )}
                        </h1>

                        {/* Income and Expenses - This Month */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-slate-800/50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <ArrowUpRight className="w-4 h-4 text-green-400" />
                                    <span className="text-green-400 text-xs font-medium uppercase">INGRESOS</span>
                                </div>
                                <p className="text-white text-2xl font-bold">
                                    {showBalance ? (
                                        <AnimatedNumber value={totalIncome} prefix="$" decimals={2} duration={0.8} />
                                    ) : (
                                        "****"
                                    )}
                                </p>
                                <span className="text-slate-500 text-xs mt-1 block">Este mes</span>
                            </div>

                            <div className="bg-slate-800/50 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-2">
                                    <ArrowDownRight className="w-4 h-4 text-red-400" />
                                    <span className="text-red-400 text-xs font-medium uppercase">GASTOS</span>
                                </div>
                                <p className="text-white text-2xl font-bold">
                                    {showBalance ? (
                                        <AnimatedNumber value={totalExpenses} prefix="$" decimals={2} duration={0.8} />
                                    ) : (
                                        "****"
                                    )}
                                </p>
                                <span className="text-slate-500 text-xs mt-1 block">Este mes</span>
                            </div>
                        </div>

                        {/* Today's Stats */}
                        <div className="pt-4 border-t border-slate-700">
                            <span className="text-slate-400 text-xs font-medium uppercase tracking-wide block mb-3">HOY</span>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <ArrowUpRight className="w-4 h-4 text-green-400" />
                                    <span className="text-green-400 text-sm font-medium">
                                        {showBalance ? `$${todayStats.income.toFixed(2)}` : "****"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <ArrowDownRight className="w-4 h-4 text-red-400" />
                                    <span className="text-red-400 text-sm font-medium">
                                        {showBalance ? `$${todayStats.expense.toFixed(2)}` : "****"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="grid grid-cols-3 gap-3 mb-6 md:mb-8">
                        <button
                            onClick={() => {
                                // Open transaction modal from navbar
                                const event = new CustomEvent('openTransactionModal', { detail: { type: 'EXPENSE' } })
                                window.dispatchEvent(event)
                            }}
                            className="glass-effect rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-slate-700/50 transition-all active:scale-95"
                        >
                            <div className="w-12 h-12 rounded-full bg-red-600/20 flex items-center justify-center">
                                <ArrowDownRight className="w-6 h-6 text-red-400" />
                            </div>
                            <span className="text-sm text-white font-medium">Gasto</span>
                        </button>

                        <button
                            onClick={() => {
                                const event = new CustomEvent('openTransactionModal', { detail: { type: 'INCOME' } })
                                window.dispatchEvent(event)
                            }}
                            className="glass-effect rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-slate-700/50 transition-all active:scale-95"
                        >
                            <div className="w-12 h-12 rounded-full bg-green-600/20 flex items-center justify-center">
                                <ArrowUpRight className="w-6 h-6 text-green-400" />
                            </div>
                            <span className="text-sm text-white font-medium">Ingreso</span>
                        </button>

                        <button
                            onClick={() => router.push('/accounts')}
                            className="glass-effect rounded-xl p-4 flex flex-col items-center gap-2 hover:bg-slate-700/50 transition-all active:scale-95"
                        >
                            <div className="w-12 h-12 rounded-full bg-violet-600/20 flex items-center justify-center">
                                <Wallet className="w-6 h-6 text-violet-400" />
                            </div>
                            <span className="text-sm text-white font-medium">Cuentas</span>
                        </button>
                    </div>

                    {/* Charts Section - Desktop Only */}
                    <div className="hidden md:block mb-6 md:mb-8">
                        <DashboardCharts
                            cashFlowData={cashFlowData}
                            expensesByCategoryData={expensesByCategoryData}
                        />
                    </div>

                    {/* Recent Transactions */}
                    <div className="glass-effect rounded-2xl p-4 md:p-6">
                        <div className="flex items-center justify-between mb-4 md:mb-6">
                            <h2 className="text-xl font-bold text-white">Transacciones Recientes</h2>
                            <button
                                onClick={() => router.push('/transactions')}
                                className="text-violet-400 hover:text-violet-300 text-sm font-medium"
                            >
                                Ver todas
                            </button>
                        </div>

                        {transactions.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-slate-400 mb-4">No hay transacciones aún</p>
                                <p className="text-slate-500 text-sm">Usa el botón de + en el navbar para agregar tu primera transacción</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {transactions.slice(0, 5).map((transaction) => (
                                    <div
                                        key={transaction.id}
                                        className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg hover:bg-slate-800/50 transition-all"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${transaction.type === 'INCOME'
                                                ? 'bg-green-600/20'
                                                : 'bg-red-600/20'
                                                }`}>
                                                {transaction.type === 'INCOME' ? (
                                                    <ArrowUpRight className="w-5 h-5 text-green-400" />
                                                ) : (
                                                    <ArrowDownRight className="w-5 h-5 text-red-400" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{transaction.category}</p>
                                                <p className="text-slate-400 text-sm">
                                                    {format(new Date(transaction.date), "d 'de' MMMM", { locale: es })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-lg font-bold ${transaction.type === 'INCOME' ? 'text-green-400' : 'text-red-400'
                                                }`}>
                                                {transaction.type === 'INCOME' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                                            </p>
                                            <p className="text-slate-400 text-sm">{transaction.account?.name}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Welcome Wizard */}
                    <WelcomeWizard
                        isOpen={showWelcomeWizard}
                        onComplete={() => {
                            setShowWelcomeWizard(false)
                            fetchUserProfile()
                        }}
                    />
                </div>
            </PullToRefresh>
        </>
    )
}
