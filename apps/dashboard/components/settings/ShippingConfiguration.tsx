'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { StoreWithId } from '../../lib/store'
import DeliveryZoneMap from './DeliveryZoneMap'

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
    allowGPS: boolean
    noCoverageMessage: string
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
  internationalShipping: {
    enabled: boolean
    countries: string[]
    basePrice: number
    weightRate?: number
    volumeRate?: number
    customMessage?: string
    customsInfo: {
      restrictedCategories: string[]
      additionalInfo?: string
    }
  }
  freeShipping: {
    enabled: boolean
    minimumAmount?: number
    applicableProducts: string[]
  }
  preparationTime: string
  notifications: {
    email: boolean
    whatsapp: boolean
  }
  displayInfo: {
    showEstimatedTimes: boolean
    showPricesInCheckout: boolean
    policyText?: string
    policyUrl?: string
  }
}

interface ShippingConfigurationProps {
  store?: StoreWithId | null
  onUpdate: (data: Partial<StoreWithId>) => Promise<boolean>
  saving: boolean
  onShippingDataChange?: (data: ShippingData) => void
}

export default function ShippingConfiguration({ store, onUpdate, saving, onShippingDataChange }: ShippingConfigurationProps) {
  const t = useTranslations('settings.advanced.shipping')
  const tActions = useTranslations('settings.actions')
  
  const [shippingData, setShippingData] = useState<ShippingData>({
    enabled: false,
    modes: {
      storePickup: false,
      localDelivery: false,
      nationalShipping: false,
      internationalShipping: false
    },
    storePickup: {
      enabled: true, // Siempre habilitado cuando se selecciona el modo
      address: '',
      schedules: [],
      preparationTime: ''
    },
    localDelivery: {
      enabled: true, // Siempre habilitado cuando se selecciona el modo
      zones: [],
      allowGPS: true,
      noCoverageMessage: ''
    },
    nationalShipping: {
      enabled: true, // Siempre habilitado cuando se selecciona el modo
      type: 'fixed',
      regions: [],
      weightRanges: [],
      carrier: {},
      automaticRates: {
        enabled: false
      }
    },
    internationalShipping: {
      enabled: true, // Siempre habilitado cuando se selecciona el modo
      countries: [],
      basePrice: 0,
      customsInfo: {
        restrictedCategories: []
      }
    },
    freeShipping: {
      enabled: false,
      applicableProducts: []
    },
    preparationTime: '',
    notifications: {
      email: true,
      whatsapp: false
    },
    displayInfo: {
      showEstimatedTimes: true,
      showPricesInCheckout: true
    }
  })

  // Cargar datos existentes cuando se monta el componente
  useEffect(() => {
    if (store?.advanced?.shipping) {
      const existingShipping = store.advanced.shipping
      console.log('Loading existing shipping data:', existingShipping)
      setShippingData(prev => ({
        ...prev,
        enabled: existingShipping.enabled || false,
        modes: {
          storePickup: existingShipping.modes?.storePickup || false,
          localDelivery: existingShipping.modes?.localDelivery || false,
          nationalShipping: existingShipping.modes?.nationalShipping || false,
          internationalShipping: existingShipping.modes?.internationalShipping || false
        },
        storePickup: {
          enabled: true,
          address: existingShipping.storePickup?.address || '',
          schedules: existingShipping.storePickup?.schedules || [],
          preparationTime: existingShipping.storePickup?.preparationTime || ''
        },
        localDelivery: {
          enabled: true,
          zones: existingShipping.localDelivery?.zones || [],
          allowGPS: existingShipping.localDelivery?.allowGPS !== undefined ? existingShipping.localDelivery.allowGPS : true,
          noCoverageMessage: existingShipping.localDelivery?.noCoverageMessage || ''
        },
        nationalShipping: {
          enabled: true,
          type: existingShipping.nationalShipping?.type || 'fixed',
          ...(existingShipping.nationalShipping?.fixedPrice !== undefined && { fixedPrice: existingShipping.nationalShipping.fixedPrice }),
          regions: existingShipping.nationalShipping?.regions || [],
          weightRanges: existingShipping.nationalShipping?.weightRanges || [],
          carrier: existingShipping.nationalShipping?.carrier || {},
          automaticRates: {
            enabled: existingShipping.nationalShipping?.automaticRates?.enabled || false,
            ...(existingShipping.nationalShipping?.automaticRates?.apiKey && { apiKey: existingShipping.nationalShipping.automaticRates.apiKey })
          }
        },
        internationalShipping: {
          enabled: true,
          countries: existingShipping.internationalShipping?.countries || [],
          basePrice: existingShipping.internationalShipping?.basePrice || 0,
          ...(existingShipping.internationalShipping?.weightRate !== undefined && { weightRate: existingShipping.internationalShipping.weightRate }),
          ...(existingShipping.internationalShipping?.volumeRate !== undefined && { volumeRate: existingShipping.internationalShipping.volumeRate }),
          ...(existingShipping.internationalShipping?.customMessage && { customMessage: existingShipping.internationalShipping.customMessage }),
          customsInfo: {
            restrictedCategories: existingShipping.internationalShipping?.customsInfo?.restrictedCategories || [],
            ...(existingShipping.internationalShipping?.customsInfo?.additionalInfo && { additionalInfo: existingShipping.internationalShipping.customsInfo.additionalInfo })
          }
        },
        freeShipping: {
          enabled: existingShipping.freeShipping?.enabled || false,
          ...(existingShipping.freeShipping?.minimumAmount !== undefined && { minimumAmount: existingShipping.freeShipping.minimumAmount }),
          applicableProducts: existingShipping.freeShipping?.applicableProducts || []
        },
        preparationTime: existingShipping.preparationTime || '',
        notifications: {
          email: existingShipping.notifications?.email !== undefined ? existingShipping.notifications.email : true,
          whatsapp: existingShipping.notifications?.whatsapp || false
        },
        displayInfo: {
          showEstimatedTimes: existingShipping.displayInfo?.showEstimatedTimes !== undefined ? existingShipping.displayInfo.showEstimatedTimes : true,
          showPricesInCheckout: existingShipping.displayInfo?.showPricesInCheckout !== undefined ? existingShipping.displayInfo.showPricesInCheckout : true,
          ...(existingShipping.displayInfo?.policyText && { policyText: existingShipping.displayInfo.policyText }),
          ...(existingShipping.displayInfo?.policyUrl && { policyUrl: existingShipping.displayInfo.policyUrl })
        }
      }))
    }
  }, [store])



  // Notificar al componente padre cuando cambien los datos
  useEffect(() => {
    if (onShippingDataChange) {
      onShippingDataChange(shippingData)
    }
  }, [shippingData, onShippingDataChange])

  const updateShippingData = (path: string, value: any) => {
    setShippingData(prev => {
      const newData = { ...prev }
      const keys = path.split('.')
      let current: any = newData
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {}
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

  const addZone = () => {
    const newZone = {
      id: Date.now().toString(),
      name: '',
      type: 'radius' as const,
      center: { lat: -12.0464, lng: -77.0428 }, // Lima default
      radius: 5,
      price: 0
    }
    
    setShippingData(prev => ({
      ...prev,
      localDelivery: {
        ...prev.localDelivery,
        zones: [...prev.localDelivery.zones, newZone]
      }
    }))
  }

  const removeZone = (zoneId: string) => {
    setShippingData(prev => ({
      ...prev,
      localDelivery: {
        ...prev.localDelivery,
        zones: prev.localDelivery.zones.filter(zone => zone.id !== zoneId)
      }
    }))
  }

  const addRegion = () => {
    setShippingData(prev => ({
      ...prev,
      nationalShipping: {
        ...prev.nationalShipping,
        regions: [
          ...prev.nationalShipping.regions,
          { name: '', price: 0 }
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

  // Componente para selector de modos de envío
  const ShippingModesSection = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">{t('modes.title')}</h4>
        
        <div className="space-y-3">
          {[
            { key: 'storePickup', label: t('modes.storePickup') },
            { key: 'localDelivery', label: t('modes.localDelivery') },
            { key: 'nationalShipping', label: t('modes.nationalShipping') },
            { key: 'internationalShipping', label: t('modes.internationalShipping') }
          ].map(mode => (
            <label key={mode.key} className="flex items-center">
              <input
                type="checkbox"
                checked={shippingData.modes[mode.key as keyof typeof shippingData.modes]}
                onChange={(e) => updateShippingData(`modes.${mode.key}`, e.target.checked)}
                className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{mode.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )

  // Componente para recojo en tienda
  const StorePickupSection = () => {
    if (!shippingData.modes.storePickup) return null

    return (
      <div className="space-y-6 border-t pt-6">
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">{t('storePickup.title')}</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('storePickup.address')}
              </label>
              <input
                type="text"
                value={shippingData.storePickup.address}
                onChange={(e) => updateShippingData('storePickup.address', e.target.value)}
                placeholder={t('storePickup.addressPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('storePickup.preparationTime')}
              </label>
              <input
                type="text"
                value={shippingData.storePickup.preparationTime}
                onChange={(e) => updateShippingData('storePickup.preparationTime', e.target.value)}
                placeholder={t('storePickup.preparationTimePlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t('storePickup.schedules')}
                </label>
                <button
                  type="button"
                  onClick={addSchedule}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  {t('storePickup.addSchedule')}
                </button>
              </div>
              
              <div className="space-y-2">
                {shippingData.storePickup.schedules.map((schedule, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <select
                      value={schedule.day}
                      onChange={(e) => {
                        const newSchedules = [...shippingData.storePickup.schedules]
                        newSchedules[index].day = e.target.value
                        updateShippingData('storePickup.schedules', newSchedules)
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                    >
                      {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                        <option key={day} value={day}>{t(`storePickup.days.${day}`)}</option>
                      ))}
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
                      onClick={() => removeSchedule(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Componente para envío local
  const LocalDeliverySection = () => {
    if (!shippingData.modes.localDelivery) return null

    return (
      <div className="space-y-6 border-t pt-6">
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">{t('localDelivery.title')}</h4>
          <p className="text-sm text-gray-600 mb-4">{t('localDelivery.subtitle')}</p>
          
          <div className="space-y-4">
            <DeliveryZoneMap />

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  {t('localDelivery.zones')}
                </label>
                <button
                  type="button"
                  onClick={addZone}
                  className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  {t('localDelivery.addZone')}
                </button>
              </div>
              
              <div className="space-y-3">
                {shippingData.localDelivery.zones.map((zone, index) => (
                  <div key={zone.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('localDelivery.zoneName')}
                        </label>
                        <input
                          type="text"
                          value={zone.name}
                          onChange={(e) => {
                            const newZones = [...shippingData.localDelivery.zones]
                            newZones[index].name = e.target.value
                            updateShippingData('localDelivery.zones', newZones)
                          }}
                          placeholder={t('localDelivery.zoneNamePlaceholder')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('localDelivery.deliveryPrice')}
                        </label>
                        <input
                          type="number"
                          value={zone.price}
                          onChange={(e) => {
                            const newZones = [...shippingData.localDelivery.zones]
                            newZones[index].price = Number(e.target.value)
                            updateShippingData('localDelivery.zones', newZones)
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('localDelivery.estimatedTime')}
                        </label>
                        <input
                          type="text"
                          value={zone.estimatedTime || ''}
                          onChange={(e) => {
                            const newZones = [...shippingData.localDelivery.zones]
                            newZones[index].estimatedTime = e.target.value
                            updateShippingData('localDelivery.zones', newZones)
                          }}
                          placeholder={t('localDelivery.estimatedTimePlaceholder')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                        />
                      </div>
                    </div>
                    
                    {zone.type === 'radius' && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('localDelivery.radius')}
                        </label>
                        <input
                          type="number"
                          value={zone.radius || 5}
                          onChange={(e) => {
                            const newZones = [...shippingData.localDelivery.zones]
                            newZones[index].radius = Number(e.target.value)
                            updateShippingData('localDelivery.zones', newZones)
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                        />
                      </div>
                    )}
                    
                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeZone(zone.id)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        {t('actions.deleteZone')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={shippingData.localDelivery.allowGPS}
                  onChange={(e) => updateShippingData('localDelivery.allowGPS', e.target.checked)}
                  className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{t('localDelivery.allowGPS')}</span>
              </label>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('localDelivery.noCoverageMessage')}
                </label>
                <input
                  type="text"
                  value={shippingData.localDelivery.noCoverageMessage}
                  onChange={(e) => updateShippingData('localDelivery.noCoverageMessage', e.target.value)}
                  placeholder={t('localDelivery.noCoverageMessagePlaceholder')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Componente para envío nacional
  const NationalShippingSection = () => {
    if (!shippingData.modes.nationalShipping) return null

    return (
      <div className="space-y-6 border-t pt-6">
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">{t('nationalShipping.title')}</h4>
          <p className="text-sm text-gray-600 mb-4">{t('nationalShipping.subtitle')}</p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('nationalShipping.type')}
              </label>
              <select
                value={shippingData.nationalShipping.type}
                onChange={(e) => updateShippingData('nationalShipping.type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
              >
                <option value="fixed">{t('nationalShipping.types.fixed')}</option>
                <option value="by_region">{t('nationalShipping.types.by_region')}</option>
                <option value="by_weight">{t('nationalShipping.types.by_weight')}</option>
              </select>
            </div>

            {shippingData.nationalShipping.type === 'fixed' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('nationalShipping.fixedPrice')}
                </label>
                <input
                  type="number"
                  value={shippingData.nationalShipping.fixedPrice || ''}
                  onChange={(e) => updateShippingData('nationalShipping.fixedPrice', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                />
              </div>
            )}

            {shippingData.nationalShipping.type === 'by_region' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('nationalShipping.regions')}
                  </label>
                  <button
                    type="button"
                    onClick={addRegion}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    {t('nationalShipping.addRegion')}
                  </button>
                </div>
                
                <div className="space-y-2">
                  {shippingData.nationalShipping.regions.map((region, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={region.name}
                        onChange={(e) => {
                          const newRegions = [...shippingData.nationalShipping.regions]
                          newRegions[index].name = e.target.value
                          updateShippingData('nationalShipping.regions', newRegions)
                        }}
                        placeholder={t('nationalShipping.regionNamePlaceholder')}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                      />
                      
                      <input
                        type="number"
                        value={region.price}
                        onChange={(e) => {
                          const newRegions = [...shippingData.nationalShipping.regions]
                          newRegions[index].price = Number(e.target.value)
                          updateShippingData('nationalShipping.regions', newRegions)
                        }}
                        placeholder="Precio"
                        className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                      />
                      
                      <button
                        type="button"
                        onClick={() => removeRegion(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {shippingData.nationalShipping.type === 'by_weight' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    {t('nationalShipping.weightRanges')}
                  </label>
                  <button
                    type="button"
                    onClick={addWeightRange}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    {t('nationalShipping.addWeightRange')}
                  </button>
                </div>
                
                <div className="space-y-2">
                  {shippingData.nationalShipping.weightRanges.map((range, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={range.minWeight}
                        onChange={(e) => {
                          const newRanges = [...shippingData.nationalShipping.weightRanges]
                          newRanges[index].minWeight = Number(e.target.value)
                          updateShippingData('nationalShipping.weightRanges', newRanges)
                        }}
                        placeholder="Min kg"
                        className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                      />
                      
                      <span className="text-gray-500">-</span>
                      
                      <input
                        type="number"
                        value={range.maxWeight}
                        onChange={(e) => {
                          const newRanges = [...shippingData.nationalShipping.weightRanges]
                          newRanges[index].maxWeight = Number(e.target.value)
                          updateShippingData('nationalShipping.weightRanges', newRanges)
                        }}
                        placeholder="Max kg"
                        className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                      />
                      
                      <input
                        type="number"
                        value={range.price}
                        onChange={(e) => {
                          const newRanges = [...shippingData.nationalShipping.weightRanges]
                          newRanges[index].price = Number(e.target.value)
                          updateShippingData('nationalShipping.weightRanges', newRanges)
                        }}
                        placeholder="Precio"
                        className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                      />
                      
                      <button
                        type="button"
                        onClick={() => removeWeightRange(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4 border-t pt-4">
              <h5 className="font-medium text-gray-900">{t('nationalShipping.carrier.title')}</h5>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('nationalShipping.carrier.name')}
                </label>
                <select
                  value={shippingData.nationalShipping.carrier.name || ''}
                  onChange={(e) => updateShippingData('nationalShipping.carrier.name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                >
                  <option value="">Seleccionar...</option>
                  <option value="serpost">{t('nationalShipping.carrier.nameOptions.serpost')}</option>
                  <option value="olva">{t('nationalShipping.carrier.nameOptions.olva')}</option>
                  <option value="shalom">{t('nationalShipping.carrier.nameOptions.shalom')}</option>
                  <option value="custom">{t('nationalShipping.carrier.nameOptions.custom')}</option>
                </select>
              </div>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={shippingData.nationalShipping.carrier.trackingEnabled || false}
                  onChange={(e) => updateShippingData('nationalShipping.carrier.trackingEnabled', e.target.checked)}
                  className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{t('nationalShipping.carrier.trackingEnabled')}</span>
              </label>
              
              {shippingData.nationalShipping.carrier.trackingEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('nationalShipping.carrier.trackingUrl')}
                  </label>
                  <input
                    type="url"
                    value={shippingData.nationalShipping.carrier.trackingUrl || ''}
                    onChange={(e) => updateShippingData('nationalShipping.carrier.trackingUrl', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                  />
                </div>
              )}
            </div>

            <div className="space-y-4 border-t pt-4">
              <h5 className="font-medium text-gray-900">{t('nationalShipping.automaticRates.title')}</h5>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={shippingData.nationalShipping.automaticRates.enabled}
                  onChange={(e) => updateShippingData('nationalShipping.automaticRates.enabled', e.target.checked)}
                  className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{t('nationalShipping.automaticRates.enabled')}</span>
              </label>
              
              {shippingData.nationalShipping.automaticRates.enabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('nationalShipping.automaticRates.apiKey')}
                  </label>
                  <input
                    type="text"
                    value={shippingData.nationalShipping.automaticRates.apiKey || ''}
                    onChange={(e) => updateShippingData('nationalShipping.automaticRates.apiKey', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Componente para envío internacional
  const InternationalShippingSection = () => {
    if (!shippingData.modes.internationalShipping) return null

    return (
      <div className="space-y-6 border-t pt-6">
        <div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">{t('internationalShipping.title')}</h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('internationalShipping.countries')}
              </label>
              <input
                type="text"
                placeholder={t('internationalShipping.countriesPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
              />
              <p className="mt-1 text-xs text-gray-500">Próximamente: selector múltiple de países</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('internationalShipping.basePrice')}
                </label>
                <input
                  type="number"
                  value={shippingData.internationalShipping.basePrice}
                  onChange={(e) => updateShippingData('internationalShipping.basePrice', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('internationalShipping.weightRate')}
                </label>
                <input
                  type="number"
                  value={shippingData.internationalShipping.weightRate || ''}
                  onChange={(e) => updateShippingData('internationalShipping.weightRate', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('internationalShipping.volumeRate')}
                </label>
                <input
                  type="number"
                  value={shippingData.internationalShipping.volumeRate || ''}
                  onChange={(e) => updateShippingData('internationalShipping.volumeRate', Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('internationalShipping.customMessage')}
              </label>
              <textarea
                value={shippingData.internationalShipping.customMessage || ''}
                onChange={(e) => updateShippingData('internationalShipping.customMessage', e.target.value)}
                placeholder={t('internationalShipping.customMessagePlaceholder')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
              />
            </div>

            <div className="space-y-4 border-t pt-4">
              <h5 className="font-medium text-gray-900">{t('internationalShipping.customsInfo.title')}</h5>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('internationalShipping.customsInfo.restrictedCategories')}
                </label>
                <input
                  type="text"
                  placeholder="Electrónicos, Líquidos, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('internationalShipping.customsInfo.additionalInfo')}
                </label>
                <textarea
                  value={shippingData.internationalShipping.customsInfo.additionalInfo || ''}
                  onChange={(e) => updateShippingData('internationalShipping.customsInfo.additionalInfo', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Componente para información de display
  const DisplayInfoSection = () => (
    <div className="space-y-6 border-t pt-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-2">{t('display.title')}</h4>
        <p className="text-sm text-gray-600 mb-4">{t('display.subtitle')}</p>
        
        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={shippingData.displayInfo.showEstimatedTimes}
              onChange={(e) => updateShippingData('displayInfo.showEstimatedTimes', e.target.checked)}
              className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">{t('display.showEstimatedTimes')}</span>
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={shippingData.displayInfo.showPricesInCheckout}
              onChange={(e) => updateShippingData('displayInfo.showPricesInCheckout', e.target.checked)}
              className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">{t('display.showPricesInCheckout')}</span>
          </label>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('display.policyText')}
            </label>
            <textarea
              value={shippingData.displayInfo.policyText || ''}
              onChange={(e) => updateShippingData('displayInfo.policyText', e.target.value)}
              placeholder={t('display.policyTextPlaceholder')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('display.policyUrl')}
            </label>
            <input
              type="url"
              value={shippingData.displayInfo.policyUrl || ''}
              onChange={(e) => updateShippingData('displayInfo.policyUrl', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
            />
          </div>
        </div>
      </div>
    </div>
  )

  // Componente para reglas generales
  const GeneralRulesSection = () => (
    <div className="space-y-6">
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-2">{t('general.title')}</h4>
        
        <div className="space-y-4">
          <div className="space-y-4 border border-gray-200 rounded-lg p-4">
            <h5 className="font-medium text-gray-900">{t('general.freeShipping.title')}</h5>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={shippingData.freeShipping.enabled}
                onChange={(e) => updateShippingData('freeShipping.enabled', e.target.checked)}
                className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">{t('general.freeShipping.enabled')}</span>
            </label>
            
            {shippingData.freeShipping.enabled && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">{t('general.freeShipping.minimumAmount')}</span>
                <input
                  type="number"
                  value={shippingData.freeShipping.minimumAmount || ''}
                  onChange={(e) => updateShippingData('freeShipping.minimumAmount', Number(e.target.value))}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                />
                <span className="text-sm text-gray-700">{t('general.freeShipping.minimumAmountSuffix')}</span>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('general.preparationTime')}
            </label>
            <input
              type="text"
              value={shippingData.preparationTime}
              onChange={(e) => updateShippingData('preparationTime', e.target.value)}
              placeholder={t('general.preparationTimePlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
            />
          </div>

          <div className="space-y-4 border border-gray-200 rounded-lg p-4">
            <h5 className="font-medium text-gray-900">{t('general.notifications.title')}</h5>
            
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={shippingData.notifications.email}
                  onChange={(e) => updateShippingData('notifications.email', e.target.checked)}
                  className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{t('general.notifications.email')}</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={shippingData.notifications.whatsapp}
                  onChange={(e) => updateShippingData('notifications.whatsapp', e.target.checked)}
                  className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{t('general.notifications.whatsapp')}</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Contenedor principal de configuración de envíos */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('title')}</h3>
          <p className="text-sm text-gray-600">{t('description')}</p>
        </div>
        
        <div className="space-y-8">
          <ShippingModesSection />
          <StorePickupSection />
          <LocalDeliverySection />
          <NationalShippingSection />
          <InternationalShippingSection />
          <DisplayInfoSection />
        </div>
      </div>

      {/* Contenedor separado para reglas adicionales */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <GeneralRulesSection />
      </div>
    </>
  )
} 