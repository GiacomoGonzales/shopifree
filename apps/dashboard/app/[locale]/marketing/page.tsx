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
      image: '/images/marketing/attract.png',
      gradientFrom: 'from-blue-500',
      gradientTo: 'to-blue-600',
      href: '/marketing/attract'
    },
    {
      id: 'maintain',
      title: t('sections.maintain.title'),
      description: t('sections.maintain.description'),
      image: '/images/marketing/maintain.png',
      gradientFrom: 'from-green-500',
      gradientTo: 'to-green-600',
      href: '/marketing/maintain'
    },
    {
      id: 'recover',
      title: t('sections.recover.title'),
      description: t('sections.recover.description'),
      image: '/images/marketing/recover.png',
      gradientFrom: 'from-orange-500',
      gradientTo: 'to-orange-600',
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {marketingTools.map((tool) => (
                <div
                  key={tool.id}
                  onClick={() => router.push(tool.href)}
                  className="group relative overflow-hidden bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 hover:border-gray-300"
                >
                  {/* Image Container with Gradient Overlay */}
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={tool.image}
                      alt={tool.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradientFrom} ${tool.gradientTo} opacity-20 group-hover:opacity-30 transition-opacity duration-300`}></div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
                        {tool.title}
                      </h3>
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 group-hover:bg-gray-900 transition-colors">
                        <svg className="h-4 w-4 text-gray-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>

                  {/* Bottom Gradient Bar */}
                  <div className={`h-1 bg-gradient-to-r ${tool.gradientFrom} ${tool.gradientTo}`}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 