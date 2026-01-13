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
                <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <PullToRefresh onRefresh={fetchGoals}>
            <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                    <div className="glass-effect rounded-xl p-4 md:p-6">
                        <h3 className="text-slate-400 text-sm font-medium mb-2">Total Metas</h3>
                        <p className="text-3xl font-bold text-white">{goals.length}</p>
                    </div>
                    <div
                        onClick={() => router.push('/goals/active')}
                        className="glass-effect rounded-xl p-4 md:p-6 cursor-pointer hover:bg-slate-800/50 transition-all group"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-slate-400 text-sm font-medium mb-2">En Progreso</h3>
                                <p className="text-3xl font-bold text-blue-400">{activeGoals.length}</p>
                            </div>
                            <ChevronRight className="w-6 h-6 text-slate-500 group-hover:text-blue-400 transition-colors" />
                        </div>
                    </div>
                    <div
                        onClick={() => router.push('/goals/completed')}
                        className="glass-effect rounded-xl p-4 md:p-6 cursor-pointer hover:bg-slate-800/50 transition-all group"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-slate-400 text-sm font-medium mb-2">Completadas</h3>
                                <p className="text-3xl font-bold text-green-400">{completedGoals.length}</p>
                            </div>
                            <ChevronRight className="w-6 h-6 text-slate-400 group-hover:text-green-400 transition-colors" />
                        </div>
                    </div>
                </div>

                {/* Goals List */}
                {goals.length === 0 ? (
                    <div className="glass-effect rounded-2xl p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-violet-600/20 flex items-center justify-center mx-auto mb-4">
                            <Target className="w-8 h-8 text-violet-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No hay metas aún</h3>
                        <p className="text-slate-400 mb-6">Crea tu primera meta de ahorro</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg transition-all"
                        >
                            Crear Primera Meta
                        </button>
                    </div>
                ) : (
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
                                            <div key={goal.id} className="glass-effect rounded-xl p-4 md:p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1">
                                                        <h3 className="text-lg font-bold text-white mb-1">{goal.name}</h3>
                                                        {goal.description && (
                                                            <p className="text-sm text-slate-400">{goal.description}</p>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleAddMoney(goal)}
                                                            className="touch-target bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-all"
                                                            title="Agregar dinero"
                                                        >
                                                            <DollarSign className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEdit(goal)}
                                                            className="touch-target bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(goal)}
                                                            className="touch-target bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Progress */}
                                                <div className="mb-4">
                                                    <div className="flex items-center justify-between text-sm mb-2">
                                                        <span className="text-slate-400">Progreso</span>
                                                        <span className={`font-bold ${isNearComplete ? 'text-green-400' : 'text-blue-400'}`}>
                                                            ${parseFloat(goal.currentAmount).toFixed(2)} / ${parseFloat(goal.targetAmount).toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full transition-all duration-500 ${isNearComplete ? 'bg-green-500' : 'bg-blue-500'}`}
                                                            style={{ width: `${Math.min(progress, 100)}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-xs text-slate-500 mt-1">{progress.toFixed(1)}% completado</p>
                                                </div>

                                                {/* Footer */}
                                                <div className="flex items-center justify-between pt-3 border-t border-slate-700">
                                                    {goal.deadline ? (
                                                        <div className="flex items-center gap-2 text-sm text-slate-400">
                                                            <Calendar className="w-4 h-4" />
                                                            {format(new Date(goal.deadline), "d 'de' MMM, yyyy", { locale: es })}
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-slate-500">Sin fecha límite</span>
                                                    )}
                                                    <span className="text-sm font-medium text-slate-400">
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
                                        <div key={goal.id} className="glass-effect rounded-xl p-4 md:p-6 opacity-75">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                                                    <div>
                                                        <h3 className="text-lg font-bold text-white">{goal.name}</h3>
                                                        {goal.description && (
                                                            <p className="text-sm text-slate-400">{goal.description}</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDelete(goal)}
                                                    className="touch-target bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                            <p className="text-green-400 font-bold">${parseFloat(goal.targetAmount).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
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
