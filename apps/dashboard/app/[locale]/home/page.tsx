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
  }, [store])

  // Verificar si los datos están listos
  const isDataLoaded = userData && store && !loading

  const getWelcomeTitle = () => {
    return isSpanish ? 'Bienvenido a Shopifree' : 'Welcome to Shopifree'
  }

  const getSubtitle = () => {
    return isSpanish
      ? '¡Felicitaciones por haber completado la configuración inicial de tu tienda!'
      : 'Congratulations on completing the initial setup of your store!'
  }

  const getSubtitle2 = () => {
    return isSpanish
      ? 'Ahora comienza lo más emocionante: dar vida a tu propio espacio online.'
      : 'Now begins the most exciting part: bringing your own online space to life.'
  }

  const getMainMessage = () => {
    if (isSpanish) {
      return 'En Shopifree creemos que crear una tienda virtual debe ser simple, rápido y gratuito, y por eso estamos aquí para acompañarte en cada paso. Poco a poco podrás personalizar tu tienda hasta que refleje exactamente lo que quieres transmitir a tus clientes.'
    } else {
      return 'At Shopifree we believe that creating an online store should be simple, fast and free, and that\'s why we\'re here to accompany you every step of the way. Little by little you\'ll be able to customize your store until it reflects exactly what you want to convey to your customers.'
    }
  }

  const getClosingMessage = () => {
    if (isSpanish) {
      return 'Recuerda: no estás solo. Nuestro objetivo es guiarte y darte las herramientas necesarias para que tu tienda crezca y sea el reflejo auténtico de tu marca.'
    } else {
      return 'Remember: you\'re not alone. Our goal is to guide you and give you the necessary tools so that your store grows and becomes an authentic reflection of your brand.'
    }
  }

  const getFinalMessage = () => {
    return isSpanish
      ? '¡Tu aventura en el mundo del ecommerce empieza hoy!'
      : 'Your adventure in the world of ecommerce starts today!'
  }

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
      {/* Sección de Bienvenida - Fuera del contenedor principal */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="w-full overflow-hidden">
            <h1 className="text-xl font-semibold text-gray-900 mb-3 break-words overflow-wrap-anywhere flex items-center">
              {getWelcomeTitle()}
              <svg className="w-6 h-6 ml-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </h1>

            <p className="text-base font-medium text-gray-700 mb-2 break-words overflow-wrap-anywhere">
              {getSubtitle()}
            </p>

            <p className="text-base text-gray-600 mb-4 break-words overflow-wrap-anywhere">
              {getSubtitle2()}
            </p>

            <p className="text-sm text-gray-600 leading-relaxed mb-4 break-words overflow-wrap-anywhere">
              {getMainMessage()}
            </p>

            <p className="text-sm text-gray-600 leading-relaxed mb-4 break-words overflow-wrap-anywhere">
              {getClosingMessage()}
            </p>

            <p className="text-base font-medium text-gray-700 break-words overflow-wrap-anywhere">
              {getFinalMessage()}
            </p>
          </div>
        </div>
      </div>

      {/* Sección 2: Primeros Pasos */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              {isSpanish ? 'Primeros pasos' : 'First steps'}
            </h2>
            <p className="text-sm text-gray-600">
              {isSpanish
                ? 'Comienza configurando estos elementos básicos de tu tienda.'
                : 'Start by setting up these basic elements of your store.'
              }
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Agregar primer producto */}
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
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <h3 className="text-sm font-medium text-gray-900">
                  {isSpanish ? 'Barra de anuncio' : 'Announcement bar'}
                </h3>
              </div>
              <p className="text-xs text-gray-600 mb-2">
                0/1 {isSpanish ? 'anuncio configurado' : 'announcement configured'}
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-gray-600 h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
              <a
                href="/store-design/announcement-bar"
                className="text-xs text-gray-500 hover:text-gray-700 hover:underline cursor-pointer"
              >
                {isSpanish ? 'Configura barra de anuncio' : 'Set up announcement bar'}
              </a>
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
        </div>
      </div>

    </DashboardLayout>
  )
}