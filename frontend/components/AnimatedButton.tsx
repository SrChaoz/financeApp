'use client'

import { motion } from 'framer-motion'
import { ButtonHTMLAttributes, ReactNode } from 'react'

interface AnimatedButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode
    variant?: 'primary' | 'secondary' | 'danger'
    isLoading?: boolean
}

export default function AnimatedButton({
    children,
    variant = 'primary',
    isLoading = false,
    className = '',
    disabled,
    ...props
}: AnimatedButtonProps) {
    const baseClasses = 'relative overflow-hidden transition-all duration-200 px-4 py-2 rounded-lg font-medium'

    const variantClasses = {
        primary: 'bg-violet-600 hover:bg-violet-700 text-white',
        secondary: 'bg-slate-700 hover:bg-slate-600 text-white',
        danger: 'bg-red-600 hover:bg-red-700 text-white',
    }

    return (
        <motion.div
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: 'spring' as const, stiffness: 400, damping: 17 }}
            className="inline-block"
        >
            <button
                className={`${baseClasses} ${variantClasses[variant]} ${className}`}
                disabled={disabled || isLoading}
                {...props}
            >
                {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                        <motion.span
                            className="w-4 h-4 border-2 border-white border-t-transparent rounded-full inline-block"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        />
                        Cargando...
                    </span>
                ) : (
                    children
                )}
            </button>
        </motion.div>
    )
}
