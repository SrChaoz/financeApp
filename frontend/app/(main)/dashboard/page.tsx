'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import {
    ArrowUpRight,
    ArrowDownRight,
    Sparkles
} from 'lucide-react'
import dynamic from 'next/dynamic'

const DashboardCharts = dynamic(() => import('@/components/DashboardCharts'), {
    loading: () => <div className="h-[300px] w-full animate-pulse bg-zinc-900/50 rounded-2xl" />,
    ssr: false
})
import { format, subDays } from 'date-fns'
import { es } from 'date-fns/locale'
import WelcomeWizard from '@/components/WelcomeWizard'
import PullToRefresh from '@/components/PullToRefresh'
import MobileTopBar from '@/components/MobileTopBar'
import FinancialOverviewCard from '@/components/FinancialOverviewCard'
import { getGreeting } from '@/lib/avatarUtils'

export default function DashboardPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [statistics, setStatistics] = useState<any>(null)
    const [transactions, setTransactions] = useState<any[]>([])
    const [dateRange, setDateRange] = useState<'7days' | '30days' | 'thisMonth' | 'all'>('30days')
    const [userProfile, setUserProfile] = useState<any>(null)
    const [showWelcomeWizard, setShowWelcomeWizard] = useState(false)
    const [showBalance, setShowBalance] = useState(true)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/login')
            return
        }
        fetchData()
        fetchUserProfile()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dateRange, router])

    useEffect(() => {
        const saved = localStorage.getItem('showBalance')
        if (saved !== null) setShowBalance(saved === 'true')
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [statsRes, transactionsRes] = await Promise.all([
                api.get('/api/transactions/statistics', { params: { period: dateRange } }),
                api.get('/api/transactions', { params: { limit: 10 } })
            ])
            setStatistics(statsRes.data.statistics)
            setTransactions(transactionsRes.data.transactions)
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchUserProfile = async () => {
        try {
            const response = await api.get('/api/user/profile')
            setUserProfile(response.data)
            if (!response.data.profileCompleted) setShowWelcomeWizard(true)
        } catch (error) {
            console.error('Error fetching user profile:', error)
        }
    }

    const handleRefresh = async () => {
        await fetchData()
    }

    const toggleBalance = () => {
        const newValue = !showBalance
        setShowBalance(newValue)
        localStorage.setItem('showBalance', newValue.toString())
    }

    const getCashFlowData = () => {
        const days = dateRange === '7days' ? 7 : 30
        const data = []
        for (let i = days - 1; i >= 0; i--) {
            const date = subDays(new Date(), i)
            const dateStr = format(date, 'yyyy-MM-dd')
            const dayTransactions = transactions.filter(t => format(new Date(t.date), 'yyyy-MM-dd') === dateStr)
            const income = dayTransactions.filter(t => t.type === 'INCOME').reduce((sum, t) => sum + parseFloat(t.amount), 0)
            const expense = dayTransactions.filter(t => t.type === 'EXPENSE').reduce((sum, t) => sum + parseFloat(t.amount), 0)
            data.push({ date: format(date, 'dd/MM'), income, expense })
        }
        return data
    }

    const getExpensesByCategoryData = () => {
        const categoryMap: { [key: string]: number } = {}
        transactions.filter(t => t.type === 'EXPENSE').forEach(t => {
            categoryMap[t.category] = (categoryMap[t.category] || 0) + parseFloat(t.amount)
        })
        return Object.entries(categoryMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 8)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    const balance = statistics?.balance || 0
    const totalIncome = statistics?.totalIncome || 0
    const totalExpenses = statistics?.totalExpenses || 0
    const cashFlowData = getCashFlowData()
    const expensesByCategoryData = getExpensesByCategoryData()

    // Get full greeting with emoji
    const greetingData = userProfile ? getGreeting(new Date().getHours(), userProfile.firstName) : null
    const greeting = greetingData ? `${greetingData.message} ${greetingData.emoji}` : ''

    return (
        <>
            {/* Mobile Top Bar */}
            <MobileTopBar />

            <PullToRefresh onRefresh={handleRefresh}>
                <div className="container mx-auto px-4 py-4 md:py-8 max-w-7xl pt-24 md:pt-8 pb-24 md:pb-8">
                    {/* Desktop Greeting Header (Hidden on Mobile) */}
                    {userProfile && (
                        <div className="hidden md:block mb-8">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-5xl">{greetingData?.emoji}</span>
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-bold text-white">
                                        {greetingData?.message}
                                    </h1>
                                    <p className="text-sm text-zinc-500 mt-1">
                                        {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MOBILE: Unified Financial Overview Card */}
                    <div className="md:hidden mb-6">
                        <FinancialOverviewCard
                            balance={balance}
                            totalIncome={totalIncome}
                            totalExpenses={totalExpenses}
                            showBalance={showBalance}
                            onToggleBalance={toggleBalance}
                            greeting={greeting}
                        />
                    </div>

                    {/* DESKTOP: Separate Cards (Hidden on Mobile) */}
                    <div className="hidden md:grid md:grid-cols-2 gap-6 mb-8">
                        {/* Income Card */}
                        <div className="card-premium p-6 hover:border-emerald-500/30 transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                                    <ArrowUpRight className="w-6 h-6 text-emerald-500" />
                                </div>
                                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                                    <span className="text-xs font-bold text-emerald-500">+{dateRange === '7days' ? '7D' : '30D'}</span>
                                </div>
                            </div>
                            <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-2">Ingresos</p>
                            <p className="text-4xl md:text-5xl font-bold text-white mb-2">
                                ${totalIncome.toFixed(2)}
                            </p>
                            <p className="text-sm text-zinc-400">Período actual</p>
                        </div>

                        {/* Expense Card */}
                        <div className="card-premium p-6 hover:border-rose-500/30 transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20 group-hover:scale-110 transition-transform">
                                    <ArrowDownRight className="w-6 h-6 text-rose-500" />
                                </div>
                                <div className="px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
                                    <span className="text-xs font-bold text-rose-500">+{dateRange === '7days' ? '7D' : '30D'}</span>
                                </div>
                            </div>
                            <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold mb-2">Gastos</p>
                            <p className="text-4xl md:text-5xl font-bold text-white mb-2">
                                ${totalExpenses.toFixed(2)}
                            </p>
                            <p className="text-sm text-zinc-400">Período actual</p>
                        </div>
                    </div>

                    {/* Charts Section - Hidden on Mobile */}
                    <div className="hidden md:block">
                        <DashboardCharts
                            cashFlowData={cashFlowData}
                            expensesByCategoryData={expensesByCategoryData}
                        />
                    </div>

                    {/* Recent Transactions */}
                    <div className="card-premium p-4 md:p-6 mt-6">
                        <div className="flex items-center justify-between mb-4 md:mb-6">
                            <div className="flex items-center gap-2 md:gap-3">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                                </div>
                                <h3 className="text-lg md:text-xl font-bold text-white">Actividad Reciente</h3>
                            </div>
                            {transactions.length > 0 && (
                                <button
                                    onClick={() => router.push('/transactions')}
                                    className="text-xs md:text-sm text-primary hover:text-primary/80 font-semibold"
                                >
                                    Ver todas
                                </button>
                            )}
                        </div>


                        {transactions.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="w-16 h-16 rounded-full bg-zinc-900/50 flex items-center justify-center mb-4">
                                    <Sparkles className="w-8 h-8 text-zinc-600" />
                                </div>
                                <p className="text-zinc-500 text-sm text-center">
                                    Aún no hay actividad reciente
                                </p>
                                <p className="text-zinc-600 text-xs text-center mt-1">
                                    Tus transacciones aparecerán aquí
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2 md:space-y-3">
                                {transactions.slice(0, 5).map((transaction) => (
                                    <div
                                        key={transaction.id}
                                        className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-zinc-900/50 hover:bg-zinc-900 transition-all group"
                                    >
                                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center border ${transaction.type === 'INCOME'
                                            ? 'bg-emerald-500/10 border-emerald-500/20'
                                            : 'bg-rose-500/10 border-rose-500/20'
                                            }`}>
                                            {transaction.type === 'INCOME' ? (
                                                <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" />
                                            ) : (
                                                <ArrowDownRight className="w-4 h-4 md:w-5 md:h-5 text-rose-500" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-white truncate text-sm md:text-base">{transaction.category}</p>
                                            <p className="text-xs md:text-sm text-zinc-500">{format(new Date(transaction.date), "d MMM, yyyy", { locale: es })}</p>
                                        </div>
                                        <p className={`text-base md:text-lg font-bold ${transaction.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'
                                            }`}>
                                            {transaction.type === 'INCOME' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </PullToRefresh>

            {showWelcomeWizard && (
                <WelcomeWizard
                    isOpen={showWelcomeWizard}
                    onComplete={() => {
                        setShowWelcomeWizard(false)
                        fetchUserProfile()
                    }}
                />
            )}
        </>
    )
}
