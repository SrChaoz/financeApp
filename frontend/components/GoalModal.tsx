'use client'

import { useState, useEffect } from 'react'
import BottomSheet from './BottomSheet'
import api from '@/lib/api'
import { useToast } from './ToastProvider'

interface Goal {
    id: string
    name: string
    targetAmount: string
    currentAmount: string
    deadline: string | null
    description: string | null
}

interface GoalModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    goal?: Goal | null
}

export default function GoalModal({ isOpen, onClose, onSuccess, goal }: GoalModalProps) {
    const { showToast } = useToast()
    const [name, setName] = useState('')
    const [targetAmount, setTargetAmount] = useState('')
    const [currentAmount, setCurrentAmount] = useState('')
    const [deadline, setDeadline] = useState('')
    const [description, setDescription] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (goal) {
            setName(goal.name)
            setTargetAmount(goal.targetAmount)
            setCurrentAmount(goal.currentAmount)
            setDeadline(goal.deadline ? goal.deadline.split('T')[0] : '')
            setDescription(goal.description || '')
        } else {
            resetForm()
        }
    }, [goal, isOpen])

    const resetForm = () => {
        setName('')
        setTargetAmount('')
        setCurrentAmount('0')
        setDeadline('')
        setDescription('')
        setError('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!name || !targetAmount) {
            setError('El nombre y el monto objetivo son requeridos')
            return
        }

        if (parseFloat(targetAmount) <= 0) {
            setError('El monto objetivo debe ser mayor a 0')
            return
        }

        setLoading(true)

        try {
            const data = {
                name,
                targetAmount: parseFloat(targetAmount),
                currentAmount: parseFloat(currentAmount) || 0,
                deadline: deadline || null,
                description: description || null
            }

            if (goal) {
                await api.put(`/api/goals/${goal.id}`, data)
            } else {
                await api.post('/api/goals', data)
            }

            showToast(
                goal ? 'Meta actualizada exitosamente' : 'Meta creada exitosamente',
                'success'
            )
            onSuccess()
            onClose()
            resetForm()
        } catch (err: any) {
            const errorMsg = err.response?.data?.error?.message || 'Error al guardar la meta'
            setError(errorMsg)
            showToast(errorMsg, 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose} title={goal ? 'Editar Meta' : '🎯 Nueva Meta'}>
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                        Nombre de la Meta *
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mobile-input w-full bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 text-white placeholder-slate-500"
                        placeholder="Ej: Vacaciones, Auto nuevo..."
                        required
                        autoFocus
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-slate-300 text-sm font-medium mb-2">
                            💰 Monto Objetivo *
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                            <input
                                type="number"
                                inputMode="decimal"
                                step="0.01"
                                value={targetAmount}
                                onChange={(e) => setTargetAmount(e.target.value)}
                                className="mobile-input w-full pr-4 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 text-white text-lg"
                                style={{ paddingLeft: '2.5rem' }}
                                placeholder="0.00"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-300 text-sm font-medium mb-2">
                            📊 Monto Actual
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                            <input
                                type="number"
                                inputMode="decimal"
                                step="0.01"
                                value={currentAmount}
                                onChange={(e) => setCurrentAmount(e.target.value)}
                                className="mobile-input w-full pr-4 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 text-white text-lg"
                                style={{ paddingLeft: '2.5rem' }}
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                        📅 Fecha Límite (Opcional)
                    </label>
                    <input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="mobile-input w-full bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 text-white"
                    />
                </div>

                <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                        📝 Descripción (Opcional)
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mobile-input w-full bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 text-white resize-none placeholder-slate-500"
                        rows={3}
                        placeholder="Describe tu meta..."
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors touch-target font-medium"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="flex-1 py-3 px-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl transition-all disabled:opacity-50 touch-target font-medium shadow-lg shadow-violet-600/30"
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                        ) : (
                            goal ? '✓ Actualizar' : '+ Crear'
                        )}
                    </button>
                </div>
            </form>
        </BottomSheet>
    )
}
