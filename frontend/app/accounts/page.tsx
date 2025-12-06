'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { Plus, Wallet, Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react'
import AccountModal from '@/components/AccountModal'
import ConfirmDialog from '@/components/ConfirmDialog'
import PullToRefresh from '@/components/PullToRefresh'

interface Account {
    id: string
    name: string
    type: string
    createdAt: string
    _count?: {
        transactions: number
    }
}

interface AccountWithBalance extends Account {
    balance: number
    income: number
    expenses: number
}

export default function AccountsPage() {
    const router = useRouter()
    const [accounts, setAccounts] = useState<AccountWithBalance[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
    const [accountToDelete, setAccountToDelete] = useState<Account | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/login')
            return
        }
        fetchAccounts()
    }, [])

    const fetchAccounts = async () => {
        try {
            setLoading(true)
            const [accountsRes, transactionsRes] = await Promise.all([
                api.get('/api/accounts'),
                api.get('/api/transactions')
            ])

            const accountsData = accountsRes.data.accounts
            const transactions = transactionsRes.data.transactions

            // Calculate balance for each account
            const accountsWithBalance = accountsData.map((account: Account) => {
                const accountTransactions = transactions.filter(
                    (t: any) => t.accountId === account.id
                )

                const income = accountTransactions
                    .filter((t: any) => t.type === 'INCOME')
                    .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0)

                const expenses = accountTransactions
                    .filter((t: any) => t.type === 'EXPENSE')
                    .reduce((sum: number, t: any) => sum + parseFloat(t.amount), 0)

                return {
                    ...account,
                    balance: income - expenses,
                    income,
                    expenses
                }
            })

            setAccounts(accountsWithBalance)
        } catch (error) {
            console.error('Error fetching accounts:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleEdit = (account: Account) => {
        setSelectedAccount(account)
        setShowModal(true)
    }

    const handleDelete = (account: Account) => {
        setAccountToDelete(account)
        setShowDeleteDialog(true)
    }

    const confirmDelete = async () => {
        if (!accountToDelete) return

        setDeleteLoading(true)
        try {
            await api.delete(`/api/accounts/${accountToDelete.id}`)
            await fetchAccounts()
            setShowDeleteDialog(false)
            setAccountToDelete(null)
        } catch (error: any) {
            console.error('Error deleting account:', error)
            alert(error.response?.data?.error?.message || 'Error al eliminar la cuenta')
        } finally {
            setDeleteLoading(false)
        }
    }

    const handleModalClose = () => {
        setShowModal(false)
        setSelectedAccount(null)
    }

    const handleModalSuccess = () => {
        fetchAccounts()
    }

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0)
    const totalIncome = accounts.reduce((sum, acc) => sum + acc.income, 0)
    const totalExpenses = accounts.reduce((sum, acc) => sum + acc.expenses, 0)

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <PullToRefresh onRefresh={fetchAccounts}>
            <div className="container mx-auto px-4 py-6 md:py-8 max-w-7xl">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Cuentas</h1>
                        <p className="text-slate-400 text-sm md:text-base">Gestiona tus cuentas bancarias y carteras</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-3 touch-target bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-all font-medium shadow-lg shadow-violet-500/30"
                    >
                        <Plus className="w-5 h-5" />
                        <span className="hidden sm:inline">Nueva Cuenta</span>
                    </button>
                </div>

                {/* Summary */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
                    <div className="glass-effect rounded-xl p-4 md:p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-violet-600/20 flex items-center justify-center">
                                <Wallet className="w-5 h-5 text-violet-400" />
                            </div>
                            <h3 className="text-slate-400 text-sm font-medium">Balance Total</h3>
                        </div>
                        <p className="text-3xl font-bold text-white">${totalBalance.toFixed(2)}</p>
                    </div>

                    <div className="glass-effect rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-green-600/20 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-green-400" />
                            </div>
                            <h3 className="text-slate-400 text-sm font-medium">Total Ingresos</h3>
                        </div>
                        <p className="text-3xl font-bold text-white">${totalIncome.toFixed(2)}</p>
                    </div>

                    <div className="glass-effect rounded-2xl p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-red-600/20 flex items-center justify-center">
                                <TrendingDown className="w-5 h-5 text-red-400" />
                            </div>
                            <h3 className="text-slate-400 text-sm font-medium">Total Gastos</h3>
                        </div>
                        <p className="text-3xl font-bold text-white">${totalExpenses.toFixed(2)}</p>
                    </div>
                </div>

                {/* Accounts List */}
                {accounts.length === 0 ? (
                    <div className="glass-effect rounded-2xl p-12 text-center">
                        <div className="w-16 h-16 rounded-full bg-violet-600/20 flex items-center justify-center mx-auto mb-4">
                            <Wallet className="w-8 h-8 text-violet-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No hay cuentas aún</h3>
                        <p className="text-slate-400 mb-6">Crea tu primera cuenta para empezar a gestionar tus finanzas</p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg transition-all"
                        >
                            Crear Primera Cuenta
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                        {accounts.map((account) => (
                            <div
                                key={account.id}
                                className="glass-effect rounded-xl p-4 md:p-6 hover:bg-slate-800/50 transition-all group"
                            >
                                {/* Account Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-lg bg-violet-600/20 flex items-center justify-center">
                                            <Wallet className="w-6 h-6 text-violet-400" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">{account.name}</h3>
                                            <p className="text-sm text-slate-400">{account.type}</p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleEdit(account)}
                                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors touch-target"
                                            title="Editar"
                                        >
                                            <Edit2 className="w-4 h-4 text-slate-400 hover:text-white" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(account)}
                                            className="p-2 hover:bg-slate-700 rounded-lg transition-colors touch-target"
                                            title="Eliminar"
                                        >
                                            <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-400" />
                                        </button>
                                    </div>
                                </div>

                                {/* Balance */}
                                <div className="mb-4">
                                    <p className="text-sm text-slate-400 mb-1">Balance</p>
                                    <p className={`text-2xl font-bold ${account.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        ${account.balance.toFixed(2)}
                                    </p>
                                </div>

                                {/* Stats */}
                                <div className="flex justify-between text-sm pt-4 border-t border-slate-700">
                                    <div>
                                        <p className="text-slate-400">Ingresos</p>
                                        <p className="text-green-400 font-medium">${account.income.toFixed(2)}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-slate-400">Gastos</p>
                                        <p className="text-red-400 font-medium">${account.expenses.toFixed(2)}</p>
                                    </div>
                                </div>

                                {/* Transaction Count */}
                                {account._count && (
                                    <div className="mt-3 text-xs text-slate-500">
                                        {account._count.transactions} transacción(es)
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Modals */}
                <AccountModal
                    isOpen={showModal}
                    onClose={handleModalClose}
                    onSuccess={handleModalSuccess}
                    account={selectedAccount}
                />

                <ConfirmDialog
                    isOpen={showDeleteDialog}
                    onClose={() => {
                        setShowDeleteDialog(false)
                        setAccountToDelete(null)
                    }}
                    onConfirm={confirmDelete}
                    title="Eliminar Cuenta"
                    message={`¿Estás seguro de que deseas eliminar la cuenta "${accountToDelete?.name}"? Esta acción también eliminará todas las transacciones asociadas.`}
                    confirmText="Eliminar"
                    loading={deleteLoading}
                />
            </div>
        </PullToRefresh>
    )
}
