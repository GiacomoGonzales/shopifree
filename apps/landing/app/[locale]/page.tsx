'use client'

import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@shopifree/ui'
import PhoneDemo from '../../components/PhoneDemo'
import LanguageSelector from '../../components/LanguageSelector'
import FAQ from '../../components/FAQ'

export default function HomePage() {
  const t = useTranslations('home')
  const locale = useLocale()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href={`/${locale}`} className="focus:outline-none focus:ring-2 focus:ring-gray-600 rounded-md transition-all duration-200 hover:scale-105">
                <Image 
                  src="/logo-primary.svg" 
                  alt="Shopifree Logo" 
                  width={224} 
                  height={64}
                  className="h-12 w-auto object-contain"
                  priority
                />
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {/* Mobile order: Login button first, then language selector */}
              <a href={`https://dashboard.shopifree.app/${locale}/login`} className="order-1 sm:order-2">
                <Button variant="secondary" size="sm" className="bg-white hover:bg-gray-100 text-gray-900 border-gray-300">
                  {t('login')}
                </Button>
              </a>
              <div className="order-2 sm:order-1">
                <LanguageSelector />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative overflow-hidden">
        {/* Background with green gradient and animated blobs */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-100">
          {/* Animated Blobs */}
          <div className="absolute top-10 -left-20 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-40 animate-blob"></div>
          <div className="absolute top-40 -right-20 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-32 left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-35 animate-blob animation-delay-4000"></div>
          
          {/* Subtle overlay for better text contrast */}
          <div className="absolute inset-0 bg-white/20"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column - Text Content */}
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-8 drop-shadow-sm">
                {t('title')}
              </h1>
              <p className="text-xl text-gray-700 mb-12 max-w-3xl lg:max-w-none drop-shadow-sm">
                {t('subtitle')}
              </p>
              <a href={`https://dashboard.shopifree.app/${locale}/register`}>
                <Button size="lg" className="px-8 py-4 text-lg !bg-emerald-600 hover:!bg-emerald-700 text-white border-emerald-600 shadow-lg hover:shadow-xl transition-all duration-200">
                  {t('startFree')}
                </Button>
              </a>
            </div>

            {/* Right Column - Phone Demo */}
            <div className="flex justify-center lg:justify-end">
              <PhoneDemo />
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('feature1.title')}</h3>
            <p className="text-gray-600">{t('feature1.description')}</p>
          </div>
          
          <div className="text-center">
            <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('feature2.title')}</h3>
            <p className="text-gray-600">{t('feature2.description')}</p>
          </div>
          
          <div className="text-center">
            <div className="bg-gray-300 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('feature3.title')}</h3>
            <p className="text-gray-600">{t('feature3.description')}</p>
          </div>
        </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQ />

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="mb-4">
                <Image 
                  src="/logo-primary.svg" 
                  alt="Shopifree Logo" 
                  width={240} 
                  height={70}
                  className="h-14 w-auto object-contain brightness-0 invert"
                />
              </div>
              <p className="text-gray-400">{t('footer.description')}</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">{t('footer.legal')}</h4>
              <ul className="space-y-2">
                <li>
                  <Link href={`/${locale}/privacy`} className="text-gray-400 hover:text-white">
                    {t('footer.privacy')}
                  </Link>
                </li>
                <li>
                  <Link href={`/${locale}/terms`} className="text-gray-400 hover:text-white">
                    {t('footer.terms')}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">{t('footer.support')}</h4>
              <ul className="space-y-2">
                <li>
                  <Link href={`/${locale}/contact`} className="text-gray-400 hover:text-white">
                    {t('footer.contact')}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold mb-4">{t('footer.followUs')}</h4>
              <p className="text-gray-400 text-sm">© 2024 Shopifree. {t('footer.rights')}</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  )
} 