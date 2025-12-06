'use client'

import { motion } from 'framer-motion'

interface SkeletonCardProps {
    variant?: 'default' | 'transaction' | 'stat'
    count?: number
}

export default function SkeletonCard({ variant = 'default', count = 1 }: SkeletonCardProps) {
    const cards = Array.from({ length: count }, (_, i) => i)

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    }

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    }

    if (variant === 'transaction') {
        return (
            <motion.div
                className="space-y-3"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                {cards.map((i) => (
                    <motion.div
                        key={i}
                        variants={itemVariants}
                        className="glass-effect rounded-xl p-4 animate-pulse"
                    >
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3 flex-1">
                                <div className="w-10 h-10 rounded-lg bg-slate-700/50" />
                                <div className="flex-1">
                                    <div className="h-4 bg-slate-700/50 rounded w-32 mb-2" />
                                    <div className="h-3 bg-slate-700/30 rounded w-24" />
                                </div>
                            </div>
                            <div className="h-5 bg-slate-700/50 rounded w-20" />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 bg-slate-700/30 rounded w-28" />
                        </div>
                    </motion.div>
                ))}
            </motion.div>
        )
    }

    if (variant === 'stat') {
        return (
            <motion.div
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
                variants={containerVariants}
                initial="hidden"
                animate="show"
            >
                {cards.map((i) => (
                    <motion.div
                        key={i}
                        variants={itemVariants}
                        className="glass-effect rounded-2xl p-6 animate-pulse"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-lg bg-slate-700/50" />
                            <div className="w-5 h-5 rounded bg-slate-700/30" />
                        </div>
                        <div className="h-3 bg-slate-700/30 rounded w-20 mb-2" />
                        <div className="h-8 bg-slate-700/50 rounded w-32" />
                    </motion.div>
                ))}
            </motion.div>
        )
    }

    return (
        <motion.div
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="show"
        >
            {cards.map((i) => (
                <motion.div
                    key={i}
                    variants={itemVariants}
                    className="glass-effect rounded-xl p-6 animate-pulse"
                >
                    <div className="h-4 bg-slate-700/50 rounded w-3/4 mb-3" />
                    <div className="h-3 bg-slate-700/30 rounded w-1/2 mb-4" />
                    <div className="space-y-2">
                        <div className="h-3 bg-slate-700/30 rounded w-full" />
                        <div className="h-3 bg-slate-700/30 rounded w-5/6" />
                    </div>
                </motion.div>
            ))}
        </motion.div>
    )
}
