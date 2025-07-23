'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import DashboardLayout from '../../../../../components/DashboardLayout'
import ShippingNav from '../../../../../components/settings/ShippingNav'
import { useAuth } from '../../../../../lib/simple-auth-context'
import { getUserStore, updateStore, StoreWithId } from '../../../../../lib/store'
import LoadingAnimation from '../../../../../components/LoadingAnimation'

interface ShippingData {
  enabled: boolean
  modes: {
    storePickup: boolean
    localDelivery: boolean
    nationalShipping: boolean
    internationalShipping: boolean
  }
  nationalShipping: {
    enabled: boolean
    type: 'fixed' | 'by_weight' | 'by_region'
    fixedPrice?: number
    regions: Array<{
      name: string
      price: number
      estimatedTime?: string
    }>
    weightRanges: Array<{
      minWeight: number
      maxWeight: number
      price: number
    }>
    carrier: {
      name?: string
      trackingEnabled?: boolean
      trackingUrl?: string
    }
    automaticRates: {
      enabled: boolean
      apiKey?: string
    }
  }
}

export default function ShippingNationalShippingPage() {
  const { user } = useAuth()
  const t = useTranslations('settings')
  const tShipping = useTranslations('settings.advanced.shipping')
  const tActions = useTranslations('settings.actions')
  
  const [store, setStore] = useState<StoreWithId | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const [shippingData, setShippingData] = useState<ShippingData>({
    enabled: true,
    modes: {
      storePickup: false,
      localDelivery: false,
      nationalShipping: false,
      internationalShipping: false
    },
    nationalShipping: {
      enabled: false,
      type: 'fixed',
      regions: [],
      weightRanges: [],
      carrier: {},
      automaticRates: {
        enabled: false
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
              nationalShipping: {
                enabled: existingShipping.nationalShipping?.enabled ?? false,
                type: existingShipping.nationalShipping?.type ?? 'fixed',
                ...(existingShipping.nationalShipping?.fixedPrice !== undefined && { fixedPrice: existingShipping.nationalShipping.fixedPrice }),
                regions: existingShipping.nationalShipping?.regions ?? [],
                weightRanges: existingShipping.nationalShipping?.weightRanges ?? [],
                carrier: existingShipping.nationalShipping?.carrier ?? {},
                automaticRates: {
                  enabled: existingShipping.nationalShipping?.automaticRates?.enabled ?? false,
                  ...(existingShipping.nationalShipping?.automaticRates?.apiKey && { apiKey: existingShipping.nationalShipping.automaticRates.apiKey })
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

  const addRegion = () => {
    setShippingData(prev => ({
      ...prev,
      nationalShipping: {
        ...prev.nationalShipping,
        regions: [
          ...prev.nationalShipping.regions,
          { name: '', price: 0, estimatedTime: '' }
        ]
      }
    }))
  }

  const removeRegion = (index: number) => {
    setShippingData(prev => ({
      ...prev,
      nationalShipping: {
        ...prev.nationalShipping,
        regions: prev.nationalShipping.regions.filter((_, i) => i !== index)
      }
    }))
  }

  const addWeightRange = () => {
    setShippingData(prev => ({
      ...prev,
      nationalShipping: {
        ...prev.nationalShipping,
        weightRanges: [
          ...prev.nationalShipping.weightRanges,
          { minWeight: 0, maxWeight: 1, price: 0 }
        ]
      }
    }))
  }

  const removeWeightRange = (index: number) => {
    setShippingData(prev => ({
      ...prev,
      nationalShipping: {
        ...prev.nationalShipping,
        weightRanges: prev.nationalShipping.weightRanges.filter((_, i) => i !== index)
      }
    }))
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Configuración de Envíos</h1>
            <p className="mt-2 text-gray-600">
              Configura las opciones de envío para tu tienda
            </p>
          </div>

          {/* Navegación */}
          <ShippingNav currentSection="national-shipping" />

          {/* Contenido */}
          <div className="space-y-6">
            {/* Configuración básica */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración de Envío Nacional</h3>
              <p className="text-sm text-gray-600 mb-6">
                Configura los precios y opciones para envíos a nivel nacional.
              </p>
              
              <div className="space-y-6">
                {/* Habilitar envío nacional */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={shippingData.modes.nationalShipping}
                      onChange={(e) => updateShippingData('modes.nationalShipping', e.target.checked)}
                      className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Activar envío nacional</span>
                  </label>
                </div>

                {shippingData.modes.nationalShipping && (
                  <>
                    {/* Tipo de configuración */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de configuración
                      </label>
                      <select
                        value={shippingData.nationalShipping.type}
                        onChange={(e) => updateShippingData('nationalShipping.type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                      >
                        <option value="fixed">Precio fijo para todo el país</option>
                        <option value="by_region">Precio por región/ciudad</option>
                        <option value="by_weight">Precio por peso</option>
                      </select>
                      <p className="mt-1 text-sm text-gray-500">
                        Selecciona cómo quieres calcular los costos de envío nacional.
                      </p>
                    </div>

                    {/* Precio fijo */}
                    {shippingData.nationalShipping.type === 'fixed' && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Precio fijo de envío nacional (S/)
                        </label>
                        <input
                          type="number"
                          step="0.50"
                          min="0"
                          value={shippingData.nationalShipping.fixedPrice || ''}
                          onChange={(e) => updateShippingData('nationalShipping.fixedPrice', Number(e.target.value))}
                          placeholder="15.00"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          Precio único para todos los envíos nacionales, sin importar el destino.
                        </p>
                      </div>
                    )}

                    {/* Precio por región */}
                    {shippingData.nationalShipping.type === 'by_region' && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-sm font-medium text-gray-700">
                            Regiones de envío
                          </label>
                          <button
                            type="button"
                            onClick={addRegion}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            + Agregar región
                          </button>
                        </div>

                        <div className="space-y-3">
                          {shippingData.nationalShipping.regions.map((region, index) => (
                            <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={region.name}
                                  onChange={(e) => {
                                    const newRegions = [...shippingData.nationalShipping.regions]
                                    newRegions[index].name = e.target.value
                                    updateShippingData('nationalShipping.regions', newRegions)
                                  }}
                                  placeholder="Nombre de la región (ej: Lima, Cusco, Arequipa)"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                                />
                              </div>
                              <div className="w-24">
                                <input
                                  type="number"
                                  step="0.50"
                                  min="0"
                                  value={region.price || ''}
                                  onChange={(e) => {
                                    const newRegions = [...shippingData.nationalShipping.regions]
                                    newRegions[index].price = Number(e.target.value)
                                    updateShippingData('nationalShipping.regions', newRegions)
                                  }}
                                  placeholder="Precio"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                                />
                              </div>
                              <div className="w-32">
                                <input
                                  type="text"
                                  value={region.estimatedTime || ''}
                                  onChange={(e) => {
                                    const newRegions = [...shippingData.nationalShipping.regions]
                                    newRegions[index].estimatedTime = e.target.value
                                    updateShippingData('nationalShipping.regions', newRegions)
                                  }}
                                  placeholder="Tiempo"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => removeRegion(index)}
                                className="text-red-600 hover:text-red-800 p-1"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          
                          {shippingData.nationalShipping.regions.length === 0 && (
                            <p className="text-sm text-gray-500 italic text-center py-4">
                              No hay regiones configuradas. Agrega al menos una región para envíos nacionales.
                            </p>
                          )}
                        </div>
                        
                        <p className="mt-2 text-sm text-gray-500">
                          Define precios específicos para cada región o ciudad donde realizas envíos.
                        </p>
                      </div>
                    )}

                    {/* Precio por peso */}
                    {shippingData.nationalShipping.type === 'by_weight' && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <label className="block text-sm font-medium text-gray-700">
                            Rangos de peso
                          </label>
                          <button
                            type="button"
                            onClick={addWeightRange}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            + Agregar rango
                          </button>
                        </div>

                        <div className="space-y-3">
                          {shippingData.nationalShipping.weightRanges.map((range, index) => (
                            <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
                              <div className="w-24">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  value={range.minWeight || ''}
                                  onChange={(e) => {
                                    const newRanges = [...shippingData.nationalShipping.weightRanges]
                                    newRanges[index].minWeight = Number(e.target.value)
                                    updateShippingData('nationalShipping.weightRanges', newRanges)
                                  }}
                                  placeholder="Min kg"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                                />
                              </div>
                              <span className="text-gray-500">-</span>
                              <div className="w-24">
                                <input
                                  type="number"
                                  step="0.1"
                                  min="0"
                                  value={range.maxWeight || ''}
                                  onChange={(e) => {
                                    const newRanges = [...shippingData.nationalShipping.weightRanges]
                                    newRanges[index].maxWeight = Number(e.target.value)
                                    updateShippingData('nationalShipping.weightRanges', newRanges)
                                  }}
                                  placeholder="Max kg"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                                />
                              </div>
                              <span className="text-gray-500">kg</span>
                              <span className="text-gray-500">=</span>
                              <div className="w-24">
                                <input
                                  type="number"
                                  step="0.50"
                                  min="0"
                                  value={range.price || ''}
                                  onChange={(e) => {
                                    const newRanges = [...shippingData.nationalShipping.weightRanges]
                                    newRanges[index].price = Number(e.target.value)
                                    updateShippingData('nationalShipping.weightRanges', newRanges)
                                  }}
                                  placeholder="Precio"
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                                />
                              </div>
                              <span className="text-gray-500">S/</span>
                              <button
                                type="button"
                                onClick={() => removeWeightRange(index)}
                                className="text-red-600 hover:text-red-800 p-1"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                          
                          {shippingData.nationalShipping.weightRanges.length === 0 && (
                            <p className="text-sm text-gray-500 italic text-center py-4">
                              No hay rangos de peso configurados. Agrega al menos un rango para calcular envíos por peso.
                            </p>
                          )}
                        </div>
                        
                        <p className="mt-2 text-sm text-gray-500">
                          Define precios según el peso del paquete. Útil para productos con pesos muy variables.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Configuración de transportista */}
            {shippingData.modes.nationalShipping && (
              <div className="bg-white shadow rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Transportista</h4>
                <p className="text-sm text-gray-600 mb-6">
                  Configura la empresa de envío y opciones de seguimiento.
                </p>
                
                <div className="space-y-6">
                  {/* Empresa de envío */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Empresa de envío
                    </label>
                    <select
                      value={shippingData.nationalShipping.carrier.name || ''}
                      onChange={(e) => updateShippingData('nationalShipping.carrier.name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                    >
                      <option value="">Seleccionar transportista...</option>
                      <option value="serpost">Serpost</option>
                      <option value="olva">Olva Courier</option>
                      <option value="shalom">Shalom</option>
                      <option value="cruz_del_sur">Cruz del Sur Cargo</option>
                      <option value="custom">Otro</option>
                    </select>
                  </div>

                  {/* Seguimiento habilitado */}
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={shippingData.nationalShipping.carrier.trackingEnabled || false}
                        onChange={(e) => updateShippingData('nationalShipping.carrier.trackingEnabled', e.target.checked)}
                        className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Permitir seguimiento del pedido</span>
                    </label>
                    <p className="mt-1 text-sm text-gray-500">
                      Los clientes podrán ver el estado de su envío con un código de seguimiento.
                    </p>
                  </div>

                  {/* URL de seguimiento */}
                  {shippingData.nationalShipping.carrier.trackingEnabled && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL de seguimiento
                      </label>
                      <input
                        type="url"
                        value={shippingData.nationalShipping.carrier.trackingUrl || ''}
                        onChange={(e) => updateShippingData('nationalShipping.carrier.trackingUrl', e.target.value)}
                        placeholder="https://www.transportista.com/seguimiento?codigo="
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        URL donde los clientes pueden rastrear su pedido. El código de seguimiento se agregará al final.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tarifas automáticas */}
            {shippingData.modes.nationalShipping && (
              <div className="bg-white shadow rounded-lg p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Tarifas Automáticas</h4>
                <p className="text-sm text-gray-600 mb-6">
                  Integra con APIs de transportistas para obtener tarifas en tiempo real.
                </p>
                
                <div className="space-y-6">
                  {/* Habilitar tarifas automáticas */}
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={shippingData.nationalShipping.automaticRates.enabled}
                        onChange={(e) => updateShippingData('nationalShipping.automaticRates.enabled', e.target.checked)}
                        className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Usar tarifas automáticas de API</span>
                    </label>
                    <p className="mt-1 text-sm text-gray-500">
                      Obtener precios actualizados directamente del transportista.
                    </p>
                  </div>

                  {/* API Key */}
                  {shippingData.nationalShipping.automaticRates.enabled && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        API Key del transportista
                      </label>
                      <input
                        type="password"
                        value={shippingData.nationalShipping.automaticRates.apiKey || ''}
                        onChange={(e) => updateShippingData('nationalShipping.automaticRates.apiKey', e.target.value)}
                        placeholder="Ingresa tu API Key"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Clave API proporcionada por el transportista para acceder a sus tarifas.
                      </p>
                    </div>
                  )}

                  {/* Información sobre tarifas automáticas */}
                  {shippingData.nationalShipping.automaticRates.enabled && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-blue-900 mb-2">Información importante:</h5>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Las tarifas se calcularán automáticamente según peso, dimensiones y destino</li>
                        <li>• Requiere conexión a internet para funcionar correctamente</li>
                        <li>• En caso de error en la API, se usarán las tarifas manuales como respaldo</li>
                        <li>• Algunos transportistas cobran por cada consulta de tarifa</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Calculadora de ejemplo */}
            {shippingData.modes.nationalShipping && shippingData.nationalShipping.type === 'by_weight' && shippingData.nationalShipping.weightRanges.length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h4 className="text-base font-medium text-gray-900 mb-3">Calculadora de ejemplo</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Precios según los rangos de peso configurados:
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {shippingData.nationalShipping.weightRanges.map((range, index) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="text-sm font-medium text-gray-900">
                        {range.minWeight}kg - {range.maxWeight}kg
                      </div>
                      <div className="text-lg font-semibold text-gray-800">
                        S/ {range.price.toFixed(2)}
                      </div>
                    </div>
                  ))}
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