'use client'

import { useState, useEffect } from 'react'
import BottomSheet from './BottomSheet'
import api from '@/lib/api'
import { useToast } from './ToastProvider'
import { ArrowUpRight, ArrowDownRight, ChevronDown, Calendar, Check } from 'lucide-react'

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
    initialType?: 'INCOME' | 'EXPENSE'
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
    transaction,
    initialType = 'EXPENSE'
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
    const [loadingAccounts, setLoadingAccounts] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (isOpen) {
            setLoadingAccounts(true)
            fetchAccounts()
            // Set initial type when modal opens (only if not editing)
            if (!transaction) {
                setType(initialType)
                // Also set appropriate category
                const categories = initialType === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
                setCategory(categories[0])
            }
        }
    }, [isOpen, initialType, transaction])

    useEffect(() => {
        if (transaction) {
            setAmount(transaction.amount)
            setType(transaction.type)
            setDate(transaction.date.split('T')[0])
            setCategory(transaction.category)
            setNotes(transaction.notes || '')
            setIsRecurring(transaction.isRecurring)
            setAccountId(transaction.accountId)
        } else if (!isOpen) {
            // Reset form when modal closes
            resetForm()
        }
        setError('')
    }, [transaction, isOpen])

    const resetForm = () => {
        setAmount('')
        // Don't reset type here, let the useEffect handle it based on initialType
        setDate(new Date().toISOString().split('T')[0])
        setCategory('')
        setNotes('')
        setIsRecurring(false)
        setAccountId('')
    }

    const fetchAccounts = async () => {
        try {
            setLoadingAccounts(true)
            const response = await api.get('/api/accounts')
            setAccounts(response.data.accounts)
            if (response.data.accounts.length > 0 && !accountId) {
                setAccountId(response.data.accounts[0].id)
            }
        } catch (error) {
            console.error('Error fetching accounts:', error)
            showToast('Error al cargar cuentas', 'error')
        } finally {
            setLoadingAccounts(false)
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

    const formContent = loadingAccounts ? (
        <div className="flex items-center justify-center py-12">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted">Cargando cuentas...</p>
            </div>
        </div>
    ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Type Toggle */}
            <div className="flex gap-3 p-1 bg-zinc-950/50 rounded-2xl border border-zinc-800">
                <button
                    type="button"
                    onClick={() => {
                        setType('EXPENSE')
                        setCategory('')
                    }}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${type === 'EXPENSE'
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20 scale-[1.02]'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                        }`}
                >
                    <span className="flex items-center justify-center gap-2">
                        <ArrowDownRight className="w-4 h-4" />
                        Gasto
                    </span>
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setType('INCOME')
                        setCategory('')
                    }}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${type === 'INCOME'
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 scale-[1.02]'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                        }`}
                >
                    <span className="flex items-center justify-center gap-2">
                        <ArrowUpRight className="w-4 h-4" />
                        Ingreso
                    </span>
                </button>
            </div>

            {/* Amount */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-400">
                    Monto
                </label>
                <div className="relative group">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-lg group-focus-within:text-primary transition-colors">$</span>
                    <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        min="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full pl-8 pr-4 py-4 bg-zinc-900 border border-zinc-800 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-white placeholder-zinc-600 text-2xl font-bold transition-all text-center tabular-nums"
                        placeholder="0.00"
                        required
                        autoFocus
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-400">
                        Categoría
                    </label>
                    <div className="relative">
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full px-4 py-4 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-white text-base appearance-none cursor-pointer hover:border-zinc-700 transition-colors"
                            required
                        >
                            <option value="" className="bg-zinc-900 text-zinc-500">Selecciona categoría</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat} className="bg-zinc-900 text-white py-2">
                                    {cat}
                                </option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" />
                    </div>
                </div>

                {/* Account */}
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-zinc-400">
                        Cuenta
                    </label>
                    <div className="relative">
                        <select
                            value={accountId}
                            onChange={(e) => setAccountId(e.target.value)}
                            className="w-full px-4 py-4 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-white text-base appearance-none cursor-pointer hover:border-zinc-700 transition-colors"
                            required
                        >
                            {accounts.length === 0 ? (
                                <option value="" className="bg-zinc-900 text-zinc-500">No hay cuentas</option>
                            ) : (
                                accounts.map((account) => (
                                    <option key={account.id} value={account.id} className="bg-zinc-900 text-white py-2">
                                        {account.name} ({account.type})
                                    </option>
                                ))
                            )}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" />
                    </div>
                    {accounts.length === 0 && (
                        <p className="text-xs text-rose-400 mt-1">
                            Crea una cuenta primero en la sección de Cuentas
                        </p>
                    )}
                </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-400">
                    Fecha
                </label>
                <div className="relative">
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full px-4 py-4 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-white text-base appearance-none"
                        required
                    />
                    <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 pointer-events-none" />
                </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-400">
                    Notas <span className="text-zinc-600 font-normal">(opcional)</span>
                </label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-4 py-4 bg-zinc-900 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-white text-base placeholder-zinc-500 resize-none transition-colors"
                    placeholder="Ej: Compra en supermercado"
                    rows={3}
                />
            </div>

            {/* Recurring */}
            <div className="flex items-center gap-3 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                <div className="relative flex items-center">
                    <input
                        type="checkbox"
                        id="isRecurring"
                        checked={isRecurring}
                        onChange={(e) => setIsRecurring(e.target.checked)}
                        className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-zinc-600 bg-zinc-950/50 checked:border-primary checked:bg-primary transition-all"
                    />
                    <Check className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" />
                </div>
                <label htmlFor="isRecurring" className="text-sm text-zinc-300 flex-1 cursor-pointer select-none">
                    Repetir esta transacción mensualmente
                </label>
            </div>

            {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    {error}
                </div>
            )}

            <div className="flex gap-3 pt-4">
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
                    disabled={loading || accounts.length === 0}
                    className="flex-1 py-3.5 px-4 bg-gradient-primary hover:shadow-glow-primary text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg active:scale-[0.98]"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                    ) : (
                        transaction ? 'Actualizar' : 'Crear Transacción'
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
