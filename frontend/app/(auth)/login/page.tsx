'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/api'
import { LogIn, Wallet, Eye, EyeOff, ArrowRight, UserPlus } from 'lucide-react'

export default function LoginPage() {
    const router = useRouter()
    const [isLogin, setIsLogin] = useState(true)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        // Validation for registration
        if (!isLogin) {
            if (password !== confirmPassword) {
                setError('Las contraseñas no coinciden')
                return
            }
            if (password.length < 6) {
                setError('La contraseña debe tener al menos 6 caracteres')
                return
            }
        }

        setLoading(true)

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
            const response = await api.post(endpoint, { username, password })

            if (response.data.token) {
                localStorage.setItem('token', response.data.token)
                localStorage.setItem('user', JSON.stringify(response.data.user))
                router.push('/dashboard')
            }
        } catch (err: any) {
            setError(err.response?.data?.error?.message || 'Error al procesar la solicitud')
        } finally {
            setLoading(false)
        }
    }

    const handleToggleMode = () => {
        setIsLogin(!isLogin)
        setError('')
        setPassword('')
        setConfirmPassword('')
        setShowPassword(false)
        setShowConfirmPassword(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-purple-600 mb-4 shadow-lg shadow-violet-600/50">
                        <Wallet className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">FinanzasPro</h1>
                    <p className="text-slate-400">
                        {isLogin ? 'Bienvenido de vuelta' : 'Crea tu cuenta gratis'}
                    </p>
                </div>

                {/* Login/Register Form */}
                <div className="glass-effect rounded-2xl p-8 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Usuario
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 text-white placeholder-slate-500 transition-all"
                                placeholder="Ingresa tu usuario"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 pr-12 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 text-white placeholder-slate-500 transition-all"
                                    placeholder="Ingresa tu contraseña"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {!isLogin && (
                                <p className="text-xs text-slate-500 mt-1">
                                    Mínimo 6 caracteres
                                </p>
                            )}
                        </div>

                        {!isLogin && (
                            <div className="animate-in slide-in-from-top">
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Confirmar Contraseña
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-3 pr-12 bg-slate-800/50 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 text-white placeholder-slate-500 transition-all"
                                        placeholder="Confirma tu contraseña"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                {confirmPassword && password !== confirmPassword && (
                                    <p className="text-xs text-red-400 mt-1">
                                        Las contraseñas no coinciden
                                    </p>
                                )}
                            </div>
                        )}

                        {error && (
                            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm animate-in slide-in-from-top">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 px-4 ${isLogin
                                    ? 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700'
                                    : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                                } text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2 focus:ring-offset-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg`}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? (
                                        <LogIn className="w-5 h-5" />
                                    ) : (
                                        <UserPlus className="w-5 h-5" />
                                    )}
                                    {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
                                </>
                            )}
                        </button>
                    </form>

                    {/* Toggle Link */}
                    <div className="mt-6 text-center">
                        <p className="text-slate-400 text-sm">
                            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                        </p>
                        <button
                            onClick={handleToggleMode}
                            className="mt-2 text-violet-400 hover:text-violet-300 font-medium text-sm inline-flex items-center gap-1 transition-colors group"
                        >
                            {isLogin ? 'Regístrate gratis' : 'Inicia sesión'}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-500 text-xs mt-6">
                    Al continuar, aceptas nuestros términos y condiciones
                </p>
            </div>
        </div>
    )
}
