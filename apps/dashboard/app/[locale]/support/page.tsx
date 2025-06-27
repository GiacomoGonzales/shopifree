'use client'

import { useTranslations } from 'next-intl'
import DashboardLayout from '../../../components/DashboardLayout'

export default function SupportPage() {
  const t = useTranslations('pages.support')

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mt-8">
            {/* Opciones de soporte */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-medium text-gray-900">Preguntas Frecuentes</h3>
                      <p className="text-sm text-gray-500 mt-2">
                        Encuentra respuestas a las preguntas más comunes sobre Shopifree
                      </p>
                      <button className="mt-3 text-sm text-gray-800 hover:text-gray-900">
                        Ver FAQ →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-8 w-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="ml-4 flex-1">
                      <h3 className="text-lg font-medium text-gray-900">Contactar Soporte</h3>
                      <p className="text-sm text-gray-500 mt-2">
                        Envíanos un mensaje y te responderemos lo antes posible
                      </p>
                      <button className="mt-3 text-sm text-green-600 hover:text-green-500">
                        Contactar →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Formulario de contacto */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Formulario de Contacto
                </h3>
                <p className="text-gray-600 mb-6">
                  {t('description')}
                </p>
                
                <form className="space-y-4">
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                      Asunto
                    </label>
                    <input
                      type="text"
                      name="subject"
                      id="subject"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-600 focus:border-gray-600 sm:text-sm"
                      placeholder="Describe brevemente tu consulta"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                      Mensaje
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-600 focus:border-gray-600 sm:text-sm"
                      placeholder="Describe tu problema o consulta en detalle..."
                    />
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
                    >
                      Enviar Mensaje
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 