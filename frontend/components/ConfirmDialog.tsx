'use client'

import { AlertTriangle } from 'lucide-react'
import Modal from './Modal'

interface ConfirmDialogProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => void
    title: string
    message: string
    confirmText?: string
    loading?: boolean
}

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    loading = false
}: ConfirmDialogProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="space-y-4">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center flex-shrink-0 border border-rose-500/20">
                        <AlertTriangle className="w-6 h-6 text-rose-500" />
                    </div>
                    <p className="text-zinc-300 pt-2 text-sm leading-relaxed">{message}</p>
                </div>

                <div className="flex gap-3 pt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors font-medium"
                        disabled={loading}
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className="flex-1 px-4 py-3 bg-rose-600 hover:bg-rose-700 hover:shadow-lg hover:shadow-rose-600/20 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                        ) : (
                            confirmText
                        )}
                    </button>
                </div>
            </div>
        </Modal>
    )
}
