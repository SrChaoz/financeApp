'use client'

import { useState, useRef, useEffect } from 'react'
import { useDrag } from '@use-gesture/react'
import { RefreshCw } from 'lucide-react'

interface PullToRefreshProps {
    onRefresh: () => Promise<void>
    children: React.ReactNode
}

export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
    const [pullDistance, setPullDistance] = useState(0)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const threshold = 80 // Distance to trigger refresh

    const bind = useDrag(
        ({ movement: [, my], last, cancel }) => {
            // Only allow pull down when at top of page
            if (containerRef.current && containerRef.current.scrollTop > 0) {
                cancel()
                return
            }

            // Only allow pulling down (positive movement)
            if (my < 0) {
                cancel()
                return
            }

            // Update pull distance with resistance
            const distance = Math.min(my * 0.5, threshold * 1.5)
            setPullDistance(distance)

            // Trigger refresh when released beyond threshold
            if (last && distance >= threshold) {
                handleRefresh()
            } else if (last) {
                setPullDistance(0)
            }
        },
        {
            axis: 'y',
            filterTaps: true,
            pointer: { touch: true }
        }
    )

    const handleRefresh = async () => {
        setIsRefreshing(true)
        try {
            await onRefresh()
        } finally {
            setTimeout(() => {
                setIsRefreshing(false)
                setPullDistance(0)
            }, 500)
        }
    }

    const rotation = (pullDistance / threshold) * 360
    const opacity = Math.min(pullDistance / threshold, 1)

    return (
        <div
            ref={containerRef}
            className="h-full overflow-y-auto"
            {...bind()}
            style={{ touchAction: 'pan-y' }}
        >
            {/* Pull indicator */}
            <div
                className="flex justify-center items-center transition-all duration-200"
                style={{
                    height: `${pullDistance}px`,
                    opacity: opacity
                }}
            >
                <div className="bg-zinc-800/80 backdrop-blur-sm rounded-full p-3 shadow-lg border border-zinc-700">
                    <RefreshCw
                        className={`w-6 h-6 text-primary ${isRefreshing ? 'animate-spin' : ''}`}
                        style={{
                            transform: isRefreshing ? 'none' : `rotate(${rotation}deg)`,
                            transition: isRefreshing ? 'none' : 'transform 0.2s'
                        }}
                    />
                </div>
            </div>

            {/* Content */}
            <div style={{ transform: `translateY(${isRefreshing ? '0px' : '0px'})` }}>
                {children}
            </div>
        </div>
    )
}
