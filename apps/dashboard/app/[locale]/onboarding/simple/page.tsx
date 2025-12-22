'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../../lib/simple-auth-context'
import { createStore, checkSubdomainAvailability } from '../../../../lib/store'
import { updateUserDocument } from '../../../../lib/user'
import AuthGuard from '../../../../components/AuthGuard'

// Códigos de país más comunes en LATAM
const countryCodes = [
  { code: '+52', country: 'México', flag: '🇲🇽' },
  { code: '+51', country: 'Perú', flag: '🇵🇪' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+56', country: 'Chile', flag: '🇨🇱' },
  { code: '+593', country: 'Ecuador', flag: '🇪🇨' },
  { code: '+58', country: 'Venezuela', flag: '🇻🇪' },
  { code: '+591', country: 'Bolivia', flag: '🇧🇴' },
  { code: '+595', country: 'Paraguay', flag: '🇵🇾' },
  { code: '+598', country: 'Uruguay', flag: '🇺🇾' },
  { code: '+55', country: 'Brasil', flag: '🇧🇷' },
  { code: '+34', country: 'España', flag: '🇪🇸' },
  { code: '+1', country: 'USA/Canadá', flag: '🇺🇸' },
]

// Generar subdomain desde nombre
function generateSubdomain(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Múltiples guiones a uno
    .replace(/^-|-$/g, '') // Quitar guiones al inicio/final
    .slice(0, 30) // Máximo 30 caracteres
}

function SimpleOnboardingContent() {
  const router = useRouter()
  const { user, refreshUserData } = useAuth()

  const [businessName, setBusinessName] = useState('')
  const [countryCode, setCountryCode] = useState('+52')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.uid) return

    // Validaciones básicas
    if (!businessName.trim()) {
      setError('El nombre de tu negocio es requerido')
      return
    }
    if (!phone.trim()) {
      setError('Tu número de WhatsApp es requerido')
      return
    }

    setSaving(true)
    setError(null)

    try {
      // Generar subdomain
      let subdomain = generateSubdomain(businessName)

      // Verificar disponibilidad y agregar número si está ocupado
      let isAvailable = await checkSubdomainAvailability(subdomain)
      let attempts = 0
      while (!isAvailable && attempts < 10) {
        subdomain = `${generateSubdomain(businessName)}${Math.floor(Math.random() * 999)}`
        isAvailable = await checkSubdomainAvailability(subdomain)
        attempts++
      }

      if (!isAvailable) {
        setError('No pudimos generar un link único. Intenta con otro nombre.')
        setSaving(false)
        return
      }

      // Crear tienda con valores mínimos
      const phoneComplete = `${countryCode}${phone}`

      await createStore({
        ownerId: user.uid,
        storeName: businessName.trim(),
        subdomain,
        phone: phoneComplete,
        // Valores por defecto
        businessType: 'retail',
        theme: 'default',
        primaryColor: '#10B981', // Emerald
        secondaryColor: '#059669',
        currency: 'USD',
        language: 'es',
        logoUrl: '',
        logoPublicId: '',
        heroMediaUrl: '',
        heroMediaPublicId: '',
        slogan: '',
        description: '',
        address: '',
        location: { address: '', lat: 0, lng: 0 },
        hasPhysicalLocation: false,
        socialMedia: {
          facebook: '',
          instagram: '',
          tiktok: '',
          x: '',
          snapchat: '',
          linkedin: '',
          telegram: '',
          youtube: '',
          pinterest: ''
        }
      })

      // Actualizar usuario
      await updateUserDocument(user.uid, {
        displayName: businessName.trim(),
        phone: phoneComplete,
        onboardingUserCompleted: true,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Mexico_City'
      })

      // Refrescar datos
      await refreshUserData()

      // Ir al catálogo
      router.push('/catalog')
    } catch (err) {
      console.error('Error en onboarding:', err)
      setError('Hubo un error. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Crea tu catálogo</h1>
          <p className="text-gray-500 mt-2">Solo necesitamos 2 datos para empezar</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre del negocio */}
            <div>
              <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de tu negocio
              </label>
              <input
                id="businessName"
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Ej: Dulces María"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                autoFocus
              />
              {businessName && (
                <p className="text-xs text-gray-500 mt-2">
                  Tu link será: <span className="font-medium text-emerald-600">{generateSubdomain(businessName)}.shopifree.app</span>
                </p>
              )}
            </div>

            {/* WhatsApp */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Tu WhatsApp
              </label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-28 px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none bg-white"
                >
                  {countryCodes.map((c) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="999 888 7777"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Aquí recibirás los pedidos de tus clientes
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Botón */}
            <button
              type="submit"
              disabled={saving || !businessName.trim() || !phone.trim()}
              className="w-full py-4 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Creando tu catálogo...
                </>
              ) : (
                <>
                  Crear mi catálogo
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-6">
          Podrás cambiar estos datos después en Configuración
        </p>
      </div>
    </div>
  )
}

export default function SimpleOnboardingPage() {
  return (
    <AuthGuard>
      <SimpleOnboardingContent />
    </AuthGuard>
  )
}
