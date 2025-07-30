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
  storePickup: {
    enabled: boolean
    address: string
    schedules: Array<{
      day: string
      openTime: string
      closeTime: string
    }>
    preparationTime: string
  }
}

export default function ShippingStorePickupPage() {
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
    storePickup: {
      enabled: false,
      address: '',
      schedules: [],
      preparationTime: ''
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
              storePickup: {
                enabled: existingShipping.storePickup?.enabled ?? false,
                address: existingShipping.storePickup?.address ?? '',
                schedules: existingShipping.storePickup?.schedules ?? [],
                preparationTime: existingShipping.storePickup?.preparationTime ?? ''
              }
            })
          } else {
            // Si no hay datos de shipping, llenar automáticamente la dirección de la tienda
            if (userStore.location?.address && !shippingData.storePickup.address) {
              setShippingData(prev => ({
                ...prev,
                storePickup: {
                  ...prev.storePickup,
                  address: userStore.location?.address || ''
                }
              }))
            } else if (userStore.address && !shippingData.storePickup.address) {
              setShippingData(prev => ({
                ...prev,
                storePickup: {
                  ...prev.storePickup,
                  address: userStore.address || ''
                }
              }))
            }
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

  const addSchedule = () => {
    setShippingData(prev => ({
      ...prev,
      storePickup: {
        ...prev.storePickup,
        schedules: [
          ...prev.storePickup.schedules,
          { day: 'monday', openTime: '09:00', closeTime: '18:00' }
        ]
      }
    }))
  }

  const removeSchedule = (index: number) => {
    setShippingData(prev => ({
      ...prev,
      storePickup: {
        ...prev.storePickup,
        schedules: prev.storePickup.schedules.filter((_, i) => i !== index)
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


          {/* Navegación */}
          <ShippingNav currentSection="store-pickup" />

          {/* Contenido */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración de Recojo en Tienda</h3>
            <p className="text-sm text-gray-600 mb-6">
              Configura las opciones para que los clientes puedan recoger sus pedidos directamente en tu tienda.
            </p>
            
            <div className="space-y-6">
              {/* Habilitar recojo en tienda */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={shippingData.modes.storePickup}
                    onChange={(e) => updateShippingData('modes.storePickup', e.target.checked)}
                    className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Activar recojo en tienda</span>
                </label>
              </div>

              {shippingData.modes.storePickup && (
                <>
                  {/* Dirección de la tienda */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700">
                        Dirección de la tienda
                      </label>
                      {(store?.location?.address || store?.address) && (
                        <button
                          type="button"
                          onClick={() => {
                            const storeAddress = store.location?.address || store.address
                            updateShippingData('storePickup.address', storeAddress)
                          }}
                          className="text-sm text-gray-600 hover:text-gray-800"
                        >
                          Usar dirección de configuración general
                        </button>
                      )}
                    </div>
                    <input
                      type="text"
                      value={shippingData.storePickup.address}
                      onChange={(e) => updateShippingData('storePickup.address', e.target.value)}
                      placeholder="Av. Ejemplo 123, Lima, Perú"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                    />
                    {(store?.location?.address || store?.address) && (
                      <p className="mt-1 text-sm text-gray-500">
                        Dirección guardada en configuración general: {store.location?.address || store.address}
                      </p>
                    )}
                  </div>

                  {/* Tiempo de preparación */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tiempo estimado de preparación
                    </label>
                    <input
                      type="text"
                      value={shippingData.storePickup.preparationTime}
                      onChange={(e) => updateShippingData('storePickup.preparationTime', e.target.value)}
                      placeholder="2-4 horas"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                    />
                  </div>

                  {/* Horarios de recojo */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Horarios de recojo disponibles
                      </label>
                      <button
                        type="button"
                        onClick={addSchedule}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Agregar horario
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                      {shippingData.storePickup.schedules.map((schedule, index) => (
                        <div key={index} className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                          <select
                            value={schedule.day}
                            onChange={(e) => {
                              const newSchedules = [...shippingData.storePickup.schedules]
                              newSchedules[index].day = e.target.value
                              updateShippingData('storePickup.schedules', newSchedules)
                            }}
                            className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                          >
                            <option value="monday">Lunes</option>
                            <option value="tuesday">Martes</option>
                            <option value="wednesday">Miércoles</option>
                            <option value="thursday">Jueves</option>
                            <option value="friday">Viernes</option>
                            <option value="saturday">Sábado</option>
                            <option value="sunday">Domingo</option>
                          </select>
                          
                          <div className="flex items-center space-x-2 w-full sm:w-auto">
                            <input
                              type="time"
                              value={schedule.openTime}
                              onChange={(e) => {
                                const newSchedules = [...shippingData.storePickup.schedules]
                                newSchedules[index].openTime = e.target.value
                                updateShippingData('storePickup.schedules', newSchedules)
                              }}
                              className="flex-1 sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                            />
                            
                            <span className="text-gray-500">-</span>
                            
                            <input
                              type="time"
                              value={schedule.closeTime}
                              onChange={(e) => {
                                const newSchedules = [...shippingData.storePickup.schedules]
                                newSchedules[index].closeTime = e.target.value
                                updateShippingData('storePickup.schedules', newSchedules)
                              }}
                              className="flex-1 sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                            />
                            
                            <button
                              type="button"
                              onClick={() => removeSchedule(index)}
                              className="text-red-600 hover:text-red-800 p-1 flex-shrink-0"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      {shippingData.storePickup.schedules.length === 0 && (
                        <p className="text-sm text-gray-500 italic">
                          No hay horarios configurados. Agrega al menos un horario de recojo.
                        </p>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
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