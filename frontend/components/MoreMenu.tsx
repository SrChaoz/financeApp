'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { PieChart, Target, Bell, X } from 'lucide-react'
import Link from 'next/link'

interface MoreMenuProps {
    isOpen: boolean
    onClose: () => void
}

const menuItems = [
    { label: 'Presupuestos', href: '/budgets', icon: PieChart, color: 'text-purple-400' },
    { label: 'Metas', href: '/goals', icon: Target, color: 'text-blue-400' },
    { label: 'Recordatorios', href: '/reminders', icon: Bell, color: 'text-orange-400' },
]

export default function MoreMenu({ isOpen, onClose }: MoreMenuProps) {
    const router = useRouter()

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    if (!isOpen) return null

    const handleNavigation = (href: string) => {
        router.push(href)
        onClose()
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
                onClick={onClose}
            />

            {/* Menu Panel */}
            <div className="fixed bottom-16 left-0 right-0 glass-effect border-t border-slate-800 z-50 md:hidden animate-in slide-in-from-bottom">
                <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-white">Más Opciones</h2>
                        <button
                            onClick={onClose}
                            className="touch-target bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                        {menuItems.map((item) => {
                            const Icon = item.icon
                            return (
                                <button
                                    key={item.href}
                                    onClick={() => handleNavigation(item.href)}
                                    className="flex items-center gap-4 p-4 glass-effect rounded-xl hover:bg-slate-800/50 transition-all text-left"
                                >
                                    <div className={`w-12 h-12 rounded-lg bg-slate-800/50 flex items-center justify-center ${item.color}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-medium">{item.label}</h3>
                                        <p className="text-slate-400 text-sm">
                                            {item.label === 'Presupuestos' && 'Controla tus gastos'}
                                            {item.label === 'Metas' && 'Ahorra para tus objetivos'}
                                            {item.label === 'Recordatorios' && 'No olvides tus pagos'}
                                        </p>
                                    </div>
                                </button>
                            )
                        })}
                    </div>
                </div>
            </div>
        </>
    )
}
