'use client'

import { TrendingUp, TrendingDown, Eye, EyeOff } from 'lucide-react'
import AnimatedNumber from './AnimatedNumber'

interface FinancialOverviewCardProps {
    balance: number
    totalIncome: number
    totalExpenses: number
    showBalance: boolean
    onToggleBalance: () => void
    greeting?: string
}

export default function FinancialOverviewCard({
    balance,
    totalIncome,
    totalExpenses,
    showBalance,
    onToggleBalance,
    greeting
}: FinancialOverviewCardProps) {
    // Extract emoji from greeting - simple approach
    const emojiRegex = /([\u263a-\u263f]|[\u2600-\u27BF]|[\uD83C-\uDBFF\uDC00-\uDFFF]+)/g
    const emojis = greeting?.match(emojiRegex)
    const greetingEmoji = emojis ? emojis[emojis.length - 1] : ''
    const greetingText = greeting?.replace(emojiRegex, '').trim() || ''

    return (
        <div className="card-premium p-6 bg-gradient-to-br from-zinc-900 to-zinc-950 relative overflow-hidden">
            {/* Subtle Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50" />

            <div className="relative z-10">
                {/* Header with Greeting */}
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Balance Total</p>
                        {greeting && (
                            <div className="flex items-center gap-2 mt-2">
                                {greetingEmoji && <span className="text-2xl">{greetingEmoji}</span>}
                                <p className="text-sm text-zinc-400">{greetingText}</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={onToggleBalance}
                        className="w-9 h-9 rounded-xl bg-zinc-900/50 hover:bg-zinc-800 flex items-center justify-center transition-all active:scale-95"
                    >
                        {showBalance ? (
                            <Eye className="w-4 h-4 text-zinc-400" />
                        ) : (
                            <EyeOff className="w-4 h-4 text-zinc-400" />
                        )}
                    </button>
                </div>

                {/* Main Balance */}
                <div className="mb-6">
                    {showBalance ? (
                        <h2 className="text-5xl font-bold text-white">
                            <AnimatedNumber value={balance} prefix="$" />
                        </h2>
                    ) : (
                        <h2 className="text-5xl font-bold text-white">••••••</h2>
                    )}
                </div>

                {/* Income & Expenses Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Income */}
                    <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                            </div>
                            <span className="text-xs text-zinc-500 font-semibold">Ingresos</span>
                        </div>
                        <p className="text-xl font-bold text-emerald-500">
                            ${totalIncome.toFixed(2)}
                        </p>
                    </div>

                    {/* Expenses */}
                    <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/10">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-6 h-6 rounded-lg bg-rose-500/20 flex items-center justify-center">
                                <TrendingDown className="w-3.5 h-3.5 text-rose-500" />
                            </div>
                            <span className="text-xs text-zinc-500 font-semibold">Gastos</span>
                        </div>
                        <p className="text-xl font-bold text-rose-500">
                            ${totalExpenses.toFixed(2)}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
