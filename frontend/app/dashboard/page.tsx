'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    Calendar,
    RefreshCw,
    ChevronDown,
    ChevronUp
} from 'lucide-react'
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    BarChart,
    Bar
} from 'recharts'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { es } from 'date-fns/locale'
import TransactionModal from '@/components/TransactionModal'
import WelcomeWizard from '@/components/WelcomeWizard'
import PullToRefresh from '@/components/PullToRefresh'
import AnimatedNumber from '@/components/AnimatedNumber'
import { getGreeting } from '@/lib/avatarUtils'

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#14b8a6', '#f97316']

export default function DashboardPage() {
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [statistics, setStatistics] = useState<any>(null)
    const [transactions, setTransactions] = useState<any[]>([])
    const [showTransactionModal, setShowTransactionModal] = useState(false)
    const [dateRange, setDateRange] = useState<'7days' | '30days' | 'thisMonth' | 'all'>('30days')
    const [refreshing, setRefreshing] = useState(false)
    const [showCharts, setShowCharts] = useState(false) // Collapsed by default on mobile
    const [userProfile, setUserProfile] = useState<any>(null)
    const [showWelcomeWizard, setShowWelcomeWizard] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/login')
            return
        }
        fetchData()
        fetchUserProfile()
    }, [dateRange])

    const fetchData = async () => {
        try {
            setLoading(true)

            // Calculate date range
            let startDate = ''
            let endDate = ''
            const now = new Date()

            switch (dateRange) {
                case '7days':
                    startDate = subDays(now, 7).toISOString()
                    break
                case '30days':
                    startDate = subDays(now, 30).toISOString()
                    break
                case 'thisMonth':
                    startDate = startOfMonth(now).toISOString()
                    endDate = endOfMonth(now).toISOString()
                    break
                case 'all':
                    // No date filter
                    break
            }

            const params = new URLSearchParams()
            if (startDate) params.append('startDate', startDate)
            if (endDate) params.append('endDate', endDate)

            const [statsRes, transRes] = await Promise.all([
                api.get(`/api/transactions/statistics?${params}`),
                api.get(`/api/transactions?${params}`)
            ])

            setStatistics(statsRes.data.statistics)
            setTransactions(transRes.data.transactions)
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const fetchUserProfile = async () => {
        try {
            const response = await api.get('/api/user/profile')
            setUserProfile(response.data)
            // Show welcome wizard if profile not completed
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
    }

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
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Dashboard</h1>
                            <p className="text-slate-400 text-sm md:text-base">Resumen de tus finanzas personales</p>
                        </div>
                        {/* Date Range Filter & Refresh - Hidden on mobile, visible on desktop */}
                        <div className="hidden md:flex items-center gap-2">
                            {/* Date Range Filter */}
                            <select
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value as any)}
                                className="mobile-input bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 text-white text-sm flex-1"
                            >
                                <option value="7days">Últimos 7 días</option>
                                <option value="30days">Últimos 30 días</option>
                                <option value="thisMonth">Este mes</option>
                                <option value="all">Todo el tiempo</option>
                            </select>

                            {/* Refresh Button - Compact */}
                            <button
                                onClick={handleRefresh}
                                disabled={refreshing}
                                className="px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50 flex-shrink-0"
                                title="Actualizar datos"
                            >
                                <RefreshCw className={`w-4 h-4 text-slate-400 ${refreshing ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                    </div>

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

                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                        {/* Balance Card */}
                        <div className="glass-effect rounded-2xl p-4 md:p-6 card-hover">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-lg bg-violet-600/20 flex items-center justify-center">
                                    <Wallet className="w-6 h-6 text-violet-400" />
                                </div>
                                <span className={`text-sm font-medium ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {balance >= 0 ? '+' : ''}{totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : '0'}%
                                </span>
                            </div>
                            <h3 className="text-slate-400 text-sm font-medium mb-1">Saldo Total</h3>
                            <p className="text-3xl font-bold text-white">
                                <AnimatedNumber value={balance} prefix="$" decimals={2} duration={0.8} />
                            </p>
                        </div>

                        {/* Income Card */}
                        <div className="glass-effect rounded-2xl p-4 md:p-6 card-hover">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-lg bg-green-600/20 flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-green-400" />
                                </div>
                                <ArrowUpRight className="w-5 h-5 text-green-400" />
                            </div>
                            <h3 className="text-slate-400 text-sm font-medium mb-1">Ingresos</h3>
                            <p className="text-3xl font-bold text-white">
                                <AnimatedNumber value={totalIncome} prefix="$" decimals={2} duration={0.8} />
                            </p>
                        </div>

                        {/* Expenses Card */}
                        <div className="glass-effect rounded-2xl p-4 md:p-6 card-hover">
                            <div className="flex items-center justify-between mb-4">
                                <div className="w-12 h-12 rounded-lg bg-red-600/20 flex items-center justify-center">
                                    <TrendingDown className="w-6 h-6 text-red-400" />
                                </div>
                                <ArrowDownRight className="w-5 h-5 text-red-400" />
                            </div>
                            <h3 className="text-slate-400 text-sm font-medium mb-1">Gastos</h3>
                            <p className="text-3xl font-bold text-white">
                                <AnimatedNumber value={totalExpenses} prefix="$" decimals={2} duration={0.8} />
                            </p>
                        </div>
                    </div>

                    {/* Charts Section - Collapsible on Mobile */}
                    <div className="mb-6 md:mb-8">
                        {/* Toggle Button - Only visible on mobile */}
                        <button
                            onClick={() => setShowCharts(!showCharts)}
                            className="md:hidden w-full glass-effect rounded-xl p-4 mb-4 flex items-center justify-between hover:bg-slate-800/50 transition-all"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-violet-600/20 flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-violet-400" />
                                </div>
                                <div className="text-left">
                                    <h3 className="text-white font-medium">Gráficos</h3>
                                    <p className="text-slate-400 text-sm">Ver estadísticas visuales</p>
                                </div>
                            </div>
                            {showCharts ? (
                                <ChevronUp className="w-5 h-5 text-slate-400" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-slate-400" />
                            )}
                        </button>

                        {/* Charts Row - Always visible on desktop, collapsible on mobile */}
                        <div className={`${showCharts ? 'block' : 'hidden'} md:block`}>
                            <div className="grid grid-cols-1 gap-4 md:gap-6">
                                {/* Cash Flow Chart */}
                                <div className="glass-effect rounded-2xl p-4 md:p-6">
                                    <h2 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6">Flujo de Caja</h2>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <AreaChart data={cashFlowData}>
                                            <defs>
                                                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                </linearGradient>
                                                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                            <XAxis
                                                dataKey="date"
                                                stroke="#94a3b8"
                                                style={{ fontSize: '12px' }}
                                            />
                                            <YAxis
                                                stroke="#94a3b8"
                                                style={{ fontSize: '12px' }}
                                                tickFormatter={(value) => `$${value}`}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#1e293b',
                                                    border: '1px solid #334155',
                                                    borderRadius: '8px'
                                                }}
                                                formatter={(value: any) => `$${value.toFixed(2)}`}
                                            />
                                            <Legend />
                                            <Area
                                                type="monotone"
                                                dataKey="income"
                                                stroke="#10b981"
                                                fillOpacity={1}
                                                fill="url(#colorIncome)"
                                                name="Ingresos"
                                            />
                                            <Area
                                                type="monotone"
                                                dataKey="expense"
                                                stroke="#ef4444"
                                                fillOpacity={1}
                                                fill="url(#colorExpense)"
                                                name="Gastos"
                                            />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>

                                {/* Expenses by Category - Hidden on mobile, visible on desktop */}
                                <div className="hidden md:block glass-effect rounded-2xl p-4 md:p-6">
                                    <h2 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6">Gastos por Categoría</h2>
                                    {expensesByCategoryData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={250}>
                                            <PieChart>
                                                <Pie
                                                    data={expensesByCategoryData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }) => window.innerWidth >= 640 ? `${name}: ${(percent * 100).toFixed(0)}%` : `${(percent * 100).toFixed(0)}%`}
                                                    outerRadius={window.innerWidth >= 640 ? 100 : 80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {expensesByCategoryData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: '#1e293b',
                                                        border: '1px solid #334155',
                                                        borderRadius: '8px'
                                                    }}
                                                    formatter={(value: any) => `$${value.toFixed(2)}`}
                                                />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-[250px] flex items-center justify-center">
                                            <p className="text-slate-400">No hay gastos registrados</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
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
                                <button
                                    onClick={() => setShowTransactionModal(true)}
                                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-all"
                                >
                                    Agregar Primera Transacción
                                </button>
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


                    {/* Transaction Modal */}
                    <TransactionModal
                        isOpen={showTransactionModal}
                        onClose={() => setShowTransactionModal(false)}
                        onSuccess={fetchData}
                    />

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

            {/* Floating Action Button */}
            <button
                onClick={() => setShowTransactionModal(true)}
                className="fixed bottom-24 md:bottom-8 right-4 md:right-8 w-14 h-14 bg-gradient-to-r from-violet-600 to-purple-600 rounded-full shadow-lg shadow-violet-500/50 flex items-center justify-center hover:scale-110 transition-transform z-40 touch-target"
            >
                <Plus className="w-6 h-6 text-white" />
            </button>
        </>
    )
}
