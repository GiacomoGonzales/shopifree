'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button, Input } from '@shopifree/ui'
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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <h1 className="text-3xl font-bold text-gray-900">Shopifree</h1>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {t('title')}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {t('subtitle')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleEmailLogin}>
            <Input
              label={t('email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />

            <Input
              label={t('password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />

            <Button
              type="submit"
              className="w-full bg-black hover:bg-gray-800 text-white focus:ring-gray-600"
              disabled={loading}
            >
              {loading ? t('loading') : t('loginButton')}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">{t('or')}</span>
              </div>
            </div>

            <div className="mt-6">
              <Button
                variant="secondary"
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 focus:ring-gray-500"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {t('googleButton')}
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('noAccount')}{' '}
              <a 
                href={`/${locale}/register`}
                className="font-medium text-gray-800 hover:text-gray-900"
              >
                {t('register')}
              </a>
            </p>
            <p className="mt-2">
              <a href="#" className="text-sm text-gray-800 hover:text-gray-900">
                {t('forgotPassword')}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 