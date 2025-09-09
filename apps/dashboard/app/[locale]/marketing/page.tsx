'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import DashboardLayout from '../../../components/DashboardLayout'

export default function MarketingPage() {
  const t = useTranslations('marketing')
  const router = useRouter()

  const marketingTools = [
    {
      id: 'attract',
      title: t('sections.attract.title'),
      description: t('sections.attract.description'),
      icon: (
        <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      ),
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      href: '/marketing/attract'
    },
    {
      id: 'maintain',
      title: t('sections.maintain.title'),
      description: t('sections.maintain.description'),
      icon: (
        <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      href: '/marketing/maintain'
    },
    {
      id: 'recover',
      title: t('sections.recover.title'),
      description: t('sections.recover.description'),
      icon: (
        <svg className="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
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

          <div className="px-4 sm:px-6 lg:px-8">
            {/* Marketing Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {marketingTools.map((tool) => (
                <div
                  key={tool.id}
                  onClick={() => router.push(tool.href)}
                  className={`${tool.bgColor} ${tool.borderColor} border-2 rounded-lg p-6 cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105`}
                >
                  <div className="flex items-center mb-4">
                    <div className="bg-white p-3 rounded-lg shadow-sm mr-4">
                      {tool.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{tool.title}</h3>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">{tool.description}</p>
                  <div className="mt-4 flex justify-end">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
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