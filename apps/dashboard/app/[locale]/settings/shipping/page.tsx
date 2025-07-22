'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '../../../../lib/simple-auth-context'
import { getUserStore, updateStore, StoreWithId } from '../../../../lib/store'
import DashboardLayout from '../../../../components/DashboardLayout'
import DeliveryZoneMap from '../../../../components/settings/DeliveryZoneMap'
import LoadingAnimation from '../../../../components/LoadingAnimation'

export default function ShippingPage() {
  const { user } = useAuth()
  const t = useTranslations('settings.advanced.shipping')
  const [store, setStore] = useState<StoreWithId | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('store-pickup')
  const [shippingData, setShippingData] = useState({
    enabled: true,
    modes: {
      storePickup: false,
      localDelivery: true,
      nationalShipping: false,
      internationalShipping: false
    },
    storePickup: {
      enabled: false,
      address: '',
      schedules: [] as Array<{ day: string; openTime: string; closeTime: string }>,
      preparationTime: ''
    },
    localDelivery: {
      enabled: true,
      zones: []
    },
    nationalShipping: {
      enabled: false,
      type: 'fixed' as 'fixed' | 'by_weight' | 'by_region',
      fixedPrice: 0,
      regions: [] as Array<{ name: string; price: number; estimatedTime?: string }>,
      weightRanges: [] as Array<{ min: number; max: number; price: number }>
    },
    internationalShipping: {
      enabled: false,
      countries: '',
      basePrice: 0,
      weightPrice: 0,
      customsInfo: '',
      estimatedTime: '',
      requiresSignature: false,
      includesInsurance: false,
      hasTracking: false
    },
    freeShipping: {
      enabled: false,
      minimumAmount: 0
    },
    preparationTime: '',
    notifications: {
      email: false,
      whatsapp: false
    },
    customerInfo: {
      generalInfo: '',
      processingTime: '',
      packagingInfo: '',
      trackingInfo: '',
      returnPolicy: '',
      contactInfo: '',
      specialInstructions: '',
      showEstimatedDelivery: true,
      showTrackingInfo: true,
      showReturnPolicy: true
    },
    additionalRules: {
      freeShipping: {
        enabled: false,
        minimumAmount: 0,
        excludeInternational: false,
        applicableCountries: '',
        promoMessage: ''
      },
      expeditedShipping: {
        enabled: false,
        name: 'Envío Express',
        additionalCost: 0,
        timeReduction: '',
        availableForCountries: ''
      },
      handlingFee: {
        enabled: false,
        amount: 0,
        description: '',
        applicableToAll: true
      },
      weightLimits: {
        enabled: false,
        maxWeight: 0,
        overweightFee: 0,
        overweightMessage: ''
      },
      notifications: {
        orderConfirmation: true,
        shippingNotification: true,
        deliveryNotification: true,
        emailNotifications: true,
        smsNotifications: false,
        whatsappNotifications: true
      },
      specialHandling: {
        fragileItems: {
          enabled: false,
          additionalCost: 0,
          message: ''
        },
        signatureRequired: {
          enabled: false,
          additionalCost: 0,
          message: ''
        },
        insuranceOptional: {
          enabled: false,
          costPercentage: 0,
          message: ''
        }
      }
    }
  })

  useEffect(() => {
    const loadStore = async () => {
      if (!user?.uid) return
      
      try {
        const storeData = await getUserStore(user.uid)
        setStore(storeData)
      } catch (error) {
        console.error('Error loading store:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStore()
  }, [user?.uid])

  const handleUpdate = async (data: Partial<StoreWithId>) => {
    if (!store?.id || !user?.uid) return false

    setSaving(true)
    try {
      await updateStore(store.id, data)
      console.log('Store updated successfully')
      return true
    } catch (error) {
      console.error('Error updating store:', error)
      throw error
    } finally {
      setSaving(false)
    }
  }

  const handleShippingDataChange = (data: any) => {
    console.log('Shipping data changed:', data)
    setShippingData(data)
  }

  // Función para actualizar datos de envío
  const updateShippingData = (path: string, value: any) => {
    const keys = path.split('.')
    const newData = { ...shippingData }
    let current: any = newData
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]]
    }
    current[keys[keys.length - 1]] = value
    
    setShippingData(newData)
  }

  // Cargar datos existentes del store
  useEffect(() => {
    if (store) {
      // Cargar datos existentes si están disponibles
      if (store.advanced?.shipping) {
        console.log('Loading existing shipping data from store:', store.advanced.shipping)
        
        // Mergear los datos existentes con los datos por defecto de forma más simple
        const existingShipping = store.advanced.shipping as any
        setShippingData(prevData => ({
          ...prevData,
          enabled: existingShipping.enabled ?? prevData.enabled,
          modes: {
            ...prevData.modes,
            ...(existingShipping.modes || {})
          },
          storePickup: {
            ...prevData.storePickup,
            ...(existingShipping.storePickup || {})
          },
          localDelivery: {
            ...prevData.localDelivery,
            ...(existingShipping.localDelivery || {})
          },
          nationalShipping: {
            ...prevData.nationalShipping,
            ...(existingShipping.nationalShipping || {})
          },
          internationalShipping: {
            ...prevData.internationalShipping,
            ...(existingShipping.internationalShipping || {})
          },
          freeShipping: {
            ...prevData.freeShipping,
            ...(existingShipping.freeShipping || {})
          },
          preparationTime: existingShipping.preparationTime ?? prevData.preparationTime,
          notifications: {
            ...prevData.notifications,
            ...(existingShipping.notifications || {})
          },
          customerInfo: {
            ...prevData.customerInfo,
            ...(existingShipping.customerInfo || {})
          },
          additionalRules: {
            ...prevData.additionalRules,
            ...(existingShipping.additionalRules || {}),
            // Asegurar que las estructuras anidadas se mantengan
            freeShipping: {
              ...prevData.additionalRules.freeShipping,
              ...(existingShipping.additionalRules?.freeShipping || {})
            },
            expeditedShipping: {
              ...prevData.additionalRules.expeditedShipping,
              ...(existingShipping.additionalRules?.expeditedShipping || {})
            },
            handlingFee: {
              ...prevData.additionalRules.handlingFee,
              ...(existingShipping.additionalRules?.handlingFee || {})
            },
            weightLimits: {
              ...prevData.additionalRules.weightLimits,
              ...(existingShipping.additionalRules?.weightLimits || {})
            },
            notifications: {
              ...prevData.additionalRules.notifications,
              ...(existingShipping.additionalRules?.notifications || {})
            },
            specialHandling: {
              ...prevData.additionalRules.specialHandling,
              ...(existingShipping.additionalRules?.specialHandling || {}),
              fragileItems: {
                ...prevData.additionalRules.specialHandling.fragileItems,
                ...(existingShipping.additionalRules?.specialHandling?.fragileItems || {})
              },
              signatureRequired: {
                ...prevData.additionalRules.specialHandling.signatureRequired,
                ...(existingShipping.additionalRules?.specialHandling?.signatureRequired || {})
              },
              insuranceOptional: {
                ...prevData.additionalRules.specialHandling.insuranceOptional,
                ...(existingShipping.additionalRules?.specialHandling?.insuranceOptional || {})
              }
            }
          }
        }))
      } else {
        // Si no hay datos de shipping, llenar automáticamente la dirección de la tienda
        if (store.location?.address && !shippingData.storePickup.address) {
          console.log('Auto-filling store address from general settings:', store.location.address)
          updateShippingData('storePickup.address', store.location.address)
        }
        // Si no hay location.address, intentar con el campo address legacy
        else if (store.address && !shippingData.storePickup.address) {
          console.log('Auto-filling store address from legacy field:', store.address)
          updateShippingData('storePickup.address', store.address)
        }
      }
    }
  }, [store])

  // Definir las pestañas
  const tabs = [
    { id: 'store-pickup', label: 'Recojo en tienda' },
    { id: 'local-delivery', label: 'Envío local' },
    { id: 'national-shipping', label: 'Envío nacional' },
    { id: 'international-shipping', label: 'Envío internacional' },
    { id: 'customer-info', label: 'Información para el cliente' },
    { id: 'additional-rules', label: 'Reglas adicionales' }
  ]

  // Renderizar contenido de cada pestaña
  const renderTabContent = () => {
    switch (activeTab) {
      case 'store-pickup':
        return (
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
                        onClick={() => {
                          const newSchedule = { day: 'Lunes', openTime: '09:00', closeTime: '18:00' }
                          updateShippingData('storePickup.schedules', [...shippingData.storePickup.schedules, newSchedule])
                        }}
                        className="text-sm text-gray-600 hover:text-gray-800"
                      >
                        Agregar horario
                      </button>
                    </div>
                    
                    {shippingData.storePickup.schedules.map((schedule, index) => (
                      <div key={index} className="flex items-center space-x-2 mb-2">
                        <select
                          value={schedule.day}
                          onChange={(e) => {
                            const newSchedules = [...shippingData.storePickup.schedules]
                            newSchedules[index].day = e.target.value
                            updateShippingData('storePickup.schedules', newSchedules)
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                        >
                          <option value="Lunes">Lunes</option>
                          <option value="Martes">Martes</option>
                          <option value="Miércoles">Miércoles</option>
                          <option value="Jueves">Jueves</option>
                          <option value="Viernes">Viernes</option>
                          <option value="Sábado">Sábado</option>
                          <option value="Domingo">Domingo</option>
                        </select>
                        
                        <input
                          type="time"
                          value={schedule.openTime}
                          onChange={(e) => {
                            const newSchedules = [...shippingData.storePickup.schedules]
                            newSchedules[index].openTime = e.target.value
                            updateShippingData('storePickup.schedules', newSchedules)
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
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
                          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                        />
                        
                        <button
                          type="button"
                          onClick={() => {
                            const newSchedules = shippingData.storePickup.schedules.filter((_, i) => i !== index)
                            updateShippingData('storePickup.schedules', newSchedules)
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )
      
      case 'local-delivery':
        return (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración de Envío Local</h3>
              <p className="text-sm text-gray-600 mb-6">
                Define las zonas de entrega local y configura los precios para cada área.
              </p>
              
              {/* Habilitar envío local */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={shippingData.modes.localDelivery}
                    onChange={(e) => updateShippingData('modes.localDelivery', e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-700">Activar envío local</span>
                </label>
              </div>


            </div>

            <div className={shippingData.modes.localDelivery ? 'block' : 'hidden'}>
              <DeliveryZoneMap 
                key={`delivery-zone-map-${user?.uid || 'anonymous'}`}
                isVisible={shippingData.modes.localDelivery && activeTab === 'local-delivery'}
              />
            </div>
          </div>
        )
      
      case 'national-shipping':
        return (
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
                  />
                  <span className="ml-2 text-sm text-gray-700">Activar envío nacional</span>
                </label>
              </div>

              {shippingData.modes.nationalShipping && (
                <>
                  {/* Tipo de envío nacional */}
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
                  </div>

                  {/* Precio fijo */}
                  {shippingData.nationalShipping.type === 'fixed' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Precio fijo de envío nacional (S/)
                      </label>
                      <input
                        type="number"
                        value={shippingData.nationalShipping.fixedPrice || ''}
                        onChange={(e) => updateShippingData('nationalShipping.fixedPrice', Number(e.target.value))}
                        placeholder="15.00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                      />
                    </div>
                  )}

                  {/* Precio por región */}
                  {shippingData.nationalShipping.type === 'by_region' && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Regiones de envío
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const newRegion = { name: '', price: 0, estimatedTime: '' }
                            updateShippingData('nationalShipping.regions', [...shippingData.nationalShipping.regions, newRegion])
                          }}
                          className="text-sm text-gray-600 hover:text-gray-800"
                        >
                          Agregar región
                        </button>
                      </div>

                      {shippingData.nationalShipping.regions.map((region, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <input
                            type="text"
                            value={region.name}
                            onChange={(e) => {
                              const newRegions = [...shippingData.nationalShipping.regions]
                              newRegions[index].name = e.target.value
                              updateShippingData('nationalShipping.regions', newRegions)
                            }}
                            placeholder="Nombre de la región"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                          />
                          <input
                            type="number"
                            value={region.price || ''}
                            onChange={(e) => {
                              const newRegions = [...shippingData.nationalShipping.regions]
                              newRegions[index].price = Number(e.target.value)
                              updateShippingData('nationalShipping.regions', newRegions)
                            }}
                            placeholder="Precio"
                            className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                          />
                          <input
                            type="text"
                            value={region.estimatedTime || ''}
                            onChange={(e) => {
                              const newRegions = [...shippingData.nationalShipping.regions]
                              newRegions[index].estimatedTime = e.target.value
                              updateShippingData('nationalShipping.regions', newRegions)
                            }}
                            placeholder="Tiempo"
                            className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newRegions = shippingData.nationalShipping.regions.filter((_, i) => i !== index)
                              updateShippingData('nationalShipping.regions', newRegions)
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Precio por peso */}
                  {shippingData.nationalShipping.type === 'by_weight' && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Rangos de peso
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const newRange = { min: 0, max: 1, price: 0 }
                            updateShippingData('nationalShipping.weightRanges', [...shippingData.nationalShipping.weightRanges, newRange])
                          }}
                          className="text-sm text-gray-600 hover:text-gray-800"
                        >
                          Agregar rango
                        </button>
                      </div>

                      {shippingData.nationalShipping.weightRanges.map((range, index) => (
                        <div key={index} className="flex items-center space-x-2 mb-2">
                          <input
                            type="number"
                            value={range.min || ''}
                            onChange={(e) => {
                              const newRanges = [...shippingData.nationalShipping.weightRanges]
                              newRanges[index].min = Number(e.target.value)
                              updateShippingData('nationalShipping.weightRanges', newRanges)
                            }}
                            placeholder="Min (kg)"
                            className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                          />
                          <span className="text-gray-500">-</span>
                          <input
                            type="number"
                            value={range.max || ''}
                            onChange={(e) => {
                              const newRanges = [...shippingData.nationalShipping.weightRanges]
                              newRanges[index].max = Number(e.target.value)
                              updateShippingData('nationalShipping.weightRanges', newRanges)
                            }}
                            placeholder="Max (kg)"
                            className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                          />
                          <input
                            type="number"
                            value={range.price || ''}
                            onChange={(e) => {
                              const newRanges = [...shippingData.nationalShipping.weightRanges]
                              newRanges[index].price = Number(e.target.value)
                              updateShippingData('nationalShipping.weightRanges', newRanges)
                            }}
                            placeholder="Precio (S/)"
                            className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newRanges = shippingData.nationalShipping.weightRanges.filter((_, i) => i !== index)
                              updateShippingData('nationalShipping.weightRanges', newRanges)
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )
      
      case 'international-shipping':
        return (
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
                  />
                  <span className="ml-2 text-sm text-gray-700">Activar envío internacional</span>
                </label>
              </div>

              {shippingData.modes.internationalShipping && (
                <>
                  {/* Países de destino */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Países de destino
                    </label>
                    <textarea
                      value={shippingData.internationalShipping.countries}
                      onChange={(e) => updateShippingData('internationalShipping.countries', e.target.value)}
                      placeholder="Ej: Estados Unidos, Canadá, México, España, Francia..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Escribe los países separados por comas donde realizas envíos internacionales
                    </p>
                  </div>

                  {/* Precio base */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio base de envío internacional (USD)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={shippingData.internationalShipping.basePrice || ''}
                      onChange={(e) => updateShippingData('internationalShipping.basePrice', Number(e.target.value))}
                      placeholder="25.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Precio fijo base para envíos internacionales
                    </p>
                  </div>

                  {/* Precio por peso */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio adicional por kg (USD)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={shippingData.internationalShipping.weightPrice || ''}
                      onChange={(e) => updateShippingData('internationalShipping.weightPrice', Number(e.target.value))}
                      placeholder="5.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Costo adicional por cada kilogramo de peso
                    </p>
                  </div>

                  {/* Tiempo estimado de entrega */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tiempo estimado de entrega
                    </label>
                    <input
                      type="text"
                      value={shippingData.internationalShipping.estimatedTime || ''}
                      onChange={(e) => updateShippingData('internationalShipping.estimatedTime', e.target.value)}
                      placeholder="10-15 días hábiles"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                    />
                  </div>

                  {/* Información de aduanas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Información adicional sobre aduanas y restricciones
                    </label>
                    <textarea
                      value={shippingData.internationalShipping.customsInfo}
                      onChange={(e) => updateShippingData('internationalShipping.customsInfo', e.target.value)}
                      placeholder="Información importante sobre documentación aduanera, restricciones, impuestos que el cliente debe considerar..."
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Esta información se mostrará a los clientes durante el checkout
                    </p>
                  </div>

                  {/* Configuraciones adicionales */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Configuraciones adicionales</h4>
                    
                    <div className="space-y-3">
                      {/* Requiere firma */}
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={shippingData.internationalShipping.requiresSignature || false}
                          onChange={(e) => updateShippingData('internationalShipping.requiresSignature', e.target.checked)}
                        />
                        <span className="ml-2 text-sm text-gray-700">Requiere firma del destinatario</span>
                      </label>

                      {/* Incluye seguro */}
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={shippingData.internationalShipping.includesInsurance || false}
                          onChange={(e) => updateShippingData('internationalShipping.includesInsurance', e.target.checked)}
                        />
                        <span className="ml-2 text-sm text-gray-700">Incluye seguro de envío</span>
                      </label>

                      {/* Tracking disponible */}
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={shippingData.internationalShipping.hasTracking || false}
                          onChange={(e) => updateShippingData('internationalShipping.hasTracking', e.target.checked)}
                        />
                        <span className="ml-2 text-sm text-gray-700">Incluye número de seguimiento</span>
                      </label>
                    </div>
                  </div>

                  {/* Calculadora de ejemplo */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">Calculadora de ejemplo</h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Ejemplo de cálculo para un paquete de 2 kg:
                    </p>
                    <div className="text-sm text-blue-800">
                      <div>Precio base: ${shippingData.internationalShipping.basePrice || 0}</div>
                      <div>Peso adicional: ${((shippingData.internationalShipping.weightPrice || 0) * 2).toFixed(2)} (2 kg × ${shippingData.internationalShipping.weightPrice || 0})</div>
                      <div className="font-medium border-t border-blue-300 mt-2 pt-2">
                        Total: ${((shippingData.internationalShipping.basePrice || 0) + ((shippingData.internationalShipping.weightPrice || 0) * 2)).toFixed(2)} USD
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )
      
      case 'customer-info':
        return (
          <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información para el Cliente</h3>
            <p className="text-sm text-gray-600 mb-6">
                Configura la información que verán los clientes sobre los envíos durante el proceso de compra.
              </p>
              
              <div className="space-y-6">
                {/* Información general de envíos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Información general de envíos
                  </label>
                  <textarea
                    value={shippingData.customerInfo.generalInfo}
                    onChange={(e) => updateShippingData('customerInfo.generalInfo', e.target.value)}
                    placeholder="Ejemplo: Realizamos envíos a nivel nacional e internacional. Todos nuestros productos son empacados con cuidado para garantizar que lleguen en perfectas condiciones."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Información general que se mostrará a todos los clientes sobre tus envíos
                  </p>
                </div>

                {/* Tiempo de procesamiento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiempo de procesamiento
                  </label>
                  <input
                    type="text"
                    value={shippingData.customerInfo.processingTime}
                    onChange={(e) => updateShippingData('customerInfo.processingTime', e.target.value)}
                    placeholder="Ejemplo: Los pedidos se procesan en 1-2 días hábiles"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Cuánto tiempo toma preparar y enviar el pedido
                  </p>
                </div>

                {/* Información de empaque */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Información sobre empaque
                  </label>
                  <textarea
                    value={shippingData.customerInfo.packagingInfo}
                    onChange={(e) => updateShippingData('customerInfo.packagingInfo', e.target.value)}
                    placeholder="Ejemplo: Utilizamos materiales de empaque ecológicos y cada producto se embala individualmente para mayor protección."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Describe cómo empacas los productos
                  </p>
                </div>

                {/* Información de seguimiento */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Información sobre seguimiento
                  </label>
                  <textarea
                    value={shippingData.customerInfo.trackingInfo}
                    onChange={(e) => updateShippingData('customerInfo.trackingInfo', e.target.value)}
                    placeholder="Ejemplo: Recibirás un número de seguimiento por email una vez que tu pedido sea enviado. Podrás rastrear tu paquete en tiempo real."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Explica cómo los clientes pueden rastrear sus pedidos
                  </p>
                </div>

                {/* Política de devoluciones */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Política de devoluciones y cambios
                  </label>
                  <textarea
                    value={shippingData.customerInfo.returnPolicy}
                    onChange={(e) => updateShippingData('customerInfo.returnPolicy', e.target.value)}
                    placeholder="Ejemplo: Aceptamos devoluciones dentro de los 30 días posteriores a la entrega. El producto debe estar en su estado original. Los gastos de envío de devolución corren por cuenta del cliente."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Política clara sobre devoluciones, cambios y reembolsos
                  </p>
                </div>

                {/* Información de contacto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Información de contacto para envíos
                  </label>
                  <textarea
                    value={shippingData.customerInfo.contactInfo}
                    onChange={(e) => updateShippingData('customerInfo.contactInfo', e.target.value)}
                    placeholder="Ejemplo: Para preguntas sobre tu envío, contáctanos al WhatsApp +51 999 999 999 o email: envios@tutienda.com"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Cómo pueden contactarte los clientes para preguntas sobre envíos
                  </p>
                </div>

                {/* Instrucciones especiales */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instrucciones especiales
                  </label>
                  <textarea
                    value={shippingData.customerInfo.specialInstructions}
                    onChange={(e) => updateShippingData('customerInfo.specialInstructions', e.target.value)}
                    placeholder="Ejemplo: Para productos frágiles, se cobra un costo adicional de empaque especial. Los envíos a zonas rurales pueden tomar 1-2 días adicionales."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Instrucciones adicionales o casos especiales
                  </p>
                </div>
              </div>
            </div>

            {/* Configuraciones de visualización */}
            <div className="bg-white shadow rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Configuraciones de Visualización</h4>
              <p className="text-sm text-gray-600 mb-4">
                Controla qué información se muestra automáticamente a los clientes.
              </p>

              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={shippingData.customerInfo.showEstimatedDelivery}
                    onChange={(e) => updateShippingData('customerInfo.showEstimatedDelivery', e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-700">Mostrar tiempo estimado de entrega</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={shippingData.customerInfo.showTrackingInfo}
                    onChange={(e) => updateShippingData('customerInfo.showTrackingInfo', e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-700">Mostrar información de seguimiento</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={shippingData.customerInfo.showReturnPolicy}
                    onChange={(e) => updateShippingData('customerInfo.showReturnPolicy', e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-700">Mostrar política de devoluciones en checkout</span>
                </label>
              </div>
            </div>

            {/* Vista previa */}
            <div className="bg-white shadow rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Vista Previa</h4>
              <p className="text-sm text-gray-600 mb-4">
                Así es como verán los clientes la información de envíos:
              </p>

              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="space-y-3">
                  {shippingData.customerInfo.generalInfo && (
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm">Información de Envíos</h5>
                      <p className="text-sm text-gray-700 mt-1">{shippingData.customerInfo.generalInfo}</p>
                    </div>
                  )}

                  {shippingData.customerInfo.processingTime && (
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm">Tiempo de Procesamiento</h5>
                      <p className="text-sm text-gray-700 mt-1">{shippingData.customerInfo.processingTime}</p>
                    </div>
                  )}

                  {shippingData.customerInfo.showEstimatedDelivery && (
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm">Tiempo Estimado de Entrega</h5>
                      <p className="text-sm text-gray-700 mt-1">Se calculará según el método de envío seleccionado</p>
                    </div>
                  )}

                  {shippingData.customerInfo.showTrackingInfo && shippingData.customerInfo.trackingInfo && (
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm">Seguimiento</h5>
                      <p className="text-sm text-gray-700 mt-1">{shippingData.customerInfo.trackingInfo}</p>
                    </div>
                  )}

                  {shippingData.customerInfo.showReturnPolicy && shippingData.customerInfo.returnPolicy && (
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm">Política de Devoluciones</h5>
                      <p className="text-sm text-gray-700 mt-1">{shippingData.customerInfo.returnPolicy}</p>
                    </div>
                  )}

                  {shippingData.customerInfo.contactInfo && (
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm">Contacto</h5>
                      <p className="text-sm text-gray-700 mt-1">{shippingData.customerInfo.contactInfo}</p>
                    </div>
                  )}

                  {(!shippingData.customerInfo.generalInfo && !shippingData.customerInfo.processingTime && !shippingData.customerInfo.trackingInfo) && (
                    <p className="text-sm text-gray-500 italic">Agrega información arriba para ver la vista previa</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      
      case 'additional-rules':
        return (
          <div className="space-y-6">
            {/* Envío Gratis */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Envío Gratis</h3>
              <p className="text-sm text-gray-600 mb-4">
                Configura reglas para ofrecer envío gratuito a tus clientes.
              </p>

              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={shippingData.additionalRules.freeShipping.enabled}
                    onChange={(e) => updateShippingData('additionalRules.freeShipping.enabled', e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-700">Activar envío gratis</span>
                </label>

                {shippingData.additionalRules.freeShipping.enabled && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Monto mínimo para envío gratis (S/)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={shippingData.additionalRules.freeShipping.minimumAmount || ''}
                        onChange={(e) => updateShippingData('additionalRules.freeShipping.minimumAmount', Number(e.target.value))}
                        placeholder="100.00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mensaje promocional
                      </label>
                      <input
                        type="text"
                        value={shippingData.additionalRules.freeShipping.promoMessage}
                        onChange={(e) => updateShippingData('additionalRules.freeShipping.promoMessage', e.target.value)}
                        placeholder="¡Envío gratis en compras mayores a S/ 100!"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                      />
                    </div>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={shippingData.additionalRules.freeShipping.excludeInternational}
                        onChange={(e) => updateShippingData('additionalRules.freeShipping.excludeInternational', e.target.checked)}
                      />
                      <span className="ml-2 text-sm text-gray-700">Excluir envíos internacionales</span>
                    </label>
                  </>
                )}
              </div>
            </div>

            {/* Envío Express */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Envío Express</h3>
              <p className="text-sm text-gray-600 mb-4">
                Ofrece una opción de envío más rápido con costo adicional.
              </p>

              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={shippingData.additionalRules.expeditedShipping.enabled}
                    onChange={(e) => updateShippingData('additionalRules.expeditedShipping.enabled', e.target.checked)}
                  />
                  <span className="ml-2 text-sm text-gray-700">Activar envío express</span>
                </label>

                {shippingData.additionalRules.expeditedShipping.enabled && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del servicio
                      </label>
                      <input
                        type="text"
                        value={shippingData.additionalRules.expeditedShipping.name}
                        onChange={(e) => updateShippingData('additionalRules.expeditedShipping.name', e.target.value)}
                        placeholder="Envío Express"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Costo adicional (S/)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={shippingData.additionalRules.expeditedShipping.additionalCost || ''}
                        onChange={(e) => updateShippingData('additionalRules.expeditedShipping.additionalCost', Number(e.target.value))}
                        placeholder="15.00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reducción de tiempo
                      </label>
                      <input
                        type="text"
                        value={shippingData.additionalRules.expeditedShipping.timeReduction}
                        onChange={(e) => updateShippingData('additionalRules.expeditedShipping.timeReduction', e.target.value)}
                        placeholder="Entrega en 24-48 horas"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Tarifas y Límites */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tarifas y Límites</h3>
              
              <div className="space-y-6">
                {/* Tarifa de manejo */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Tarifa de Manejo</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={shippingData.additionalRules.handlingFee.enabled}
                        onChange={(e) => updateShippingData('additionalRules.handlingFee.enabled', e.target.checked)}
                      />
                      <span className="ml-2 text-sm text-gray-700">Activar tarifa de manejo</span>
                    </label>

                    {shippingData.additionalRules.handlingFee.enabled && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Monto de la tarifa (S/)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={shippingData.additionalRules.handlingFee.amount || ''}
                            onChange={(e) => updateShippingData('additionalRules.handlingFee.amount', Number(e.target.value))}
                            placeholder="5.00"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Descripción
                          </label>
                          <input
                            type="text"
                            value={shippingData.additionalRules.handlingFee.description}
                            onChange={(e) => updateShippingData('additionalRules.handlingFee.description', e.target.value)}
                            placeholder="Tarifa por empaque y manejo"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Límites de peso */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Límites de Peso</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={shippingData.additionalRules.weightLimits.enabled}
                        onChange={(e) => updateShippingData('additionalRules.weightLimits.enabled', e.target.checked)}
                      />
                      <span className="ml-2 text-sm text-gray-700">Activar límites de peso</span>
                    </label>

                    {shippingData.additionalRules.weightLimits.enabled && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Peso máximo sin cargo adicional (kg)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            value={shippingData.additionalRules.weightLimits.maxWeight || ''}
                            onChange={(e) => updateShippingData('additionalRules.weightLimits.maxWeight', Number(e.target.value))}
                            placeholder="5.0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tarifa por exceso de peso (S/ por kg adicional)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={shippingData.additionalRules.weightLimits.overweightFee || ''}
                            onChange={(e) => updateShippingData('additionalRules.weightLimits.overweightFee', Number(e.target.value))}
                            placeholder="2.00"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mensaje para exceso de peso
                          </label>
                          <input
                            type="text"
                            value={shippingData.additionalRules.weightLimits.overweightMessage}
                            onChange={(e) => updateShippingData('additionalRules.weightLimits.overweightMessage', e.target.value)}
                            placeholder="Se aplicará un cargo adicional por exceso de peso"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Notificaciones */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notificaciones</h3>
              <p className="text-sm text-gray-600 mb-4">
                Configura qué notificaciones enviar a los clientes durante el proceso de envío.
              </p>

              <div className="space-y-4">
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Eventos de notificación</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={shippingData.additionalRules.notifications.orderConfirmation}
                        onChange={(e) => updateShippingData('additionalRules.notifications.orderConfirmation', e.target.checked)}
                      />
                      <span className="ml-2 text-sm text-gray-700">Confirmación de pedido</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={shippingData.additionalRules.notifications.shippingNotification}
                        onChange={(e) => updateShippingData('additionalRules.notifications.shippingNotification', e.target.checked)}
                      />
                      <span className="ml-2 text-sm text-gray-700">Pedido enviado</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={shippingData.additionalRules.notifications.deliveryNotification}
                        onChange={(e) => updateShippingData('additionalRules.notifications.deliveryNotification', e.target.checked)}
                      />
                      <span className="ml-2 text-sm text-gray-700">Pedido entregado</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Canales de notificación</h4>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={shippingData.additionalRules.notifications.emailNotifications}
                        onChange={(e) => updateShippingData('additionalRules.notifications.emailNotifications', e.target.checked)}
                      />
                      <span className="ml-2 text-sm text-gray-700">Email</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={shippingData.additionalRules.notifications.whatsappNotifications}
                        onChange={(e) => updateShippingData('additionalRules.notifications.whatsappNotifications', e.target.checked)}
                      />
                      <span className="ml-2 text-sm text-gray-700">WhatsApp</span>
                    </label>

                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={shippingData.additionalRules.notifications.smsNotifications}
                        onChange={(e) => updateShippingData('additionalRules.notifications.smsNotifications', e.target.checked)}
                      />
                      <span className="ml-2 text-sm text-gray-700">SMS</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Manejo Especial */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Manejo Especial</h3>
              <p className="text-sm text-gray-600 mb-4">
                Configura servicios adicionales opcionales para productos que requieren cuidado especial.
              </p>

              <div className="space-y-6">
                {/* Productos frágiles */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Productos Frágiles</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={shippingData.additionalRules.specialHandling.fragileItems.enabled}
                        onChange={(e) => updateShippingData('additionalRules.specialHandling.fragileItems.enabled', e.target.checked)}
                      />
                      <span className="ml-2 text-sm text-gray-700">Ofrecer empaque especial para productos frágiles</span>
                    </label>

                    {shippingData.additionalRules.specialHandling.fragileItems.enabled && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Costo adicional (S/)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={shippingData.additionalRules.specialHandling.fragileItems.additionalCost || ''}
                            onChange={(e) => updateShippingData('additionalRules.specialHandling.fragileItems.additionalCost', Number(e.target.value))}
                            placeholder="8.00"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mensaje para el cliente
                          </label>
                          <input
                            type="text"
                            value={shippingData.additionalRules.specialHandling.fragileItems.message}
                            onChange={(e) => updateShippingData('additionalRules.specialHandling.fragileItems.message', e.target.value)}
                            placeholder="Empaque especial para proteger productos frágiles"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Firma requerida */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Firma Requerida</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={shippingData.additionalRules.specialHandling.signatureRequired.enabled}
                        onChange={(e) => updateShippingData('additionalRules.specialHandling.signatureRequired.enabled', e.target.checked)}
                      />
                      <span className="ml-2 text-sm text-gray-700">Ofrecer entrega con firma requerida</span>
                    </label>

                    {shippingData.additionalRules.specialHandling.signatureRequired.enabled && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Costo adicional (S/)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={shippingData.additionalRules.specialHandling.signatureRequired.additionalCost || ''}
                            onChange={(e) => updateShippingData('additionalRules.specialHandling.signatureRequired.additionalCost', Number(e.target.value))}
                            placeholder="5.00"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mensaje para el cliente
                          </label>
                          <input
                            type="text"
                            value={shippingData.additionalRules.specialHandling.signatureRequired.message}
                            onChange={(e) => updateShippingData('additionalRules.specialHandling.signatureRequired.message', e.target.value)}
                            placeholder="Garantiza que tu paquete sea entregado en persona"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Seguro opcional */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">Seguro Opcional</h4>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={shippingData.additionalRules.specialHandling.insuranceOptional.enabled}
                        onChange={(e) => updateShippingData('additionalRules.specialHandling.insuranceOptional.enabled', e.target.checked)}
                      />
                      <span className="ml-2 text-sm text-gray-700">Ofrecer seguro adicional para el envío</span>
                    </label>

                    {shippingData.additionalRules.specialHandling.insuranceOptional.enabled && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Porcentaje del valor del pedido (%)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={shippingData.additionalRules.specialHandling.insuranceOptional.costPercentage || ''}
                            onChange={(e) => updateShippingData('additionalRules.specialHandling.insuranceOptional.costPercentage', Number(e.target.value))}
                            placeholder="2.5"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mensaje para el cliente
                          </label>
                          <input
                            type="text"
                            value={shippingData.additionalRules.specialHandling.insuranceOptional.message}
                            onChange={(e) => updateShippingData('additionalRules.specialHandling.insuranceOptional.message', e.target.value)}
                            placeholder="Protege tu compra contra pérdida o daño durante el envío"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      
      default:
        return null
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

          {/* Pestañas de navegación */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav 
                className="flex space-x-8 overflow-x-auto px-4 sm:px-0 scrollbar-none" 
                style={{
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-3 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                      activeTab === tab.id
                        ? 'border-gray-600 text-gray-800'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Contenido de la pestaña activa */}
          <div className="mb-8">
            {renderTabContent()}
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

          {/* Botón de guardar global */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={async () => {
                try {
                  console.log('Saving shipping data:', shippingData)
                  
                  // Guardar los datos de shipping en el campo advanced.shipping
                  await handleUpdate({
                    advanced: {
                      ...store?.advanced,
                      shipping: shippingData as any
                    }
                  })
                  
                  console.log('Shipping data saved successfully')
                  setSaveMessage('Configuración de envíos guardada exitosamente')
                  
                  // Limpiar mensaje después de 3 segundos
                  setTimeout(() => setSaveMessage(null), 3000)
                } catch (error) {
                  console.error('Error saving shipping data:', error)
                  setSaveMessage('Error al guardar la configuración. Inténtalo de nuevo.')
                  
                  // Limpiar mensaje después de 5 segundos
                  setTimeout(() => setSaveMessage(null), 5000)
                }
              }}
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