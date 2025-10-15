'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import DashboardLayout from '../../../../../components/DashboardLayout'
import ShippingNav from '../../../../../components/settings/ShippingNav'
import { useAuth } from '../../../../../lib/simple-auth-context'
import { getUserStore, updateStore, StoreWithId } from '../../../../../lib/store'
import LoadingAnimation from '../../../../../components/LoadingAnimation'
import { Toast } from '../../../../../components/shared/Toast'
import { useToast } from '../../../../../lib/hooks/useToast'

interface AdditionalRulesData {
  minimumOrderValue: number
  enableMinimumOrder: boolean
  freeShippingThreshold: number
  enableFreeShipping: boolean
  customMessage: string
  enableCustomMessage: boolean
}

export default function AdditionalRulesPage() {
  const { user } = useAuth()
  const params = useParams()
  const locale = params?.locale || 'es'
  
  const [store, setStore] = useState<StoreWithId | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast, showToast, hideToast } = useToast()

  const [formData, setFormData] = useState<AdditionalRulesData>({
    minimumOrderValue: 0,
    enableMinimumOrder: false,
    freeShippingThreshold: 100,
    enableFreeShipping: false,
    customMessage: '',
    enableCustomMessage: false
  })

  // Cargar datos de la tienda
  useEffect(() => {
    const loadStore = async () => {
      if (!user?.uid) return
      
      try {
        const userStore = await getUserStore(user.uid)
        setStore(userStore)
        if (userStore?.orderRules) {
          setFormData(prev => ({
            ...prev,
            ...userStore.orderRules
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

  const handleSave = async () => {
    if (!store?.id || !user?.uid) return

    setSaving(true)
    try {
      await updateStore(store.id, {
        orderRules: formData
      })

      showToast('Reglas adicionales guardadas exitosamente', 'success')
    } catch (error) {
      console.error('Error saving additional rules:', error)
      showToast('Error al guardar las reglas. Inténtalo de nuevo.', 'error')
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

          <div className="space-y-6">
            {/* Pedido Mínimo */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Pedido Mínimo</h3>

              <label className="flex items-center mb-4">
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
                    type="text"
                    inputMode="decimal"
                    value={formData.minimumOrderValue || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '')
                      handleChange('minimumOrderValue', value === '' ? 0 : Number(value))
                    }}
                    placeholder="Ej: 50"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Los clientes deberán alcanzar este monto mínimo para poder realizar un pedido
                  </p>
                </div>
              )}
            </div>

            {/* Envío Gratuito */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Envío Gratuito</h3>

              <label className="flex items-center mb-4">
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
                    type="text"
                    inputMode="decimal"
                    value={formData.freeShippingThreshold || ''}
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^0-9.]/g, '')
                      handleChange('freeShippingThreshold', value === '' ? 0 : Number(value))
                    }}
                    placeholder="Ej: 100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Los pedidos que superen este monto tendrán envío gratuito
                  </p>
                </div>
              )}
            </div>

            {/* Mensaje Personalizado */}
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
          </div>


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