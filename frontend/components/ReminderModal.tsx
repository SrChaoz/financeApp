'use client'

import { useState, useEffect } from 'react'
import BottomSheet from './BottomSheet'
import api from '@/lib/api'
import { useToast } from './ToastProvider'

interface Reminder {
    id: string
    title: string
    amount: string | null
    dueDate: string
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
    category: string
    notes: string | null
}

interface ReminderModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    reminder?: Reminder | null
}

const FREQUENCIES = [
    { value: 'DAILY', label: '📅 Diario', emoji: '📅' },
    { value: 'WEEKLY', label: '📆 Semanal', emoji: '📆' },
    { value: 'MONTHLY', label: '🗓️ Mensual', emoji: '🗓️' },
    { value: 'YEARLY', label: '📋 Anual', emoji: '📋' }
]

const EXPENSE_CATEGORIES = [
    { value: 'Vivienda', emoji: '🏠' },
    { value: 'Transporte', emoji: '🚗' },
    { value: 'Alimentación', emoji: '🍔' },
    { value: 'Servicios', emoji: '💡' },
    { value: 'Entretenimiento', emoji: '🎮' },
    { value: 'Salud', emoji: '⚕️' },
    { value: 'Educación', emoji: '📚' },
    { value: 'Seguros', emoji: '🛡️' },
    { value: 'Deudas', emoji: '💳' },
    { value: 'Suscripciones', emoji: '📺' },
    { value: 'Otros', emoji: '📦' }
]

export default function ReminderModal({ isOpen, onClose, onSuccess, reminder }: ReminderModalProps) {
    const { showToast } = useToast()
    const [title, setTitle] = useState('')
    const [amount, setAmount] = useState('')
    const [dueDate, setDueDate] = useState('')
    const [frequency, setFrequency] = useState<'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'>('MONTHLY')
    const [category, setCategory] = useState('')
    const [notes, setNotes] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        if (reminder) {
            setTitle(reminder.title)
            setAmount(reminder.amount || '')
            setDueDate(reminder.dueDate.split('T')[0])
            setFrequency(reminder.frequency)
            setCategory(reminder.category)
            setNotes(reminder.notes || '')
        } else {
            resetForm()
        }
    }, [reminder, isOpen])

    const resetForm = () => {
        setTitle('')
        setAmount('')
        setDueDate('')
        setFrequency('MONTHLY')
        setCategory('')
        setNotes('')
        setError('')
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (!title || !dueDate || !category) {
            setError('El título, fecha y categoría son requeridos')
            return
        }

        setLoading(true)

        try {
            const data = {
                title,
                amount: amount ? parseFloat(amount) : null,
                dueDate: new Date(dueDate).toISOString(),
                frequency,
                category,
                notes: notes || null
            }

            if (reminder) {
                await api.put(`/api/reminders/${reminder.id}`, data)
            } else {
                await api.post('/api/reminders', data)
            }

            showToast(
                reminder ? 'Recordatorio actualizado exitosamente' : 'Recordatorio creado exitosamente',
                'success'
            )
            onSuccess()
            onClose()
            resetForm()
        } catch (err: any) {
            const errorMsg = err.response?.data?.error?.message || 'Error al guardar el recordatorio'
            setError(errorMsg)
            showToast(errorMsg, 'error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose} title={reminder ? 'Editar Recordatorio' : '🔔 Nuevo Recordatorio'}>
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm">
                        {error}
                    </div>
                )}

                <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                        Título *
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mobile-input w-full bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 text-white placeholder-slate-500"
                        placeholder="Ej: Pago de renta, Factura de luz..."
                        required
                        autoFocus
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-slate-300 text-sm font-medium mb-2">
                            💰 Monto (Opcional)
                        </label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                            <input
                                type="number"
                                inputMode="decimal"
                                step="0.01"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="mobile-input w-full pr-4 bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 text-white text-lg"
                                style={{ paddingLeft: '2.5rem' }}
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-300 text-sm font-medium mb-2">
                            📅 Fecha de Vencimiento *
                        </label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="mobile-input w-full bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 text-white"
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-slate-300 text-sm font-medium mb-2">
                            Frecuencia *
                        </label>
                        <select
                            value={frequency}
                            onChange={(e) => setFrequency(e.target.value as any)}
                            className="mobile-input w-full bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 text-white"
                            required
                        >
                            {FREQUENCIES.map(freq => (
                                <option key={freq.value} value={freq.value}>{freq.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-slate-300 text-sm font-medium mb-2">
                            Categoría *
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="mobile-input w-full bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 text-white"
                            required
                        >
                            <option value="">Seleccionar...</option>
                            {EXPENSE_CATEGORIES.map(cat => (
                                <option key={cat.value} value={cat.value}>{cat.emoji} {cat.value}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                        📝 Notas (Opcional)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="mobile-input w-full bg-slate-800/50 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-600 text-white resize-none placeholder-slate-500"
                        rows={3}
                        placeholder="Información adicional..."
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
                            reminder ? '✓ Actualizar' : '+ Crear'
                        )}
                    </button>
                </div>
            </form>
        </BottomSheet>
    )
}
