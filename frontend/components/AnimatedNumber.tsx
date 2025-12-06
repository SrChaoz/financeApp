'use client'

import { motion, useSpring, useTransform } from 'framer-motion'
import { useEffect } from 'react'

interface AnimatedNumberProps {
    value: number
    decimals?: number
    prefix?: string
    suffix?: string
    className?: string
    duration?: number
}

export default function AnimatedNumber({
    value,
    decimals = 2,
    prefix = '',
    suffix = '',
    className = '',
    duration = 1,
}: AnimatedNumberProps) {
    const spring = useSpring(0, {
        stiffness: 100,
        damping: 30,
        duration: duration * 1000,
    })

    const display = useTransform(spring, (current) =>
        `${prefix}${current.toFixed(decimals)}${suffix}`
    )

    useEffect(() => {
        spring.set(value)
    }, [spring, value])

    return <motion.span className={className}>{display}</motion.span>
}
