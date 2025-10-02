'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import DashboardLayout from '../../../components/DashboardLayout'

export default function MarketingPage() {
  const t = useTranslations('marketing')
  const router = useRouter()

  const marketingTools = [
    {
      id: 'attract',
      title: t('sections.attract.title'),
      description: t('sections.attract.description'),
      image: '/images/marketing/attract.png?v=2',
      gradientFrom: 'from-gray-600',
      gradientTo: 'to-gray-700',
      href: '/marketing/attract'
    },
    {
      id: 'maintain',
      title: t('sections.maintain.title'),
      description: t('sections.maintain.description'),
      image: '/images/marketing/maintain.png?v=2',
      gradientFrom: 'from-gray-600',
      gradientTo: 'to-gray-700',
      href: '/marketing/maintain'
    },
    {
      id: 'recover',
      title: t('sections.recover.title'),
      description: t('sections.recover.description'),
      image: '/images/marketing/recover.png?v=2',
      gradientFrom: 'from-gray-600',
      gradientTo: 'to-gray-700',
      href: '/marketing/recover'
    }
  ]

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-light text-gray-900">{t('title')}</h1>
                <p className="mt-1 text-sm text-gray-600">{t('subtitle')}</p>
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 lg:px-8 pb-8">
            {/* Marketing Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {marketingTools.map((tool) => (
                <div
                  key={tool.id}
                  onClick={() => router.push(tool.href)}
                  className="group relative cursor-pointer"
                >
                  {/* Card Container */}
                  <div className="bg-white rounded-3xl p-8 transition-all duration-300 md:hover:shadow-xl border border-gray-100 md:hover:border-gray-200 active:scale-[0.98]">
                    {/* Floating Image */}
                    <div className="flex justify-center mb-6">
                      <div className="relative transition-transform duration-300 md:group-hover:scale-110 md:group-hover:-translate-y-2">
                        <Image
                          src={tool.image}
                          alt={tool.title}
                          width={120}
                          height={120}
                          className="drop-shadow-[0_10px_25px_rgba(0,0,0,0.1)] transition-all duration-300 md:group-hover:drop-shadow-[0_20px_35px_rgba(0,0,0,0.15)]"
                        />
                      </div>
                    </div>

                    {/* Text Content */}
                    <div className="text-center space-y-3">
                      <h3 className="text-xl font-semibold text-gray-900 transition-colors duration-200 md:group-hover:text-gray-700">
                        {tool.title}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        {tool.description}
                      </p>
                    </div>

                    {/* Arrow Indicator */}
                    <div className="mt-6 flex justify-center">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-600 md:text-gray-400 md:group-hover:text-gray-900 transition-colors duration-200">
                        <span className="md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-200">Ver más</span>
                        <svg className="h-4 w-4 transform md:group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 