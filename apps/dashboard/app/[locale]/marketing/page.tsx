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
                  className="group relative bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-200 hover:border-gray-300 overflow-hidden"
                >
                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${tool.gradientFrom} ${tool.gradientTo} opacity-5 group-hover:opacity-10 transition-opacity duration-500`}></div>

                  {/* Content Container */}
                  <div className="relative p-8">
                    {/* 3D Graphic Element */}
                    <div className="relative w-full h-48 mb-6 flex items-center justify-center">
                      <div className="relative w-40 h-40 group-hover:scale-110 transition-transform duration-500 ease-out" style={{ perspective: '1000px' }}>
                        <Image
                          src={tool.image}
                          alt={tool.title}
                          width={160}
                          height={160}
                          className="drop-shadow-2xl group-hover:drop-shadow-[0_20px_40px_rgba(0,0,0,0.25)] transition-all duration-500"
                          style={{
                            transform: 'translateZ(20px)',
                            filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.15))'
                          }}
                        />
                      </div>
                    </div>

                    {/* Text Content */}
                    <div className="text-center space-y-3">
                      <h3 className="text-2xl font-bold text-gray-900 group-hover:text-gray-700 transition-colors">
                        {tool.title}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed px-2">
                        {tool.description}
                      </p>
                    </div>

                    {/* Arrow Button */}
                    <div className="mt-6 flex justify-center">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 group-hover:bg-gray-900 transition-all duration-300">
                        <svg className="h-5 w-5 text-gray-600 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Accent Bar */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r ${tool.gradientFrom} ${tool.gradientTo} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 