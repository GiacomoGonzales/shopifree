'use client'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import DashboardLayout from '../../../../../components/DashboardLayout'
import GeneralSettingsNav from '../../../../../components/settings/GeneralSettingsNav'
import BrandingSection from '../../../../../components/settings/BrandingSection'

export default function GeneralSettingsBrandingPage() {
  const t = useTranslations('settings')
  const params = useParams()
  const locale = params?.locale || 'es'

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navegación */}
          <GeneralSettingsNav currentSection="branding" />

          {/* Contenido */}
          <div className="max-w-4xl">
            <BrandingSection />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 