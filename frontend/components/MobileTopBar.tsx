'use client'

import { Wallet, Settings } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function MobileTopBar() {
    const router = useRouter()

    return (
        <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-800 mb-8">
            <div className="flex items-center justify-between px-4 py-3">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-glow-primary overflow-hidden bg-black">
                        <Image src="/logo.png" alt="Logo" width={36} height={36} className="object-cover w-full h-full" />
                    </div>
                    <span className="text-lg font-bold text-white tracking-tight">VixFinanzas</span>
                </div>

                {/* Settings Button */}
                <button
                    onClick={() => router.push('/profile')}
                    className="w-9 h-9 rounded-xl bg-zinc-900 hover:bg-zinc-800 flex items-center justify-center transition-all active:scale-95"
                >
                    <Settings className="w-5 h-5 text-zinc-400" />
                </button>
            </div>
        </div>
    )
}
