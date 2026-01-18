'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Plus, Target, Edit2, Trash2, TrendingUp, CheckCircle2, Calendar, DollarSign, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import GoalModal from '@/components/GoalModal'
import AddMoneyModal from '@/components/AddMoneyModal'
import ConfirmDialog from '@/components/ConfirmDialog'
import CelebrationModal from '@/components/CelebrationModal'
import PullToRefresh from '@/components/PullToRefresh'
import { useToast } from '@/components/ToastProvider'

interface Goal {
    id: string
    name: string
    targetAmount: string
    currentAmount: string
    deadline: string | null
    description: string | null
    isCompleted: boolean
    createdAt: string
}

export default function GoalsPage() {
    const router = useRouter()
    const { showToast } = useToast()
    const [goals, setGoals] = useState<Goal[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [showAddMoneyModal, setShowAddMoneyModal] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
    const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null)
    const [showCelebration, setShowCelebration] = useState(false)
    const [completedGoalData, setCompletedGoalData] = useState<{ name: string; targetAmount: string } | null>(null)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/login')
            return
        }
        fetchGoals()
    }, [])

    const fetchGoals = async () => {
        try {
            setLoading(true)
            const res = await api.get('/api/goals')
            setGoals(res.data.goals)
        } catch (error) {
            console.error('Error fetching goals:', error)
            showToast('Error al cargar metas', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (goal: Goal) => {
        setSelectedGoal(goal)
        setShowModal(true)
    }

    const handleDelete = (goal: Goal) => {
        setGoalToDelete(goal)
        setShowDeleteDialog(true)
    }

    const confirmDelete = async () => {
        if (!goalToDelete) return

        try {
            await api.delete(`/api/goals/${goalToDelete.id}`)
            showToast('Meta eliminada exitosamente', 'success')
            fetchGoals()
        } catch (error) {
            console.error('Error deleting goal:', error)
            showToast('Error al eliminar meta', 'error')
        } finally {
            setShowDeleteDialog(false)
            setGoalToDelete(null)
        }
    }

    const handleModalClose = () => {
        setShowModal(false)
        setSelectedGoal(null)
    }

    const handleAddMoney = (goal: Goal) => {
        setSelectedGoal(goal)
        setShowAddMoneyModal(true)
    }

    const handleAddMoneyClose = () => {
        setShowAddMoneyModal(false)
        setSelectedGoal(null)
    }

    const handleGoalCompleted = (goal: { name: string; targetAmount: string }) => {
        setCompletedGoalData(goal)
        setShowCelebration(true)
    }

    const getProgress = (goal: Goal) => {
        const current = parseFloat(goal.currentAmount)
        const target = parseFloat(goal.targetAmount)
        return target > 0 ? (current / target) * 100 : 0
    }

    const activeGoals = goals.filter(g => !g.isCompleted)
    const completedGoals = goals.filter(g => g.isCompleted)

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <PullToRefresh onRefresh={fetchGoals}>
            <div className="container mx-auto px-4 py-4 md:py-8 max-w-7xl pb-24 md:pb-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-white">Metas</h1>
                </div>

                {/* Compact Summary Bar */}
                <div className="card-premium p-4 mb-6 bg-gradient-to-br from-zinc-900 to-zinc-950">
                    <div className="grid grid-cols-3 divide-x divide-zinc-800">
                        {/* Total Goals */}
                        <div className="px-4 first:pl-0 last:pr-0">
                            <div className="flex items-center gap-2 mb-1">
                                <Target className="w-3 h-3 text-primary" />
                                <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold">Total</p>
                            </div>
                            <p className="text-2xl md:text-3xl font-bold text-white">{goals.length}</p>
                        </div>

                        {/* Active Goals */}
                        <div
                            onClick={() => router.push('/goals/active')}
                            className="px-4 first:pl-0 last:pr-0 cursor-pointer hover:bg-zinc-800/30 transition-all rounded"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingUp className="w-3 h-3 text-primary" />
                                <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold">En Progreso</p>
                            </div>
                            <p className="text-2xl md:text-3xl font-bold text-primary">{activeGoals.length}</p>
                        </div>

                        {/* Completed Goals */}
                        <div
                            onClick={() => router.push('/goals/completed')}
                            className="px-4 first:pl-0 last:pr-0 cursor-pointer hover:bg-zinc-800/30 transition-all rounded"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold">Completadas</p>
                            </div>
                            <p className="text-2xl md:text-3xl font-bold text-emerald-400">{completedGoals.length}</p>
                        </div>
                    </div>
                </div>

                {/* Goals List */}
                {goals.length === 0 ? (
                    <div className="card-premium p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 border border-primary/20">
                            <Target className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No hay metas aún</h3>
                        <p className="text-muted mb-6">Crea tu primera meta de ahorro</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-6 py-3 bg-gradient-primary hover:shadow-glow-primary text-white rounded-lg transition-all font-semibold shadow-lg active:scale-[0.98]"
                        >
                            Crear Primera Meta
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Section Header with Add Button */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-white">Mis Metas</h2>
                            <button
                                onClick={() => setShowModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-tr from-indigo-500 to-violet-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] text-white rounded-xl transition-all font-medium shadow-lg active:scale-95"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Nueva Meta</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Active Goals */}
                            {activeGoals.length > 0 && (
                                <div>
                                    <h2 className="text-lg font-bold text-white mb-4">En Progreso</h2>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                                        {activeGoals.map((goal) => {
                                            const progress = getProgress(goal)
                                            const isNearComplete = progress >= 80

                                            return (
                                                <div key={goal.id} className="card-premium p-4 md:p-6">
                                                    <div className="flex items-start justify-between mb-4">
                                                        <div className="flex-1">
                                                            <h3 className="text-lg font-bold text-white mb-1">{goal.name}</h3>
                                                            {goal.description && (
                                                                <p className="text-sm text-muted">{goal.description}</p>
                                                            )}
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleAddMoney(goal)}
                                                                className="touch-target bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-lg transition-all"
                                                                title="Agregar dinero"
                                                            >
                                                                <DollarSign className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleEdit(goal)}
                                                                className="touch-target bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-all"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(goal)}
                                                                className="touch-target bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-all"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Progress */}
                                                    <div className="mb-4">
                                                        <div className="flex items-center justify-between text-sm mb-2">
                                                            <span className="text-muted">Progreso</span>
                                                            <span className={`font-bold ${isNearComplete ? 'text-emerald-400' : 'text-primary'}`}>
                                                                ${parseFloat(goal.currentAmount).toFixed(2)} / ${parseFloat(goal.targetAmount).toFixed(2)}
                                                            </span>
                                                        </div>
                                                        <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full transition-all duration-500 ${isNearComplete ? 'bg-emerald-500' : 'bg-primary'}`}
                                                                style={{ width: `${Math.min(progress, 100)}%` }}
                                                            />
                                                        </div>
                                                        <p className="text-xs text-zinc-500 mt-1">{progress.toFixed(1)}% completado</p>
                                                    </div>

                                                    {/* Footer */}
                                                    <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
                                                        {goal.deadline ? (
                                                            <div className="flex items-center gap-2 text-sm text-muted">
                                                                <Calendar className="w-4 h-4" />
                                                                {format(new Date(goal.deadline), "d 'de' MMM, yyyy", { locale: es })}
                                                            </div>
                                                        ) : (
                                                            <span className="text-sm text-zinc-500">Sin fecha límite</span>
                                                        )}
                                                        <span className="text-sm font-medium text-muted">
                                                            Faltan: ${(parseFloat(goal.targetAmount) - parseFloat(goal.currentAmount)).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Completed Goals */}
                            {completedGoals.length > 0 && (
                                <div className="mt-8">
                                    <h2 className="text-lg font-bold text-white mb-4">Completadas</h2>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                                        {completedGoals.map((goal) => (
                                            <div key={goal.id} className="card-premium p-4 md:p-6 opacity-75">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                                        <div>
                                                            <h3 className="text-lg font-bold text-white">{goal.name}</h3>
                                                            {goal.description && (
                                                                <p className="text-sm text-muted">{goal.description}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleDelete(goal)}
                                                        className="touch-target bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-all"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <p className="text-emerald-400 font-bold">${parseFloat(goal.targetAmount).toFixed(2)}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Modals */}
                <GoalModal
                    isOpen={showModal}
                    onClose={handleModalClose}
                    onSuccess={fetchGoals}
                    goal={selectedGoal}
                />

                {selectedGoal && (
                    <AddMoneyModal
                        isOpen={showAddMoneyModal}
                        onClose={handleAddMoneyClose}
                        onSuccess={fetchGoals}
                        onGoalCompleted={handleGoalCompleted}
                        goal={selectedGoal}
                    />
                )}

                {goalToDelete && (
                    <ConfirmDialog
                        isOpen={showDeleteDialog}
                        onClose={() => setShowDeleteDialog(false)}
                        onConfirm={confirmDelete}
                        title="Eliminar Meta"
                        message={`¿Estás seguro de que deseas eliminar la meta "${goalToDelete.name}"?`}
                    />
                )}

                {/* Celebration Modal */}
                {completedGoalData && (
                    <CelebrationModal
                        isOpen={showCelebration}
                        onClose={() => {
                            setShowCelebration(false)
                            setCompletedGoalData(null)
                        }}
                        goalName={completedGoalData.name}
                        goalAmount={completedGoalData.targetAmount}
                    />
                )}
            </div>
        </PullToRefresh>
    )
}
