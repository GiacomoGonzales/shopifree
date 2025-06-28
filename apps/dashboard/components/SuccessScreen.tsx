'use client'

import { useEffect, useState } from 'react'
import { Button } from '@shopifree/ui'
import { useTranslations } from 'next-intl'

interface SuccessScreenProps {
  storeName: string
  onContinue: () => void
}

export default function SuccessScreen({ storeName, onContinue }: SuccessScreenProps) {
  const t = useTranslations('success')
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    // Auto redirect after 3 seconds
    const timer = setTimeout(() => {
      onContinue()
    }, 3000)

    // Hide confetti after 2 seconds
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false)
    }, 2000)

    return () => {
      clearTimeout(timer)
      clearTimeout(confettiTimer)
    }
  }, [onContinue])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-md w-full mx-4 text-center">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Success Icon */}
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <svg 
              className="w-10 h-10 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>

          {/* Success Message */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('title')} 🎉
          </h1>
          
          <p className="text-gray-600 mb-6">
            <span className="font-semibold text-gray-900">{storeName}</span> {t('subtitle')}
          </p>

          {/* Features Preview */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-3">{t('whatCanDo')}</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                {t('addProducts')}
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                {t('customizeDesign')}
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                {t('setupPayments')}
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-2">✓</span>
                {t('shareStore')}
              </li>
            </ul>
          </div>

          {/* Action Button */}
          <Button 
            onClick={onContinue}
            className="w-full py-3 text-lg bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            {t('goToDashboard')} 🚀
          </Button>

          <p className="text-xs text-gray-500 mt-4 flex items-center justify-center">
            <div className="animate-spin rounded-full h-3 w-3 border border-gray-400 border-t-transparent mr-2"></div>
            {t('redirecting')}
          </p>
        </div>
      </div>
    </div>
  )
} 