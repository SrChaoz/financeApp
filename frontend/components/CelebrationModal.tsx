'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, X, Sparkles } from 'lucide-react'
import { useEffect } from 'react'

interface CelebrationModalProps {
    isOpen: boolean
    onClose: () => void
    goalName: string
    goalAmount: string
}

export default function CelebrationModal({
    isOpen,
    onClose,
    goalName,
    goalAmount
}: CelebrationModalProps) {
    useEffect(() => {
        if (isOpen) {
            // Auto-close after 5 seconds
            const timer = setTimeout(() => {
                onClose()
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [isOpen, onClose])

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{
                                type: 'spring',
                                stiffness: 200,
                                damping: 20
                            }}
                            className="glass-effect rounded-3xl p-8 max-w-md w-full text-center pointer-events-auto relative overflow-hidden"
                        >
                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>

                            {/* Sparkles animation */}
                            <div className="absolute inset-0 pointer-events-none">
                                {[...Array(20)].map((_, i) => (
                                    <motion.div
                                        key={i}
                                        className="absolute"
                                        initial={{
                                            x: '50%',
                                            y: '50%',
                                            scale: 0,
                                            opacity: 1
                                        }}
                                        animate={{
                                            x: `${Math.random() * 100}%`,
                                            y: `${Math.random() * 100}%`,
                                            scale: [0, 1, 0],
                                            opacity: [1, 1, 0]
                                        }}
                                        transition={{
                                            duration: 2,
                                            delay: i * 0.1,
                                            repeat: Infinity,
                                            repeatDelay: 1
                                        }}
                                    >
                                        <Sparkles className="w-4 h-4 text-yellow-400" />
                                    </motion.div>
                                ))}
                            </div>

                            {/* Success icon */}
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{
                                    type: 'spring',
                                    stiffness: 200,
                                    damping: 15,
                                    delay: 0.2
                                }}
                                className="mb-6"
                            >
                                <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-r from-green-600 to-emerald-600 flex items-center justify-center">
                                    <CheckCircle2 className="w-12 h-12 text-white" />
                                </div>
                            </motion.div>

                            {/* Text content */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <h2 className="text-3xl font-bold text-white mb-2">
                                    ¡Meta Completada! 🎉
                                </h2>
                                <p className="text-slate-300 mb-4">
                                    Has alcanzado tu objetivo
                                </p>

                                <div className="glass-effect rounded-xl p-4 mb-6">
                                    <p className="text-sm text-slate-400 mb-1">Meta</p>
                                    <p className="text-xl font-bold text-white mb-3">{goalName}</p>
                                    <p className="text-sm text-slate-400 mb-1">Monto Alcanzado</p>
                                    <p className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                                        ${parseFloat(goalAmount).toFixed(2)}
                                    </p>
                                </div>

                                <p className="text-sm text-slate-400">
                                    ¡Felicidades por tu disciplina y constancia! 🌟
                                </p>
                            </motion.div>

                            {/* Button */}
                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                onClick={onClose}
                                className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-lg font-medium transition-all"
                            >
                                ¡Genial!
                            </motion.button>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    )
}
