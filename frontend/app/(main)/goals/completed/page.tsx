'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { ArrowLeft, CheckCircle2, Calendar, TrendingUp, Filter, Trophy } from 'lucide-react'
import { format, differenceInDays, startOfMonth, startOfYear } from 'date-fns'
import { es } from 'date-fns/locale'
import AnimatedNumber from '@/components/AnimatedNumber'
import FadeIn from '@/components/FadeIn'
import { StaggerItem } from '@/components/StaggerContainer'

interface Goal {
    id: string
    name: string
    targetAmount: string
    currentAmount: string
    deadline: string | null
    description: string | null
    isCompleted: boolean
    createdAt: string
    completedAt?: string
}

type FilterPeriod = 'all' | 'thisYear' | 'thisMonth' | 'last30'
type SortBy = 'newest' | 'oldest' | 'highest' | 'lowest'

export default function CompletedGoalsPage() {
    const router = useRouter()
    const [goals, setGoals] = useState<Goal[]>([])
    const [loading, setLoading] = useState(true)
    const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('all')
    const [sortBy, setSortBy] = useState<SortBy>('newest')

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/login')
            return
        }
        fetchCompletedGoals()
    }, [])

    const fetchCompletedGoals = async () => {
        try {
            setLoading(true)
            const res = await api.get('/api/goals')
            const completedGoals = res.data.goals.filter((g: Goal) => g.isCompleted)
            setGoals(completedGoals)
        } catch (error) {
            console.error('Error fetching completed goals:', error)
        } finally {
            setLoading(false)
        }
    }

    const getFilteredGoals = () => {
        let filtered = [...goals]

        // Filter by period
        const now = new Date()
        switch (filterPeriod) {
            case 'thisYear':
                filtered = filtered.filter(g =>
                    g.completedAt && new Date(g.completedAt) >= startOfYear(now)
                )
                break
            case 'thisMonth':
                filtered = filtered.filter(g =>
                    g.completedAt && new Date(g.completedAt) >= startOfMonth(now)
                )
                break
            case 'last30':
                const thirtyDaysAgo = new Date()
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                filtered = filtered.filter(g =>
                    g.completedAt && new Date(g.completedAt) >= thirtyDaysAgo
                )
                break
        }

        // Sort
        switch (sortBy) {
            case 'newest':
                filtered.sort((a, b) =>
                    new Date(b.completedAt || b.createdAt).getTime() -
                    new Date(a.completedAt || a.createdAt).getTime()
                )
                break
            case 'oldest':
                filtered.sort((a, b) =>
                    new Date(a.completedAt || a.createdAt).getTime() -
                    new Date(b.completedAt || b.createdAt).getTime()
                )
                break
            case 'highest':
                filtered.sort((a, b) => parseFloat(b.targetAmount) - parseFloat(a.targetAmount))
                break
            case 'lowest':
                filtered.sort((a, b) => parseFloat(a.targetAmount) - parseFloat(b.targetAmount))
                break
        }

        return filtered
    }

    const getDaysToComplete = (goal: Goal) => {
        if (!goal.completedAt) return null
        return differenceInDays(new Date(goal.completedAt), new Date(goal.createdAt))
    }

    const getTotalAmount = () => {
        return goals.reduce((sum, goal) => sum + parseFloat(goal.targetAmount), 0)
    }

    const getThisMonthCount = () => {
        const now = new Date()
        return goals.filter(g =>
            g.completedAt && new Date(g.completedAt) >= startOfMonth(now)
        ).length
    }

    const getThisYearCount = () => {
        const now = new Date()
        return goals.filter(g =>
            g.completedAt && new Date(g.completedAt) >= startOfYear(now)
        ).length
    }

    const filteredGoals = getFilteredGoals()

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 md:mb-8">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-white" />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
                        Metas Completadas 🎉
                    </h1>
                    <p className="text-slate-400 text-sm md:text-base">
                        Has alcanzado {goals.length} {goals.length === 1 ? 'meta' : 'metas'}
                    </p>
                </div>
            </div>

            {/* Statistics */}
            <FadeIn delay={0.1}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                    <div className="glass-effect rounded-xl p-4 md:p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Trophy className="w-5 h-5 text-yellow-400" />
                            <h3 className="text-slate-400 text-sm font-medium">Total Metas</h3>
                        </div>
                        <p className="text-3xl font-bold text-white">{goals.length}</p>
                    </div>
                    <div className="glass-effect rounded-xl p-4 md:p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <Calendar className="w-5 h-5 text-blue-400" />
                            <h3 className="text-slate-400 text-sm font-medium">Este Mes</h3>
                        </div>
                        <p className="text-3xl font-bold text-blue-400">{getThisMonthCount()}</p>
                    </div>
                    <div className="glass-effect rounded-xl p-4 md:p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <TrendingUp className="w-5 h-5 text-green-400" />
                            <h3 className="text-slate-400 text-sm font-medium">Total Ahorrado</h3>
                        </div>
                        <p className="text-2xl font-bold text-green-400">
                            <AnimatedNumber value={getTotalAmount()} prefix="$" decimals={2} duration={1} />
                        </p>
                    </div>
                </div>
            </FadeIn>

            {/* Filters */}
            <div className="glass-effect rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <Filter className="w-5 h-5 text-violet-400" />
                    <h3 className="text-white font-medium">Filtros</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Período</label>
                        <select
                            value={filterPeriod}
                            onChange={(e) => setFilterPeriod(e.target.value as FilterPeriod)}
                            className="w-full mobile-input bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 text-white"
                        >
                            <option value="all">Todo el tiempo</option>
                            <option value="thisYear">Este año</option>
                            <option value="thisMonth">Este mes</option>
                            <option value="last30">Últimos 30 días</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Ordenar por</label>
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as SortBy)}
                            className="w-full mobile-input bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 text-white"
                        >
                            <option value="newest">Más reciente</option>
                            <option value="oldest">Más antigua</option>
                            <option value="highest">Mayor monto</option>
                            <option value="lowest">Menor monto</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Goals List */}
            {filteredGoals.length === 0 ? (
                <div className="glass-effect rounded-2xl p-12 text-center">
                    <CheckCircle2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">No hay metas completadas</h3>
                    <p className="text-slate-400">
                        {filterPeriod !== 'all'
                            ? 'Intenta cambiar el filtro de período'
                            : 'Completa tu primera meta para verla aquí'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredGoals.map((goal, index) => {
                        const daysToComplete = getDaysToComplete(goal)

                        return (
                            <StaggerItem key={goal.id}>
                                <div className="glass-effect rounded-xl p-4 md:p-6 border-2 border-green-500/30">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <CheckCircle2 className="w-5 h-5 text-green-400" />
                                                <h3 className="text-lg font-bold text-white">{goal.name}</h3>
                                            </div>
                                            {goal.description && (
                                                <p className="text-sm text-slate-400 mb-2">{goal.description}</p>
                                            )}
                                        </div>
                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-green-400">
                                                ${parseFloat(goal.targetAmount).toFixed(2)}
                                            </p>
                                            <p className="text-xs text-slate-500">100% completado</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                                        {goal.completedAt && (
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                <span>
                                                    Completada: {format(new Date(goal.completedAt), "d 'de' MMMM, yyyy", { locale: es })}
                                                </span>
                                            </div>
                                        )}
                                        {daysToComplete !== null && (
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4" />
                                                <span>
                                                    Tiempo: {daysToComplete} {daysToComplete === 1 ? 'día' : 'días'}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </StaggerItem>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
