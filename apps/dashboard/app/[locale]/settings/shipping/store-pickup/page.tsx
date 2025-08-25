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
    locations: Array<{
      id: string
      name: string
    address: string
    schedules: Array<{
      day: string
      openTime: string
      closeTime: string
    }>
    preparationTime: string
    }>
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
      locations: [] as Array<{
        id: string;
        name: string;
        address: string;
        schedules: Array<{
          day: string;
          openTime: string;
          closeTime: string;
        }>;
        preparationTime: string;
      }>
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
            // Convertir la configuración antigua a la nueva estructura
            const oldAddress = existingShipping.storePickup?.address;
            const oldSchedules = existingShipping.storePickup?.schedules || [];
            const oldPreparationTime = existingShipping.storePickup?.preparationTime;

            // Si hay una dirección antigua, crear una sucursal con esos datos
            const initialLocations = oldAddress ? [{
              id: Date.now().toString(),
              name: 'Sucursal Principal',
              address: oldAddress,
              schedules: oldSchedules,
              preparationTime: oldPreparationTime || '2-4 horas'
            }] : [];

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
                locations: existingShipping.storePickup?.locations || initialLocations
              }
            })
          } else {
            // Si no hay datos de shipping, crear una sucursal con la dirección de la tienda
            const storeAddress = userStore.location?.address || userStore.address;
            if (storeAddress) {
              setShippingData(prev => ({
                ...prev,
                storePickup: {
                  ...prev.storePickup,
                  locations: [{
                    id: Date.now().toString(),
                    name: 'Sucursal Principal',
                    address: storeAddress,
                    schedules: [],
                    preparationTime: '2-4 horas'
                  }]
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
      
      // Si se está actualizando modes.storePickup, sincronizar con storePickup.enabled
      if (path === 'modes.storePickup') {
        newData.storePickup.enabled = value
        console.log('🚚 [Dashboard] Sincronizando storePickup.enabled:', value)
      }
      
      return newData
    })
  }

  const addLocation = () => {
    const newLocation = {
      id: Date.now().toString(),
      name: `Sucursal ${shippingData.storePickup.locations.length + 1}`,
      address: '',
      schedules: [],
      preparationTime: '2-4 horas'
    };

    setShippingData(prev => ({
      ...prev,
      storePickup: {
        ...prev.storePickup,
        locations: [...prev.storePickup.locations, newLocation]
      }
    }));
  };

  const removeLocation = (locationId: string) => {
    setShippingData(prev => ({
      ...prev,
      storePickup: {
        ...prev.storePickup,
        locations: prev.storePickup.locations.filter(loc => loc.id !== locationId)
      }
    }));
  };

  const updateLocation = (locationId: string, field: string, value: any) => {
    setShippingData(prev => ({
      ...prev,
      storePickup: {
        ...prev.storePickup,
        locations: prev.storePickup.locations.map(loc => 
          loc.id === locationId ? { ...loc, [field]: value } : loc
        )
      }
    }));
  };

  const addSchedule = (locationId: string) => {
    setShippingData(prev => ({
      ...prev,
      storePickup: {
        ...prev.storePickup,
        locations: prev.storePickup.locations.map(loc => 
          loc.id === locationId ? {
            ...loc,
        schedules: [
              ...loc.schedules,
          { day: 'monday', openTime: '09:00', closeTime: '18:00' }
        ]
          } : loc
        )
      }
    }));
  };

  const removeSchedule = (locationId: string, scheduleIndex: number) => {
    setShippingData(prev => ({
      ...prev,
      storePickup: {
        ...prev.storePickup,
        locations: prev.storePickup.locations.map(loc => 
          loc.id === locationId ? {
            ...loc,
            schedules: loc.schedules.filter((_, i) => i !== scheduleIndex)
          } : loc
        )
      }
    }));
  };

  const updateSchedule = (locationId: string, scheduleIndex: number, field: string, value: string) => {
    setShippingData(prev => ({
      ...prev,
      storePickup: {
        ...prev.storePickup,
        locations: prev.storePickup.locations.map(loc => 
          loc.id === locationId ? {
            ...loc,
            schedules: loc.schedules.map((schedule, i) => 
              i === scheduleIndex ? { ...schedule, [field]: value } : schedule
            )
          } : loc
        )
      }
    }));
  };

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
                  {/* Sucursales */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-base font-medium text-gray-900">Sucursales disponibles para recojo en tienda</h4>
                      <button
                        type="button"
                        onClick={addLocation}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        <svg className="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Agregar sucursal
                      </button>
                    </div>

                    <div className="space-y-6">
                      {shippingData.storePickup.locations.map((location, locationIndex) => (
                        <div key={location.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <input
                                type="text"
                                value={location.name}
                                onChange={(e) => updateLocation(location.id, 'name', e.target.value)}
                                placeholder="Nombre de la sucursal"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500 text-sm font-medium"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeLocation(location.id)}
                              className="ml-2 text-red-600 hover:text-red-800"
                            >
                              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>

                          {/* Dirección */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Dirección
                      </label>
                            <div className="flex items-center">
                              <input
                                type="text"
                                value={location.address}
                                onChange={(e) => updateLocation(location.id, 'address', e.target.value)}
                                placeholder="Av. Ejemplo 123, Lima, Perú"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                              />
                              {locationIndex === 0 && (store?.location?.address || store?.address) && (
                        <button
                          type="button"
                          onClick={() => {
                                    const storeAddress = store.location?.address || store.address;
                                    updateLocation(location.id, 'address', storeAddress);
                          }}
                                  className="ml-2 text-sm text-gray-600 hover:text-gray-800 whitespace-nowrap"
                        >
                                  Usar dirección general
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Tiempo de preparación */}
                          <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tiempo estimado de preparación
                    </label>
                    <input
                      type="text"
                              value={location.preparationTime}
                              onChange={(e) => updateLocation(location.id, 'preparationTime', e.target.value)}
                      placeholder="2-4 horas"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                    />
                  </div>

                          {/* Horarios */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                                Horarios de atención
                      </label>
                      <button
                        type="button"
                                onClick={() => addSchedule(location.id)}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Agregar horario
                      </button>
                    </div>
                    
                    <div className="space-y-2">
                              {location.schedules.map((schedule, index) => (
                        <div key={index} className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                          <select
                            value={schedule.day}
                                    onChange={(e) => updateSchedule(location.id, index, 'day', e.target.value)}
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
                                      onChange={(e) => updateSchedule(location.id, index, 'openTime', e.target.value)}
                              className="flex-1 sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                            />
                            
                            <span className="text-gray-500">-</span>
                            
                            <input
                              type="time"
                              value={schedule.closeTime}
                                      onChange={(e) => updateSchedule(location.id, index, 'closeTime', e.target.value)}
                              className="flex-1 sm:w-auto px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                            />
                            
                            <button
                              type="button"
                                      onClick={() => removeSchedule(location.id, index)}
                              className="text-red-600 hover:text-red-800 p-1 flex-shrink-0"
                            >
                              ×
                            </button>
                          </div>
                        </div>
                      ))}
                      
                              {location.schedules.length === 0 && (
                        <p className="text-sm text-gray-500 italic">
                                  No hay horarios configurados. Agrega al menos un horario de atención.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}

                      {shippingData.storePickup.locations.length === 0 && (
                        <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                          <h3 className="mt-2 text-sm font-medium text-gray-900">No hay sucursales</h3>
                          <p className="mt-1 text-sm text-gray-500">Agrega una sucursal para habilitar el recojo en tienda.</p>
                          <div className="mt-6">
                            <button
                              type="button"
                              onClick={addLocation}
                              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                              <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                              </svg>
                              Agregar primera sucursal
                            </button>
                          </div>
                        </div>
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