'use client'

import { useState, useEffect } from 'react'
import BottomSheet from './BottomSheet'
import api from '@/lib/api'
import { useToast } from './ToastProvider'

interface Budget {
    id: string
    category: string
    limitAmount: string
}

interface BudgetModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    budget?: Budget | null
}

const EXPENSE_CATEGORIES = [
    { value: 'Alimentación', emoji: '🍔' },
    { value: 'Transporte', emoji: '🚗' },
    { value: 'Vivienda', emoji: '🏠' },
    { value: 'Servicios', emoji: '💡' },
    { value: 'Entretenimiento', emoji: '🎮' },
    { value: 'Salud', emoji: '⚕️' },
    { value: 'Educación', emoji: '📚' },
    { value: 'Ropa', emoji: '👕' },
    { value: 'Tecnología', emoji: '💻' },
    { value: 'Viajes', emoji: '✈️' },
    { value: 'Regalos', emoji: '🎁' },
    { value: 'Otros Gastos', emoji: '📦' }
]

export default function BudgetModal({ isOpen, onClose, onSuccess, budget }: BudgetModalProps) {
    const { showToast } = useToast()
    const [category, setCategory] = useState('')
    const [limitAmount, setLimitAmount] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (budget) {
            setCategory(budget.category)
            setLimitAmount(budget.limitAmount)
        } else {
            setCategory('')
            setLimitAmount('')
        }
        setError('')
    }, [budget, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const data = {
                category,
                limitAmount: parseFloat(limitAmount)
            }

            if (budget) {
                await api.put(`/api/budgets/${budget.id}`, data)
            } else {
                await api.post('/api/budgets', data)
            }

            showToast(
                budget ? 'Presupuesto actualizado exitosamente' : 'Presupuesto creado exitosamente',
                'success'
            )
            onSuccess()
            onClose()
        } catch (err: any) {
            const errorMsg = err.response?.data?.error?.message || 'Error al guardar el presupuesto'
            setError(errorMsg)
            showToast(errorMsg, 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title={budget ? 'Editar Presupuesto' : 'Nuevo Presupuesto'}
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Categoría *
                    </label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="mobile-input w-full bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 text-white"
                        required
                    >
                        <option value="">Selecciona una categoría</option>
                        {EXPENSE_CATEGORIES.map((cat) => (
                            <option key={cat.value} value={cat.value}>
                                {cat.emoji} {cat.value}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-slate-400 mt-2">
                        💡 El presupuesto se aplicará a los gastos de esta categoría
                    </p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                        Límite Mensual *
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                        <input
                            type="number"
                            inputMode="decimal"
                            step="0.01"
                            min="0"
                            value={limitAmount}
                            onChange={(e) => setLimitAmount(e.target.value)}
                            className="mobile-input w-full pr-4 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 text-white placeholder-slate-500 text-lg"
                            style={{ paddingLeft: '2.5rem' }}
                            placeholder="0.00"
                            required
                            autoFocus
                        />
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                        🔔 Recibirás alertas cuando te acerques o excedas este límite
                    </p>
                </div>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
                        {error}
                    </div>
                )}

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
                        disabled={loading}
                        className="flex-1 py-3 px-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-target font-medium shadow-lg shadow-violet-600/30"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                        ) : (
                            budget ? '✓ Actualizar' : '+ Crear'
                        )}
                    </button>
                </div>
            </form>
        </BottomSheet>
    )
}
