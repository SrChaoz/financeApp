'use client'

import { useState, useEffect } from 'react'
import BottomSheet from './BottomSheet'
import api from '@/lib/api'
import { useToast } from './ToastProvider'

interface Transaction {
    id: string
    amount: string
    type: 'INCOME' | 'EXPENSE'
    date: string
    category: string
    notes?: string
    isRecurring: boolean
    accountId: string
}

interface Account {
    id: string
    name: string
    type: string
}

interface TransactionModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    transaction?: Transaction | null
}

const INCOME_CATEGORIES = [
    'Salario',
    'Freelance',
    'Inversiones',
    'Bonos',
    'Ventas',
    'Regalos',
    'Otros Ingresos'
]

const EXPENSE_CATEGORIES = [
    'Alimentación',
    'Transporte',
    'Vivienda',
    'Servicios',
    'Entretenimiento',
    'Salud',
    'Educación',
    'Ropa',
    'Tecnología',
    'Viajes',
    'Regalos',
    'Otros Gastos'
]

export default function TransactionModal({
    isOpen,
    onClose,
    onSuccess,
    transaction
}: TransactionModalProps) {
    const { showToast } = useToast()
    const [accounts, setAccounts] = useState<Account[]>([])
    const [amount, setAmount] = useState('')
    const [type, setType] = useState<'INCOME' | 'EXPENSE'>('EXPENSE')
    const [date, setDate] = useState('')
    const [category, setCategory] = useState('')
    const [notes, setNotes] = useState('')
    const [isRecurring, setIsRecurring] = useState(false)
    const [accountId, setAccountId] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (isOpen) {
            fetchAccounts()
        }
    }, [isOpen])

    useEffect(() => {
        if (transaction) {
            setAmount(transaction.amount)
            setType(transaction.type)
            setDate(transaction.date.split('T')[0])
            setCategory(transaction.category)
            setNotes(transaction.notes || '')
            setIsRecurring(transaction.isRecurring)
            setAccountId(transaction.accountId)
        } else {
            resetForm()
        }
        setError('')
    }, [transaction, isOpen])

    const resetForm = () => {
        setAmount('')
        setType('EXPENSE')
        setDate(new Date().toISOString().split('T')[0])
        setCategory('')
        setNotes('')
        setIsRecurring(false)
        setAccountId('')
    }

    const fetchAccounts = async () => {
        try {
            const response = await api.get('/api/accounts')
            setAccounts(response.data.accounts)
            if (response.data.accounts.length > 0 && !accountId) {
                setAccountId(response.data.accounts[0].id)
            }
        } catch (error) {
            console.error('Error fetching accounts:', error)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        if (accounts.length === 0) {
            setError('Debes crear al menos una cuenta primero')
            setLoading(false)
            return
        }

        try {
            const data = {
                amount: parseFloat(amount),
                type,
                date: new Date(date).toISOString(),
                category,
                notes: notes || undefined,
                isRecurring,
                accountId
            }

            if (transaction) {
                await api.put(`/api/transactions/${transaction.id}`, data)
            } else {
                await api.post('/api/transactions', data)
            }

            showToast(
                transaction ? 'Transacción actualizada exitosamente' : 'Transacción creada exitosamente',
                'success'
            )
            onSuccess()
            onClose()
            resetForm()
        } catch (err: any) {
            const errorMsg = err.response?.data?.error?.message || 'Error al guardar la transacción'
            setError(errorMsg)
            showToast(errorMsg, 'error')
        } finally {
            setLoading(false)
        }
    }

    const categories = type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

    const formContent = (
        <form onSubmit={handleSubmit} className="space-y-5">
            {/* Type Toggle */}
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => {
                        setType('EXPENSE')
                        setCategory('')
                    }}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all touch-target ${type === 'EXPENSE'
                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                >
                    💸 Gasto
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setType('INCOME')
                        setCategory('')
                    }}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all touch-target ${type === 'INCOME'
                        ? 'bg-green-600 text-white shadow-lg shadow-green-600/30'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                >
                    💰 Ingreso
                </button>
            </div>

            {/* Amount */}
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    Monto *
                </label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                    <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="mobile-input w-full pl-4 pr-4 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 text-white placeholder-slate-500 text-lg"
                        style={{ paddingLeft: '2.5rem' }}
                        placeholder="0.00"
                        required
                        autoFocus
                    />
                </div>
            </div>

            {/* Category */}
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
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
            </div>

            {/* Account */}
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    Cuenta *
                </label>
                <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="mobile-input w-full bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 text-white"
                    required
                >
                    {accounts.length === 0 ? (
                        <option value="">No hay cuentas disponibles</option>
                    ) : (
                        accounts.map((account) => (
                            <option key={account.id} value={account.id}>
                                {account.name} ({account.type})
                            </option>
                        ))
                    )}
                </select>
                {accounts.length === 0 && (
                    <p className="text-xs text-slate-400 mt-1">
                        Crea una cuenta primero en la sección de Cuentas
                    </p>
                )}
            </div>

            {/* Date */}
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    Fecha *
                </label>
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mobile-input w-full bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 text-white"
                    required
                />
            </div>

            {/* Notes */}
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                    Notas (opcional)
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="mobile-input w-full bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 text-white placeholder-slate-500 resize-none"
                    placeholder="Agrega detalles adicionales..."
                    rows={3}
                />
            </div>

            {/* Recurring */}
            <div className="flex items-center gap-3 p-4 bg-slate-800/30 rounded-xl">
                <input
                    type="checkbox"
                    id="isRecurring"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="w-5 h-5 rounded border-slate-700 bg-slate-800 text-violet-600 focus:ring-violet-600 focus:ring-offset-slate-900"
                />
                <label htmlFor="isRecurring" className="text-sm text-slate-300 flex-1">
                    🔄 Transacción recurrente
                </label>
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
                    disabled={loading || accounts.length === 0}
                    className="flex-1 py-3 px-4 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed touch-target font-medium shadow-lg shadow-violet-600/30"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto" />
                    ) : (
                        transaction ? '✓ Actualizar' : '+ Crear'
                    )}
                </button>
            </div>
        </form>
    )

    return (
        <BottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title={transaction ? 'Editar Transacción' : 'Nueva Transacción'}
        >
            {formContent}
        </BottomSheet>
    )
}
