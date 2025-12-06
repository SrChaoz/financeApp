'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { ArrowLeft, Target, Calendar, DollarSign, Edit2, Trash2 } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { es } from 'date-fns/locale'
import AnimatedNumber from '@/components/AnimatedNumber'
import FadeIn from '@/components/FadeIn'
import AddMoneyModal from '@/components/AddMoneyModal'
import GoalModal from '@/components/GoalModal'
import CelebrationModal from '@/components/CelebrationModal'
import ConfirmDialog from '@/components/ConfirmDialog'
import { useToast } from '@/components/ToastProvider'


type Goal = {
    id: string
    name: string
    targetAmount: string
    currentAmount: string
    deadline: string | null
    description: string | null
    isCompleted: boolean
    createdAt: string
    updatedAt: string
}

type FilterPeriod = 'all' | 'thisYear' | 'thisMonth' | 'last30'
type SortBy = 'progress' | 'deadline' | 'amount' | 'recent'

export default function ActiveGoalsPage() {
    const router = useRouter()
    const { showToast } = useToast()
    const [goals, setGoals] = useState<Goal[]>([])
    const [loading, setLoading] = useState(true)
    const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('all')
    const [sortBy, setSortBy] = useState<SortBy>('progress')
    const [showAddMoneyModal, setShowAddMoneyModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showCelebration, setShowCelebration] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/login')
            return
        }
        fetchGoals()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    const fetchGoals = async () => {
        try {
            setLoading(true)
            const response = await api.get('/api/goals')
            // Filter only active (not completed) goals
            const activeGoals = response.data.goals.filter((g: Goal) => !g.isCompleted)
            setGoals(activeGoals)
        } catch (error) {
            console.error('Error fetching goals:', error)
            showToast('Error al cargar metas', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleAddMoney = (goal: Goal) => {
        setSelectedGoal(goal)
        setShowAddMoneyModal(true)
    }

    const handleEdit = (goal: Goal) => {
        setSelectedGoal(goal)
        setShowEditModal(true)
    }

    const handleDelete = (goal: Goal) => {
        setDeleteId(goal.id)
        setShowDeleteDialog(true)
    }

    const confirmDelete = async () => {
        if (!deleteId) return

        try {
            await api.delete(`/api/goals/${deleteId}`)
            showToast('Meta eliminada exitosamente', 'success')
            fetchGoals()
        } catch (error) {
            console.error('Error deleting goal:', error)
            showToast('Error al eliminar meta', 'error')
        } finally {
            setShowDeleteDialog(false)
            setDeleteId(null)
        }
    }

    // Filter goals by period
    const filteredGoals = goals.filter(goal => {
        const createdDate = new Date(goal.createdAt)
        const now = new Date()

        switch (filterPeriod) {
            case 'thisYear':
                return createdDate.getFullYear() === now.getFullYear()
            case 'thisMonth':
                return createdDate.getFullYear() === now.getFullYear() &&
                    createdDate.getMonth() === now.getMonth()
            case 'last30':
                return differenceInDays(now, createdDate) <= 30
            default:
                return true
        }
    })

    // Sort goals
    const sortedGoals = [...filteredGoals].sort((a, b) => {
        switch (sortBy) {
            case 'progress':
                const progressA = (Number(a.currentAmount) / Number(a.targetAmount)) * 100
                const progressB = (Number(b.currentAmount) / Number(b.targetAmount)) * 100
                return progressB - progressA
            case 'deadline':
                if (!a.deadline) return 1
                if (!b.deadline) return -1
                return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
            case 'amount':
                return Number(b.targetAmount) - Number(a.targetAmount)
            case 'recent':
            default:
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        }
    })

    // Calculate statistics
    const totalSaved = goals.reduce((sum, goal) => sum + Number(goal.currentAmount), 0)
    const averageProgress = goals.length > 0
        ? goals.reduce((sum, goal) => sum + (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100, 0) / goals.length
        : 0

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-white text-lg">Cargando...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-4 md:p-6 pb-24">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <FadeIn>
                    <div className="mb-6">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Volver
                        </button>
                        <h1 className="text-3xl font-bold text-white mb-2">Metas en Progreso</h1>
                        <p className="text-slate-400">Sigue trabajando en tus objetivos</p>
                    </div>
                </FadeIn>

                {/* Statistics */}
                <FadeIn delay={0.1}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="glass-effect rounded-xl p-6">
                            <h3 className="text-slate-400 text-sm font-medium mb-2">Total Activas</h3>
                            <p className="text-3xl font-bold text-blue-400">
                                <AnimatedNumber value={goals.length} />
                            </p>
                        </div>
                        <div className="glass-effect rounded-xl p-6">
                            <h3 className="text-slate-400 text-sm font-medium mb-2">Progreso Promedio</h3>
                            <p className="text-3xl font-bold text-violet-400">
                                <AnimatedNumber value={averageProgress} decimals={0} />%
                            </p>
                        </div>
                        <div className="glass-effect rounded-xl p-6">
                            <h3 className="text-slate-400 text-sm font-medium mb-2">Total Ahorrado</h3>
                            <p className="text-3xl font-bold text-green-400">
                                $<AnimatedNumber value={totalSaved} />
                            </p>
                        </div>
                    </div>
                </FadeIn>

                {/* Filters */}
                <FadeIn delay={0.2}>
                    <div className="glass-effect rounded-xl p-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Period Filter */}
                            <div>
                                <label className="block text-slate-400 text-sm font-medium mb-2">Período</label>
                                <select
                                    value={filterPeriod}
                                    onChange={(e) => setFilterPeriod(e.target.value as FilterPeriod)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                                >
                                    <option value="all">Todo el tiempo</option>
                                    <option value="thisYear">Este año</option>
                                    <option value="thisMonth">Este mes</option>
                                    <option value="last30">Últimos 30 días</option>
                                </select>
                            </div>

                            {/* Sort Filter */}
                            <div>
                                <label className="block text-slate-400 text-sm font-medium mb-2">Ordenar por</label>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as SortBy)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                                >
                                    <option value="progress">Mayor progreso</option>
                                    <option value="deadline">Próxima a vencer</option>
                                    <option value="amount">Mayor monto</option>
                                    <option value="recent">Más reciente</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </FadeIn>

                {/* Goals List */}
                {sortedGoals.length === 0 ? (
                    <FadeIn delay={0.3}>
                        <div className="glass-effect rounded-xl p-12 text-center">
                            <Target className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">No hay metas activas</h3>
                            <p className="text-slate-400">Crea una nueva meta para comenzar a ahorrar</p>
                        </div>
                    </FadeIn>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                        {sortedGoals.map((goal, index) => {
                            const progress = (Number(goal.currentAmount) / Number(goal.targetAmount)) * 100
                            const isNearComplete = progress >= 90

                            return (
                                <FadeIn key={goal.id} delay={0.3 + index * 0.05}>
                                    <div className="glass-effect rounded-xl p-4 md:p-6">
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
                                                    ${Number(goal.currentAmount).toFixed(2)} / ${Number(goal.targetAmount).toFixed(2)}
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
                                                Faltan: ${(Number(goal.targetAmount) - Number(goal.currentAmount)).toFixed(2)}
                                            </span>
                                        </div>
                                    </div>
                                </FadeIn>
                            )
                        })}
                    </div>
                )}
            </div>

            {/* Modals */}
            {selectedGoal && (
                <>
                    <AddMoneyModal
                        isOpen={showAddMoneyModal}
                        onClose={() => {
                            setShowAddMoneyModal(false)
                            setSelectedGoal(null)
                        }}
                        goal={selectedGoal}
                        onSuccess={() => {
                            fetchGoals()
                            setShowAddMoneyModal(false)
                            setSelectedGoal(null)
                        }}
                        onGoalCompleted={(goal) => {
                            setShowCelebration(true)
                            setShowAddMoneyModal(false)
                        }}
                    />
                    <GoalModal
                        isOpen={showEditModal}
                        onClose={() => {
                            setShowEditModal(false)
                            setSelectedGoal(null)
                        }}
                        goal={selectedGoal}
                        onSuccess={() => {
                            fetchGoals()
                            setShowEditModal(false)
                            setSelectedGoal(null)
                        }}
                    />
                </>
            )}

            <ConfirmDialog
                isOpen={showDeleteDialog}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={confirmDelete}
                title="Eliminar Meta"
                message="¿Estás seguro de que deseas eliminar esta meta? Esta acción no se puede deshacer."
            />

            <CelebrationModal
                isOpen={showCelebration}
                onClose={() => setShowCelebration(false)}
                goalName={selectedGoal?.name || ''}
                goalAmount={selectedGoal?.targetAmount || '0'}
            />
        </div>
    )
}
