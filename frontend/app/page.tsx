'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
    const router = useRouter()

    useEffect(() => {
        // Check if user is already logged in
        const token = localStorage.getItem('token')
        if (token) {
            router.replace('/dashboard')
        } else {
            router.replace('/login')
        }
    }, [router])

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-slate-400">Redirigiendo...</p>
            </div>
        </div>
    )
}
