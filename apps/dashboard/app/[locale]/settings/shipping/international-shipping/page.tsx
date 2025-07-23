'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import DashboardLayout from '../../../../../components/DashboardLayout'
import ShippingNav from '../../../../../components/settings/ShippingNav'
import { useAuth } from '../../../../../lib/simple-auth-context'
import { getUserStore, updateStore, StoreWithId } from '../../../../../lib/store'
import LoadingAnimation from '../../../../../components/LoadingAnimation'

// Lista de países comunes para envíos internacionales
const COMMON_COUNTRIES = [
  'Estados Unidos', 'Canadá', 'México', 'España', 'Francia', 'Alemania', 'Reino Unido', 
  'Italia', 'Brasil', 'Argentina', 'Chile', 'Colombia', 'Ecuador', 'Bolivia', 'Paraguay',
  'Uruguay', 'Venezuela', 'Australia', 'Japón', 'Corea del Sur', 'China', 'India'
]

interface ShippingData {
  enabled: boolean
  modes: {
    storePickup: boolean
    localDelivery: boolean
    nationalShipping: boolean
    internationalShipping: boolean
  }
  internationalShipping: {
    enabled: boolean
    countries: string[]
    basePrice: number
    weightRate?: number
    volumeRate?: number
    customMessage?: string
    estimatedTime?: string
    requiresSignature?: boolean
    includesInsurance?: boolean
    hasTracking?: boolean
    customsInfo: {
      restrictedCategories: string[]
      additionalInfo?: string
    }
  }
}

