'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface StaggerContainerProps {
    children: ReactNode
    staggerDelay?: number
    className?: string
}

export default function StaggerContainer({
    children,
    staggerDelay = 0.1,
    className = '',
}: StaggerContainerProps) {
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: staggerDelay,
            },
        },
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className={className}
        >
            {children}
        </motion.div>
    )
}

interface StaggerItemProps {
    children: ReactNode
    className?: string
}

export function StaggerItem({ children, className = '' }: StaggerItemProps) {
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                type: 'spring' as const,
                stiffness: 300,
                damping: 24,
            },
        },
    }

    return (
        <motion.div variants={itemVariants} className={className}>
            {children}
        </motion.div>
    )
}
