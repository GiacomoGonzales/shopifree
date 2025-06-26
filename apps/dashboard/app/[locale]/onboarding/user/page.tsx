'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../../lib/simple-auth-context'
import { updateUserDocument } from '../../../../lib/user'
import { useTranslations } from 'next-intl'
import AuthGuard from '../../../../components/AuthGuard'

interface UserFormData {
  nombre: string
  telefono: string
  correo: string
  zonaHoraria: string
}

const timeZones = [
  'America/Mexico_City',
  'America/New_York', 
  'America/Los_Angeles',
  'America/Chicago',
  'America/Denver',
  'America/Bogota',
  'America/Argentina/Buenos_Aires',
  'America/Sao_Paulo',
  'Europe/Madrid',
  'Europe/London',
  'Europe/Paris'
]

function UserOnboardingContent() {
  const t = useTranslations('onboarding.user')
  const router = useRouter()
  const { user } = useAuth()
  
  const [formData, setFormData] = useState<UserFormData>({
    nombre: '',
    telefono: '',
    correo: user?.email || '',
    zonaHoraria: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Mexico_City'
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<UserFormData>>({})

  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({
        ...prev,
        correo: user.email || ''
      }))
    }
  }, [user?.email])

  const validateForm = (): boolean => {
    const newErrors: Partial<UserFormData> = {}
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = t('errors.nombreRequired')
    }
    
    if (!formData.telefono.trim()) {
      newErrors.telefono = t('errors.telefonoRequired')
    } else if (!/^\+?[\d\s-()]+$/.test(formData.telefono)) {
      newErrors.telefono = t('errors.telefonoInvalid')
    }
    
    if (!formData.zonaHoraria) {
      newErrors.zonaHoraria = t('errors.zonaHorariaRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !user?.uid) return
    
    setLoading(true)
    
    try {
      await updateUserDocument(user.uid, {
        displayName: formData.nombre,
        nombre: formData.nombre,
        telefono: formData.telefono,
        correo: formData.correo,
        zonaHoraria: formData.zonaHoraria,
        onboardingUserCompleted: true
      })
      
      router.push('/onboarding/store')
    } catch (error) {
      console.error('Error updating user:', error)
      alert(t('errors.saveError'))
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
            <p className="text-gray-600 mt-2">{t('subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('nombre')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nombre}
                onChange={(e) => handleInputChange('nombre', e.target.value)}
                placeholder={t('nombrePlaceholder')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.nombre ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.nombre && <p className="text-red-500 text-sm mt-1">{errors.nombre}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('telefono')} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.telefono}
                onChange={(e) => handleInputChange('telefono', e.target.value)}
                placeholder={t('telefonoPlaceholder')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.telefono ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.telefono && <p className="text-red-500 text-sm mt-1">{errors.telefono}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('correo')}
              </label>
              <input
                type="email"
                value={formData.correo}
                disabled={!!user?.email}
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">{t('correoHint')}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('zonaHoraria')} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.zonaHoraria}
                onChange={(e) => handleInputChange('zonaHoraria', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.zonaHoraria ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {timeZones.map(tz => (
                  <option key={tz} value={tz}>
                    {tz.replace('_', ' ')}
                  </option>
                ))}
              </select>
              {errors.zonaHoraria && <p className="text-red-500 text-sm mt-1">{errors.zonaHoraria}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t('saving') : t('continue')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function UserOnboardingPage() {
  return (
    <AuthGuard>
      <UserOnboardingContent />
    </AuthGuard>
  )
} 