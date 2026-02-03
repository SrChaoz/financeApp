'use client'

import { useState } from 'react'
import { useToast } from './ToastProvider'
import { UserPlus, Sparkles, X } from 'lucide-react'
import api from '@/lib/api'

interface WelcomeWizardProps {
    isOpen: boolean
    onComplete: () => void
}

export default function WelcomeWizard({ isOpen, onComplete }: WelcomeWizardProps) {
    const { showToast } = useToast()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        gender: '',
        birthDate: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSkip = async () => {
        try {
            await api.post('/api/user/profile/complete')
            showToast('¡Bienvenido a VixFinanzas!', 'success')
            onComplete()
        } catch (error) {
            console.error('Error skipping wizard:', error)
            onComplete() // Continue anyway
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Update profile with provided data
            await api.put('/api/user/profile', {
                ...formData,
                birthDate: formData.birthDate || null
            })

            // Mark profile as completed
            await api.post('/api/user/profile/complete')

            showToast('¡Perfil completado exitosamente!', 'success')
            onComplete()
        } catch (error: any) {
            showToast(error.response?.data?.error?.message || 'Error al guardar perfil', 'error')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <div className="min-h-screen flex items-start justify-center p-4 py-8">
                <div className="w-full max-w-md bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 my-auto">
                    {/* Header with close button */}
                    <div className="relative p-6 border-b border-slate-800">
                        <button
                            onClick={handleSkip}
                            className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-lg transition-colors"
                            aria-label="Cerrar"
                        >
                            <X className="w-6 h-6 text-slate-300" />
                        </button>

                        <div className="text-center pr-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-primary mb-3">
                                <Sparkles className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">
                                ¡Bienvenido a VixFinanzas!
                            </h2>
                            <p className="text-slate-400 text-sm">
                                Completa tu perfil para una experiencia personalizada
                            </p>
                        </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Nombre
                                </label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-zinc-600"
                                    placeholder="Tu nombre"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Apellido
                                </label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-zinc-600"
                                    placeholder="Tu apellido"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-white placeholder-zinc-600"
                                placeholder="tu@email.com"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Género
                                </label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-white"
                                >
                                    <option value="">Seleccionar...</option>
                                    <option value="Masculino">Masculino</option>
                                    <option value="Femenino">Femenino</option>
                                    <option value="Otro">Otro</option>
                                    <option value="Prefiero no decir">Prefiero no decir</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Fecha de Nacimiento
                                </label>
                                <input
                                    type="date"
                                    name="birthDate"
                                    value={formData.birthDate}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-white"
                                />
                            </div>
                        </div>

                        <p className="text-xs text-slate-500 text-center py-2">
                            Todos los campos son opcionales. Puedes completarlos después desde tu perfil.
                        </p>

                        <div className="flex flex-col gap-3 pt-2">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full px-4 py-3 bg-gradient-primary hover:shadow-glow-primary text-white rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 font-semibold shadow-lg active:scale-[0.98]"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <UserPlus className="w-5 h-5" />
                                        Completar Perfil
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={handleSkip}
                                className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all font-medium"
                            >
                                Omitir por ahora
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
