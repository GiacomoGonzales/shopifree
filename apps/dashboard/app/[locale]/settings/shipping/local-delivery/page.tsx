'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import DashboardLayout from '../../../../../components/DashboardLayout'
import ShippingNav from '../../../../../components/settings/ShippingNav'
import DeliveryZoneMap from '../../../../../components/settings/DeliveryZoneMap'
import { useAuth } from '../../../../../lib/simple-auth-context'
import { getUserStore, updateStore, StoreWithId } from '../../../../../lib/store'
import LoadingAnimation from '../../../../../components/LoadingAnimation'
import { Toast } from '../../../../../components/shared/Toast'
import { useToast } from '../../../../../lib/hooks/useToast'

interface ShippingData {
  enabled: boolean
  modes: {
    storePickup: boolean
    localDelivery: boolean
    nationalShipping: boolean
    internationalShipping: boolean
  }
  localDelivery: {
    enabled: boolean
    allowGPS?: boolean
    noCoverageMessage?: string
    express: {
      enabled: boolean
      priceMultiplier?: number
      fixedSurcharge?: number
      estimatedTime?: string
    }
  }
}

export default function ShippingLocalDeliveryPage() {
  const { user } = useAuth()
  const t = useTranslations('settings')
  const tShipping = useTranslations('settings.advanced.shipping')
  const tActions = useTranslations('settings.actions')
  
  const [store, setStore] = useState<StoreWithId | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast, showToast, hideToast } = useToast()

  const [shippingData, setShippingData] = useState<ShippingData>({
    enabled: true,
    modes: {
      storePickup: false,
      localDelivery: false,
      nationalShipping: false,
      internationalShipping: false
    },
    localDelivery: {
      enabled: false,
      allowGPS: true,
      noCoverageMessage: 'Lo sentimos, no hacemos entregas en tu zona',
      express: {
        enabled: false,
        priceMultiplier: 1.5,
        fixedSurcharge: 0,
        estimatedTime: '1-2 días hábiles'
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
              localDelivery: {
                enabled: existingShipping.localDelivery?.enabled ?? false,
                allowGPS: existingShipping.localDelivery?.allowGPS ?? true,
                noCoverageMessage: existingShipping.localDelivery?.noCoverageMessage ?? 'Lo sentimos, no hacemos entregas en tu zona',
                express: {
                  enabled: existingShipping.localDelivery?.express?.enabled ?? false,
                  priceMultiplier: existingShipping.localDelivery?.express?.priceMultiplier ?? 1.5,
                  fixedSurcharge: existingShipping.localDelivery?.express?.fixedSurcharge ?? 0,
                  estimatedTime: existingShipping.localDelivery?.express?.estimatedTime ?? '1-2 días hábiles'
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

  const handleSave = async () => {
    if (!store?.id || !user?.uid) return

    setSaving(true)
    try {
      await updateStore(store.id, {
        advanced: {
          ...store?.advanced,
          shipping: {
            ...store?.advanced?.shipping,
            ...shippingData
          }
        }
      })
      
      showToast(tActions('saved'), 'success')
    } catch (error) {
      console.error('Error saving shipping data:', error)
      showToast('Error al guardar la configuración. Inténtalo de nuevo.', 'error')
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
          <ShippingNav currentSection="local-delivery" />

          {/* Contenido */}
          <div className="space-y-6">
            {/* Configuración básica */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración de Envío Local</h3>
              <p className="text-sm text-gray-600 mb-6">
                Define las zonas de entrega local y configura los precios para cada área.
              </p>
              
              <div className="space-y-6">
                {/* Habilitar envío local */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={shippingData.localDelivery.enabled}
                      onChange={(e) => {
                        const isChecked = e.target.checked
                        updateShippingData('localDelivery.enabled', isChecked)
                        updateShippingData('modes.localDelivery', isChecked)
                      }}
                      className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Activar envío local</span>
                  </label>
                </div>

                {shippingData.localDelivery.enabled && (
                  <>
                    {/* Permitir GPS del cliente */}
                    <div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={shippingData.localDelivery.allowGPS}
                          onChange={(e) => updateShippingData('localDelivery.allowGPS', e.target.checked)}
                          className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-700">Permitir que los clientes usen su ubicación GPS</span>
                      </label>
                      <p className="mt-1 text-sm text-gray-500">
                        Los clientes podrán activar su GPS para que el sistema calcule automáticamente los costos de envío según su ubicación.
                      </p>
                    </div>

                    {/* Mensaje para zonas no cubiertas */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mensaje para zonas no cubiertas
                      </label>
                      <textarea
                        value={shippingData.localDelivery.noCoverageMessage}
                        onChange={(e) => updateShippingData('localDelivery.noCoverageMessage', e.target.value)}
                        placeholder="Lo sentimos, no hacemos entregas en tu zona"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                      />
                      <p className="mt-1 text-sm text-gray-500">
                        Este mensaje se mostrará a los clientes cuando su dirección esté fuera de las zonas de entrega configuradas.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Configuración de Envío Express */}
            {shippingData.localDelivery.enabled && (
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración de Envío Express</h3>
                <p className="text-sm text-gray-600 mb-6">
                  El envío express permite a los clientes recibir sus pedidos más rápido por un costo adicional.
                </p>

                <div className="space-y-6">
                  {/* Habilitar envío express */}
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={shippingData.localDelivery.express.enabled}
                        onChange={(e) => updateShippingData('localDelivery.express.enabled', e.target.checked)}
                        className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Activar envío express</span>
                    </label>
                    <p className="mt-1 text-sm text-gray-500">
                      Los clientes podrán elegir entre envío estándar y envío express durante el checkout.
                    </p>
                  </div>

                  {shippingData.localDelivery.express.enabled && (
                    <>
                      {/* Tiempo estimado */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tiempo estimado de entrega express
                        </label>
                        <input
                          type="text"
                          value={shippingData.localDelivery.express.estimatedTime}
                          onChange={(e) => updateShippingData('localDelivery.express.estimatedTime', e.target.value)}
                          placeholder="1-2 días hábiles"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                        />
                        <p className="mt-1 text-sm text-gray-500">
                          Este tiempo se mostrará a los clientes en el checkout.
                        </p>
                      </div>

                      {/* Método de cálculo de precio */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Cómo calcular el precio del envío express
                        </label>

                        <div className="space-y-4">
                          {/* Multiplicador */}
                          <div className="border border-gray-200 rounded-lg p-4">
                            <label className="flex items-center mb-3">
                              <input
                                type="radio"
                                name="expressMethod"
                                checked={shippingData.localDelivery.express.fixedSurcharge === 0}
                                onChange={() => updateShippingData('localDelivery.express.fixedSurcharge', 0)}
                                className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300"
                              />
                              <span className="ml-2 text-sm font-medium text-gray-700">
                                Multiplicador del precio estándar
                              </span>
                            </label>

                            <div className="ml-6">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  min="1"
                                  max="5"
                                  step="0.1"
                                  value={shippingData.localDelivery.express.priceMultiplier}
                                  onChange={(e) => updateShippingData('localDelivery.express.priceMultiplier', parseFloat(e.target.value) || 1.5)}
                                  className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                                  disabled={shippingData.localDelivery.express.fixedSurcharge > 0}
                                />
                                <span className="text-sm text-gray-500">
                                  × precio de envío estándar
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-gray-500">
                                Ejemplo: Si el envío estándar cuesta $10 y el multiplicador es 1.5, el envío express costará $15
                              </p>
                            </div>
                          </div>

                          {/* Recargo fijo */}
                          <div className="border border-gray-200 rounded-lg p-4">
                            <label className="flex items-center mb-3">
                              <input
                                type="radio"
                                name="expressMethod"
                                checked={shippingData.localDelivery.express.fixedSurcharge > 0}
                                onChange={() => updateShippingData('localDelivery.express.fixedSurcharge', 5)}
                                className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300"
                              />
                              <span className="ml-2 text-sm font-medium text-gray-700">
                                Recargo fijo sobre el precio estándar
                              </span>
                            </label>

                            <div className="ml-6">
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-500">$</span>
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={shippingData.localDelivery.express.fixedSurcharge}
                                  onChange={(e) => updateShippingData('localDelivery.express.fixedSurcharge', parseInt(e.target.value) || 0)}
                                  className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                                  disabled={shippingData.localDelivery.express.fixedSurcharge === 0}
                                />
                                <span className="text-sm text-gray-500">
                                  adicionales al envío estándar
                                </span>
                              </div>
                              <p className="mt-1 text-xs text-gray-500">
                                Ejemplo: Si el envío estándar cuesta $10 y el recargo es $5, el envío express costará $15
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                    </>
                  )}
                </div>
              </div>
            )}

            {/* Mapa de zonas */}
            {shippingData.localDelivery.enabled && (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Mapa de Zonas de Entrega</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Usa el mapa interactivo para definir las zonas de entrega. Puedes crear zonas circulares o dibujar áreas personalizadas.
                  </p>
                </div>

                {/* Componente del mapa */}
                <DeliveryZoneMap
                  key={`delivery-zone-map-${user?.uid || 'anonymous'}`}
                  isVisible={shippingData.localDelivery.enabled}
                />
              </div>
            )}

            {/* Información adicional */}
            {shippingData.localDelivery.enabled && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h4 className="text-base font-medium text-gray-900 mb-3">Información importante</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>• Las zonas de entrega se guardan automáticamente cuando las creas en el mapa.</p>
                  <p>• Los clientes verán el costo de envío calculado según su dirección durante el checkout.</p>
                  <p>• Si una dirección está en múltiples zonas, se aplicará el precio de la zona más específica (menor área).</p>
                  <p>• Para eliminar una zona, haz clic en ella en el mapa y selecciona "Eliminar zona".</p>
                </div>
              </div>
            )}
          </div>


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
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </DashboardLayout>
  )
} 