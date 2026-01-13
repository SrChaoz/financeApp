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
                <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <>
            <PullToRefresh onRefresh={fetchData}>
                <div className="container mx-auto px-4 py-8 max-w-7xl">
                    {/* Search and Filters */}
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                        <div className="glass-effect rounded-xl p-4 md:p-6">
                            <p className="text-slate-400 text-xs md:text-sm mb-1">Total Transacciones</p>
                            <p className="text-xl md:text-2xl font-bold text-white">{filteredTransactions.length}</p>
                        </div>
                        <div className="glass-effect rounded-xl p-4 md:p-6">
                            <p className="text-slate-400 text-xs md:text-sm mb-1">Ingresos</p>
                            <p className="text-xl md:text-2xl font-bold text-green-400">${totalIncome.toFixed(2)}</p>
                        </div>
                        <div className="glass-effect rounded-xl p-4 md:p-6">
                            <p className="text-slate-400 text-xs md:text-sm mb-1">Gastos</p>
                            <p className="text-xl md:text-2xl font-bold text-red-400">${totalExpenses.toFixed(2)}</p>
                        </div>
                    </div>

                    {/* Filters - Collapsible on Mobile */}
                    <div className="glass-effect rounded-xl p-4 md:p-6 mb-6 md:mb-8">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center justify-between w-full md:hidden mb-4"
                        >
                            <span className="font-medium text-white flex items-center gap-2">
                                <Filter className="w-4 h-4" />
                                Filtros
                            </span>
                            <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${showFilters ? 'rotate-90' : ''}`} />
                        </button>

                        <div className={`space-y-4 ${showFilters ? 'block' : 'hidden md:block'}`}>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Buscar..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="mobile-input w-full pl-10 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 text-white"
                                    />
                                </div>

                                {/* Type Filter */}
                                <select
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                    className="mobile-input w-full bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 text-white"
                                >
                                    <option value="">Todos los tipos</option>
                                    <option value="INCOME">Ingresos</option>
                                    <option value="EXPENSE">Gastos</option>
                                </select>

                                {/* Category Filter */}
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="mobile-input w-full bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 text-white"
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
                                    className="mobile-input w-full bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 text-white"
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
                                    <label className="block text-slate-400 text-sm mb-2">Desde</label>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="mobile-input w-full bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-sm mb-2">Hasta</label>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="mobile-input w-full bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 text-white"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={clearFilters}
                                className="w-full md:w-auto px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all text-sm"
                            >
                                Limpiar Filtros
                            </button>
                        </div>
                    </div>


                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-3 mb-6">
                        {paginatedTransactions.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-slate-400">No hay transacciones</p>
                            </div>
                        ) : (
                            paginatedTransactions.map((transaction) => (
                                <SwipeableItem
                                    key={transaction.id}
                                    onEdit={() => openEditModal(transaction)}
                                    onDelete={() => openDeleteDialog(transaction.id)}
                                >
                                    <div className="glass-effect rounded-xl p-4">
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${transaction.type === 'INCOME' ? 'bg-green-600/20' : 'bg-red-600/20'}`}>
                                                    {transaction.type === 'INCOME' ? (
                                                        <ArrowUpRight className="w-5 h-5 text-green-400" />
                                                    ) : (
                                                        <ArrowDownRight className="w-5 h-5 text-red-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{transaction.category}</p>
                                                    <p className="text-slate-400 text-sm">{transaction.account?.name}</p>
                                                </div>
                                            </div>
                                            <p className={`text-lg font-bold ${transaction.type === 'INCOME' ? 'text-green-400' : 'text-red-400'}`}>
                                                {transaction.type === 'INCOME' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <Calendar className="w-4 h-4" />
                                                {format(new Date(transaction.date), "d 'de' MMMM, yyyy", { locale: es })}
                                            </div>
                                            <div className="flex gap-2 md:hidden">
                                                <button
                                                    onClick={() => openEditModal(transaction)}
                                                    className="touch-target bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteDialog(transaction.id)}
                                                    className="touch-target bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>

                                        {transaction.notes && (
                                            <p className="text-slate-400 text-sm mt-2 pt-2 border-t border-slate-700">
                                                {transaction.notes}
                                            </p>
                                        )}
                                    </div>
                                </SwipeableItem>
                            ))
                        )}
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block glass-effect rounded-xl overflow-hidden mb-6">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-800/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Fecha</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Categoría</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Cuenta</th>
                                        <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase">Notas</th>
                                        <th className="px-6 py-4 text-right text-xs font-medium text-slate-400 uppercase">Monto</th>
                                        <th className="px-6 py-4 text-right text-xs font-medium text-slate-400 uppercase">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {paginatedTransactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                                                No hay transacciones
                                            </td>
                                        </tr>
                                    ) : (
                                        paginatedTransactions.map((transaction) => (
                                            <tr key={transaction.id} className="hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                                    {format(new Date(transaction.date), "d 'de' MMM, yyyy", { locale: es })}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${transaction.type === 'INCOME' ? 'bg-green-600/20' : 'bg-red-600/20'
                                                            }`}>
                                                            {transaction.type === 'INCOME' ? (
                                                                <ArrowUpRight className="w-4 h-4 text-green-400" />
                                                            ) : (
                                                                <ArrowDownRight className="w-4 h-4 text-red-400" />
                                                            )}
                                                        </div>
                                                        <span className="text-white font-medium">{transaction.category}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                                    {transaction.account?.name}
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-400 max-w-xs truncate">
                                                    {transaction.notes || '-'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <span className={`text-lg font-bold ${transaction.type === 'INCOME' ? 'text-green-400' : 'text-red-400'
                                                        }`}>
                                                        {transaction.type === 'INCOME' ? '+' : '-'}${parseFloat(transaction.amount).toFixed(2)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => openEditModal(transaction)}
                                                            className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => openDeleteDialog(transaction.id)}
                                                            className="p-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg transition-all"
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
                            <div className="flex items-center justify-between">
                                <p className="text-slate-400 text-sm">
                                    Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} de {filteredTransactions.length}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="touch-target bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all"
                                    >
                                        <ChevronLeft className="w-5 h-5" />
                                    </button>
                                    <span className="px-4 py-2 text-white">
                                        {currentPage} / {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="touch-target bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all"
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
                </div>
            </PullToRefresh>
        </>
    )
}
