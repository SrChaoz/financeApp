'use client'

// Bottom Sheet menu with SOLID backgrounds - Updated design
import { useRouter } from 'next/navigation'
import { PieChart, Target, Bell, ChevronRight } from 'lucide-react'
import BottomSheet from './BottomSheet'

interface MoreMenuProps {
    isOpen: boolean
    onClose: () => void
}

const menuItems = [
    {
        label: 'Presupuestos',
        href: '/budgets',
        icon: PieChart,
        color: 'text-white',
        bgGradient: 'bg-gradient-to-r from-purple-600 to-purple-700',
        description: 'Controla tus gastos mensuales'
    },
    {
        label: 'Metas',
        href: '/goals',
        icon: Target,
        color: 'text-white',
        bgGradient: 'bg-gradient-to-r from-blue-600 to-blue-700',
        description: 'Ahorra para tus objetivos'
    },
    {
        label: 'Recordatorios',
        href: '/reminders',
        icon: Bell,
        color: 'text-white',
        bgGradient: 'bg-gradient-to-r from-orange-600 to-orange-700',
        description: 'No olvides tus pagos'
    },
]

export default function MoreMenu({ isOpen, onClose }: MoreMenuProps) {
    const router = useRouter()

    const handleNavigation = (href: string) => {
        router.push(href)
        onClose()
    }

    return (
        <BottomSheet isOpen={isOpen} onClose={onClose} title="Más Opciones">
            <div className="space-y-4 pb-4">
                {menuItems.map((item) => {
                    const Icon = item.icon
                    return (
                        <button
                            key={item.href}
                            onClick={() => handleNavigation(item.href)}
                            className={`w-full flex items-center gap-4 p-5 ${item.bgGradient} rounded-2xl transition-all text-left shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]`}
                        >
                            <div className="w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                <Icon className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-white font-bold text-xl mb-1">{item.label}</h3>
                                <p className="text-white/80 text-sm font-medium">{item.description}</p>
                            </div>
                            <ChevronRight className="w-6 h-6 text-white/60" />
                        </button>
                    )
                })}
            </div>
        </BottomSheet>
    )
}
