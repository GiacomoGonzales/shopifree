'use client'

import { useState } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import { Button, Input } from '@shopifree/ui'

export default function OTPPage() {
  const t = useTranslations('auth.otp')
  const locale = useLocale()
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'phone' | 'code'>('phone')
  const [loading, setLoading] = useState(false)

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // TODO: Implement OTP sending logic
    setTimeout(() => {
      setStep('code')
      setLoading(false)
    }, 1000)
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // TODO: Implement OTP verification logic
    setTimeout(() => {
      alert('OTP functionality will be implemented in a future version')
      setLoading(false)
    }, 1000)
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
          {step === 'phone' ? (
            <form className="space-y-6" onSubmit={handleSendCode}>
              <Input
                label={t('phone')}
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                required
              />

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !phone}
              >
                {loading ? 'Enviando...' : t('sendCode')}
              </Button>
            </form>
          ) : (
            <form className="space-y-6" onSubmit={handleVerifyCode}>
              <div className="text-center mb-4">
                <p className="text-sm text-gray-600">
                  Código enviado a: <span className="font-medium">{phone}</span>
                </p>
              </div>

              <Input
                label={t('code')}
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="000000"
                required
              />

              <Button
                type="submit"
                className="w-full"
                disabled={loading || code.length !== 6}
              >
                {loading ? 'Verificando...' : t('verifyCode')}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-sm text-indigo-600 hover:text-indigo-500"
                >
                  {t('resendCode')}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              <Link href={`/${locale}/login`} className="font-medium text-indigo-600 hover:text-indigo-500">
                {t('backToLogin')}
              </Link>
            </p>
          </div>

          {/* Coming Soon Notice */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Funcionalidad en desarrollo
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>La autenticación por OTP estará disponible en una próxima versión.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 