'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { signInWithEmail, signInWithGoogle } from '../../../lib/auth'
import { useAuth } from '../../../lib/simple-auth-context'

export default function LoginPage({ params: { locale } }: { params: { locale: string } }) {
  const router = useRouter()
  const t = useTranslations('auth.login')
  const tErrors = useTranslations('auth.errors')
  const tLoading = useTranslations('loading')
  const { isAuthenticated, loading: authLoading } = useAuth()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace(`/${locale}`)
    }
  }, [isAuthenticated, authLoading, router, locale])

  const getErrorMessage = (authError: string) => {
    if (authError.includes('usuario no encontrado') || authError.includes('user-not-found')) {
      return tErrors('userNotFound')
    }
    if (authError.includes('contraseña incorrecta') || authError.includes('wrong-password')) {
      return tErrors('wrongPassword')
    }
    if (authError.includes('email inválido') || authError.includes('invalid-email')) {
      return tErrors('invalidEmail')
    }
    if (authError.includes('demasiados intentos') || authError.includes('too-many-requests')) {
      return tErrors('tooManyRequests')
    }
    if (authError.includes('Firebase no está disponible') || authError.includes('firebase unavailable')) {
      return tErrors('firebaseUnavailable')
    }
    if (authError.includes('popup bloqueado') || authError.includes('popup-blocked')) {
      return tErrors('popupBlocked')
    }
    if (authError.includes('proceso cancelado') || authError.includes('popup-closed')) {
      return tErrors('popupClosed')
    }
    return tErrors('general')
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { user, error: authError } = await signInWithEmail(email, password)
    
    if (user) {
      router.replace(`/${locale}`)
    } else {
      setError(getErrorMessage(authError || ''))
    }
    
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')

    const { user, error: authError } = await signInWithGoogle()
    
    if (user) {
      router.replace(`/${locale}`)
    } else {
      setError(getErrorMessage(authError || ''))
    }
    
    setLoading(false)
  }

  // Show loading if auth is still initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto"></div>
          <p className="mt-2 text-gray-600">{tLoading('general')}</p>
        </div>
      </div>
    )
  }

  // Don't render if authenticated (will redirect)
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto"></div>
          <p className="mt-2 text-gray-600">Accediendo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center py-12 px-4">
      <div className="w-full max-w-sm mx-auto">
        {/* Logo/Brand */}
        <div className="mb-12">
          <img 
            src="/logo-primary.png" 
            alt="Shopifree" 
            className="h-10"
          />
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {t('title')}
          </h2>
          <p className="text-gray-600">
            {t('subtitle')}
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form className="space-y-4 mb-6" onSubmit={handleEmailLogin}>
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              {t('email')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              {t('password')}
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-black text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? t('loading') : t('loginButton')}
          </button>
        </form>

        {/* Google Button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full border border-gray-300 hover:border-gray-400 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                        {/* Colores oficiales del logo de Google - mantener sin cambios para la marca */}
                            <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          {t('googleButton')}
        </button>

        {/* Footer Links */}
        <div className="text-center mt-8">
          <p>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">
              {t('forgotPassword')}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
} 