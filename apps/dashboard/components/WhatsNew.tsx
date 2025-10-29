'use client'

import Image from 'next/image'
import { useState, useRef, useEffect } from 'react'

interface NewsItem {
  id: string
  title: string
  titleEn: string
  description: string
  descriptionEn: string
  date: string
  iconType: 'gift' | 'cart' | 'sparkles'
}

interface WhatsNewProps {
  locale?: string
}

export default function WhatsNew({ locale = 'es' }: WhatsNewProps) {
  const isSpanish = locale === 'es'
  const [currentSlide, setCurrentSlide] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  // Aquí puedes ir agregando las nuevas funcionalidades
  const newsItems: NewsItem[] = [
    {
      id: '1',
      title: 'Sistema de Programas de Lealtad',
      titleEn: 'Loyalty Programs System',
      description: 'Ahora puedes crear programas de puntos para premiar a tus clientes más fieles. Configura puntos por compra y canjéalos por descuentos.\n\nEsta nueva funcionalidad te permite:\n• Definir cuántos puntos otorgar por cada compra\n• Establecer el valor de canje de los puntos\n• Ver el historial de puntos de cada cliente\n• Crear promociones especiales para miembros del programa\n• Fomentar la lealtad y aumentar las compras recurrentes\n\nLos programas de lealtad son una excelente forma de mantener a tus clientes comprometidos con tu marca y aumentar el valor de vida del cliente.',
      descriptionEn: 'You can now create points programs to reward your most loyal customers. Set up points per purchase and redeem them for discounts.\n\nThis new feature allows you to:\n• Define how many points to award per purchase\n• Set the redemption value of points\n• View each customer\'s points history\n• Create special promotions for program members\n• Foster loyalty and increase repeat purchases\n\nLoyalty programs are an excellent way to keep your customers engaged with your brand and increase customer lifetime value.',
      date: '2025-10-25',
      iconType: 'gift'
    },
    {
      id: '2',
      title: 'Recuperación de Carritos Abandonados',
      titleEn: 'Abandoned Cart Recovery',
      description: 'Sistema automático para enviar recordatorios a clientes que dejaron productos en su carrito sin finalizar la compra.\n\nCaracterísticas principales:\n• Detección automática de carritos abandonados\n• Envío programado de emails de recordatorio\n• Personalización de mensajes con los productos específicos\n• Seguimiento de tasas de recuperación\n• Opción de incluir cupones de descuento para incentivar la compra\n\nEstudios muestran que más del 70% de los carritos son abandonados. Esta herramienta te ayuda a recuperar esas ventas perdidas de manera automática.',
      descriptionEn: 'Automatic system to send reminders to customers who left products in their cart without completing the purchase.\n\nKey features:\n• Automatic detection of abandoned carts\n• Scheduled reminder email sending\n• Message personalization with specific products\n• Recovery rate tracking\n• Option to include discount coupons to incentivize purchase\n\nStudies show that over 70% of carts are abandoned. This tool helps you recover those lost sales automatically.',
      date: '2025-10-15',
      iconType: 'cart'
    },
    {
      id: '3',
      title: 'Integración con IA para Mejorar Textos',
      titleEn: 'AI Integration for Text Improvement',
      description: 'Utiliza inteligencia artificial para mejorar las descripciones de tus productos y generar contenido SEO optimizado.\n\nBeneficios de esta integración:\n• Genera descripciones atractivas y profesionales automáticamente\n• Optimiza títulos y meta descripciones para SEO\n• Mejora textos existentes con sugerencias inteligentes\n• Adapta el tono de voz según tu marca\n• Ahorra tiempo en la creación de contenido\n• Mejora tu posicionamiento en buscadores\n\nLa IA analiza tus productos y crea textos persuasivos que ayudan a convertir más visitantes en clientes.',
      descriptionEn: 'Use artificial intelligence to improve your product descriptions and generate SEO-optimized content.\n\nBenefits of this integration:\n• Automatically generate attractive and professional descriptions\n• Optimize titles and meta descriptions for SEO\n• Improve existing texts with smart suggestions\n• Adapt tone of voice according to your brand\n• Save time on content creation\n• Improve your search engine ranking\n\nAI analyzes your products and creates persuasive texts that help convert more visitors into customers.',
      date: '2025-10-05',
      iconType: 'sparkles'
    }
  ]

  const getIcon = (iconType: NewsItem['iconType']) => {
    switch (iconType) {
      case 'gift':
        return (
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
        )
      case 'cart':
        return (
          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        )
      case 'sparkles':
        return (
          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        )
    }
  }

  // Funciones para el carrusel
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % newsItems.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + newsItems.length) % newsItems.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  // Manejo de swipe táctil
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return

    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe) {
      nextSlide()
    }
    if (isRightSwipe) {
      prevSlide()
    }

    setTouchStart(0)
    setTouchEnd(0)
  }

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="w-full overflow-hidden">
          {/* Título principal */}
          <h1 className="text-xl font-semibold text-gray-900 mb-3 break-words overflow-wrap-anywhere flex items-center">
            {isSpanish ? 'Novedades' : 'What\'s New'}
            <svg className="w-6 h-6 ml-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </h1>

          <p className="text-base text-gray-600 mb-4 break-words overflow-wrap-anywhere">
            {isSpanish
              ? 'Descubre las últimas funcionalidades que hemos agregado para hacer crecer tu tienda.'
              : 'Discover the latest features we\'ve added to grow your store.'}
          </p>

          {/* Layout de dos columnas: Carrusel a la izquierda, Imagen a la derecha */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Columna izquierda: Carrusel de novedades */}
            <div className="relative">
              <div
                ref={carouselRef}
                className="overflow-hidden rounded-lg"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div
                  className="flex transition-transform duration-500 ease-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {newsItems.map((item) => (
                    <div
                      key={item.id}
                      className="min-w-full border border-gray-200 rounded-lg p-6 bg-white"
                    >
                      <div className="flex flex-col">
                        <div className="flex items-start mb-4">
                          <div className="mr-3 flex-shrink-0 mt-1">
                            {getIcon(item.iconType)}
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 break-words">
                            {isSpanish ? item.title : item.titleEn}
                          </h3>
                        </div>
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 break-words leading-relaxed whitespace-pre-line">
                            {isSpanish ? item.description : item.descriptionEn}
                          </p>
                        </div>
                        <div className="pt-4 border-t border-gray-100">
                          <p className="text-xs text-gray-400">
                            {new Date(item.date).toLocaleDateString(isSpanish ? 'es-ES' : 'en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Controles del carrusel */}
              <div className="flex items-center justify-between mt-4">
                {/* Botón anterior */}
                <button
                  onClick={prevSlide}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Anterior"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                {/* Indicadores de puntos */}
                <div className="flex gap-2">
                  {newsItems.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        currentSlide === index
                          ? 'bg-blue-600 w-8'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                      aria-label={`Ir a slide ${index + 1}`}
                    />
                  ))}
                </div>

                {/* Botón siguiente */}
                <button
                  onClick={nextSlide}
                  className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  aria-label="Siguiente"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Columna derecha: Imagen cuadrada */}
            <div className="flex items-start justify-center">
              <Image
                src="/images/novedades.png"
                alt={isSpanish ? 'Novedades' : 'What\'s New'}
                width={600}
                height={600}
                className="rounded-lg object-contain w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
