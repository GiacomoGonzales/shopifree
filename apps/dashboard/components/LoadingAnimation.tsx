'use client'

import { useTranslations } from 'next-intl'

interface LoadingAnimationProps {
  title?: string
  subtitle?: string
}

export default function LoadingAnimation({ 
  title,
  subtitle 
}: LoadingAnimationProps) {
  const t = useTranslations('loading')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto"></div>
        <p className="mt-2 text-gray-600">
          {title || subtitle || t('creatingStore')}
        </p>
      </div>
    </div>
  )
} 