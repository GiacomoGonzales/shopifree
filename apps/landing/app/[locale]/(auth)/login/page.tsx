'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import { Button, Input } from '@shopifree/ui'
import { signInWithEmail, signInWithGoogle } from '../../../../lib/auth'
import { getDashboardUrl } from '../../../../lib/config'

export default function LoginPage() {
  const t = useTranslations('auth.login')
  const locale = useLocale()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { user, error: authError } = await signInWithEmail(email, password)
    
    if (user) {
      // Redirect to dashboard with login parameter
      window.location.href = getDashboardUrl('?from_login=true')
    } else {
      setError(authError || 'Error al iniciar sesión')
    }
    
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError('')

    const { user, error: authError } = await signInWithGoogle()
    
    if (user) {
      // Redirect to dashboard with login parameter
      window.location.href = getDashboardUrl('?from_login=true')
    } else {
      setError(authError || 'Error al iniciar sesión con Google')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href={`/${locale}`} className="flex justify-center">
          <h1 className="text-3xl font-bold text-gray-900">Shopifree</h1>
        </Link>
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
            />

            <Input
              label={t('password')}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Cargando...' : t('loginButton')}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">O continúa con</span>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <Button
                variant="secondary"
                className="w-full"
                onClick={handleGoogleLogin}
                disabled={loading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {t('googleLogin')}
              </Button>

                             <Link href={`/${locale}/otp`}>
                 <Button variant="secondary" className="w-full">
                   {t('otpLogin')}
                 </Button>
               </Link>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('noAccount')}{' '}
              <Link href={`/${locale}/register`} className="font-medium text-indigo-600 hover:text-indigo-500">
                {t('signUp')}
              </Link>
            </p>
            <p className="mt-2">
              <Link href="#" className="text-sm text-indigo-600 hover:text-indigo-500">
                {t('forgotPassword')}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 