'use client'

import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import DashboardLayout from '../../../components/DashboardLayout'
import { useAuth } from '../../../lib/simple-auth-context'
import { useStore } from '../../../lib/hooks/useStore'
import { getFilteredProducts } from '../../../lib/products'
import { getParentCategories } from '../../../lib/categories'
import { getCoupons } from '../../../lib/coupons'
import { getPromotions } from '../../../lib/promotions'
import WhatsNew from '../../../components/WhatsNew'

export default function HomePage() {
  const { userData } = useAuth()
  const { store } = useStore()
  const pathname = usePathname()
  const currentLocale = pathname.split('/')[1] || 'es'
  const isSpanish = currentLocale === 'es'

  const [productCount, setProductCount] = useState(0)
  const [categoryCount, setCategoryCount] = useState(0)
  const [paymentMethodsCount, setPaymentMethodsCount] = useState(0)
  const [carouselImagesCount, setCarouselImagesCount] = useState(0)
  const [socialMediaCount, setSocialMediaCount] = useState(0)
  const [shippingMethodsCount, setShippingMethodsCount] = useState(0)
  const [promotionsCount, setPromotionsCount] = useState(0)
  const [announcementBarConfigured, setAnnouncementBarConfigured] = useState(false)
  const [allFirstStepsCompleted, setAllFirstStepsCompleted] = useState(false)
  const [seoConfigured, setSeoConfigured] = useState(false)
  const [domainConfigured, setDomainConfigured] = useState(false)
  const [analyticsConfigured, setAnalyticsConfigured] = useState(false)
  const [showFirstStepsDetails, setShowFirstStepsDetails] = useState(false)
  const [loading, setLoading] = useState(true)

  // Cargar el conteo de productos y categorías
  useEffect(() => {
    const loadCounts = async () => {
      if (!store?.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)

        // Cargar conteos en paralelo
        const [productResult, categories, coupons, promotions] = await Promise.all([
          getFilteredProducts(store.id, { status: 'all' }, 1, 1),
          getParentCategories(store.id),
          getCoupons(store.id),
          getPromotions(store.id)
        ])

        setProductCount(productResult.totalItems)
        setCategoryCount(categories.length)

        // Contar promociones y cupones combinados
        const totalPromotions = coupons.length + promotions.length
        setPromotionsCount(totalPromotions)
      } catch (error) {
        console.error('Error loading counts:', error)
        setProductCount(0)
        setCategoryCount(0)
        setPromotionsCount(0)
      } finally {
        setLoading(false)
      }
    }

    loadCounts()
  }, [store?.id])

  // Actualizar conteos basados en los datos de la tienda cuando cambie
  useEffect(() => {
    if (!store) return

    // Contar métodos de pago configurados
    let paymentCount = 0
    if (store.advanced?.payments?.acceptCashOnDelivery) {
      paymentCount++
    }
    if (store.advanced?.payments?.acceptOnlinePayment && store.advanced?.payments?.provider) {
      paymentCount++
    }
    setPaymentMethodsCount(paymentCount)

    // Contar imágenes del carrusel
    console.log('Store data updated:', store)
    console.log('Carousel images:', store.carouselImages)
    const carouselCount = store.carouselImages?.length || 0
    console.log('Carousel count:', carouselCount)
    setCarouselImagesCount(carouselCount)

    // Contar redes sociales configuradas
    let socialCount = 0
    if (store.socialMedia) {
      const socialFields = ['facebook', 'instagram', 'whatsapp', 'tiktok', 'x', 'snapchat', 'linkedin', 'telegram', 'youtube', 'pinterest']
      socialFields.forEach(field => {
        if (store.socialMedia?.[field as keyof typeof store.socialMedia]?.trim()) {
          socialCount++
        }
      })
    }
    console.log('Social media count:', socialCount)
    setSocialMediaCount(socialCount)

    // Contar métodos de envío configurados
    let shippingCount = 0
    if (store.advanced?.shipping?.enabled && store.advanced?.shipping?.modes) {
      const shippingModes = store.advanced.shipping.modes
      if (shippingModes.storePickup) shippingCount++
      if (shippingModes.localDelivery) shippingCount++
      if (shippingModes.nationalShipping) shippingCount++
      if (shippingModes.internationalShipping) shippingCount++
    }
    console.log('Shipping methods count:', shippingCount)
    setShippingMethodsCount(shippingCount)

    // Verificar si la barra de anuncio está configurada
    const isAnnouncementBarConfigured = !!(
      store.announcementBar?.enabled &&
      store.announcementBar?.message?.trim()
    )
    console.log('Announcement bar configured:', isAnnouncementBarConfigured)
    setAnnouncementBarConfigured(isAnnouncementBarConfigured)

    // Verificar si SEO está configurado básicamente
    const isSeoConfigured = !!(
      store.advanced?.seo?.title?.trim() ||
      store.advanced?.seo?.metaDescription?.trim()
    )
    console.log('SEO configured:', isSeoConfigured)
    setSeoConfigured(isSeoConfigured)

    // Verificar si el dominio personalizado está configurado
    const checkDomainConfiguration = async () => {
      if (!store?.id) return false
      try {
        const { getFirebaseDb } = await import('../../../lib/firebase')
        const { doc, getDoc } = await import('firebase/firestore')
        const db = getFirebaseDb()
        if (!db) return false

        const domainRef = doc(db, 'stores', store.id, 'settings', 'domain')
        const domainSnap = await getDoc(domainRef)

        if (domainSnap.exists()) {
          const domainData = domainSnap.data()
          const isConfigured = !!(
            domainData?.customDomain?.trim() &&
            (domainData?.verified || domainData?.vercelData?.verified)
          )
          console.log('Domain configured:', isConfigured, domainData)
          return isConfigured
        }
        return false
      } catch (error) {
        console.error('Error checking domain configuration:', error)
        return false
      }
    }

    checkDomainConfiguration().then(setDomainConfigured)

    // Verificar si Analytics está configurado
    const isAnalyticsConfigured = !!(
      store.advanced?.integrations?.googleAnalytics?.trim()
    )
    console.log('Analytics configured:', isAnalyticsConfigured)
    setAnalyticsConfigured(isAnalyticsConfigured)

    // Verificar si todos los primeros pasos están completados
    const firstStepsCompleted =
      productCount >= 10 &&
      categoryCount >= 1 &&
      paymentMethodsCount >= 1 &&
      isAnnouncementBarConfigured &&
      carouselImagesCount >= 3 &&
      socialMediaCount >= 1 &&
      shippingMethodsCount >= 1 &&
      promotionsCount >= 1

    console.log('All first steps completed:', firstStepsCompleted)
    setAllFirstStepsCompleted(firstStepsCompleted)
  }, [store, productCount, categoryCount, paymentMethodsCount, carouselImagesCount, socialMediaCount, shippingMethodsCount, promotionsCount])


  // Verificar si los datos están listos
  const isDataLoaded = userData && store && !loading

  // Mostrar loading mientras se cargan los datos
  if (!isDataLoaded) {
    return (
      <DashboardLayout>
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="w-full overflow-hidden">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Sección de Novedades */}
      <WhatsNew locale={currentLocale} />

      {/* Sección 2: Primeros Pasos */}
      <div className={`py-6 ${allFirstStepsCompleted ? 'bg-green-50' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
              {allFirstStepsCompleted && (
                <svg className="w-6 h-6 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {allFirstStepsCompleted
                ? (isSpanish ? '¡Primeros pasos completados!' : 'First steps completed!')
                : (isSpanish ? 'Primeros pasos' : 'First steps')
              }
            </h2>
            <p className="text-sm text-gray-600">
              {allFirstStepsCompleted
                ? (isSpanish
                    ? '¡Excelente trabajo! Has configurado todos los elementos básicos de tu tienda.'
                    : 'Excellent work! You have configured all the basic elements of your store.')
                : (isSpanish
                    ? 'Comienza configurando estos elementos básicos de tu tienda.'
                    : 'Start by setting up these basic elements of your store.')
              }
            </p>

            {allFirstStepsCompleted && (
              <button
                onClick={() => setShowFirstStepsDetails(!showFirstStepsDetails)}
                className="inline-flex items-center text-sm text-green-700 hover:text-green-800 font-medium"
              >
                {showFirstStepsDetails ? 'Ocultar detalles' : 'Ver detalles'}
                <svg
                  className={`ml-1 w-4 h-4 transition-transform ${showFirstStepsDetails ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            )}
          </div>

          {(!allFirstStepsCompleted || showFirstStepsDetails) && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Crear categorías */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  {categoryCount >= 1 ? (
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  )}
                </div>
                <h3 className="text-sm font-medium text-gray-900">
                  {isSpanish ? 'Categorías' : 'Categories'}
                </h3>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                {Math.min(categoryCount, 1)}/1 {isSpanish ? 'primera categoría' : 'first category'}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    categoryCount >= 1 ? 'bg-green-600' : 'bg-gray-600'
                  }`}
                  style={{ width: `${Math.min((categoryCount / 1) * 100, 100)}%` }}
                ></div>
              </div>
              {categoryCount >= 1 ? (
                <p className="text-xs text-green-600 font-medium">
                  {isSpanish ? '¡Objetivo completado!' : 'Goal completed!'}
                </p>
              ) : (
                <a
                  href="/categories"
                  className="text-xs text-gray-500 hover:text-gray-700 hover:underline cursor-pointer"
                >
                  {isSpanish ? 'Crea tu primera categoría' : 'Create your first category'}
                </a>
              )}
            </div>

            {/* Agregar productos */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  {productCount >= 10 ? (
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  )}
                </div>
                <h3 className="text-sm font-medium text-gray-900">
                  {isSpanish ? 'Productos' : 'Products'}
                </h3>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                {Math.min(productCount, 10)}/10 {isSpanish ? 'primeros productos' : 'first products'}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    productCount >= 10 ? 'bg-green-600' : 'bg-gray-600'
                  }`}
                  style={{ width: `${Math.min((productCount / 10) * 100, 100)}%` }}
                ></div>
              </div>
              {productCount >= 10 ? (
                <p className="text-xs text-green-600 font-medium">
                  {isSpanish ? '¡Objetivo completado!' : 'Goal completed!'}
                </p>
              ) : productCount === 0 ? (
                <a
                  href="/products/create"
                  className="text-xs text-gray-500 hover:text-gray-700 hover:underline cursor-pointer"
                >
                  {isSpanish ? 'Agrega tu primer producto' : 'Add your first product'}
                </a>
              ) : (
                <a
                  href="/products/create"
                  className="text-xs text-gray-500 hover:text-gray-700 hover:underline cursor-pointer"
                >
                  {isSpanish ? 'Agrega más productos' : 'Add more products'}
                </a>
              )}
            </div>

            {/* Configurar métodos de pago */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  {paymentMethodsCount >= 1 ? (
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  )}
                </div>
                <h3 className="text-sm font-medium text-gray-900">
                  {isSpanish ? 'Pagos' : 'Payments'}
                </h3>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                {Math.min(paymentMethodsCount, 1)}/1 {isSpanish ? 'método configurado' : 'method configured'}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    paymentMethodsCount >= 1 ? 'bg-green-600' : 'bg-gray-600'
                  }`}
                  style={{ width: `${Math.min((paymentMethodsCount / 1) * 100, 100)}%` }}
                ></div>
              </div>
              {paymentMethodsCount >= 1 ? (
                <p className="text-xs text-green-600 font-medium">
                  {isSpanish ? '¡Objetivo completado!' : 'Goal completed!'}
                </p>
              ) : (
                <a
                  href="/settings/general/sales"
                  className="text-xs text-gray-500 hover:text-gray-700 hover:underline cursor-pointer"
                >
                  {isSpanish ? 'Configura métodos de pago' : 'Set up payment methods'}
                </a>
              )}
            </div>

            {/* Configurar barra de anuncio */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  {announcementBarConfigured ? (
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  )}
                </div>
                <h3 className="text-sm font-medium text-gray-900">
                  {isSpanish ? 'Barra de anuncio' : 'Announcement bar'}
                </h3>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                {announcementBarConfigured ? 1 : 0}/1 {isSpanish ? 'anuncio configurado' : 'announcement configured'}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    announcementBarConfigured ? 'bg-green-600' : 'bg-gray-600'
                  }`}
                  style={{ width: `${announcementBarConfigured ? 100 : 0}%` }}
                ></div>
              </div>
              {announcementBarConfigured ? (
                <p className="text-xs text-green-600 font-medium">
                  {isSpanish ? '¡Objetivo completado!' : 'Goal completed!'}
                </p>
              ) : (
                <a
                  href="/store-design/announcement-bar"
                  className="text-xs text-gray-500 hover:text-gray-700 hover:underline cursor-pointer"
                >
                  {isSpanish ? 'Configura barra de anuncio' : 'Set up announcement bar'}
                </a>
              )}
            </div>

            {/* Agregar imágenes del carrusel */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  {carouselImagesCount >= 3 ? (
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <h3 className="text-sm font-medium text-gray-900">
                  {isSpanish ? 'Carrusel' : 'Carousel'}
                </h3>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                {Math.min(carouselImagesCount, 3)}/3 {isSpanish ? 'imágenes agregadas' : 'images added'}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    carouselImagesCount >= 3 ? 'bg-green-600' : 'bg-gray-600'
                  }`}
                  style={{ width: `${Math.min((carouselImagesCount / 3) * 100, 100)}%` }}
                ></div>
              </div>
              {carouselImagesCount >= 3 ? (
                <p className="text-xs text-green-600 font-medium">
                  {isSpanish ? '¡Objetivo completado!' : 'Goal completed!'}
                </p>
              ) : carouselImagesCount === 0 ? (
                <a
                  href="/store-design/banners"
                  className="text-xs text-gray-500 hover:text-gray-700 hover:underline cursor-pointer"
                >
                  {isSpanish ? 'Agrega tu primera imagen' : 'Add your first image'}
                </a>
              ) : (
                <a
                  href="/store-design/banners"
                  className="text-xs text-gray-500 hover:text-gray-700 hover:underline cursor-pointer"
                >
                  {isSpanish ? 'Agrega más imágenes' : 'Add more images'}
                </a>
              )}
            </div>

            {/* Configurar redes sociales */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  {socialMediaCount >= 1 ? (
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2M7 4h10l.94 10.34a2 2 0 01-1.94 2.16H8a2 2 0 01-1.94-2.16L7 4zM9 9v8m6-8v8M5 4h14" />
                    </svg>
                  )}
                </div>
                <h3 className="text-sm font-medium text-gray-900">
                  {isSpanish ? 'Redes sociales' : 'Social media'}
                </h3>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                {Math.min(socialMediaCount, 1)}/1 {isSpanish ? 'red social configurada' : 'social network configured'}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    socialMediaCount >= 1 ? 'bg-green-600' : 'bg-gray-600'
                  }`}
                  style={{ width: `${Math.min((socialMediaCount / 1) * 100, 100)}%` }}
                ></div>
              </div>
              {socialMediaCount >= 1 ? (
                <p className="text-xs text-green-600 font-medium">
                  {isSpanish ? '¡Objetivo completado!' : 'Goal completed!'}
                </p>
              ) : (
                <a
                  href="/settings/general/contact"
                  className="text-xs text-gray-500 hover:text-gray-700 hover:underline cursor-pointer"
                >
                  {isSpanish ? 'Configura tus redes sociales' : 'Set up your social media'}
                </a>
              )}
            </div>

            {/* Configurar métodos de envío */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  {shippingMethodsCount >= 1 ? (
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                  )}
                </div>
                <h3 className="text-sm font-medium text-gray-900">
                  {isSpanish ? 'Envíos' : 'Shipping'}
                </h3>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                {Math.min(shippingMethodsCount, 1)}/1 {isSpanish ? 'método configurado' : 'method configured'}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    shippingMethodsCount >= 1 ? 'bg-green-600' : 'bg-gray-600'
                  }`}
                  style={{ width: `${Math.min((shippingMethodsCount / 1) * 100, 100)}%` }}
                ></div>
              </div>
              {shippingMethodsCount >= 1 ? (
                <p className="text-xs text-green-600 font-medium">
                  {isSpanish ? '¡Objetivo completado!' : 'Goal completed!'}
                </p>
              ) : (
                <a
                  href="/settings/shipping/store-pickup"
                  className="text-xs text-gray-500 hover:text-gray-700 hover:underline cursor-pointer"
                >
                  {isSpanish ? 'Configura métodos de envío' : 'Set up shipping methods'}
                </a>
              )}
            </div>

            {/* Crear promociones */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                  {promotionsCount >= 1 ? (
                    <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2M7 4h10l.94 10.34a2 2 0 01-1.94 2.16H8a2 2 0 01-1.94-2.16L7 4zM9 9v8m6-8v8M5 4h14" />
                    </svg>
                  )}
                </div>
                <h3 className="text-sm font-medium text-gray-900">
                  {isSpanish ? 'Promociones' : 'Promotions'}
                </h3>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                {Math.min(promotionsCount, 1)}/1 {isSpanish ? 'promoción creada' : 'promotion created'}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    promotionsCount >= 1 ? 'bg-green-600' : 'bg-gray-600'
                  }`}
                  style={{ width: `${Math.min((promotionsCount / 1) * 100, 100)}%` }}
                ></div>
              </div>
              {promotionsCount >= 1 ? (
                <p className="text-xs text-green-600 font-medium">
                  {isSpanish ? '¡Objetivo completado!' : 'Goal completed!'}
                </p>
              ) : (
                <a
                  href="/marketing/attract"
                  className="text-xs text-gray-500 hover:text-gray-700 hover:underline cursor-pointer"
                >
                  {isSpanish ? 'Crea tu primera promoción' : 'Create your first promotion'}
                </a>
              )}
            </div>

            </div>
          )}
        </div>
      </div>

      {/* Sección 3: Pasos Avanzados - Solo si se completaron los primeros pasos */}
      {allFirstStepsCompleted && (
        <div className="py-6 bg-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {isSpanish ? 'Lleva tu tienda al siguiente nivel' : 'Take your store to the next level'}
              </h2>
              <p className="text-sm text-gray-600">
                {isSpanish
                  ? 'Optimiza y escala tu tienda con estas funcionalidades avanzadas.'
                  : 'Optimize and scale your store with these advanced features.'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Configurar SEO */}
              <div className="bg-white border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    {seoConfigured ? (
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-gray-900">SEO</h3>
                </div>
                <p className="text-xs text-gray-600 mb-2">
                  {seoConfigured ? 1 : 0}/1 {isSpanish ? 'configuración básica' : 'basic setup'}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      seoConfigured ? 'bg-green-600' : 'bg-blue-600'
                    }`}
                    style={{ width: `${seoConfigured ? 100 : 0}%` }}
                  ></div>
                </div>
                {seoConfigured ? (
                  <p className="text-xs text-green-600 font-medium">
                    {isSpanish ? '¡Objetivo completado!' : 'Goal completed!'}
                  </p>
                ) : (
                  <a
                    href="/settings/seo"
                    className="text-xs text-blue-500 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    {isSpanish ? 'Optimiza para buscadores' : 'Optimize for search engines'}
                  </a>
                )}
              </div>

              {/* Dominio personalizado */}
              <div className="bg-white border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    {domainConfigured ? (
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {isSpanish ? 'Dominio' : 'Domain'}
                  </h3>
                </div>
                <p className="text-xs text-gray-600 mb-2">
                  {domainConfigured ? 1 : 0}/1 {isSpanish ? 'dominio conectado' : 'domain connected'}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      domainConfigured ? 'bg-green-600' : 'bg-blue-600'
                    }`}
                    style={{ width: `${domainConfigured ? 100 : 0}%` }}
                  ></div>
                </div>
                {domainConfigured ? (
                  <p className="text-xs text-green-600 font-medium">
                    {isSpanish ? '¡Objetivo completado!' : 'Goal completed!'}
                  </p>
                ) : (
                  <a
                    href="/settings/general/advanced"
                    className="text-xs text-blue-500 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    {isSpanish ? 'Conecta tu dominio propio' : 'Connect your own domain'}
                  </a>
                )}
              </div>

              {/* Analytics */}
              <div className="bg-white border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    {analyticsConfigured ? (
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    )}
                  </div>
                  <h3 className="text-sm font-medium text-gray-900">Analytics</h3>
                </div>
                <p className="text-xs text-gray-600 mb-2">
                  {analyticsConfigured ? 1 : 0}/1 {isSpanish ? 'configuración realizada' : 'setup completed'}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      analyticsConfigured ? 'bg-green-600' : 'bg-blue-600'
                    }`}
                    style={{ width: `${analyticsConfigured ? 100 : 0}%` }}
                  ></div>
                </div>
                {analyticsConfigured ? (
                  <p className="text-xs text-green-600 font-medium">
                    {isSpanish ? '¡Objetivo completado!' : 'Goal completed!'}
                  </p>
                ) : (
                  <a
                    href="/settings/seo"
                    className="text-xs text-blue-500 hover:text-blue-700 hover:underline cursor-pointer"
                  >
                    {isSpanish ? 'Mide el rendimiento' : 'Track performance'}
                  </a>
                )}
              </div>

              {/* Marketing */}
              <div className="bg-white border border-blue-200 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {isSpanish ? 'Email Marketing' : 'Email Marketing'}
                  </h3>
                </div>
                <p className="text-xs text-gray-600 mb-2">
                  0/1 {isSpanish ? 'campaña creada' : 'campaign created'}
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                </div>
                <p className="text-xs text-gray-500">
                  {isSpanish ? 'Conecta con clientes' : 'Connect with customers'}
                </p>
              </div>

            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  )
}