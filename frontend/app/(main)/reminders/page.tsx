'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Plus, Bell, Edit2, Trash2, Calendar, AlertCircle, Clock } from 'lucide-react'
import { format, isPast, isToday, isTomorrow } from 'date-fns'
import { es } from 'date-fns/locale'
import ReminderModal from '@/components/ReminderModal'
import ConfirmDialog from '@/components/ConfirmDialog'
import PullToRefresh from '@/components/PullToRefresh'
import SwipeableItem from '@/components/SwipeableItem'
import { useToast } from '@/components/ToastProvider'

interface Reminder {
    id: string
    title: string
    amount: string | null
    dueDate: string
    frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'
    category: string
    notes: string | null
    isActive: boolean
    createdAt: string
}

const FREQUENCY_LABELS = {
    DAILY: 'Diario',
    WEEKLY: 'Semanal',
    MONTHLY: 'Mensual',
    YEARLY: 'Anual'
}

export default function RemindersPage() {
    const router = useRouter()
    const { showToast } = useToast()
    const [reminders, setReminders] = useState<Reminder[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null)
    const [reminderToDelete, setReminderToDelete] = useState<Reminder | null>(null)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/login')
            return
        }
        fetchReminders()
    }, [])

    const fetchReminders = async () => {
        try {
            setLoading(true)
            const res = await api.get('/api/reminders')
            setReminders(res.data.reminders)
        } catch (error) {
            console.error('Error fetching reminders:', error)
            showToast('Error al cargar recordatorios', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (reminder: Reminder) => {
        setSelectedReminder(reminder)
        setShowModal(true)
    }

    const handleDelete = (reminder: Reminder) => {
        setReminderToDelete(reminder)
        setShowDeleteDialog(true)
    }

    const confirmDelete = async () => {
        if (!reminderToDelete) return

        try {
            await api.delete(`/api/reminders/${reminderToDelete.id}`)
            showToast('Recordatorio eliminado exitosamente', 'success')
            fetchReminders()
        } catch (error) {
            console.error('Error deleting reminder:', error)
            showToast('Error al eliminar recordatorio', 'error')
        } finally {
            setShowDeleteDialog(false)
            setReminderToDelete(null)
        }
    }

    const handleMarkAsPaid = async (reminder: Reminder) => {
        try {
            // For now, we'll just show a toast. In the future, this could update the reminder status
            showToast(`Recordatorio "${reminder.title}" marcado como pagado`, 'success')
            // TODO: Implement actual API call to mark as paid
            // await api.put(`/api/reminders/${reminder.id}/mark-paid`)
            // fetchReminders()
        } catch (error) {
            console.error('Error marking reminder as paid:', error)
            showToast('Error al marcar como pagado', 'error')
        }
    }

    const handleModalClose = () => {
        setShowModal(false)
        setSelectedReminder(null)
    }

    const getDueDateStatus = (dueDate: string) => {
        const date = new Date(dueDate)
        if (isPast(date) && !isToday(date)) return { label: 'Vencido', color: 'text-red-400', bg: 'bg-red-500/20' }
        if (isToday(date)) return { label: 'Hoy', color: 'text-yellow-400', bg: 'bg-yellow-500/20' }
        if (isTomorrow(date)) return { label: 'Mañana', color: 'text-orange-400', bg: 'bg-orange-500/20' }
        return { label: 'Próximo', color: 'text-blue-400', bg: 'bg-blue-500/20' }
    }

    const activeReminders = reminders.filter(r => r.isActive)
    const upcomingReminders = activeReminders.filter(r => {
        const date = new Date(r.dueDate)
        return !isPast(date) || isToday(date)
    })
    const overdueReminders = activeReminders.filter(r => {
        const date = new Date(r.dueDate)
        return isPast(date) && !isToday(date)
    })

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <PullToRefresh onRefresh={fetchReminders}>
            <div className="container mx-auto px-4 py-4 md:py-8 max-w-7xl pb-24 md:pb-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-white">Recordatorios</h1>
                </div>

                {/* Summary Cards */}
                {overdueReminders.length > 0 && (
                    <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                        <div className="flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-rose-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="text-rose-400 font-bold mb-1">¡Recordatorios Vencidos!</h3>
                                <p className="text-rose-300 text-sm">
                                    Tienes {overdueReminders.length} recordatorio(s) vencido(s)
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Compact Summary Bar */}
                <div className="card-premium p-4 mb-6 bg-gradient-to-br from-zinc-900 to-zinc-950">
                    <div className="grid grid-cols-3 divide-x divide-zinc-800">
                        {/* Total Active */}
                        <div className="px-4 first:pl-0 last:pr-0">
                            <div className="flex items-center gap-2 mb-1">
                                <Bell className="w-3 h-3 text-primary" />
                                <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold">Activos</p>
                            </div>
                            <p className="text-2xl md:text-3xl font-bold text-white">{activeReminders.length}</p>
                        </div>

                        {/* Upcoming */}
                        <div className="px-4 first:pl-0 last:pr-0">
                            <div className="flex items-center gap-2 mb-1">
                                <Calendar className="w-3 h-3 text-blue-500" />
                                <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold">Próximos</p>
                            </div>
                            <p className="text-2xl md:text-3xl font-bold text-blue-400">{upcomingReminders.length}</p>
                        </div>

                        {/* Overdue */}
                        <div className="px-4 first:pl-0 last:pr-0">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertCircle className="w-3 h-3 text-rose-500" />
                                <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold">Vencidos</p>
                            </div>
                            <p className="text-2xl md:text-3xl font-bold text-rose-400">{overdueReminders.length}</p>
                        </div>
                    </div>
                </div>

                {/* Reminders List */}
                {reminders.length === 0 ? (
                    <div className="glass-effect rounded-2xl p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-violet-600/20 flex items-center justify-center mx-auto mb-4">
                            <Bell className="w-8 h-8 text-violet-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No hay recordatorios aún</h3>
                        <p className="text-slate-400 mb-6">Crea tu primer recordatorio de pago</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg transition-all"
                        >
                            Crear Primer Recordatorio
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Section Header with Add Button */}
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-white">Mis Recordatorios</h2>
                            <button
                                onClick={() => setShowModal(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-tr from-indigo-500 to-violet-500 hover:shadow-[0_0_20px_rgba(99,102,241,0.5)] text-white rounded-xl transition-all font-medium shadow-lg active:scale-95"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">Nuevo Recordatorio</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {/* Overdue Reminders */}
                            {overdueReminders.length > 0 && (
                                <div>
                                    <h2 className="text-lg font-bold text-white mb-4">Vencidos</h2>
                                    <div className="space-y-3">
                                        {overdueReminders.map((reminder) => {
                                            const status = getDueDateStatus(reminder.dueDate)

                                            return (
                                                <SwipeableItem
                                                    key={reminder.id}
                                                    onEdit={() => handleMarkAsPaid(reminder)}
                                                    onDelete={() => handleDelete(reminder)}
                                                    editColor="bg-green-600"
                                                >
                                                    <div className="glass-effect rounded-xl p-4 md:p-6 border-2 border-red-500/50">
                                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                                            <div className="flex-1">
                                                                <div className="flex items-start gap-3 mb-2">
                                                                    <Bell className="w-5 h-5 text-red-400 mt-1" />
                                                                    <div>
                                                                        <h3 className="text-lg font-bold text-white">{reminder.title}</h3>
                                                                        <p className="text-sm text-slate-400">{reminder.category}</p>
                                                                    </div>
                                                                </div>
                                                                {reminder.notes && (
                                                                    <p className="text-sm text-slate-400 ml-8">{reminder.notes}</p>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center gap-4">
                                                                {reminder.amount && (
                                                                    <span className="text-lg font-bold text-white">${parseFloat(reminder.amount).toFixed(2)}</span>
                                                                )}
                                                                <div className="flex gap-2 md:hidden">
                                                                    <button
                                                                        onClick={() => handleEdit(reminder)}
                                                                        className="touch-target bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
                                                                    >
                                                                        <Edit2 className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(reminder)}
                                                                        className="touch-target bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-slate-700">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                                                                {status.label}
                                                            </span>
                                                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                                                <Calendar className="w-4 h-4" />
                                                                {format(new Date(reminder.dueDate), "d 'de' MMMM, yyyy", { locale: es })}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                                                <Clock className="w-4 h-4" />
                                                                {FREQUENCY_LABELS[reminder.frequency]}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </SwipeableItem>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Upcoming Reminders */}
                            {upcomingReminders.length > 0 && (
                                <div className={overdueReminders.length > 0 ? 'mt-8' : ''}>
                                    <h2 className="text-lg font-bold text-white mb-4">Próximos</h2>
                                    <div className="space-y-3">
                                        {upcomingReminders.map((reminder) => {
                                            const status = getDueDateStatus(reminder.dueDate)

                                            return (
                                                <SwipeableItem
                                                    key={reminder.id}
                                                    onEdit={() => handleMarkAsPaid(reminder)}
                                                    onDelete={() => handleDelete(reminder)}
                                                    editColor="bg-green-600"
                                                >
                                                    <div className="glass-effect rounded-xl p-4 md:p-6">
                                                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                                            <div className="flex-1">
                                                                <div className="flex items-start gap-3 mb-2">
                                                                    <Bell className="w-5 h-5 text-violet-400 mt-1" />
                                                                    <div>
                                                                        <h3 className="text-lg font-bold text-white">{reminder.title}</h3>
                                                                        <p className="text-sm text-slate-400">{reminder.category}</p>
                                                                    </div>
                                                                </div>
                                                                {reminder.notes && (
                                                                    <p className="text-sm text-slate-400 ml-8">{reminder.notes}</p>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center gap-4">
                                                                {reminder.amount && (
                                                                    <span className="text-lg font-bold text-white">${parseFloat(reminder.amount).toFixed(2)}</span>
                                                                )}
                                                                <div className="flex gap-2 md:hidden">
                                                                    <button
                                                                        onClick={() => handleEdit(reminder)}
                                                                        className="touch-target bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
                                                                    >
                                                                        <Edit2 className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(reminder)}
                                                                        className="touch-target bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-3 mt-4 pt-4 border-t border-slate-700">
                                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color}`}>
                                                                {status.label}
                                                            </span>
                                                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                                                <Calendar className="w-4 h-4" />
                                                                {format(new Date(reminder.dueDate), "d 'de' MMMM, yyyy", { locale: es })}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                                                <Clock className="w-4 h-4" />
                                                                {FREQUENCY_LABELS[reminder.frequency]}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </SwipeableItem>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Modals */}
                <ReminderModal
                    isOpen={showModal}
                    onClose={handleModalClose}
                    onSuccess={fetchReminders}
                    reminder={selectedReminder}
                />

                <ConfirmDialog
                    isOpen={showDeleteDialog}
                    onClose={() => setShowDeleteDialog(false)}
                    onConfirm={confirmDelete}
                    title="Eliminar Recordatorio"
                    message={`¿Estás seguro de que deseas eliminar el recordatorio "${reminderToDelete?.title}"?`}
                />
            </div>
        </PullToRefresh>
    )
}
