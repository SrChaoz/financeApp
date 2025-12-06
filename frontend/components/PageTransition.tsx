'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { ReactNode } from 'react'

interface PageTransitionProps {
    children: ReactNode
}

const pageVariants = {
    initial: {
        opacity: 0,
        x: -20,
    },
    enter: {
        opacity: 1,
        x: 0,
    },
    exit: {
        opacity: 0,
        x: 20,
    },
}

const pageTransition = {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
}

export default function PageTransition({ children }: PageTransitionProps) {
    const pathname = usePathname()

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={pathname}
                initial="initial"
                animate="enter"
                exit="exit"
                variants={pageVariants}
                transition={pageTransition}
                className="w-full"
            >
                {children}
            </motion.div>
        </AnimatePresence>
    )
}
