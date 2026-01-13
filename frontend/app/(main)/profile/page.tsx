'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import Avatar from '@/components/Avatar'
import { useToast } from '@/components/ToastProvider'
import { User, Mail, Calendar, Save, ArrowLeft } from 'lucide-react'
import PullToRefresh from '@/components/PullToRefresh'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface UserProfile {
    id: string
    username: string
    email?: string | null
    firstName?: string | null
    lastName?: string | null
    gender?: string | null
    birthDate?: string | null
    createdAt: string
}

export default function ProfilePage() {
    const router = useRouter()
    const { showToast } = useToast()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [formData, setFormData] = useState({
        email: '',
        firstName: '',
        lastName: '',
        gender: '',
        birthDate: ''
    })

    useEffect(() => {
        fetchProfile()
    }, [])

    const fetchProfile = async () => {
        try {
            const response = await api.get('/api/user/profile')
            setProfile(response.data)
            setFormData({
                email: response.data.email || '',
                firstName: response.data.firstName || '',
                lastName: response.data.lastName || '',
                gender: response.data.gender || '',
                birthDate: response.data.birthDate ? response.data.birthDate.split('T')[0] : ''
            })
        } catch (error) {
            showToast('Error al cargar perfil', 'error')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)

        try {
            await api.put('/api/user/profile', {
                ...formData,
                birthDate: formData.birthDate || null
            })
            showToast('Perfil actualizado exitosamente', 'success')
            fetchProfile()
        } catch (error: any) {
            showToast(error.response?.data?.error?.message || 'Error al actualizar perfil', 'error')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    if (!profile) return null

    return (
        <PullToRefresh onRefresh={fetchProfile}>
            <div className="min-h-screen p-4 md:p-8 pb-20 md:pb-8">
                <div className="max-w-3xl mx-auto">
                    {/* Header */}
                    <div className="mb-6">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-4"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Volver
                        </button>
                        <h1 className="text-3xl font-bold text-white">Mi Perfil</h1>
                    </div>

                    {/* Avatar Section */}
                    <div className="glass-effect rounded-2xl p-6 md:p-8 mb-6">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <Avatar
                                firstName={profile.firstName}
                                lastName={profile.lastName}
                                username={profile.username}
                                size="xl"
                            />
                            <div className="text-center md:text-left">
                                <h2 className="text-2xl font-bold text-white mb-1">
                                    {profile.firstName && profile.lastName
                                        ? `${profile.firstName} ${profile.lastName}`
                                        : profile.username}
                                </h2>
                                <p className="text-slate-400">@{profile.username}</p>
                                <p className="text-sm text-slate-500 mt-2">
                                    Miembro desde {format(new Date(profile.createdAt), 'MMMM yyyy', { locale: es })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Profile Form */}
                    <div className="glass-effect rounded-2xl p-6 md:p-8">
                        <h3 className="text-xl font-bold text-white mb-6">Información Personal</h3>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        <User className="w-4 h-4 inline mr-2" />
                                        Nombre
                                    </label>
                                    <input
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="mobile-input w-full bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 text-white placeholder-slate-500"
                                        placeholder="Tu nombre"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        <User className="w-4 h-4 inline mr-2" />
                                        Apellido
                                    </label>
                                    <input
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="mobile-input w-full bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 text-white placeholder-slate-500"
                                        placeholder="Tu apellido"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    <Mail className="w-4 h-4 inline mr-2" />
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="mobile-input w-full bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 text-white placeholder-slate-500"
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
                                        className="mobile-input w-full bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 text-white"
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
                                        <Calendar className="w-4 h-4 inline mr-2" />
                                        Fecha de Nacimiento
                                    </label>
                                    <input
                                        type="date"
                                        name="birthDate"
                                        value={formData.birthDate}
                                        onChange={handleChange}
                                        className="mobile-input w-full bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 text-white"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full md:w-auto px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {saving ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Guardar Cambios
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </PullToRefresh>
    )
}
