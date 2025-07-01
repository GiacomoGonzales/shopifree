'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../../lib/simple-auth-context'
import { updateUserDocument } from '../../../../lib/user'
import { useTranslations } from 'next-intl'
import AuthGuard from '../../../../components/AuthGuard'

interface UserFormData {
  displayName: string
  countryCode: string
  localPhone: string
  email: string
  timezone: string
}

const timeZones = [
  // América del Norte
  { zone: 'America/Mexico_City', label: 'México (GMT-6)' },
  { zone: 'America/New_York', label: 'Nueva York, Miami, Toronto (GMT-5)' },
  { zone: 'America/Chicago', label: 'Chicago, Houston, Dallas (GMT-6)' },
  { zone: 'America/Denver', label: 'Denver, Phoenix (GMT-7)' },
  { zone: 'America/Los_Angeles', label: 'Los Ángeles, San Francisco, Seattle (GMT-8)' },
  
  // América Central
  { zone: 'America/Guatemala', label: 'Guatemala, San Salvador, Tegucigalpa (GMT-6)' },
  { zone: 'America/Costa_Rica', label: 'Costa Rica, Nicaragua (GMT-6)' },
  { zone: 'America/Panama', label: 'Panamá (GMT-5)' },
  
  // América del Sur
  { zone: 'America/Bogota', label: 'Bogotá, Lima, Quito (GMT-5)' },
  { zone: 'America/Caracas', label: 'Caracas (GMT-4)' },
  { zone: 'America/La_Paz', label: 'La Paz, Sucre (GMT-4)' },
  { zone: 'America/Santiago', label: 'Santiago de Chile (GMT-3)' },
  { zone: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires, Montevideo (GMT-3)' },
  { zone: 'America/Asuncion', label: 'Asunción (GMT-3)' },
  { zone: 'America/Sao_Paulo', label: 'São Paulo, Río de Janeiro, Brasília (GMT-3)' },
  { zone: 'America/Manaus', label: 'Manaus (GMT-4)' },
  
  // Europa
  { zone: 'Europe/London', label: 'Londres, Dublín, Lisboa (GMT+0)' },
  { zone: 'Europe/Madrid', label: 'Madrid, París, Roma, Berlín (GMT+1)' },
  { zone: 'Europe/Amsterdam', label: 'Ámsterdam, Bruselas, Zurich (GMT+1)' },
  { zone: 'Europe/Vienna', label: 'Viena, Praga, Budapest (GMT+1)' },
  { zone: 'Europe/Stockholm', label: 'Estocolmo, Oslo, Copenhague (GMT+1)' },
  { zone: 'Europe/Helsinki', label: 'Helsinki (GMT+2)' },
  { zone: 'Europe/Athens', label: 'Atenas, Bucarest (GMT+2)' },
  { zone: 'Europe/Moscow', label: 'Moscú (GMT+3)' },
  
  // Asia
  { zone: 'Asia/Tokyo', label: 'Tokio, Seúl (GMT+9)' },
  { zone: 'Asia/Shanghai', label: 'Pekín, Shanghai, Hong Kong (GMT+8)' },
  { zone: 'Asia/Singapore', label: 'Singapur, Manila (GMT+8)' },
  { zone: 'Asia/Bangkok', label: 'Bangkok, Jakarta (GMT+7)' },
  { zone: 'Asia/Kolkata', label: 'Nueva Delhi, Mumbai (GMT+5:30)' },
  { zone: 'Asia/Dubai', label: 'Dubái, Abu Dhabi (GMT+4)' },
  
  // África
  { zone: 'Africa/Cairo', label: 'El Cairo (GMT+2)' },
  { zone: 'Africa/Lagos', label: 'Lagos, Abuja (GMT+1)' },
  { zone: 'Africa/Johannesburg', label: 'Johannesburgo, Ciudad del Cabo (GMT+2)' },
  
  // Oceanía
  { zone: 'Australia/Sydney', label: 'Sídney, Melbourne (GMT+10)' },
  { zone: 'Pacific/Auckland', label: 'Auckland (GMT+12)' }
]

const countryCodes = [
  { code: '+1', country: 'Estados Unidos / Canadá', flag: '🇺🇸' },
  { code: '+52', country: 'México', flag: '🇲🇽' },
  { code: '+34', country: 'España', flag: '🇪🇸' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴' },
  { code: '+51', country: 'Perú', flag: '🇵🇪' },
  { code: '+56', country: 'Chile', flag: '🇨🇱' },
  { code: '+58', country: 'Venezuela', flag: '🇻🇪' },
  { code: '+593', country: 'Ecuador', flag: '🇪🇨' },
  { code: '+591', country: 'Bolivia', flag: '🇧🇴' },
  { code: '+595', country: 'Paraguay', flag: '🇵🇾' },
  { code: '+598', country: 'Uruguay', flag: '🇺🇾' },
  { code: '+55', country: 'Brasil', flag: '🇧🇷' },
  { code: '+33', country: 'Francia', flag: '🇫🇷' },
  { code: '+49', country: 'Alemania', flag: '🇩🇪' },
  { code: '+39', country: 'Italia', flag: '🇮🇹' },
  { code: '+44', country: 'Reino Unido', flag: '🇬🇧' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹' },
  { code: '+31', country: 'Países Bajos', flag: '🇳🇱' },
  { code: '+41', country: 'Suiza', flag: '🇨🇭' },
  { code: '+43', country: 'Austria', flag: '🇦🇹' },
  { code: '+32', country: 'Bélgica', flag: '🇧🇪' },
  { code: '+45', country: 'Dinamarca', flag: '🇩🇰' },
  { code: '+46', country: 'Suecia', flag: '🇸🇪' },
  { code: '+47', country: 'Noruega', flag: '🇳🇴' },
  { code: '+358', country: 'Finlandia', flag: '🇫🇮' }
]

function UserOnboardingContent() {
  const t = useTranslations('onboarding.user')
  const router = useRouter()
  const { user, refreshUserData } = useAuth()
  
  const [formData, setFormData] = useState<UserFormData>({
    displayName: '',
    countryCode: '+52', // México por defecto
    localPhone: '',
    email: user?.email || '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Mexico_City'
  })
  
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Partial<UserFormData>>({})

  useEffect(() => {
    if (user?.email) {
      setFormData(prev => ({
        ...prev,
        email: user.email || ''
      }))
    }
  }, [user?.email])

  const validateForm = (): boolean => {
    const newErrors: Partial<UserFormData> = {}
    
    if (!formData.displayName.trim()) {
      newErrors.displayName = t('errors.nombreRequired')
    }
    
    if (!formData.localPhone.trim()) {
      newErrors.localPhone = t('errors.telefonoRequired')
    } else if (!/^[\d\s-()]+$/.test(formData.localPhone)) {
      newErrors.localPhone = t('errors.telefonoInvalid')
    }
    
    if (!formData.timezone) {
      newErrors.timezone = t('errors.zonaHorariaRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm() || !user?.uid) return
    
    setLoading(true)
    
    try {
      console.log('💾 Saving user onboarding data for:', user.uid)
      // Combinar código de país con teléfono local
      const phoneComplete = `${formData.countryCode}${formData.localPhone}`
      
      const updateData = {
        displayName: formData.displayName,
        phone: phoneComplete,
        email: formData.email,
        timezone: formData.timezone,
        onboardingUserCompleted: true
      }
      console.log('📝 Update data:', updateData)
      
      await updateUserDocument(user.uid, updateData)
      console.log('✅ User document updated successfully')
      
      // Refresh user data in context to reflect changes
      console.log('🔄 Refreshing auth context...')
      await refreshUserData()
      
      // Small delay to ensure context propagation
      await new Promise(resolve => setTimeout(resolve, 300))
      
      router.push('/onboarding/store')
    } catch (error) {
      console.error('❌ Error updating user:', error)
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
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                placeholder={t('nombrePlaceholder')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 ${
                  errors.displayName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.displayName && <p className="text-red-500 text-sm mt-1">{errors.displayName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('telefono')} <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-1 sm:space-x-2">
                <select
                  value={formData.countryCode}
                  onChange={(e) => handleInputChange('countryCode', e.target.value)}
                  className="w-20 sm:w-24 px-1 sm:px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 bg-white text-xs sm:text-sm"
                >
                  {countryCodes.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={formData.localPhone}
                  onChange={(e) => handleInputChange('localPhone', e.target.value)}
                  placeholder="1234567890"
                  className={`flex-1 px-2 sm:px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 text-xs sm:text-sm ${
                    errors.localPhone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.localPhone && <p className="text-red-500 text-sm mt-1">{errors.localPhone}</p>}
              <p className="text-xs text-gray-500 mt-1 break-words">
                {t('enterLocalNumber')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('correo')}
              </label>
              <input
                type="email"
                value={formData.email}
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
                value={formData.timezone}
                onChange={(e) => handleInputChange('timezone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 ${
                  errors.timezone ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                {timeZones.map(tz => (
                  <option key={tz.zone} value={tz.zone}>
                    {tz.label}
                  </option>
                ))}
              </select>
              {errors.timezone && <p className="text-red-500 text-sm mt-1">{errors.timezone}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
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