'use client'

import { Drawer } from 'vaul'
import { X } from 'lucide-react'

interface BottomSheetProps {
    isOpen: boolean
    onClose: () => void
    title?: string
    children: React.ReactNode
    snapPoints?: number[]
}

export default function BottomSheet({
    isOpen,
    onClose,
    title,
    children,
    snapPoints = [1]
}: BottomSheetProps) {
    return (
        <Drawer.Root
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose()
            }}
            dismissible={true}
            shouldScaleBackground={false}
        >
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
                <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col bg-slate-900 rounded-t-3xl max-h-[95vh] outline-none">
                    {/* Handle bar */}
                    <div className="flex justify-center py-3">
                        <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
                    </div>

                    {/* Header */}
                    {title && (
                        <div className="flex items-center justify-between px-6 pb-4 border-b border-slate-800">
                            <Drawer.Title className="text-xl font-bold text-white">
                                {title}
                            </Drawer.Title>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto px-6 py-6">
                        {children}
                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    )
}
