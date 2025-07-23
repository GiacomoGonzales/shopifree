'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import DashboardLayout from '../../../../../components/DashboardLayout'
import ShippingNav from '../../../../../components/settings/ShippingNav'
import { useAuth } from '../../../../../lib/simple-auth-context'
import { getUserStore, updateStore, StoreWithId } from '../../../../../lib/store'
import LoadingAnimation from '../../../../../components/LoadingAnimation'

interface ProductRestriction {
  id: string
  productName: string
  restrictionType: 'no-shipping' | 'special-handling' | 'restricted-zones'
  description: string
  additionalCost?: number
}

interface ZoneRestriction {
  id: string
  zoneName: string
  restrictionType: 'no-delivery' | 'extra-cost' | 'special-requirements'
  description: string
  additionalCost?: number
}

interface AdditionalRulesData {
  minimumOrderValue: number
  enableMinimumOrder: boolean
  freeShippingThreshold: number
  enableFreeShipping: boolean
  maxOrderWeight: number
  enableWeightLimit: boolean
  maxOrderValue: number
  enableValueLimit: boolean
  restrictedDays: string[]
  holidayMessage: string
  productRestrictions: ProductRestriction[]
  zoneRestrictions: ZoneRestriction[]
  customMessage: string
  enableCustomMessage: boolean
  packagingFee: number
  enablePackagingFee: boolean
  handlingFee: number
  enableHandlingFee: boolean
  insuranceRequired: boolean
  signatureRequired: boolean
  ageVerificationRequired: boolean
  specialInstructions: string
}

const DAYS_OF_WEEK = [
  { id: 'monday', label: 'Lunes' },
  { id: 'tuesday', label: 'Martes' },
  { id: 'wednesday', label: 'Miércoles' },
  { id: 'thursday', label: 'Jueves' },
  { id: 'friday', label: 'Viernes' },
  { id: 'saturday', label: 'Sábado' },
  { id: 'sunday', label: 'Domingo' }
]

