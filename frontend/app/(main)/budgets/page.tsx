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
    '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6',
    '#ef4444', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
    '#a855f7', '#06b6d4'
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
                <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <PullToRefresh onRefresh={fetchBudgets}>
            <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
                {/* Summary Cards */}
                {exceededBudgets.length > 0 && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="text-red-400 font-bold mb-1">¡Presupuesto Excedido!</h3>
                                <p className="text-red-300 text-sm">
                                    Has excedido el límite en {exceededBudgets.length} categoría(s): {' '}
                                    {exceededBudgets.map(b => b.category).join(', ')}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {warningBudgets.length > 0 && exceededBudgets.length === 0 && (
                    <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="text-yellow-400 font-bold mb-1">Advertencia</h3>
                                <p className="text-yellow-300 text-sm">
                                    Estás cerca del límite en {warningBudgets.length} categoría(s): {' '}
                                    {warningBudgets.map(b => b.category).join(', ')}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                    <div className="glass-effect rounded-xl p-4 md:p-6">
                        <h3 className="text-slate-400 text-sm font-medium mb-2">Presupuesto Total</h3>
                        <p className="text-3xl font-bold text-white">${totalBudget.toFixed(2)}</p>
                    </div>

                    <div className="glass-effect rounded-xl p-4 md:p-6">
                        <h3 className="text-slate-400 text-sm font-medium mb-2">Total Gastado</h3>
                        <p className={`text-3xl font-bold ${overallPercentage >= 100 ? 'text-red-400' :
                            overallPercentage >= 80 ? 'text-yellow-400' : 'text-green-400'
                            }`}>
                            ${totalSpent.toFixed(2)}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">{overallPercentage.toFixed(1)}% del total</p>
                    </div>

                    <div className="glass-effect rounded-xl p-4 md:p-6">
                        <h3 className="text-slate-400 text-sm font-medium mb-2">Disponible</h3>
                        <p className={`text-3xl font-bold ${totalRemaining >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ${totalRemaining.toFixed(2)}
                        </p>
                    </div>
                </div>

                {budgets.length === 0 ? (
                    <div className="glass-effect rounded-2xl p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-violet-600/20 flex items-center justify-center mx-auto mb-4">
                            <PieChart className="w-8 h-8 text-violet-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No hay presupuestos aún</h3>
                        <p className="text-slate-400 mb-6">Crea tu primer presupuesto para controlar tus gastos</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg transition-all"
                        >
                            Crear Primer Presupuesto
                        </button>
                    </div>
                ) : (
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
                                        className={`glass-effect rounded-xl p-4 md:p-6 transition-all ${isExceeded ? 'border-2 border-red-500/50' :
                                            isWarning ? 'border-2 border-yellow-500/50' : ''
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
                                                    className="touch-target bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(budget)}
                                                    className="touch-target bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mb-3">
                                            <div className="flex items-center justify-between text-sm mb-2">
                                                <span className="text-slate-400">Gastado</span>
                                                <span className={`font-bold ${isExceeded ? 'text-red-400' :
                                                    isWarning ? 'text-yellow-400' : 'text-green-400'
                                                    }`}>
                                                    ${budget.spent.toFixed(2)} ({budget.percentage.toFixed(1)}%)
                                                </span>
                                            </div>
                                            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-500 ${isExceeded ? 'bg-red-500' :
                                                        isWarning ? 'bg-yellow-500' : 'bg-green-500'
                                                        }`}
                                                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Status */}
                                        <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                                            <div className="flex items-center gap-2">
                                                {isExceeded ? (
                                                    <>
                                                        <AlertTriangle className="w-4 h-4 text-red-400" />
                                                        <span className="text-sm text-red-400 font-medium">Excedido</span>
                                                    </>
                                                ) : isWarning ? (
                                                    <>
                                                        <TrendingUp className="w-4 h-4 text-yellow-400" />
                                                        <span className="text-sm text-yellow-400 font-medium">Cerca del límite</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                                                        <span className="text-sm text-green-400 font-medium">Bajo control</span>
                                                    </>
                                                )}
                                            </div>
                                            <span className={`text-sm font-medium ${budget.remaining >= 0 ? 'text-slate-400' : 'text-red-400'
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
                        <div className="hidden md:block glass-effect rounded-xl p-4 md:p-6">
                            <h2 className="text-lg md:text-xl font-bold text-white mb-4 md:mb-6">Distribución de Gastos</h2>
                            <BudgetDistributionChart chartData={chartData} />
                        </div>
                    </div>
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
            </div>
        </PullToRefresh>
    )
}
