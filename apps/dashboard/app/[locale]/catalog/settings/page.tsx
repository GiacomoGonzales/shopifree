'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '../../../../components/DashboardLayout'
import { useStore } from '../../../../lib/hooks/useStore'
import { updateStore } from '../../../../lib/store'

// Monedas disponibles por país
const currencies = [
  { code: 'USD', symbol: '$', name: 'Dólar (USD)', country: 'Estados Unidos' },
  { code: 'MXN', symbol: '$', name: 'Peso Mexicano (MXN)', country: 'México' },
  { code: 'COP', symbol: '$', name: 'Peso Colombiano (COP)', country: 'Colombia' },
  { code: 'ARS', symbol: '$', name: 'Peso Argentino (ARS)', country: 'Argentina' },
  { code: 'CLP', symbol: '$', name: 'Peso Chileno (CLP)', country: 'Chile' },
  { code: 'PEN', symbol: 'S/', name: 'Sol Peruano (PEN)', country: 'Perú' },
  { code: 'BRL', symbol: 'R$', name: 'Real Brasileño (BRL)', country: 'Brasil' },
  { code: 'UYU', symbol: '$', name: 'Peso Uruguayo (UYU)', country: 'Uruguay' },
  { code: 'BOB', symbol: 'Bs', name: 'Boliviano (BOB)', country: 'Bolivia' },
  { code: 'PYG', symbol: '₲', name: 'Guaraní (PYG)', country: 'Paraguay' },
  { code: 'VES', symbol: 'Bs', name: 'Bolívar (VES)', country: 'Venezuela' },
  { code: 'GTQ', symbol: 'Q', name: 'Quetzal (GTQ)', country: 'Guatemala' },
  { code: 'CRC', symbol: '₡', name: 'Colón (CRC)', country: 'Costa Rica' },
  { code: 'PAB', symbol: 'B/.', name: 'Balboa (PAB)', country: 'Panamá' },
  { code: 'DOP', symbol: 'RD$', name: 'Peso Dominicano (DOP)', country: 'Rep. Dominicana' },
  { code: 'HNL', symbol: 'L', name: 'Lempira (HNL)', country: 'Honduras' },
  { code: 'NIO', symbol: 'C$', name: 'Córdoba (NIO)', country: 'Nicaragua' },
  { code: 'EUR', symbol: '€', name: 'Euro (EUR)', country: 'Europa' },
]

export default function CatalogSettingsPage() {
  const router = useRouter()
  const { store, loading: storeLoading } = useStore()

  const [storeName, setStoreName] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  // Cargar datos actuales
  useEffect(() => {
    if (store) {
      setStoreName(store.storeName || '')
      setWhatsapp(store.whatsappNumber || '')
      setCurrency(store.currency || 'USD')
    }
  }, [store])

  const handleSave = async () => {
    if (!store?.id) return

    setSaving(true)
    setSuccess(false)

    try {
      await updateStore(store.id, {
        storeName,
        whatsappNumber: whatsapp,
        currency
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setSaving(false)
    }
  }

  if (storeLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    )
  }

  const selectedCurrency = currencies.find(c => c.code === currency)

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-light text-gray-900">Configuración</h1>
            <p className="text-gray-500 mt-1">Datos básicos de tu catálogo</p>
          </div>

          {/* Success message */}
          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-emerald-700">Configuración guardada</span>
            </div>
          )}

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Columna izquierda - Datos del negocio */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Tu negocio</h2>

              <div className="space-y-6">
                {/* Nombre del negocio */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre del negocio
                  </label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    placeholder="Ej: Dulces María"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                  />
                </div>

                {/* WhatsApp */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    WhatsApp para pedidos
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                    </span>
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="+51 999 888 777"
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                    />
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    Incluye el código de país (ej: +51 para Perú)
                  </p>
                </div>
              </div>
            </div>

            {/* Columna derecha - Moneda */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Moneda</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecciona tu país/moneda
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all bg-white"
                >
                  {currencies.map(curr => (
                    <option key={curr.code} value={curr.code}>
                      {curr.country} - {curr.symbol} {curr.code}
                    </option>
                  ))}
                </select>
              </div>

              {/* Preview */}
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-500 mb-2">Así se verán tus precios:</p>
                <p className="text-2xl font-medium text-gray-900">
                  {selectedCurrency?.symbol} 45.00
                </p>
              </div>

              {/* Info */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-blue-700">
                    La moneda se mostrará en tu catálogo público y en los mensajes de WhatsApp.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Botón guardar */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:bg-gray-300 transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Guardando...
                </>
              ) : (
                'Guardar cambios'
              )}
            </button>
          </div>

          {/* Link del catálogo */}
          <div className="mt-8 bg-gray-100 rounded-2xl p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-sm text-gray-500">Tu catálogo está en:</p>
                <p className="text-lg font-medium text-gray-900">{store?.subdomain}.shopifree.app</p>
              </div>
              <a
                href={`https://${store?.subdomain}.shopifree.app`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                Ver catálogo
              </a>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
