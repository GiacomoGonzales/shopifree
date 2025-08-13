'use client'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'

interface GeneralSettingsNavProps {
  currentSection: 'info' | 'contact' | 'branding' | 'sales' | 'advanced'
}

export default function GeneralSettingsNav({ currentSection }: GeneralSettingsNavProps) {
  const t = useTranslations('settings')
  const params = useParams()
  const locale = params?.locale || 'es'

  const sections = [
    { id: 'info', key: 'info' },
    { id: 'contact', key: 'contact' },
    { id: 'sales', key: 'sales' },
    { id: 'advanced', key: 'advanced' },
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
          {sections.map((section) => (
            <a
              key={section.id}
              href={`/${locale}/settings/general/${section.id}`}
              className={`py-2 px-3 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                currentSection === section.id
                  ? 'border-gray-600 text-gray-800'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t(`sections.${section.key}`)}
            </a>
          ))}
        </nav>
      </div>
    </div>
  )
} 