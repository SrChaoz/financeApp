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
                router.replace('/dashboard')
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
            <div className="w-full max-w-md animate-fade-in">
                {/* Logo & Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-primary mb-6 shadow-glow-primary transform transition-transform hover:scale-105">
                        <Wallet className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">FinanzasPro</h1>
                    <p className="text-muted text-lg">
                        {isLogin ? 'Bienvenido de vuelta' : 'Crea tu cuenta gratis'}
                    </p>
                </div>

                {/* Login/Register Form */}
                <div className="card-premium p-8 backdrop-blur-xl">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-zinc-300">
                                Usuario
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-white placeholder-zinc-600 transition-all duration-200"
                                placeholder="Ingresa tu usuario"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-zinc-300">
                                Contraseña
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-4 py-3 pr-12 bg-zinc-950/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-white placeholder-zinc-600 transition-all duration-200"
                                    placeholder="Ingresa tu contraseña"
                                    required
                                    minLength={6}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors p-1"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {!isLogin && (
                                <p className="text-xs text-muted flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-zinc-600" />
                                    Mínimo 6 caracteres
                                </p>
                            )}
                        </div>

                        {!isLogin && (
                            <div className="space-y-1.5 animate-slide-up">
                                <label className="block text-sm font-medium text-zinc-300">
                                    Confirmar Contraseña
                                </label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-4 py-3 pr-12 bg-zinc-950/50 border border-zinc-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-white placeholder-zinc-600 transition-all duration-200"
                                        placeholder="Confirma tu contraseña"
                                        required
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors p-1"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                {confirmPassword && password !== confirmPassword && (
                                    <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                        Las contraseñas no coinciden
                                    </p>
                                )}
                            </div>
                        )}

                        {error && (
                            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm animate-fade-in flex items-start gap-3">
                                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3.5 px-4 ${isLogin
                                ? 'bg-gradient-primary hover:shadow-glow-primary'
                                : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-glow-income'
                                } text-white font-semibold rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transform`}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                    <div className="mt-8 text-center pt-6 border-t border-zinc-800">
                        <p className="text-muted text-sm mb-3">
                            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
                        </p>
                        <button
                            onClick={handleToggleMode}
                            className="text-primary hover:text-indigo-400 font-semibold text-sm inline-flex items-center gap-1 transition-colors group p-2 hover:bg-primary/5 rounded-lg"
                        >
                            {isLogin ? 'Regístrate gratis' : 'Inicia sesión'}
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8 space-y-2">
                    <p className="text-zinc-600 text-xs">
                        Al continuar, aceptas nuestros <span className="hover:text-zinc-400 cursor-pointer transition-colors">términos y condiciones</span>
                    </p>
                </div>
            </div>
        </div>
    )
}
