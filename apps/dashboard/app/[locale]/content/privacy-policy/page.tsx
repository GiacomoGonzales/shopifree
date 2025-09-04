'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import DashboardLayout from '../../../../components/DashboardLayout'
import { useAuth } from '../../../../lib/simple-auth-context'
import { getUserStore, updateStore, StoreWithId } from '../../../../lib/store'
import LoadingAnimation from '../../../../components/LoadingAnimation'
import { ContentTabs } from '../../../../components/content/ContentTabs'

interface PrivacyPolicyData {
  introduction: string
  dataCollection: string
  dataUsage: string
  dataSharing: string
  cookiesPolicy: string
  userRights: string
  dataRetention: string
  dataSecurity: string
  minorProtection: string
  thirdPartyServices: string
  policyUpdates: string
  contactInfo: string
  lastUpdated: string
  effectiveDate: string
  showLastUpdated: boolean
  showEffectiveDate: boolean
}

export default function ContentPrivacyPolicyPage() {
  const { user } = useAuth()
  const t = useTranslations('content')
  const tActions = useTranslations('settings.actions')
  const params = useParams()
  const locale = params?.locale || 'es'
  
  const [store, setStore] = useState<StoreWithId | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const [formData, setFormData] = useState<PrivacyPolicyData>({
    introduction: '',
    dataCollection: '',
    dataUsage: '',
    dataSharing: '',
    cookiesPolicy: '',
    userRights: '',
    dataRetention: '',
    dataSecurity: '',
    minorProtection: '',
    thirdPartyServices: '',
    policyUpdates: '',
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
          if (userStore.legal?.privacyPolicy) {
            const privacyData = userStore.legal.privacyPolicy
            setFormData({
              introduction: privacyData.introduction || '',
              dataCollection: privacyData.dataCollection || '',
              dataUsage: privacyData.dataUsage || '',
              dataSharing: privacyData.dataSharing || '',
              cookiesPolicy: privacyData.cookiesPolicy || '',
              userRights: privacyData.userRights || '',
              dataRetention: privacyData.dataRetention || '',
              dataSecurity: privacyData.dataSecurity || '',
              minorProtection: privacyData.minorProtection || '',
              thirdPartyServices: privacyData.thirdPartyServices || '',
              policyUpdates: privacyData.policyUpdates || '',
              contactInfo: privacyData.contactInfo || '',
              lastUpdated: privacyData.lastUpdated || '',
              effectiveDate: privacyData.effectiveDate || '',
              showLastUpdated: privacyData.showLastUpdated ?? true,
              showEffectiveDate: privacyData.showEffectiveDate ?? true
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

  const handleChange = (field: keyof PrivacyPolicyData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!store?.id || !user?.uid) return

    setSaving(true)
    try {
      // Actualizar los datos de política de privacidad en el campo correspondiente
      await updateStore(store.id, {
        legal: {
          ...store?.legal,
          privacyPolicy: formData
        }
      })
      
      setSaveMessage('Política de privacidad guardada exitosamente')
      
      // Limpiar mensaje después de 3 segundos
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      console.error('Error saving privacy policy:', error)
      setSaveMessage('Error al guardar la política. Inténtalo de nuevo.')
      
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
          <ContentTabs currentTab="privacy" />

          {/* Contenido */}
          <div className="space-y-6">
            {/* Información General */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Política de Privacidad</h3>
              <p className="text-sm text-gray-600 mb-6">
                Configure la política de privacidad que explica cómo recopila, usa y protege la información personal de los usuarios.
              </p>
              
              <div className="space-y-6">
                {/* Introducción */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Introducción
                  </label>
                  <textarea
                    value={formData.introduction}
                    onChange={(e) => handleChange('introduction', e.target.value)}
                    placeholder="Ejemplo: En nuestra tienda, valoramos y respetamos su privacidad. Esta política explica cómo recopilamos, usamos y protegemos su información personal cuando utiliza nuestros servicios."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Introducción general sobre el compromiso con la privacidad
                  </p>
                </div>

                {/* Recopilación de datos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recopilación de datos
                  </label>
                  <textarea
                    value={formData.dataCollection}
                    onChange={(e) => handleChange('dataCollection', e.target.value)}
                    placeholder="Ejemplo: Recopilamos información que usted nos proporciona directamente, como su nombre, dirección de email, dirección de envío y detalles de pago cuando realiza una compra. También recopilamos automáticamente información sobre su uso de nuestro sitio web."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Qué tipo de información personal se recopila y cómo
                  </p>
                </div>

                {/* Uso de datos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Uso de datos
                  </label>
                  <textarea
                    value={formData.dataUsage}
                    onChange={(e) => handleChange('dataUsage', e.target.value)}
                    placeholder="Ejemplo: Utilizamos su información para procesar pedidos, enviar productos, proporcionar atención al cliente, mejorar nuestros servicios y enviarle comunicaciones relacionadas con su cuenta o promociones (con su consentimiento)."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Para qué propósitos se utiliza la información recopilada
                  </p>
                </div>

                {/* Compartir datos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Compartir datos con terceros
                  </label>
                  <textarea
                    value={formData.dataSharing}
                    onChange={(e) => handleChange('dataSharing', e.target.value)}
                    placeholder="Ejemplo: No vendemos, alquilamos ni compartimos su información personal con terceros para fines de marketing. Podemos compartir información con proveedores de servicios de confianza (procesadores de pago, empresas de envío) solo para completar su pedido."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Cuándo y con quién se comparte la información personal
                  </p>
                </div>

                {/* Política de cookies */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Política de cookies
                  </label>
                  <textarea
                    value={formData.cookiesPolicy}
                    onChange={(e) => handleChange('cookiesPolicy', e.target.value)}
                    placeholder="Ejemplo: Utilizamos cookies y tecnologías similares para mejorar su experiencia de navegación, recordar sus preferencias y analizar el tráfico del sitio. Puede controlar las cookies a través de la configuración de su navegador."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Cómo se utilizan las cookies y tecnologías de seguimiento
                  </p>
                </div>

                {/* Derechos del usuario */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Derechos del usuario
                  </label>
                  <textarea
                    value={formData.userRights}
                    onChange={(e) => handleChange('userRights', e.target.value)}
                    placeholder="Ejemplo: Usted tiene derecho a acceder, rectificar, cancelar u oponerse al tratamiento de sus datos personales. También puede solicitar la portabilidad de sus datos. Para ejercer estos derechos, contáctenos usando la información proporcionada al final de esta política."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Derechos que tienen los usuarios sobre sus datos personales
                  </p>
                </div>

                {/* Retención de datos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Retención de datos
                  </label>
                  <textarea
                    value={formData.dataRetention}
                    onChange={(e) => handleChange('dataRetention', e.target.value)}
                    placeholder="Ejemplo: Conservamos su información personal solo durante el tiempo necesario para cumplir con los propósitos descritos en esta política, cumplir con obligaciones legales o resolver disputas. Los datos de cuenta se mantienen mientras la cuenta esté activa."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Cuánto tiempo se conservan los datos personales
                  </p>
                </div>

                {/* Seguridad de datos */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seguridad de datos
                  </label>
                  <textarea
                    value={formData.dataSecurity}
                    onChange={(e) => handleChange('dataSecurity', e.target.value)}
                    placeholder="Ejemplo: Implementamos medidas de seguridad técnicas y organizacionales apropiadas para proteger su información personal contra acceso no autorizado, alteración, divulgación o destrucción. Utilizamos cifrado SSL y sistemas seguros de almacenamiento."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Medidas de seguridad implementadas para proteger los datos
                  </p>
                </div>

                {/* Protección de menores */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Protección de menores
                  </label>
                  <textarea
                    value={formData.minorProtection}
                    onChange={(e) => handleChange('minorProtection', e.target.value)}
                    placeholder="Ejemplo: Nuestros servicios no están dirigidos a menores de 18 años. No recopilamos intencionalmente información personal de menores. Si detectamos que hemos recopilado datos de un menor, tomaremos medidas para eliminar dicha información."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Políticas específicas para la protección de menores de edad
                  </p>
                </div>

                {/* Servicios de terceros */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Servicios de terceros
                  </label>
                  <textarea
                    value={formData.thirdPartyServices}
                    onChange={(e) => handleChange('thirdPartyServices', e.target.value)}
                    placeholder="Ejemplo: Nuestro sitio puede contener enlaces a sitios web de terceros. No somos responsables de las prácticas de privacidad de estos sitios. Le recomendamos revisar las políticas de privacidad de cualquier sitio web de terceros que visite."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Información sobre servicios de terceros integrados
                  </p>
                </div>

                {/* Actualizaciones de política */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Actualizaciones de la política
                  </label>
                  <textarea
                    value={formData.policyUpdates}
                    onChange={(e) => handleChange('policyUpdates', e.target.value)}
                    placeholder="Ejemplo: Podemos actualizar esta política de privacidad ocasionalmente. Le notificaremos sobre cambios significativos publicando la nueva política en nuestro sitio web y actualizando la fecha de 'Última actualización'. Su uso continuado del sitio constituye aceptación de los cambios."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Cómo se manejan las actualizaciones de la política
                  </p>
                </div>

                {/* Información de contacto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Información de contacto
                  </label>
                  <textarea
                    value={formData.contactInfo}
                    onChange={(e) => handleChange('contactInfo', e.target.value)}
                    placeholder="Ejemplo: Si tiene preguntas sobre esta política de privacidad o desea ejercer sus derechos de datos, contáctenos en: privacidad@tutienda.com, teléfono +51 999 999 999, o por correo postal en Av. Principal 123, Ciudad, País."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Información de contacto para consultas sobre privacidad
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
                    Cuándo entra en vigor esta política
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
                    Cuándo se actualizó por última vez
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
                Así es como verán los clientes la política de privacidad en tu tienda:
              </p>

              <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-6 max-h-96 overflow-y-auto">
                <div className="space-y-6">
                  <div className="text-center border-b border-gray-300 pb-4">
                    <h1 className="text-2xl font-bold text-gray-900">Política de Privacidad</h1>
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

                  {formData.introduction && (
                    <div>
                      <h3 className="font-medium text-gray-900 text-lg mb-2">Introducción</h3>
                      <p className="text-sm text-gray-700">{formData.introduction}</p>
                    </div>
                  )}

                  {formData.dataCollection && (
                    <div>
                      <h3 className="font-medium text-gray-900 text-lg mb-2">Recopilación de Datos</h3>
                      <p className="text-sm text-gray-700">{formData.dataCollection}</p>
                    </div>
                  )}

                  {formData.dataUsage && (
                    <div>
                      <h3 className="font-medium text-gray-900 text-lg mb-2">Uso de Datos</h3>
                      <p className="text-sm text-gray-700">{formData.dataUsage}</p>
                    </div>
                  )}

                  {formData.dataSharing && (
                    <div>
                      <h3 className="font-medium text-gray-900 text-lg mb-2">Compartir Datos</h3>
                      <p className="text-sm text-gray-700">{formData.dataSharing}</p>
                    </div>
                  )}

                  {formData.cookiesPolicy && (
                    <div>
                      <h3 className="font-medium text-gray-900 text-lg mb-2">Cookies</h3>
                      <p className="text-sm text-gray-700">{formData.cookiesPolicy}</p>
                    </div>
                  )}

                  {formData.userRights && (
                    <div>
                      <h3 className="font-medium text-gray-900 text-lg mb-2">Sus Derechos</h3>
                      <p className="text-sm text-gray-700">{formData.userRights}</p>
                    </div>
                  )}

                  {formData.dataSecurity && (
                    <div>
                      <h3 className="font-medium text-gray-900 text-lg mb-2">Seguridad</h3>
                      <p className="text-sm text-gray-700">{formData.dataSecurity}</p>
                    </div>
                  )}

                  {formData.contactInfo && (
                    <div>
                      <h3 className="font-medium text-gray-900 text-lg mb-2">Contacto</h3>
                      <p className="text-sm text-gray-700">{formData.contactInfo}</p>
                    </div>
                  )}

                  {(!formData.introduction && !formData.dataCollection && !formData.dataUsage) && (
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
              {saving ? 'Guardando...' : 'Guardar política'}
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}