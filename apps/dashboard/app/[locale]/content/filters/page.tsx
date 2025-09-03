'use client'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import DashboardLayout from '../../../../components/DashboardLayout'
import FilterManager from '../../../../components/store-design/FilterManager'
import { ContentTabs } from '../../../../components/content/ContentTabs'

export default function ContentFiltersPage() {
  const t = useTranslations('content')
  const params = useParams()
  const locale = params?.locale || 'es'

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navegación por pestañas */}
          <ContentTabs currentTab="filters" />

          {/* Contenido */}
          <FilterManager />
        </div>
      </div>
    </DashboardLayout>
  )
} 