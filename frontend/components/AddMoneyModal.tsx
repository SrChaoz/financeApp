'use client'

import { useState } from 'react'
import Modal from './Modal'
import api from '@/lib/api'
import { useToast } from './ToastProvider'
import { DollarSign } from 'lucide-react'

interface AddMoneyModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    goal: {
        id: string
        name: string
        currentAmount: string
        targetAmount: string
    }
}

export default function AddMoneyModal({ isOpen, onClose, onSuccess, goal }: AddMoneyModalProps) {
    const { showToast } = useToast()
    const [amount, setAmount] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!amount || parseFloat(amount) <= 0) {
            setError('Ingresa un monto válido mayor a 0')
            return
        }

        setLoading(true)

        try {
            const newCurrentAmount = parseFloat(goal.currentAmount) + parseFloat(amount)

            await api.put(`/api/goals/${goal.id}`, {
                currentAmount: newCurrentAmount
            })

            showToast(`¡$${parseFloat(amount).toFixed(2)} agregados a ${goal.name}!`, 'success')
            onSuccess()
            onClose()
            setAmount('')
        } catch (err: any) {
            const errorMsg = err.response?.data?.error?.message || 'Error al agregar dinero'
            setError(errorMsg)
            showToast(errorMsg, 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = () => {
        setAmount('')
        setError('')
        onClose()
    }

    const newTotal = amount ? parseFloat(goal.currentAmount) + parseFloat(amount) : parseFloat(goal.currentAmount)
    const progress = (newTotal / parseFloat(goal.targetAmount)) * 100

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="Agregar Dinero">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <div className="text-center mb-4">
                    <p className="text-slate-400 text-sm mb-1">Meta</p>
                    <h3 className="text-xl font-bold text-white">{goal.name}</h3>
                </div>

                <div className="glass-effect rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-slate-400 text-sm">Actual</span>
                        <span className="text-white font-bold">${parseFloat(goal.currentAmount).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">Objetivo</span>
                        <span className="text-white font-bold">${parseFloat(goal.targetAmount).toFixed(2)}</span>
                    </div>
                </div>

                <div>
                    <label className="block text-slate-400 text-sm font-medium mb-2">
                        ¿Cuánto quieres agregar? *
                    </label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">$</span>
                        <input
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="mobile-input w-full pl-10 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-white text-lg font-bold"
                            placeholder="0.00"
                            autoFocus
                            required
                        />
                    </div>
                </div>

                {amount && parseFloat(amount) > 0 && (
                    <div className="glass-effect rounded-lg p-4 border-2 border-green-500/30">
                        <p className="text-slate-400 text-sm mb-2">Nuevo total</p>
                        <p className="text-2xl font-bold text-green-400 mb-3">
                            ${newTotal.toFixed(2)}
                        </p>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-500 transition-all duration-500"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-2">{progress.toFixed(1)}% completado</p>
                    </div>
                )}

                <div className="flex gap-3 pt-4">
                    <button
                        type="button"
                        onClick={handleClose}
                        className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all disabled:opacity-50 font-medium"
                        disabled={loading}
                    >
                        {loading ? 'Agregando...' : 'Agregar Dinero'}
                    </button>
                </div>
            </form>
        </Modal>
    )
}
