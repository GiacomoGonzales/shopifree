'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import DashboardLayout from '../../../../../components/DashboardLayout'
import ShippingNav from '../../../../../components/settings/ShippingNav'
import DeliveryZoneMap from '../../../../../components/settings/DeliveryZoneMap'
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
  localDelivery: {
    enabled: boolean
    zones: Array<{
      id: string
      name: string
      type: 'polygon' | 'radius'
      coordinates?: Array<{ lat: number; lng: number }>
      center?: { lat: number; lng: number }
      radius?: number
      price: number
      estimatedTime?: string
    }>
    allowGPS?: boolean
    noCoverageMessage?: string
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
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

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
      zones: [],
      allowGPS: true,
      noCoverageMessage: 'Lo sentimos, no hacemos entregas en tu zona'
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
                zones: existingShipping.localDelivery?.zones ?? [],
                allowGPS: existingShipping.localDelivery?.allowGPS ?? true,
                noCoverageMessage: existingShipping.localDelivery?.noCoverageMessage ?? 'Lo sentimos, no hacemos entregas en tu zona'
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
                      checked={shippingData.modes.localDelivery}
                      onChange={(e) => updateShippingData('modes.localDelivery', e.target.checked)}
                      className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Activar envío local</span>
                  </label>
                </div>

                {shippingData.modes.localDelivery && (
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

            {/* Mapa de zonas */}
            {shippingData.modes.localDelivery && (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Mapa de Zonas de Entrega</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Usa el mapa interactivo para definir las zonas de entrega. Puedes crear zonas circulares o dibujar áreas personalizadas.
                  </p>
                  
                  {/* Instrucciones */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h5 className="text-sm font-medium text-blue-900 mb-2">Cómo usar el mapa:</h5>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>• <strong>Polígono:</strong> Haz clic en el ícono de polígono y dibuja el área de entrega punto por punto</li>
                      <li>• <strong>Círculo:</strong> Haz clic en el ícono de círculo y dibuja un área circular</li>
                      <li>• <strong>Configurar:</strong> Después de dibujar, configura el nombre, precio y tiempo estimado</li>
                      <li>• <strong>Gestionar:</strong> Haz clic en una zona existente para ver información o eliminarla</li>
                    </ul>
                  </div>
                </div>

                {/* Componente del mapa */}
                <DeliveryZoneMap 
                  key={`delivery-zone-map-${user?.uid || 'anonymous'}`}
                  isVisible={shippingData.modes.localDelivery}
                />
              </div>
            )}

            {/* Información adicional */}
            {shippingData.modes.localDelivery && (
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