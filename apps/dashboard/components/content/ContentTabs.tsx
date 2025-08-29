import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'

interface ContentTabsProps {
  currentTab: 'sections' | 'filters' | 'shipping'
}

export function ContentTabs({ currentTab }: ContentTabsProps) {
  const t = useTranslations('content')
  const params = useParams()
  const locale = params?.locale || 'es'

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
          aria-label="Tabs"
        >
          <a
            href={`/${locale}/content/sections`}
            className={`py-2 px-3 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
              currentTab === 'sections' 
                ? 'border-gray-600 text-gray-800' 
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('tabs.sections')}
          </a>
          <a
            href={`/${locale}/content/filters`}
            className={`py-2 px-3 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
              currentTab === 'filters'
                ? 'border-gray-600 text-gray-800'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('tabs.filters')}
          </a>
          <a
            href={`/${locale}/content/shipping-policies`}
            className={`py-2 px-3 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
              currentTab === 'shipping'
                ? 'border-gray-600 text-gray-800'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {t('tabs.shipping')}
          </a>
        </nav>
      </div>
    </div>
  )
}