export default function ShippingInternationalShippingPage() {
  const { user } = useAuth()
  const t = useTranslations('settings')
  const tShipping = useTranslations('settings.advanced.shipping')
  const tActions = useTranslations('settings.actions')
  
  const [store, setStore] = useState<StoreWithId | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [newCountry, setNewCountry] = useState('')
  const [newRestrictedCategory, setNewRestrictedCategory] = useState('')

  const [shippingData, setShippingData] = useState<ShippingData>({
    enabled: true,
    modes: {
      storePickup: false,
      localDelivery: false,
      nationalShipping: false,
      internationalShipping: false
    },
    internationalShipping: {
      enabled: false,
      countries: [],
      basePrice: 0,
      estimatedTime: '7-15 días hábiles',
      requiresSignature: false,
      includesInsurance: false,
      hasTracking: true,
      customsInfo: {
        restrictedCategories: []
      }
    }
  })

  // Cargar datos de la tienda
  useEffect(() => {
    const loadStore = async () => {
      if (!user?.uid) return
      
      try {
        const userStore = await getUserStore(user.uid)
        setStore(userStore)
        if (userStore) {
          // Cargar datos existentes si están disponibles
          if (userStore.advanced?.shipping) {
            const existingShipping = userStore.advanced.shipping as any
            setShippingData({
              enabled: existingShipping.enabled ?? true,
              modes: {
                storePickup: existingShipping.modes?.storePickup ?? false,
                localDelivery: existingShipping.modes?.localDelivery ?? false,
                nationalShipping: existingShipping.modes?.nationalShipping ?? false,
                internationalShipping: existingShipping.modes?.internationalShipping ?? false
              },
              internationalShipping: {
                enabled: existingShipping.internationalShipping?.enabled ?? false,
                countries: existingShipping.internationalShipping?.countries ?? [],
                basePrice: existingShipping.internationalShipping?.basePrice ?? 0,
                weightRate: existingShipping.internationalShipping?.weightRate,
                volumeRate: existingShipping.internationalShipping?.volumeRate,
                customMessage: existingShipping.internationalShipping?.customMessage,
                estimatedTime: existingShipping.internationalShipping?.estimatedTime ?? '7-15 días hábiles',
                requiresSignature: existingShipping.internationalShipping?.requiresSignature ?? false,
                includesInsurance: existingShipping.internationalShipping?.includesInsurance ?? false,
                hasTracking: existingShipping.internationalShipping?.hasTracking ?? true,
                customsInfo: {
                  restrictedCategories: existingShipping.internationalShipping?.customsInfo?.restrictedCategories ?? [],
                  additionalInfo: existingShipping.internationalShipping?.customsInfo?.additionalInfo
                }
              }
            })
          }
        }
      } catch (error) {
        console.error('Error loading store:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStore()
  }, [user?.uid])

  const updateShippingData = (path: string, value: any) => {
    const keys = path.split('.')
    setShippingData(prev => {
      const newData = { ...prev }
      let current: any = newData
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      current[keys[keys.length - 1]] = value
      
      return newData
    })
  }

  const addCountry = (country: string) => {
    if (country && !shippingData.internationalShipping.countries.includes(country)) {
      setShippingData(prev => ({
        ...prev,
        internationalShipping: {
          ...prev.internationalShipping,
          countries: [...prev.internationalShipping.countries, country]
        }
      }))
      setNewCountry('')
    }
  }

  const removeCountry = (countryToRemove: string) => {
    setShippingData(prev => ({
      ...prev,
      internationalShipping: {
        ...prev.internationalShipping,
        countries: prev.internationalShipping.countries.filter(country => country !== countryToRemove)
      }
    }))
  }

  const addRestrictedCategory = (category: string) => {
    if (category && !shippingData.internationalShipping.customsInfo.restrictedCategories.includes(category)) {
      setShippingData(prev => ({
        ...prev,
        internationalShipping: {
          ...prev.internationalShipping,
          customsInfo: {
            ...prev.internationalShipping.customsInfo,
            restrictedCategories: [...prev.internationalShipping.customsInfo.restrictedCategories, category]
          }
        }
      }))
      setNewRestrictedCategory('')
    }
  }

  const removeRestrictedCategory = (categoryToRemove: string) => {
    setShippingData(prev => ({
      ...prev,
      internationalShipping: {
        ...prev.internationalShipping,
        customsInfo: {
          ...prev.internationalShipping.customsInfo,
          restrictedCategories: prev.internationalShipping.customsInfo.restrictedCategories.filter(cat => cat !== categoryToRemove)
        }
      }
    }))
  }

  const calculateExamplePrice = (weight: number) => {
    const basePrice = shippingData.internationalShipping.basePrice || 0
    const weightRate = shippingData.internationalShipping.weightRate || 0
    return basePrice + (weight * weightRate)
  }

  const handleSave = async () => {
    if (!store?.id || !user?.uid) return

    setSaving(true)
    try {
      await updateStore(store.id, {
        advanced: {
          ...store?.advanced,
          shipping: shippingData as any
        }
      })
      
      setSaveMessage(tActions('saved'))
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      console.error('Error saving shipping data:', error)
      setSaveMessage('Error al guardar la configuración. Inténtalo de nuevo.')
      
      // Limpiar mensaje después de 5 segundos
      setTimeout(() => setSaveMessage(null), 5000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingAnimation />
      </DashboardLayout>
    )
  }

  if (!store) {
    return (
      <DashboardLayout>
        <div className="text-center py-8">
          <p className="text-gray-600">No se pudo cargar la información de la tienda</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">


          {/* Navegación */}
          <ShippingNav currentSection="international-shipping" />

          {/* Contenido */}
          <div className="space-y-6">
            {/* Configuración básica */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración de Envío Internacional</h3>
              <p className="text-sm text-gray-600 mb-6">
                Define los países de destino y configura los precios para envíos internacionales.
              </p>
              
              <div className="space-y-6">
                {/* Habilitar envío internacional */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={shippingData.modes.internationalShipping}
                      onChange={(e) => updateShippingData('modes.internationalShipping', e.target.checked)}
                      className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Activar envío internacional</span>
                  </label>
                </div>

                {shippingData.modes.internationalShipping && (
                  <>
                    {/* Países de destino */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Países de destino
                      </label>
                      
                      {/* Agregar país */}
                      <div className="flex items-center space-x-2 mb-3">
                        <input
                          type="text"
                          value={newCountry}
                          onChange={(e) => setNewCountry(e.target.value)}
                          placeholder="Escribe un país..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault()
                              addCountry(newCountry)
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => addCountry(newCountry)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Agregar
                        </button>
                      </div>

                      {/* Países comunes */}
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">Países comunes:</p>
                        <div className="flex flex-wrap gap-2">
                          {COMMON_COUNTRIES.filter(country => 
                            !shippingData.internationalShipping.countries.includes(country)
                          ).slice(0, 8).map(country => (
                            <button
                              key={country}
                              type="button"
                              onClick={() => addCountry(country)}
                              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full"
                            >
                              + {country}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Lista de países seleccionados */}
                      <div className="space-y-2">
                        {shippingData.internationalShipping.countries.map(country => (
                          <div key={country} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <span className="text-sm text-gray-900">{country}</span>
                            <button
                              type="button"
                              onClick={() => removeCountry(country)}
                              className="text-red-600 hover:text-red-800"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        
                        {shippingData.internationalShipping.countries.length === 0 && (
                          <p className="text-sm text-gray-500 italic text-center py-4">
                            No hay países configurados. Agrega al menos un país para envíos internacionales.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Configuración de precios */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Precio base (USD)
                        </label>
                        <input
                          type="number"
                          step="0.50"
                          min="0"
                          value={shippingData.internationalShipping.basePrice || ''}
                          onChange={(e) => updateShippingData('internationalShipping.basePrice', Number(e.target.value))}
                          placeholder="25.00"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Precio fijo base para todos los envíos internacionales
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tarifa por peso (USD/kg)
                        </label>
                        <input
                          type="number"
                          step="0.25"
                          min="0"
                          value={shippingData.internationalShipping.weightRate || ''}
                          onChange={(e) => updateShippingData('internationalShipping.weightRate', Number(e.target.value))}
                          placeholder="5.00"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Costo adicional por cada kilogramo
                        </p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tarifa por volumen (USD/cm³)
                        </label>
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          value={shippingData.internationalShipping.volumeRate || ''}
                          onChange={(e) => updateShippingData('internationalShipping.volumeRate', Number(e.target.value))}
                          placeholder="0.01"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Costo adicional por volumen (opcional)
                        </p>
                      </div>
                    </div>

                    {/* Tiempo estimado */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tiempo estimado de entrega
                      </label>
                      <input
                        type="text"
                        value={shippingData.internationalShipping.estimatedTime || ''}
                        onChange={(e) => updateShippingData('internationalShipping.estimatedTime', e.target.value)}
                        placeholder="7-15 días hábiles"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                      />
                    </div>

                    {/* Mensaje personalizado */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mensaje personalizado para clientes internacionales
                      </label>
                      <textarea
                        value={shippingData.internationalShipping.customMessage || ''}
                        onChange={(e) => updateShippingData('internationalShipping.customMessage', e.target.value)}
                        placeholder="Los envíos internacionales pueden tardar entre 7-15 días hábiles. Se aplican impuestos aduaneros según las regulaciones del país de destino."
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Este mensaje se mostrará a los clientes durante el checkout para envíos internacionales.
                      </p>
                    </div>

                    {/* Configuraciones adicionales */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-gray-900 mb-3">Configuraciones adicionales</h5>
                      
                      <div className="space-y-3">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={shippingData.internationalShipping.requiresSignature || false}
                            onChange={(e) => updateShippingData('internationalShipping.requiresSignature', e.target.checked)}
                            className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Requiere firma del destinatario</span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={shippingData.internationalShipping.includesInsurance || false}
                            onChange={(e) => updateShippingData('internationalShipping.includesInsurance', e.target.checked)}
                            className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Incluye seguro de envío</span>
                        </label>

                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={shippingData.internationalShipping.hasTracking || false}
                            onChange={(e) => updateShippingData('internationalShipping.hasTracking', e.target.checked)}
                            className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-700">Incluye número de seguimiento</span>
                        </label>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Información de aduanas */}
            {shippingData.modes.internationalShipping && (
              <div className="bg-white shadow rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Información de Aduanas</h4>
                <p className="text-sm text-gray-600 mb-6">
                  Configura restricciones y información importante para envíos internacionales.
                </p>
                
                <div className="space-y-6">
                  {/* Categorías restringidas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categorías de productos restringidas
                    </label>
                    
                    {/* Agregar categoría */}
                    <div className="flex items-center space-x-2 mb-3">
                      <input
                        type="text"
                        value={newRestrictedCategory}
                        onChange={(e) => setNewRestrictedCategory(e.target.value)}
                        placeholder="Ej: Electrónicos, Líquidos, Alimentos..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addRestrictedCategory(newRestrictedCategory)
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => addRestrictedCategory(newRestrictedCategory)}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                      >
                        Agregar
                      </button>
                    </div>

                    {/* Lista de categorías restringidas */}
                    <div className="space-y-2">
                      {shippingData.internationalShipping.customsInfo.restrictedCategories.map(category => (
                        <div key={category} className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded-lg">
                          <span className="text-sm text-red-900">{category}</span>
                          <button
                            type="button"
                            onClick={() => removeRestrictedCategory(category)}
                            className="text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      
                      {shippingData.internationalShipping.customsInfo.restrictedCategories.length === 0 && (
                        <p className="text-sm text-gray-500 italic text-center py-2">
                          No hay categorías restringidas configuradas.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Información adicional */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Información adicional sobre aduanas y restricciones
                    </label>
                    <textarea
                      value={shippingData.internationalShipping.customsInfo.additionalInfo || ''}
                      onChange={(e) => updateShippingData('internationalShipping.customsInfo.additionalInfo', e.target.value)}
                      placeholder="Información importante sobre documentación aduanera, impuestos, restricciones específicas por país, etc."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Esta información se mostrará a los clientes durante el checkout para envíos internacionales.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Calculadora de ejemplo */}
            {shippingData.modes.internationalShipping && (shippingData.internationalShipping.basePrice > 0 || shippingData.internationalShipping.weightRate! > 0) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h4 className="text-base font-medium text-blue-900 mb-3">Calculadora de Envío</h4>
                <p className="text-sm text-blue-700 mb-4">
                  Ejemplos de cálculo según tu configuración:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[0.5, 1, 2].map(weight => (
                    <div key={weight} className="bg-white rounded-lg p-4 border border-blue-200">
                      <div className="text-sm font-medium text-blue-900">
                        Paquete de {weight}kg
                      </div>
                      <div className="text-lg font-semibold text-blue-800">
                        ${calculateExamplePrice(weight).toFixed(2)} USD
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        Base: ${shippingData.internationalShipping.basePrice || 0}
                        {shippingData.internationalShipping.weightRate && 
                          ` + Peso: $${(weight * shippingData.internationalShipping.weightRate).toFixed(2)}`
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Información importante */}
            {shippingData.modes.internationalShipping && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                <h4 className="text-base font-medium text-yellow-900 mb-3">Información importante sobre envíos internacionales</h4>
                <div className="space-y-2 text-sm text-yellow-800">
                  <p>• Los tiempos de entrega pueden variar según el país de destino y los procesos aduaneros.</p>
                  <p>• Los clientes pueden estar sujetos a impuestos adicionales y tasas aduaneras en su país.</p>
                  <p>• Algunos productos pueden estar restringidos o prohibidos en ciertos países.</p>
                  <p>• Se recomienda incluir información clara sobre políticas de devolución para envíos internacionales.</p>
                  <p>• Considera usar servicios de envío con seguimiento para mayor seguridad.</p>
                </div>
              </div>
            )}
          </div>

          {/* Mensaje de estado */}
          {saveMessage && (
            <div className={`mt-4 p-3 rounded-md ${
              saveMessage.includes('Error') 
                ? 'bg-red-50 border border-red-200 text-red-700' 
                : 'bg-green-50 border border-green-200 text-green-700'
            }`}>
              {saveMessage}
            </div>
          )}

          {/* Botón de guardar */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 