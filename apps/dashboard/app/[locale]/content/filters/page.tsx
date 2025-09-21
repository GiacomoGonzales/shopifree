'use client'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import DashboardLayout from '../../../../components/DashboardLayout'
import FilterManager from '../../../../components/store-design/FilterManager'
import { ContentTabs } from '../../../../components/content/ContentTabs'
import { Toast } from '../../../../components/shared/Toast'
import { useToast } from '../../../../lib/hooks/useToast'

export default function ContentFiltersPage() {
  const t = useTranslations('content')
  const params = useParams()
  const locale = params?.locale || 'es'

  const { toast, showToast, hideToast } = useToast()

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navegación por pestañas */}
          <ContentTabs currentTab="filters" />

          {/* Contenido */}
          <FilterManager showToast={showToast} />
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