'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Trash2, Edit2, Search, Filter, X, ArrowUpRight, ArrowDownRight, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import TransactionModal from '@/components/TransactionModal'
import ConfirmDialog from '@/components/ConfirmDialog'
import PullToRefresh from '@/components/PullToRefresh'
import SwipeableItem from '@/components/SwipeableItem'
import { useToast } from '@/components/ToastProvider'

export default function TransactionsPage() {
    const router = useRouter()
    const { showToast } = useToast()
    const [transactions, setTransactions] = useState<any[]>([])
    const [accounts, setAccounts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [selectedTransaction, setSelectedTransaction] = useState<any>(null)
    const [deleteId, setDeleteId] = useState<string | null>(null)

    // Filters
    const [searchTerm, setSearchTerm] = useState('')
    const [typeFilter, setTypeFilter] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('')
    const [accountFilter, setAccountFilter] = useState('')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [showFilters, setShowFilters] = useState(false)

    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 10

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/login')
            return
        }
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [transRes, accountsRes] = await Promise.all([
                api.get('/api/transactions'),
                api.get('/api/accounts')
            ])
            setTransactions(transRes.data.transactions)
            setAccounts(accountsRes.data.accounts)
        } catch (error) {
            console.error('Error fetching data:', error)
            showToast('Error al cargar datos', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (!deleteId) return

        try {
            await api.delete(`/api/transactions/${deleteId}`)
            showToast('Transacción eliminada exitosamente', 'success')
            fetchData()
        } catch (error) {
            console.error('Error deleting transaction:', error)
            showToast('Error al eliminar transacción', 'error')
        } finally {
            setShowDeleteDialog(false)
            setDeleteId(null)
        }
    }

    const openDeleteDialog = (id: string) => {
        setDeleteId(id)
        setShowDeleteDialog(true)
    }

    const openEditModal = (transaction: any) => {
        setSelectedTransaction(transaction)
        setShowModal(true)
    }

    const closeModal = () => {
        setShowModal(false)
        setSelectedTransaction(null)
    }

    // Filter transactions
    const filteredTransactions = transactions.filter(t => {
        const matchesSearch = t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.notes?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesType = !typeFilter || t.type === typeFilter
        const matchesCategory = !categoryFilter || t.category === categoryFilter
        const matchesAccount = !accountFilter || t.accountId === accountFilter
        const matchesStartDate = !startDate || new Date(t.date) >= new Date(startDate)
        const matchesEndDate = !endDate || new Date(t.date) <= new Date(endDate)

        return matchesSearch && matchesType && matchesCategory && matchesAccount &&
            matchesStartDate && matchesEndDate
    })

    // Pagination
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage)
    const paginatedTransactions = filteredTransactions.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    // Summary
    const totalIncome = filteredTransactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    const totalExpenses = filteredTransactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    const categories = Array.from(new Set(transactions.map(t => t.category)))

    const clearFilters = () => {
        setSearchTerm('')
        setTypeFilter('')
        setCategoryFilter('')
        setAccountFilter('')
        setStartDate('')
        setEndDate('')
        setCurrentPage(1)
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <>
            <PullToRefresh onRefresh={fetchData}>
                <div className="container mx-auto px-4 py-4 md:py-8 max-w-7xl pb-24 md:pb-8">
                    {/* Header with Search and Filter Button */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                        <h1 className="text-2xl md:text-3xl font-bold text-white">Transacciones</h1>

                        {/* Search and Filter Toggle */}
                        <div className="flex items-center gap-3">
                            {/* Search Bar */}
                            <div className="relative flex-1 md:w-64">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <input
                                    type="text"
                                    placeholder="Buscar..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-white text-sm placeholder-zinc-600"
                                />
                            </div>

                            {/* Filter Button */}
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${showFilters
                                    ? 'bg-primary/20 border-primary/30 text-primary'
                                    : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                                    }`}
                            >
                                <Filter className="w-4 h-4" />
                                <span className="text-sm font-medium hidden sm:inline">Filtros</span>
                            </button>
                        </div>
                    </div>

                    {/* Compact Summary Bar */}
                    <div className="card-premium p-4 mb-6 bg-gradient-to-br from-zinc-900 to-zinc-950">
                        <div className="grid grid-cols-3 divide-x divide-zinc-800">
                            {/* Total Transactions */}
                            <div className="px-4 first:pl-0 last:pr-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                                    <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold">Total</p>
                                </div>
                                <p className="text-2xl md:text-3xl font-bold text-white">{filteredTransactions.length}</p>
                            </div>

                            {/* Income */}
                            <div className="px-4 first:pl-0 last:pr-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <ArrowUpRight className="w-3 h-3 text-emerald-500" />
                                    <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold">Ingresos</p>
                                </div>
                                <p className="text-2xl md:text-3xl font-bold text-emerald-400">${totalIncome.toFixed(2)}</p>
                            </div>

                            {/* Expenses */}
                            <div className="px-4 first:pl-0 last:pr-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <ArrowDownRight className="w-3 h-3 text-rose-500" />
                                    <p className="text-zinc-500 text-xs uppercase tracking-wider font-bold">Gastos</p>
                                </div>
                                <p className="text-2xl md:text-3xl font-bold text-rose-400">${totalExpenses.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Filters Panel - Collapsible */}
                    {showFilters && (
                        <div className="card-premium p-4 md:p-6 mb-6 animate-slide-down">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Filtros Avanzados</h3>
                                <button
                                    onClick={clearFilters}
                                    className="text-xs text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                                >
                                    <X className="w-3 h-3" />
                                    Limpiar
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Type Filter */}
                                    <select
                                        value={typeFilter}
                                        onChange={(e) => setTypeFilter(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-white text-sm"
                                    >
                                        <option value="">Todos los tipos</option>
                                        <option value="INCOME">Ingresos</option>
                                        <option value="EXPENSE">Gastos</option>
                                    </select>

                                    {/* Category Filter */}
                                    <select
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-white text-sm"
                                    >
                                        <option value="">Todas las categorías</option>
                                        {categories.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>

                                    {/* Account Filter */}
                                    <select
                                        value={accountFilter}
                                        onChange={(e) => setAccountFilter(e.target.value)}
                                        className="w-full px-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-white text-sm"
                                    >
                                        <option value="">Todas las cuentas</option>
                                        {accounts.map(acc => (
                                            <option key={acc.id} value={acc.id}>{acc.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Date Range */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-zinc-500 text-xs uppercase tracking-wider font-bold mb-2">Desde</label>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-white text-sm"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-zinc-500 text-xs uppercase tracking-wider font-bold mb-2">Hasta</label>
                                        <input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            className="w-full px-4 py-2.5 bg-zinc-950/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-white text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}


                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-3 mb-6">
                        {paginatedTransactions.length === 0 ? (
                            <div className="text-center py-12 px-4">
                                <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-4 border border-zinc-800">
                                    <Search className="w-6 h-6 text-zinc-600" />
                                </div>
                                <p className="text-zinc-400 font-medium">No se encontraron transacciones</p>
                                <p className="text-muted text-sm mt-1">Intenta ajustar los filtros de búsqueda.</p>
                            </div>
                        ) : (
                            paginatedTransactions.map((transaction) => (
                                <SwipeableItem
                                    key={transaction.id}
                                    onEdit={() => openEditModal(transaction)}
                                    onDelete={() => openDeleteDialog(transaction.id)}
                                >
                                    <div className="card-premium p-4 hover:border-zinc-700 transition-colors">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${transaction.type === 'INCOME'
                                                    ? 'bg-emerald-500/10 border-emerald-500/20'
                                                    : 'bg-rose-500/10 border-rose-500/20'
                                                    }`}>
                                                    {transaction.type === 'INCOME' ? (
                                                        <ArrowUpRight className="w-6 h-6 text-emerald-500" />
                                                    ) : (
                                                        <ArrowDownRight className="w-6 h-6 text-rose-500" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-white font-semibold text-lg">{transaction.category}</p>
                                                    <p className="text-zinc-400 text-sm">{transaction.account?.name}</p>
                                                </div>
                                            </div>
                                            <p className={`text-xl font-bold tabular-nums ${transaction.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                {transaction.type === 'INCOME' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between text-sm border-t border-zinc-800 pt-3 mt-3">
                                            <div className="flex items-center gap-2 text-muted uppercase tracking-wide text-xs font-medium">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {format(new Date(transaction.date), "d 'de' MMMM, yyyy", { locale: es })}
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEditModal(transaction)}
                                                    className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-all"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteDialog(transaction.id)}
                                                    className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {transaction.notes && (
                                            <p className="text-zinc-500 text-sm mt-3 pt-3 border-t border-zinc-800/50 italic">
                                                "{transaction.notes}"
                                            </p>
                                        )}
                                    </div>
                                </SwipeableItem>
                            ))
                        )}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block card-premium overflow-hidden mb-6">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-zinc-900 border-b border-zinc-800">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-wider">Fecha</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-wider">Categoría</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-wider">Cuenta</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-muted uppercase tracking-wider">Notas</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-muted uppercase tracking-wider">Monto</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-muted uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-800">
                                    {paginatedTransactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center">
                                                <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center mx-auto mb-3 border border-zinc-800">
                                                    <Search className="w-5 h-5 text-zinc-600" />
                                                </div>
                                                <p className="text-zinc-400 font-medium">No se encontraron transacciones</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedTransactions.map((transaction) => (
                                            <tr key={transaction.id} className="hover:bg-zinc-800/40 transition-colors group">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-300 font-medium">
                                                    {format(new Date(transaction.date), "d 'de' MMM, yyyy", { locale: es })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${transaction.type === 'INCOME' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-rose-500/10 border-rose-500/20'
                                                            }`}>
                                                            {transaction.type === 'INCOME' ? (
                                                                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                                                            ) : (
                                                                <ArrowDownRight className="w-4 h-4 text-rose-500" />
                                                            )}
                                                        </div>
                                                        <span className="text-white font-medium">{transaction.category}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-400">
                                                    {transaction.account?.name}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-zinc-500 max-w-xs truncate group-hover:text-zinc-400 transition-colors">
                                                    {transaction.notes || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <span className={`text-lg font-bold tabular-nums ${transaction.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'
                                                        }`}>
                                                        {transaction.type === 'INCOME' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => openEditModal(transaction)}
                                                            className="p-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-all"
                                                            title="Editar"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => openDeleteDialog(transaction.id)}
                                                            className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-all"
                                                            title="Eliminar"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table >
                        </div>
                    </div>

                    {/* Pagination */}
                    {
                        totalPages > 1 && (
                            <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                                <p className="text-muted text-sm">
                                    Mostrando <span className="text-white font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> a <span className="text-white font-medium">{Math.min(currentPage * itemsPerPage, filteredTransactions.length)}</span> de <span className="text-white font-medium">{filteredTransactions.length}</span>
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <span className="px-4 py-2 text-white bg-zinc-800 rounded-lg font-medium min-w-[3rem] text-center">
                                        {currentPage}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all"
                                    >
                                        <ChevronRight className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )
                    }

                    {/* Modals */}
                    <TransactionModal
                        isOpen={showModal}
                        onClose={closeModal}
                        onSuccess={fetchData}
                        transaction={selectedTransaction}
                    />

                    <ConfirmDialog
                        isOpen={showDeleteDialog}
                        onClose={() => setShowDeleteDialog(false)}
                        onConfirm={handleDelete}
                        title="Eliminar Transacción"
                        message="¿Estás seguro de que deseas eliminar esta transacción? Esta acción no se puede deshacer."
                    />
                </div >
            </PullToRefresh >
        </>
    )
}