export default function AdditionalRulesPage() {
  const { user } = useAuth()
  const params = useParams()
  const locale = params?.locale || 'es'
  
  const [store, setStore] = useState<StoreWithId | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const [formData, setFormData] = useState<AdditionalRulesData>({
    minimumOrderValue: 0,
    enableMinimumOrder: false,
    freeShippingThreshold: 100,
    enableFreeShipping: false,
    maxOrderWeight: 30,
    enableWeightLimit: false,
    maxOrderValue: 1000,
    enableValueLimit: false,
    restrictedDays: [],
    holidayMessage: '',
    productRestrictions: [],
    zoneRestrictions: [],
    customMessage: '',
    enableCustomMessage: false,
    packagingFee: 0,
    enablePackagingFee: false,
    handlingFee: 0,
    enableHandlingFee: false,
    insuranceRequired: false,
    signatureRequired: false,
    ageVerificationRequired: false,
    specialInstructions: ''
  })

  // Estados para formularios de nuevas restricciones
  const [newProductRestriction, setNewProductRestriction] = useState<Partial<ProductRestriction>>({
    productName: '',
    restrictionType: 'no-shipping',
    description: '',
    additionalCost: 0
  })

  const [newZoneRestriction, setNewZoneRestriction] = useState<Partial<ZoneRestriction>>({
    zoneName: '',
    restrictionType: 'no-delivery',
    description: '',
    additionalCost: 0
  })

  // Cargar datos de la tienda
  useEffect(() => {
    const loadStore = async () => {
      if (!user?.uid) return
      
      try {
        const userStore = await getUserStore(user.uid)
        setStore(userStore)
        if (userStore?.advanced?.shipping?.additionalRules) {
          const rules = userStore.advanced.shipping.additionalRules
          setFormData(prev => ({
            ...prev,
            ...rules
          }))
        }
      } catch (error) {
        console.error('Error loading store:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStore()
  }, [user?.uid])

  const handleChange = (field: keyof AdditionalRulesData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleDayToggle = (dayId: string) => {
    setFormData(prev => ({
      ...prev,
      restrictedDays: prev.restrictedDays.includes(dayId)
        ? prev.restrictedDays.filter(id => id !== dayId)
        : [...prev.restrictedDays, dayId]
    }))
  }

  const addProductRestriction = () => {
    if (!newProductRestriction.productName || !newProductRestriction.description) return

    const restriction: ProductRestriction = {
      id: Date.now().toString(),
      productName: newProductRestriction.productName!,
      restrictionType: newProductRestriction.restrictionType!,
      description: newProductRestriction.description!,
      additionalCost: newProductRestriction.additionalCost || 0
    }

    setFormData(prev => ({
      ...prev,
      productRestrictions: [...prev.productRestrictions, restriction]
    }))

    setNewProductRestriction({
      productName: '',
      restrictionType: 'no-shipping',
      description: '',
      additionalCost: 0
    })
  }

  const removeProductRestriction = (id: string) => {
    setFormData(prev => ({
      ...prev,
      productRestrictions: prev.productRestrictions.filter(r => r.id !== id)
    }))
  }

  const addZoneRestriction = () => {
    if (!newZoneRestriction.zoneName || !newZoneRestriction.description) return

    const restriction: ZoneRestriction = {
      id: Date.now().toString(),
      zoneName: newZoneRestriction.zoneName!,
      restrictionType: newZoneRestriction.restrictionType!,
      description: newZoneRestriction.description!,
      additionalCost: newZoneRestriction.additionalCost || 0
    }

    setFormData(prev => ({
      ...prev,
      zoneRestrictions: [...prev.zoneRestrictions, restriction]
    }))

    setNewZoneRestriction({
      zoneName: '',
      restrictionType: 'no-delivery',
      description: '',
      additionalCost: 0
    })
  }

  const removeZoneRestriction = (id: string) => {
    setFormData(prev => ({
      ...prev,
      zoneRestrictions: prev.zoneRestrictions.filter(r => r.id !== id)
    }))
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
            additionalRules: formData
          }
        }
      })
      
      setSaveMessage('Reglas adicionales guardadas exitosamente')
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      console.error('Error saving additional rules:', error)
      setSaveMessage('Error al guardar las reglas. Inténtalo de nuevo.')
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


          <ShippingNav currentSection="additional-rules" />

          <div className="space-y-8">
            {/* Límites de pedido */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Límites de Pedido</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Pedido mínimo */}
                <div>
                  <label className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      checked={formData.enableMinimumOrder}
                      onChange={(e) => handleChange('enableMinimumOrder', e.target.checked)}
                      className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Habilitar pedido mínimo</span>
                  </label>
                  {formData.enableMinimumOrder && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Valor mínimo del pedido (S/)</label>
                      <input
                        type="number"
                        value={formData.minimumOrderValue}
                        onChange={(e) => handleChange('minimumOrderValue', Number(e.target.value))}
                        min="0"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                      />
                    </div>
                  )}
                </div>

                {/* Envío gratuito */}
                <div>
                  <label className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      checked={formData.enableFreeShipping}
                      onChange={(e) => handleChange('enableFreeShipping', e.target.checked)}
                      className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Habilitar envío gratuito</span>
                  </label>
                  {formData.enableFreeShipping && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Monto para envío gratuito (S/)</label>
                      <input
                        type="number"
                        value={formData.freeShippingThreshold}
                        onChange={(e) => handleChange('freeShippingThreshold', Number(e.target.value))}
                        min="0"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                      />
                    </div>
                  )}
                </div>

                {/* Límite de peso */}
                <div>
                  <label className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      checked={formData.enableWeightLimit}
                      onChange={(e) => handleChange('enableWeightLimit', e.target.checked)}
                      className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Límite de peso por pedido</span>
                  </label>
                  {formData.enableWeightLimit && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Peso máximo por pedido (kg)</label>
                      <input
                        type="number"
                        value={formData.maxOrderWeight}
                        onChange={(e) => handleChange('maxOrderWeight', Number(e.target.value))}
                        min="0"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                      />
                    </div>
                  )}
                </div>

                {/* Límite de valor */}
                <div>
                  <label className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      checked={formData.enableValueLimit}
                      onChange={(e) => handleChange('enableValueLimit', e.target.checked)}
                      className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Límite máximo de valor</span>
                  </label>
                  {formData.enableValueLimit && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Valor máximo por pedido (S/)</label>
                      <input
                        type="number"
                        value={formData.maxOrderValue}
                        onChange={(e) => handleChange('maxOrderValue', Number(e.target.value))}
                        min="0"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tarifas adicionales */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tarifas Adicionales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Tarifa de empaque */}
                <div>
                  <label className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      checked={formData.enablePackagingFee}
                      onChange={(e) => handleChange('enablePackagingFee', e.target.checked)}
                      className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Tarifa de empaque</span>
                  </label>
                  {formData.enablePackagingFee && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Costo de empaque (S/)</label>
                      <input
                        type="number"
                        value={formData.packagingFee}
                        onChange={(e) => handleChange('packagingFee', Number(e.target.value))}
                        min="0"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                      />
                    </div>
                  )}
                </div>

                {/* Tarifa de manejo */}
                <div>
                  <label className="flex items-center mb-3">
                    <input
                      type="checkbox"
                      checked={formData.enableHandlingFee}
                      onChange={(e) => handleChange('enableHandlingFee', e.target.checked)}
                      className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Tarifa de manejo</span>
                  </label>
                  {formData.enableHandlingFee && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Costo de manejo (S/)</label>
                      <input
                        type="number"
                        value={formData.handlingFee}
                        onChange={(e) => handleChange('handlingFee', Number(e.target.value))}
                        min="0"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Requisitos especiales */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Requisitos Especiales</h3>
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.insuranceRequired}
                    onChange={(e) => handleChange('insuranceRequired', e.target.checked)}
                    className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded mr-3"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Seguro obligatorio</span>
                    <p className="text-xs text-gray-500">Todos los envíos incluirán seguro automáticamente</p>
                  </div>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.signatureRequired}
                    onChange={(e) => handleChange('signatureRequired', e.target.checked)}
                    className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded mr-3"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Firma requerida</span>
                    <p className="text-xs text-gray-500">El cliente debe firmar al recibir el paquete</p>
                  </div>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.ageVerificationRequired}
                    onChange={(e) => handleChange('ageVerificationRequired', e.target.checked)}
                    className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded mr-3"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">Verificación de edad</span>
                    <p className="text-xs text-gray-500">Requerido para productos con restricción de edad</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Días restringidos */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Días sin Envío</h3>
              <p className="text-sm text-gray-600 mb-4">
                Selecciona los días de la semana en los que no realizas envíos
              </p>
              
              <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-4">
                {DAYS_OF_WEEK.map((day) => (
                  <label key={day.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.restrictedDays.includes(day.id)}
                      onChange={() => handleDayToggle(day.id)}
                      className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded mr-2"
                    />
                    <span className="text-sm text-gray-700">{day.label}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensaje para días festivos/restricciones
                </label>
                <input
                  type="text"
                  value={formData.holidayMessage}
                  onChange={(e) => handleChange('holidayMessage', e.target.value)}
                  placeholder="Ejemplo: Durante días festivos los envíos pueden tomar 1-2 días adicionales"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                />
              </div>
            </div>

            {/* Restricciones de productos */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Restricciones de Productos</h3>
              
              {/* Lista de restricciones existentes */}
              {formData.productRestrictions.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Restricciones actuales:</h4>
                  <div className="space-y-2">
                    {formData.productRestrictions.map((restriction) => (
                      <div key={restriction.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="font-medium text-sm">{restriction.productName}</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              restriction.restrictionType === 'no-shipping' ? 'bg-red-100 text-red-800' :
                              restriction.restrictionType === 'special-handling' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {restriction.restrictionType === 'no-shipping' ? 'Sin envío' :
                               restriction.restrictionType === 'special-handling' ? 'Manejo especial' :
                               'Zonas restringidas'}
                            </span>
                            {restriction.additionalCost && restriction.additionalCost > 0 && (
                              <span className="text-sm text-gray-600">+S/ {restriction.additionalCost}</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{restriction.description}</p>
                        </div>
                        <button
                          onClick={() => removeProductRestriction(restriction.id)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Formulario para nueva restricción */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Agregar nueva restricción:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Nombre del producto</label>
                    <input
                      type="text"
                      value={newProductRestriction.productName || ''}
                      onChange={(e) => setNewProductRestriction(prev => ({ ...prev, productName: e.target.value }))}
                      placeholder="Ejemplo: Productos químicos"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Tipo de restricción</label>
                    <select
                      value={newProductRestriction.restrictionType || 'no-shipping'}
                      onChange={(e) => setNewProductRestriction(prev => ({ ...prev, restrictionType: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                    >
                      <option value="no-shipping">Sin envío</option>
                      <option value="special-handling">Manejo especial</option>
                      <option value="restricted-zones">Zonas restringidas</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">Descripción</label>
                    <input
                      type="text"
                      value={newProductRestriction.description || ''}
                      onChange={(e) => setNewProductRestriction(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Ejemplo: Requiere manejo especial por materiales peligrosos"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                    />
                  </div>

                  {newProductRestriction.restrictionType === 'special-handling' && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Costo adicional (S/)</label>
                      <input
                        type="number"
                        value={newProductRestriction.additionalCost || 0}
                        onChange={(e) => setNewProductRestriction(prev => ({ ...prev, additionalCost: Number(e.target.value) }))}
                        min="0"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                      />
                    </div>
                  )}
                </div>

                <button
                  onClick={addProductRestriction}
                  disabled={!newProductRestriction.productName || !newProductRestriction.description}
                  className="mt-3 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Agregar restricción
                </button>
              </div>
            </div>

            {/* Restricciones de zonas */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Restricciones de Zonas</h3>
              
              {/* Lista de restricciones existentes */}
              {formData.zoneRestrictions.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Restricciones actuales:</h4>
                  <div className="space-y-2">
                    {formData.zoneRestrictions.map((restriction) => (
                      <div key={restriction.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="font-medium text-sm">{restriction.zoneName}</span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              restriction.restrictionType === 'no-delivery' ? 'bg-red-100 text-red-800' :
                              restriction.restrictionType === 'extra-cost' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {restriction.restrictionType === 'no-delivery' ? 'Sin delivery' :
                               restriction.restrictionType === 'extra-cost' ? 'Costo extra' :
                               'Requisitos especiales'}
                            </span>
                            {restriction.additionalCost && restriction.additionalCost > 0 && (
                              <span className="text-sm text-gray-600">+S/ {restriction.additionalCost}</span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{restriction.description}</p>
                        </div>
                        <button
                          onClick={() => removeZoneRestriction(restriction.id)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Formulario para nueva restricción */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Agregar nueva restricción:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Nombre de la zona</label>
                    <input
                      type="text"
                      value={newZoneRestriction.zoneName || ''}
                      onChange={(e) => setNewZoneRestriction(prev => ({ ...prev, zoneName: e.target.value }))}
                      placeholder="Ejemplo: Zona rural Amazonas"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Tipo de restricción</label>
                    <select
                      value={newZoneRestriction.restrictionType || 'no-delivery'}
                      onChange={(e) => setNewZoneRestriction(prev => ({ ...prev, restrictionType: e.target.value as any }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                    >
                      <option value="no-delivery">Sin delivery</option>
                      <option value="extra-cost">Costo extra</option>
                      <option value="special-requirements">Requisitos especiales</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm text-gray-600 mb-1">Descripción</label>
                    <input
                      type="text"
                      value={newZoneRestriction.description || ''}
                      onChange={(e) => setNewZoneRestriction(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Ejemplo: Zona de difícil acceso, requiere coordinación previa"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                    />
                  </div>

                  {newZoneRestriction.restrictionType === 'extra-cost' && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Costo adicional (S/)</label>
                      <input
                        type="number"
                        value={newZoneRestriction.additionalCost || 0}
                        onChange={(e) => setNewZoneRestriction(prev => ({ ...prev, additionalCost: Number(e.target.value) }))}
                        min="0"
                        step="0.1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                      />
                    </div>
                  )}
                </div>

                <button
                  onClick={addZoneRestriction}
                  disabled={!newZoneRestriction.zoneName || !newZoneRestriction.description}
                  className="mt-3 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  Agregar restricción
                </button>
              </div>
            </div>

            {/* Mensaje personalizado */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Mensaje Personalizado</h3>
              
              <label className="flex items-center mb-4">
                <input
                  type="checkbox"
                  checked={formData.enableCustomMessage}
                  onChange={(e) => handleChange('enableCustomMessage', e.target.checked)}
                  className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded mr-2"
                />
                <span className="text-sm font-medium text-gray-700">Mostrar mensaje personalizado en checkout</span>
              </label>

              {formData.enableCustomMessage && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensaje personalizado
                  </label>
                  <textarea
                    value={formData.customMessage}
                    onChange={(e) => handleChange('customMessage', e.target.value)}
                    placeholder="Ejemplo: Por favor revisa nuestras políticas de envío antes de finalizar tu compra. Algunos productos pueden tener restricciones especiales."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Este mensaje se mostrará a los clientes durante el checkout
                  </p>
                </div>
              )}
            </div>

            {/* Instrucciones especiales */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Instrucciones Especiales</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instrucciones adicionales para el personal de envíos
                </label>
                <textarea
                  value={formData.specialInstructions}
                  onChange={(e) => handleChange('specialInstructions', e.target.value)}
                  placeholder="Ejemplo: Todos los productos frágiles deben empacarse con material de burbuja adicional. Verificar ID en entregas de productos restringidos."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Instrucciones internas para el manejo y envío de productos
                </p>
              </div>
            </div>
          </div>

          {/* Mensaje de estado */}
          {saveMessage && (
            <div className={`mt-6 p-3 rounded-md ${
              saveMessage.includes('Error') 
                ? 'bg-red-50 border border-red-200 text-red-700' 
                : 'bg-green-50 border border-green-200 text-green-700'
            }`}>
              {saveMessage}
            </div>
          )}

          {/* Botón de guardar */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar reglas adicionales'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 