'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import DashboardLayout from '../../../../components/DashboardLayout'
import { useAuth } from '../../../../lib/simple-auth-context'
import { getUserStore, updateStore, StoreWithId } from '../../../../lib/store'
import LoadingAnimation from '../../../../components/LoadingAnimation'

interface ShippingPoliciesData {
  generalInfo: string
  processingTime: string
  packagingInfo: string
  trackingInfo: string
  returnPolicy: string
  contactInfo: string
  specialInstructions: string
  showEstimatedDelivery: boolean
  showTrackingInfo: boolean
  showReturnPolicy: boolean
}

export default function ContentShippingPoliciesPage() {
  const { user } = useAuth()
  const t = useTranslations('content')
  const tActions = useTranslations('settings.actions')
  const params = useParams()
  const locale = params?.locale || 'es'
  
  const [store, setStore] = useState<StoreWithId | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const [formData, setFormData] = useState<ShippingPoliciesData>({
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
          if (userStore.advanced?.shipping?.customerInfo) {
            const customerInfo = userStore.advanced.shipping.customerInfo
            setFormData({
              generalInfo: customerInfo.generalInfo || '',
              processingTime: customerInfo.processingTime || '',
              packagingInfo: customerInfo.packagingInfo || '',
              trackingInfo: customerInfo.trackingInfo || '',
              returnPolicy: customerInfo.returnPolicy || '',
              contactInfo: customerInfo.contactInfo || '',
              specialInstructions: customerInfo.specialInstructions || '',
              showEstimatedDelivery: customerInfo.showEstimatedDelivery ?? true,
              showTrackingInfo: customerInfo.showTrackingInfo ?? true,
              showReturnPolicy: customerInfo.showReturnPolicy ?? true
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

  const handleChange = (field: keyof ShippingPoliciesData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!store?.id || !user?.uid) return

    setSaving(true)
    try {
      // Actualizar los datos de políticas de envío en el campo correspondiente
      await updateStore(store.id, {
        advanced: {
          ...store?.advanced,
          shipping: {
            ...store?.advanced?.shipping,
            customerInfo: formData
          }
        }
      })
      
      setSaveMessage('Políticas de envío guardadas exitosamente')
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      console.error('Error saving shipping policies:', error)
      setSaveMessage('Error al guardar las políticas. Inténtalo de nuevo.')
      
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
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navegación por pestañas */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav 
                className="flex space-x-8 overflow-x-auto px-4 sm:px-0 scrollbar-none" 
                style={{
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}
                aria-label="Tabs"
              >
                <a
                  href={`/${locale}/content/pages`}
                  className="py-2 px-3 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 border-transparent text-gray-500 hover:text-gray-700"
                >
                  {t('tabs.pages')}
                </a>
                <a
                  href={`/${locale}/content/filters`}
                  className="py-2 px-3 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 border-transparent text-gray-500 hover:text-gray-700"
                >
                  {t('tabs.filters')}
                </a>
                <a
                  href={`/${locale}/content/shipping-policies`}
                  className="py-2 px-3 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 border-gray-600 text-gray-800"
                >
                  Políticas de envío
                </a>
              </nav>
            </div>
          </div>

          {/* Contenido */}
          <div className="space-y-6">
            {/* Información para el Cliente */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Información para el Cliente</h3>
              <p className="text-sm text-gray-600 mb-6">
                Configura la información que verán los clientes sobre los envíos en tu tienda pública.
              </p>
              
              <div className="space-y-6">
                {/* Información general de envíos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Información general de envíos
                  </label>
                  <textarea
                    value={formData.generalInfo}
                    onChange={(e) => handleChange('generalInfo', e.target.value)}
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
                    value={formData.processingTime}
                    onChange={(e) => handleChange('processingTime', e.target.value)}
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
                    value={formData.packagingInfo}
                    onChange={(e) => handleChange('packagingInfo', e.target.value)}
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
                    value={formData.trackingInfo}
                    onChange={(e) => handleChange('trackingInfo', e.target.value)}
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
                    value={formData.returnPolicy}
                    onChange={(e) => handleChange('returnPolicy', e.target.value)}
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
                    value={formData.contactInfo}
                    onChange={(e) => handleChange('contactInfo', e.target.value)}
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
                    value={formData.specialInstructions}
                    onChange={(e) => handleChange('specialInstructions', e.target.value)}
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
                Controla qué información se muestra automáticamente a los clientes en la tienda pública.
              </p>

              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.showEstimatedDelivery}
                    onChange={(e) => handleChange('showEstimatedDelivery', e.target.checked)}
                    className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Mostrar tiempo estimado de entrega</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.showTrackingInfo}
                    onChange={(e) => handleChange('showTrackingInfo', e.target.checked)}
                    className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Mostrar información de seguimiento</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.showReturnPolicy}
                    onChange={(e) => handleChange('showReturnPolicy', e.target.checked)}
                    className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Mostrar política de devoluciones en checkout</span>
                </label>
              </div>
            </div>

            {/* Vista previa */}
            <div className="bg-white shadow rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Vista Previa</h4>
              <p className="text-sm text-gray-600 mb-4">
                Así es como verán los clientes la información de envíos en tu tienda:
              </p>

              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="space-y-3">
                  {formData.generalInfo && (
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm">Información de Envíos</h5>
                      <p className="text-sm text-gray-700 mt-1">{formData.generalInfo}</p>
                    </div>
                  )}

                  {formData.processingTime && (
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm">Tiempo de Procesamiento</h5>
                      <p className="text-sm text-gray-700 mt-1">{formData.processingTime}</p>
                    </div>
                  )}

                  {formData.showEstimatedDelivery && (
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm">Tiempo Estimado de Entrega</h5>
                      <p className="text-sm text-gray-700 mt-1">Se calculará según el método de envío seleccionado</p>
                    </div>
                  )}

                  {formData.showTrackingInfo && formData.trackingInfo && (
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm">Seguimiento</h5>
                      <p className="text-sm text-gray-700 mt-1">{formData.trackingInfo}</p>
                    </div>
                  )}

                  {formData.showReturnPolicy && formData.returnPolicy && (
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm">Política de Devoluciones</h5>
                      <p className="text-sm text-gray-700 mt-1">{formData.returnPolicy}</p>
                    </div>
                  )}

                  {formData.contactInfo && (
                    <div>
                      <h5 className="font-medium text-gray-900 text-sm">Contacto</h5>
                      <p className="text-sm text-gray-700 mt-1">{formData.contactInfo}</p>
                    </div>
                  )}

                  {(!formData.generalInfo && !formData.processingTime && !formData.trackingInfo) && (
                    <p className="text-sm text-gray-500 italic">Agrega información arriba para ver la vista previa</p>
                  )}
                </div>
              </div>
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
              {saving ? 'Guardando...' : 'Guardar políticas'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 