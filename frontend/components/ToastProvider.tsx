'use client'

import { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, XCircle, AlertCircle, Info, X } from 'lucide-react'

type ToastType = 'success' | 'error' | 'warning' | 'info'

interface Toast {
    id: string
    type: ToastType
    message: string
}

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([])

    const showToast = useCallback((message: string, type: ToastType = 'info') => {
        const id = Math.random().toString(36).substring(7)
        const newToast = { id, type, message }

        setToasts((prev) => [...prev, newToast])

        // Auto remove after 4 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id))
        }, 4000)
    }, [])

    const removeToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }

    const getIcon = (type: ToastType) => {
        switch (type) {
            case 'success':
                return <CheckCircle2 className="w-5 h-5 text-green-400" />
            case 'error':
                return <XCircle className="w-5 h-5 text-red-400" />
            case 'warning':
                return <AlertCircle className="w-5 h-5 text-yellow-400" />
            case 'info':
                return <Info className="w-5 h-5 text-blue-400" />
        }
    }

    const getStyles = (type: ToastType) => {
        switch (type) {
            case 'success':
                return 'bg-green-500/10 border-green-500/50'
            case 'error':
                return 'bg-red-500/10 border-red-500/50'
            case 'warning':
                return 'bg-yellow-500/10 border-yellow-500/50'
            case 'info':
                return 'bg-blue-500/10 border-blue-500/50'
        }
    }

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}

            {/* Toast Container */}
            <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`${getStyles(toast.type)} border rounded-lg p-4 shadow-lg backdrop-blur-sm animate-in slide-in-from-right duration-300`}
                    >
                        <div className="flex items-start gap-3">
                            {getIcon(toast.type)}
                            <p className="text-white text-sm flex-1">{toast.message}</p>
                            <button
                                onClick={() => removeToast(toast.id)}
                                className="text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    )
}

export function useToast() {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within ToastProvider')
    }
    return context
}
