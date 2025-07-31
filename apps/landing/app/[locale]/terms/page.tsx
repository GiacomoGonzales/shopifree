'use client'

import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@shopifree/ui'
import LanguageSelector from '../../../components/LanguageSelector'

export default function TermsPage() {
  const t = useTranslations('home')
  const locale = useLocale()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href={`/${locale}`} className="transition-all duration-200 hover:scale-105">
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
              {/* Mobile: Login first, Desktop: Login first too */}
              <a href={`https://dashboard.shopifree.app/${locale}/login`} className="order-1">
                <Button variant="secondary" size="sm" className="bg-white hover:bg-gray-100 text-gray-900 border-gray-300">
                  {t('login')}
                </Button>
              </a>
              <div className="order-2">
                <LanguageSelector />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Términos y Condiciones</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            Última actualización: Diciembre 2024
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Aceptación de términos</h2>
            <p className="text-gray-700 mb-4">
              Al acceder y utilizar Shopifree, aceptas estar sujeto a estos términos y condiciones de uso.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Descripción del servicio</h2>
            <p className="text-gray-700 mb-4">
              Shopifree es una plataforma que permite a los usuarios crear y gestionar tiendas online. Proporcionamos herramientas para:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Crear y personalizar tiendas virtuales</li>
              <li>Gestionar productos e inventario</li>
              <li>Procesar pedidos y pagos</li>
              <li>Analizar rendimiento de ventas</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Responsabilidades del usuario</h2>
            <p className="text-gray-700 mb-4">
              Como usuario de Shopifree, te comprometes a:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Proporcionar información precisa y actualizada</li>
              <li>Mantener la seguridad de tu cuenta</li>
              <li>Cumplir con todas las leyes aplicables</li>
              <li>No utilizar el servicio para actividades ilegales</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Limitación de responsabilidad</h2>
            <p className="text-gray-700 mb-4">
              Shopifree se proporciona &ldquo;tal como es&rdquo; sin garantías de ningún tipo. No seremos responsables por daños directos, indirectos, incidentales o consecuentes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Modificaciones</h2>
            <p className="text-gray-700 mb-4">
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán efectivos inmediatamente después de su publicación.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Contacto</h2>
            <p className="text-gray-700 mb-4">
              Para preguntas sobre estos términos, contáctanos en:
            </p>
            <p className="text-gray-700">
              Email: legal@shopifree.app
            </p>
          </section>
        </div>
        </div>
      </main>

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
    </div>
  )
} 