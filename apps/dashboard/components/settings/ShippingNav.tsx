'use client'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'

interface ShippingNavProps {
  currentSection: 'store-pickup' | 'local-delivery' | 'national-shipping' | 'international-shipping' | 'additional-rules'
}

export default function ShippingNav({ currentSection }: ShippingNavProps) {
  const t = useTranslations('settings')
  const params = useParams()
  const locale = params?.locale || 'es'

  const tabs = [
    { id: 'store-pickup', label: 'Recojo en tienda' },
    { id: 'local-delivery', label: 'Envío local' },
    { id: 'national-shipping', label: 'Envío nacional' },
    { id: 'international-shipping', label: 'Envío internacional' },
    { id: 'additional-rules', label: 'Reglas adicionales' }
  ]

  return (
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
            <a
              key={tab.id}
              href={`/${locale}/settings/shipping/${tab.id}`}
              className={`py-2 px-3 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                currentSection === tab.id
                  ? 'border-gray-600 text-gray-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  )
} 