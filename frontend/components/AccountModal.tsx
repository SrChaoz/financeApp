'use client'

import { useState, useEffect } from 'react'
import BottomSheet from './BottomSheet'
import api from '@/lib/api'
import { useToast } from './ToastProvider'

interface Account {
    id: string
    name: string
    type: string
}

interface AccountModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    account?: Account | null
}

const ACCOUNT_TYPES = [
    { value: 'Banco', label: '🏦 Cuenta Bancaria', emoji: '🏦' },
    { value: 'Efectivo', label: '💵 Efectivo', emoji: '💵' },
    { value: 'Tarjeta de Crédito', label: '💳 Tarjeta de Crédito', emoji: '💳' },
    { value: 'Ahorros', label: '🐷 Cuenta de Ahorros', emoji: '🐷' },
    { value: 'Inversión', label: '📈 Inversión', emoji: '📈' },
    { value: 'Otro', label: '📦 Otro', emoji: '📦' },
]

export default function AccountModal({ isOpen, onClose, onSuccess, account }: AccountModalProps) {
    const { showToast } = useToast()
    const [name, setName] = useState('')
    const [type, setType] = useState('Banco')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (account) {
            setName(account.name)
            setType(account.type)
        } else {
            setName('')
            setType('Banco')
        }
        setError('')
    }, [account, isOpen])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            if (account) {
                await api.put(`/api/accounts/${account.id}`, { name, type })
            } else {
                await api.post('/api/accounts', { name, type })
            }
            showToast(
                account ? 'Cuenta actualizada exitosamente' : 'Cuenta creada exitosamente',
                'success'
            )
            onSuccess()
            onClose()
        } catch (err: any) {
            const errorMsg = err.response?.data?.error?.message || 'Error al guardar la cuenta'
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
            title={account ? 'Editar Cuenta' : 'Nueva Cuenta'}
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                        Nombre de la Cuenta *
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-4 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-white text-base placeholder-zinc-500"
                        placeholder="Ej: Banco Principal"
                        required
                        autoFocus
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">
                        Tipo de Cuenta *
                    </label>
                    <select
                        value={type}
                        onChange={(e) => setType(e.target.value)}
                        className="w-full px-4 py-4 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-white text-base appearance-none cursor-pointer"
                        required
                    >
                        {ACCOUNT_TYPES.map((accountType) => (
                            <option key={accountType.value} value={accountType.value} className="bg-zinc-900 text-white py-2">
                                {accountType.label}
                            </option>
                        ))}
                    </select>
                </div>

                {error && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                        {error}
                    </div>
                )}

                <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-3.5 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white rounded-xl transition-colors font-medium"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 px-4 bg-gradient-primary hover:shadow-glow-primary text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-target font-semibold shadow-lg active:scale-[0.98]"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                        ) : (
                            account ? '✓ Actualizar' : '+ Crear'
                        )}
                    </button>
                </div>
            </form>
        </BottomSheet>
    )
}
