'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import DashboardLayout from '../../../../components/DashboardLayout'
import { useAuth } from '../../../../lib/simple-auth-context'
import { getUserStore, updateStore, StoreWithId } from '../../../../lib/store'
import LoadingAnimation from '../../../../components/LoadingAnimation'
import { ContentTabs } from '../../../../components/content/ContentTabs'

interface TermsConditionsData {
  generalTerms: string
  purchaseTerms: string
  paymentTerms: string
  deliveryTerms: string
  returnTerms: string
  privacyPolicy: string
  userRights: string
  liabilityLimitation: string
  contactInfo: string
  lastUpdated: string
  effectiveDate: string
  showLastUpdated: boolean
  showEffectiveDate: boolean
}

export default function ContentTermsConditionsPage() {
  const { user } = useAuth()
  const t = useTranslations('content')
  const tActions = useTranslations('settings.actions')
  const params = useParams()
  const locale = params?.locale || 'es'
  
  const [store, setStore] = useState<StoreWithId | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const [formData, setFormData] = useState<TermsConditionsData>({
    generalTerms: '',
    purchaseTerms: '',
    paymentTerms: '',
    deliveryTerms: '',
    returnTerms: '',
    privacyPolicy: '',
    userRights: '',
    liabilityLimitation: '',
    contactInfo: '',
    lastUpdated: '',
    effectiveDate: '',
    showLastUpdated: true,
    showEffectiveDate: true
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
          if (userStore.legal?.termsConditions) {
            const termsData = userStore.legal.termsConditions
            setFormData({
              generalTerms: termsData.generalTerms || '',
              purchaseTerms: termsData.purchaseTerms || '',
              paymentTerms: termsData.paymentTerms || '',
              deliveryTerms: termsData.deliveryTerms || '',
              returnTerms: termsData.returnTerms || '',
              privacyPolicy: termsData.privacyPolicy || '',
              userRights: termsData.userRights || '',
              liabilityLimitation: termsData.liabilityLimitation || '',
              contactInfo: termsData.contactInfo || '',
              lastUpdated: termsData.lastUpdated || '',
              effectiveDate: termsData.effectiveDate || '',
              showLastUpdated: termsData.showLastUpdated ?? true,
              showEffectiveDate: termsData.showEffectiveDate ?? true
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

  const handleChange = (field: keyof TermsConditionsData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!store?.id || !user?.uid) return

    setSaving(true)
    try {
      // Actualizar los datos de términos y condiciones en el campo correspondiente
      await updateStore(store.id, {
        legal: {
          ...store?.legal,
          termsConditions: formData
        }
      })
      
      setSaveMessage('Términos y condiciones guardados exitosamente')
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      console.error('Error saving terms and conditions:', error)
      setSaveMessage('Error al guardar los términos. Inténtalo de nuevo.')
      
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
          <ContentTabs currentTab="terms" />

          {/* Contenido */}
          <div className="space-y-6">
            {/* Información General */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Términos y Condiciones</h3>
              <p className="text-sm text-gray-600 mb-6">
                Configure los términos y condiciones legales que rigen el uso de su tienda en línea.
              </p>
              
              <div className="space-y-6">
                {/* Términos generales */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Términos generales de uso
                  </label>
                  <textarea
                    value={formData.generalTerms}
                    onChange={(e) => handleChange('generalTerms', e.target.value)}
                    placeholder="Ejemplo: Al acceder y utilizar este sitio web, usted acepta estar sujeto a estos términos y condiciones de uso. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar nuestro sitio web."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Términos generales que aplican a todos los usuarios del sitio web
                  </p>
                </div>

                {/* Términos de compra */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Términos de compra y venta
                  </label>
                  <textarea
                    value={formData.purchaseTerms}
                    onChange={(e) => handleChange('purchaseTerms', e.target.value)}
                    placeholder="Ejemplo: Todos los productos están sujetos a disponibilidad. Nos reservamos el derecho de limitar las cantidades de cualquier producto. Los precios están sujetos a cambios sin previo aviso."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Condiciones específicas para la compra de productos
                  </p>
                </div>

                {/* Términos de pago */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Términos de pago
                  </label>
                  <textarea
                    value={formData.paymentTerms}
                    onChange={(e) => handleChange('paymentTerms', e.target.value)}
                    placeholder="Ejemplo: Aceptamos pagos con tarjetas de crédito, débito y transferencias bancarias. El pago debe procesarse antes del envío del producto. Todos los pagos son en moneda local."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Condiciones y métodos de pago aceptados
                  </p>
                </div>

                {/* Términos de entrega */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Términos de entrega
                  </label>
                  <textarea
                    value={formData.deliveryTerms}
                    onChange={(e) => handleChange('deliveryTerms', e.target.value)}
                    placeholder="Ejemplo: Los tiempos de entrega son estimados y pueden variar según la ubicación y disponibilidad. No nos hacemos responsables por retrasos causados por factores externos como condiciones climáticas o problemas de transporte."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Políticas y condiciones de entrega de productos
                  </p>
                </div>

                {/* Términos de devolución */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Términos de devolución y reembolso
                  </label>
                  <textarea
                    value={formData.returnTerms}
                    onChange={(e) => handleChange('returnTerms', e.target.value)}
                    placeholder="Ejemplo: Aceptamos devoluciones dentro de los 30 días posteriores a la compra. Los productos deben estar en su estado original y con embalaje intacto. Los gastos de envío para devoluciones corren por cuenta del cliente."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Políticas de devolución, cambios y reembolsos
                  </p>
                </div>

                {/* Política de privacidad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Política de privacidad y datos
                  </label>
                  <textarea
                    value={formData.privacyPolicy}
                    onChange={(e) => handleChange('privacyPolicy', e.target.value)}
                    placeholder="Ejemplo: Respetamos su privacidad y protegemos su información personal. Solo recopilamos datos necesarios para procesar pedidos y mejorar nuestros servicios. No compartimos información personal con terceros sin su consentimiento."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Política de manejo y protección de datos personales
                  </p>
                </div>

                {/* Derechos del usuario */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Derechos y responsabilidades del usuario
                  </label>
                  <textarea
                    value={formData.userRights}
                    onChange={(e) => handleChange('userRights', e.target.value)}
                    placeholder="Ejemplo: Los usuarios tienen derecho a acceder, rectificar y cancelar sus datos personales. Es responsabilidad del usuario proporcionar información veraz y mantener actualizada su información de contacto."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Derechos que tienen los usuarios y sus responsabilidades
                  </p>
                </div>

                {/* Limitación de responsabilidad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Limitación de responsabilidad
                  </label>
                  <textarea
                    value={formData.liabilityLimitation}
                    onChange={(e) => handleChange('liabilityLimitation', e.target.value)}
                    placeholder="Ejemplo: Nuestra responsabilidad se limita al valor del producto adquirido. No nos hacemos responsables por daños indirectos, lucro cesante o daños consecuenciales que puedan surgir del uso de nuestros productos o servicios."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Límites de responsabilidad de la empresa
                  </p>
                </div>

                {/* Información de contacto legal */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Información de contacto legal
                  </label>
                  <textarea
                    value={formData.contactInfo}
                    onChange={(e) => handleChange('contactInfo', e.target.value)}
                    placeholder="Ejemplo: Para consultas legales o sobre estos términos, contáctanos en: legal@tutienda.com o al teléfono +51 999 999 999. Dirección: Av. Principal 123, Ciudad, País."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Información de contacto para asuntos legales
                  </p>
                </div>
              </div>
            </div>

            {/* Fechas y configuraciones */}
            <div className="bg-white shadow rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Fechas y Configuración</h4>
              <p className="text-sm text-gray-600 mb-4">
                Configure las fechas importantes y qué información mostrar a los usuarios.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de entrada en vigor
                  </label>
                  <input
                    type="date"
                    value={formData.effectiveDate}
                    onChange={(e) => handleChange('effectiveDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Cuándo entran en vigor estos términos
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de última actualización
                  </label>
                  <input
                    type="date"
                    value={formData.lastUpdated}
                    onChange={(e) => handleChange('lastUpdated', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Cuándo se actualizaron por última vez
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.showEffectiveDate}
                    onChange={(e) => handleChange('showEffectiveDate', e.target.checked)}
                    className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Mostrar fecha de entrada en vigor</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.showLastUpdated}
                    onChange={(e) => handleChange('showLastUpdated', e.target.checked)}
                    className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Mostrar fecha de última actualización</span>
                </label>
              </div>
            </div>

            {/* Vista previa */}
            <div className="bg-white shadow rounded-lg p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Vista Previa</h4>
              <p className="text-sm text-gray-600 mb-4">
                Así es como verán los clientes los términos y condiciones en tu tienda:
              </p>

              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 max-h-96 overflow-y-auto">
                <div className="space-y-6">
                  <div className="text-center border-b border-gray-300 pb-4">
                    <h1 className="text-2xl font-bold text-gray-900">Términos y Condiciones</h1>
                    {formData.showEffectiveDate && formData.effectiveDate && (
                      <p className="text-sm text-gray-600 mt-2">
                        Vigente desde: {new Date(formData.effectiveDate).toLocaleDateString('es-ES')}
                      </p>
                    )}
                    {formData.showLastUpdated && formData.lastUpdated && (
                      <p className="text-sm text-gray-600">
                        Última actualización: {new Date(formData.lastUpdated).toLocaleDateString('es-ES')}
                      </p>
                    )}
                  </div>

                  {formData.generalTerms && (
                    <div>
                      <h3 className="font-medium text-gray-900 text-lg mb-2">Términos Generales</h3>
                      <p className="text-sm text-gray-700">{formData.generalTerms}</p>
                    </div>
                  )}

                  {formData.purchaseTerms && (
                    <div>
                      <h3 className="font-medium text-gray-900 text-lg mb-2">Compras</h3>
                      <p className="text-sm text-gray-700">{formData.purchaseTerms}</p>
                    </div>
                  )}

                  {formData.paymentTerms && (
                    <div>
                      <h3 className="font-medium text-gray-900 text-lg mb-2">Pagos</h3>
                      <p className="text-sm text-gray-700">{formData.paymentTerms}</p>
                    </div>
                  )}

                  {formData.deliveryTerms && (
                    <div>
                      <h3 className="font-medium text-gray-900 text-lg mb-2">Entregas</h3>
                      <p className="text-sm text-gray-700">{formData.deliveryTerms}</p>
                    </div>
                  )}

                  {formData.returnTerms && (
                    <div>
                      <h3 className="font-medium text-gray-900 text-lg mb-2">Devoluciones</h3>
                      <p className="text-sm text-gray-700">{formData.returnTerms}</p>
                    </div>
                  )}

                  {formData.privacyPolicy && (
                    <div>
                      <h3 className="font-medium text-gray-900 text-lg mb-2">Privacidad</h3>
                      <p className="text-sm text-gray-700">{formData.privacyPolicy}</p>
                    </div>
                  )}

                  {formData.userRights && (
                    <div>
                      <h3 className="font-medium text-gray-900 text-lg mb-2">Derechos del Usuario</h3>
                      <p className="text-sm text-gray-700">{formData.userRights}</p>
                    </div>
                  )}

                  {formData.liabilityLimitation && (
                    <div>
                      <h3 className="font-medium text-gray-900 text-lg mb-2">Limitación de Responsabilidad</h3>
                      <p className="text-sm text-gray-700">{formData.liabilityLimitation}</p>
                    </div>
                  )}

                  {formData.contactInfo && (
                    <div>
                      <h3 className="font-medium text-gray-900 text-lg mb-2">Contacto Legal</h3>
                      <p className="text-sm text-gray-700">{formData.contactInfo}</p>
                    </div>
                  )}

                  {(!formData.generalTerms && !formData.purchaseTerms && !formData.paymentTerms) && (
                    <p className="text-sm text-gray-500 italic text-center">
                      Complete la información arriba para ver la vista previa
                    </p>
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
              {saving ? 'Guardando...' : 'Guardar términos'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}