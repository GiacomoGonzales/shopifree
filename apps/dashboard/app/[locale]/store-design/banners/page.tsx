'use client'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import DashboardLayout from '../../../../components/DashboardLayout'
import HeroImageUpload from '../../../../components/store-design/HeroImageUpload'
import CarouselImagesUpload from '../../../../components/store-design/CarouselImagesUpload'

export default function StoreDesignBannersPage() {
  const t = useTranslations('storeDesign')
  const params = useParams()
  const locale = params?.locale || 'es'

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navegación por pestañas - Carrusel horizontal */}
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
                  href={`/${locale}/store-design/branding`}
                  className="py-2 px-3 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 border-transparent text-gray-500 hover:text-gray-700"
                >
                  {t('tabs.logoColors')}
                </a>
                <a
                  href={`/${locale}/store-design/banners`}
                  className="py-2 px-3 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 border-gray-600 text-gray-800"
                >
                  {t('tabs.banners')}
                </a>
                <a
                  href={`/${locale}/store-design/announcement-bar`}
                  className="py-2 px-3 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 border-transparent text-gray-500 hover:text-gray-700"
                >
                  {t('tabs.announcementBar')}
                </a>
                <a
                  href={`/${locale}/store-design/themes`}
                  className="py-2 px-3 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 border-transparent text-gray-500 hover:text-gray-700"
                >
                  {t('tabs.themes')}
                </a>
              </nav>
            </div>
          </div>

          {/* Contenido */}
          <div className="space-y-6">
            {/* Imagen Hero */}
            <HeroImageUpload />

            <CarouselImagesUpload />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 