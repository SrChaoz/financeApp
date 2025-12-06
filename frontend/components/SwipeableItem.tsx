'use client'

import { useRef, useState } from 'react'
import { useDrag } from '@use-gesture/react'
import { Trash2, Edit2 } from 'lucide-react'

interface SwipeableItemProps {
    children: React.ReactNode
    onEdit?: () => void
    onDelete?: () => void
    editColor?: string
    deleteColor?: string
    disabled?: boolean
}

export default function SwipeableItem({
    children,
    onEdit,
    onDelete,
    editColor = 'bg-blue-600',
    deleteColor = 'bg-red-600',
    disabled = false
}: SwipeableItemProps) {
    const [offsetX, setOffsetX] = useState(0)
    const [isRevealed, setIsRevealed] = useState(false)
    const threshold = 80 // Distance to trigger action
    const maxSwipe = 120 // Maximum swipe distance

    const bind = useDrag(
        ({ movement: [mx], last, cancel, velocity: [vx] }) => {
            // Disable on desktop or if disabled prop is true
            if (disabled || window.innerWidth >= 768) {
                cancel()
                return
            }

            // Limit swipe distance
            const newOffset = Math.max(-maxSwipe, Math.min(maxSwipe, mx))
            setOffsetX(newOffset)

            // On release
            if (last) {
                const absOffset = Math.abs(newOffset)
                const fastSwipe = Math.abs(vx) > 0.5

                // Trigger action if threshold met or fast swipe
                if (absOffset >= threshold || fastSwipe) {
                    if (newOffset < 0 && onDelete) {
                        // Swipe left - Delete
                        setOffsetX(-maxSwipe)
                        setIsRevealed(true)
                        setTimeout(() => {
                            onDelete()
                            setOffsetX(0)
                            setIsRevealed(false)
                        }, 300)
                    } else if (newOffset > 0 && onEdit) {
                        // Swipe right - Edit
                        setOffsetX(maxSwipe)
                        setIsRevealed(true)
                        setTimeout(() => {
                            onEdit()
                            setOffsetX(0)
                            setIsRevealed(false)
                        }, 300)
                    } else {
                        // Reset if no action
                        setOffsetX(0)
                        setIsRevealed(false)
                    }
                } else {
                    // Reset if threshold not met
                    setOffsetX(0)
                    setIsRevealed(false)
                }
            }
        },
        {
            axis: 'x',
            filterTaps: true,
            pointer: { touch: true }
        }
    )

    const opacity = Math.min(Math.abs(offsetX) / threshold, 1)

    return (
        <div className="relative overflow-hidden rounded-xl">
            {/* Background Actions */}
            <div className="absolute inset-0 flex items-center justify-between">
                {/* Edit (Right swipe) */}
                {onEdit && (
                    <div
                        className={`${editColor} h-full flex items-center justify-start pl-6 transition-opacity`}
                        style={{ opacity: offsetX > 0 ? opacity : 0 }}
                    >
                        <Edit2 className="w-6 h-6 text-white" />
                    </div>
                )}

                {/* Delete (Left swipe) */}
                {onDelete && (
                    <div
                        className={`${deleteColor} h-full flex items-center justify-end pr-6 transition-opacity ml-auto`}
                        style={{ opacity: offsetX < 0 ? opacity : 0 }}
                    >
                        <Trash2 className="w-6 h-6 text-white" />
                    </div>
                )}
            </div>

            {/* Swipeable Content */}
            <div
                {...bind()}
                style={{
                    transform: `translateX(${offsetX}px)`,
                    transition: isRevealed ? 'transform 0.3s ease-out' : 'none',
                    touchAction: 'pan-y'
                }}
                className="relative bg-slate-900"
            >
                {children}
            </div>
        </div>
    )
}
