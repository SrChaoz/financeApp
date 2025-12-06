'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import {
    Search,
    Filter,
    Plus,
    Edit2,
    Trash2,
    ArrowUpRight,
    ArrowDownRight,
    ChevronLeft,
    ChevronRight,
    Calendar
} from 'lucide-react'
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
        <PullToRefresh onRefresh={fetchData}>
            <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
