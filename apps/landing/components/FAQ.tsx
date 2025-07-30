'use client'

import { useState } from 'react'

interface FAQItem {
  id: string
  question: string
  answer: string
}

const faqData: FAQItem[] = [
  {
    id: 'what-is-shopifree',
    question: '¿Qué es Shopifree?',
    answer: 'Shopifree es una plataforma completa para crear y gestionar tu tienda online sin conocimientos técnicos. Te permite vender productos, gestionar pedidos, personalizar tu tienda y mucho más, todo desde un panel intuitivo.'
  },
  {
    id: 'technical-knowledge',
    question: '¿Necesito conocimientos técnicos para usarlo?',
    answer: 'No, Shopifree está diseñado para ser extremadamente fácil de usar. Nuestro editor visual te permite crear y personalizar tu tienda simplemente arrastrando y soltando elementos, sin necesidad de programar.'
  },
  {
    id: 'custom-domain',
    question: '¿Puedo conectar mi propio dominio?',
    answer: 'Sí, puedes conectar tu dominio personalizado a tu tienda Shopifree. Te proporcionamos guías paso a paso para configurar tu dominio y asegurarnos de que todo funcione perfectamente.'
  },
  {
    id: 'payment-methods',
    question: '¿Qué métodos de pago puedo habilitar en mi tienda?',
    answer: 'Shopifree soporta múltiples métodos de pago incluyendo tarjetas de crédito/débito, PayPal, transferencias bancarias y más. Puedes habilitar los métodos que prefieras según tu ubicación y necesidades.'
  },
  {
    id: 'order-management',
    question: '¿Puedo gestionar pedidos y clientes desde el panel?',
    answer: 'Absolutamente. El panel de administración de Shopifree te permite gestionar todos tus pedidos, ver información detallada de clientes, controlar inventario, generar reportes y mucho más, todo desde un lugar centralizado.'
  },
  {
    id: 'costs-commissions',
    question: '¿Tiene algún costo o comisión por venta?',
    answer: 'Shopifree ofrece planes flexibles sin comisiones por venta. Solo pagas una suscripción mensual fija que incluye todas las funcionalidades, hosting, soporte técnico y actualizaciones constantes.'
  }
]

export default function FAQ() {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id)
    } else {
      newOpenItems.add(id)
    }
    setOpenItems(newOpenItems)
  }

  return (
    <section className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Column - Title */}
          <div className="text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Preguntas
              <br />
              Frecuentes
            </h2>
            <p className="text-lg text-gray-600 max-w-lg">
              Resolvemos las dudas más comunes sobre Shopifree para que puedas empezar con confianza.
            </p>
          </div>

          {/* Right Column - FAQ Accordion */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {faqData.map((item) => {
                const isOpen = openItems.has(item.id)
                
                return (
                  <div key={item.id} className="group">
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="w-full px-6 py-5 text-left focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-inset focus:ring-offset-0 hover:bg-gray-50 transition-colors duration-150 rounded-xl"
                      aria-expanded={isOpen}
                    >
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-gray-900 pr-4">
                          {item.question}
                        </h3>
                        <div className="flex-shrink-0">
                          <div className={`w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center transition-all duration-200 ${isOpen ? 'bg-emerald-600' : 'group-hover:bg-emerald-200'}`}>
                            {isOpen ? (
                              <svg
                                className="w-4 h-4 text-white"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            ) : (
                              <svg
                                className={`w-4 h-4 transition-colors duration-200 ${isOpen ? 'text-white' : 'text-emerald-600 group-hover:text-emerald-700'}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                              </svg>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                    
                    {/* Answer Content */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="px-6 pb-5">
                        <p className="text-gray-600 leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}