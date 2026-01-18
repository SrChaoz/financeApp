'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import {
    Plus,
    PieChart,
    Edit2,
    Trash2,
    AlertTriangle,
    TrendingUp,
    CheckCircle2
} from 'lucide-react'
import BudgetModal from '@/components/BudgetModal'
import ConfirmDialog from '@/components/ConfirmDialog'
import PullToRefresh from '@/components/PullToRefresh'
import dynamic from 'next/dynamic'

const BudgetDistributionChart = dynamic(() => import('@/components/BudgetDistributionChart'), {
    loading: () => <div className="h-[250px] w-full animate-pulse bg-slate-800/50 rounded-2xl" />,
    ssr: false
})

interface Budget {
    id: string
    category: string
    limitAmount: string
    createdAt: string
}

interface BudgetWithSpending extends Budget {
    spent: number
    percentage: number
    remaining: number
}

const COLORS = [
    '#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#06b6d4',
    '#14b8a6', '#84cc16', '#f97316', '#a855f7', '#ec4899',
    '#8b5cf6', '#3b82f6'
]

export default function BudgetsPage() {
    const router = useRouter()
    const [budgets, setBudgets] = useState<BudgetWithSpending[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null)
    const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/login')
            return
        }
        fetchBudgets()
    }, [])

    const fetchBudgets = async () => {
        try {
            setLoading(true)
            const [budgetsRes, transactionsRes] = await Promise.all([
                api.get('/api/budgets'),
                api.get('/api/transactions')
            ])

            const budgetsData = budgetsRes.data.budgets
            const transactions = transactionsRes.data.transactions

            // Calculate spending for each budget category
            const budgetsWithSpending = budgetsData.map((budget: Budget) => {
                const categoryExpenses = transactions
                    .filter((t: any) =>
                        t.type === 'EXPENSE' &&
                        t.category === budget.category
                    )
                    .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0)

                const limit = parseFloat(budget.limitAmount)
                const percentage = limit > 0 ? (categoryExpenses / limit) * 100 : 0

                return {
                    ...budget,
                    spent: categoryExpenses,
                    percentage,
                    remaining: limit - categoryExpenses
                }
            })

            setBudgets(budgetsWithSpending)
        } catch (error) {
            console.error('Error fetching budgets:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (budget: Budget) => {
        setSelectedBudget(budget)
        setShowModal(true)
    }

    const handleDelete = (budget: Budget) => {
        setBudgetToDelete(budget)
        setShowDeleteDialog(true)
    }

    const confirmDelete = async () => {
        if (!budgetToDelete) return

        setDeleteLoading(true)
        try {
            await api.delete(`/api/budgets/${budgetToDelete.id}`)
            await fetchBudgets()
            setShowDeleteDialog(false)
            setBudgetToDelete(null)
        } catch (error: any) {
            console.error('Error deleting budget:', error)
            alert(error.response?.data?.error?.message || 'Error al eliminar el presupuesto')
        } finally {
            setDeleteLoading(false)
        }
    }

    const handleModalClose = () => {
        setShowModal(false)
        setSelectedBudget(null)
    }

    const handleModalSuccess = () => {
        fetchBudgets()
    }

    // Prepare data for pie chart
    const chartData = budgets.map((budget, index) => ({
        name: budget.category,
        value: budget.spent,
        limit: parseFloat(budget.limitAmount),
        color: COLORS[index % COLORS.length]
    }))

    const totalBudget = budgets.reduce((sum, b) => sum + parseFloat(b.limitAmount), 0)
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0)
    const totalRemaining = totalBudget - totalSpent
    const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0

    const exceededBudgets = budgets.filter(b => b.percentage >= 100)
    const warningBudgets = budgets.filter(b => b.percentage >= 80 && b.percentage < 100)

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <PullToRefresh onRefresh={fetchBudgets}>
            <div className="container mx-auto px-4 py-4 md:py-8 max-w-7xl pb-24 md:pb-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-white">Presupuestos</h1>
                </div>

                {/* Summary Cards */}
                {exceededBudgets.length > 0 && (
                    <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="text-rose-400 font-bold mb-1">¡Presupuesto Excedido!</h3>
                                <p className="text-rose-300 text-sm">
                                    Has excedido el límite en {exceededBudgets.length} categoría(s): {' '}
                                    {exceededBudgets.map(b => b.category).join(', ')}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {warningBudgets.length > 0 && exceededBudgets.length === 0 && (
                    <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="text-amber-400 font-bold mb-1">Advertencia</h3>
                                <p className="text-amber-300 text-sm">
                                    Estás cerca del límite en {warningBudgets.length} categoría(s): {' '}
                                    {warningBudgets.map(b => b.category).join(', ')}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Compact Summary Bar */}
                <div className="card-premium p-4 mb-6 bg-gradient-to-br from-zinc-900 to-zinc-950">
                    <div className="grid grid-cols-3 divide-x divide-zinc-800">
                        {/* Total Budget */}
                        <div className="px-4 first:pl-0 last:pr-0">
                            <div className="flex items-center gap-2 mb-1">
                                <PieChart className="w-3 h-3 text-primary" />
                                <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold">Presupuesto</p>
                            </div>
                            <p className="text-2xl md:text-3xl font-bold text-white">${totalBudget.toFixed(2)}</p>
                        </div>

                        {/* Total Spent */}
                        <div className="px-4 first:pl-0 last:pr-0">
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingUp className="w-3 h-3 text-rose-500" />
                                <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold">Gastado</p>
                            </div>
                            <p className="text-2xl md:text-3xl font-bold text-rose-400">${totalSpent.toFixed(2)}</p>
                        </div>

                        {/* Remaining */}
                        <div className="px-4 first:pl-0 last:pr-0">
                            <div className="flex items-center gap-2 mb-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold">Restante</p>
                            </div>
                            <p className={`text-2xl md:text-3xl font-bold ${totalRemaining >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                ${totalRemaining.toFixed(2)}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Budgets List */}
                {budgets.length === 0 ? (
                    <div className="card-premium p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
                            <PieChart className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No hay presupuestos aún</h3>
                        <p className="text-muted mb-6">Crea tu primer presupuesto para controlar tus gastos</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-6 py-3 bg-gradient-primary hover:shadow-glow-primary text-white rounded-lg transition-all font-semibold shadow-lg active:scale-[0.98]"
                        >
                            Crear Primer Presupuesto
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Section Header with Add Button */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-white">Mis Presupuestos</h2>
                            <button
                                onClick={() => setShowModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-tr from-indigo-500 to-violet-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] text-white rounded-xl transition-all font-medium shadow-lg active:scale-95"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Nuevo Presupuesto</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                            {/* Budgets List */}
                            <div className="lg:col-span-2 space-y-3 md:space-y-4">
                                {budgets.map((budget) => {
                                    const isExceeded = budget.percentage >= 100
                                    const isWarning = budget.percentage >= 80 && budget.percentage < 100
                                    const isGood = budget.percentage < 80

                                    return (
                                        <div
                                            key={budget.id}
                                            className={`card-premium p-4 md:p-6 transition-all ${isExceeded ? 'border-2 border-rose-500/50' :
                                                isWarning ? 'border-2 border-amber-500/50' : ''
                                                }`}
                                        >
                                            {/* Header */}
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="text-lg font-bold text-white mb-1">{budget.category}</h3>
                                                    <p className="text-sm text-slate-400">
                                                        Límite: ${parseFloat(budget.limitAmount).toFixed(2)}
                                                    </p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(budget)}
                                                        className="touch-target bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-all"
                                                        title="Editar"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(budget)}
                                                        className="touch-target bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-all"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <div className="flex items-center justify-between text-sm mb-2">
                                                    <span className="text-muted">Gastado</span>
                                                    <span className={`font-bold ${isExceeded ? 'text-rose-400' :
                                                        isWarning ? 'text-amber-400' : 'text-emerald-400'
                                                        }`}>
                                                        ${budget.spent.toFixed(2)} ({budget.percentage.toFixed(1)}%)
                                                    </span>
                                                </div>
                                                <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all duration-500 ${isExceeded ? 'bg-rose-500' :
                                                            isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                                                            }`}
                                                        style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                                                <div className="flex items-center gap-2">
                                                    {isExceeded ? (
                                                        <>
                                                            <AlertTriangle className="w-4 h-4 text-rose-400" />
                                                            <span className="text-sm text-rose-400 font-medium">Excedido</span>
                                                        </>
                                                    ) : isWarning ? (
                                                        <>
                                                            <TrendingUp className="w-4 h-4 text-amber-400" />
                                                            <span className="text-sm text-amber-400 font-medium">Cerca del límite</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                            <span className="text-sm text-emerald-400 font-medium">Bajo control</span>
                                                        </>
                                                    )}
                                                </div>
                                                <span className={`text-sm font-medium ${budget.remaining >= 0 ? 'text-muted' : 'text-rose-400'
                                                    }`}>
                                                    {budget.remaining >= 0 ? 'Disponible: ' : 'Excedido: '}
                                                    ${Math.abs(budget.remaining).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Expense Distribution Chart - Hidden on mobile, visible on desktop */}
                            <div className="hidden md:block card-premium p-4 md:p-6">
                                <h2 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6">Distribución de Gastos</h2>
                                <BudgetDistributionChart chartData={chartData} />
                            </div>
                        </div>
                    </>
                )}

                {/* Modals */}
                <BudgetModal
                    isOpen={showModal}
                    onClose={handleModalClose}
                    onSuccess={handleModalSuccess}
                    budget={selectedBudget}
                />

                <ConfirmDialog
                    isOpen={showDeleteDialog}
                    onClose={() => {
                        setShowDeleteDialog(false)
                        setBudgetToDelete(null)
                    }}
                    onConfirm={confirmDelete}
                    title="Eliminar Presupuesto"
                    message={`¿Estás seguro de que deseas eliminar el presupuesto de "${budgetToDelete?.category}"?`}
                    confirmText="Eliminar"
                    loading={deleteLoading}
                />
            </div >
        </PullToRefresh >
    )
}
