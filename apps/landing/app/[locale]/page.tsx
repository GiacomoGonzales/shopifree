'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@shopifree/ui'
import LanguageSelector from '../../components/LanguageSelector'
import FAQ from '../../components/FAQ'
import { OrganizationSchema, SoftwareApplicationSchema, FAQSchema, WebSiteSchema } from '../../components/StructuredData'

export default function HomePage() {
  const t = useTranslations('home')
  const locale = useLocale()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const [visibleWords, setVisibleWords] = useState<number>(0)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [currentPlan, setCurrentPlan] = useState(1) // Start with Premium plan (index 1)
  const [isAnnual, setIsAnnual] = useState(true) // Start with annual pricing as default
  const [carouselPosition, setCarouselPosition] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const [currentDemoStore, setCurrentDemoStore] = useState(0)

  const dynamicPhrases = t.raw('dynamicPhrases') as string[]

  // Integration names for better SEO
  const integrationNames = [
    'Mercado Pago',
    'PayPal',
    'Stripe',
    'Google Analytics',
    'Meta Pixel',
    'WhatsApp Business',
    'Mailchimp',
    'Instagram Shopping',
    'Google Ads',
    'Sendgrid',
    'Google Gemini AI'
  ]

  // Demo stores data
  const demoStores = [
    {
      name: "Fast Bite - Comida rápida a domicilio",
      category: "Restaurante",
      theme: "Restaurant",
      icon: "🍔",
      url: "https://fastbite.shopifree.app",
      description: "Menú digital con checkout rápido",
      mobileColor: "bg-gradient-to-br from-orange-400 to-red-500",
      desktopColor: "bg-gradient-to-br from-orange-300 to-red-400"
    },
    {
      name: "Lunara Store - Moda y accesorios",
      category: "Moda",
      theme: "Shopifree Theme",
      icon: "👗",
      url: "https://lunara-store.xyz",
      description: "Tienda de moda premium",
      mobileColor: "bg-gradient-to-br from-pink-400 to-purple-500",
      desktopColor: "bg-gradient-to-br from-pink-300 to-purple-400"
    },
    {
      name: "La Patota Shop - Vet & Spa para mascotas",
      category: "Mascotas",
      theme: "Pet Friendly",
      icon: "🐾",
      url: "https://lapatotashop.com",
      description: "Todo para tu mascota",
      mobileColor: "bg-gradient-to-br from-green-400 to-teal-500",
      desktopColor: "bg-gradient-to-br from-green-300 to-teal-400"
    },
    {
      name: "TechZone",
      category: "Tecnología",
      theme: "Mobile Modern",
      icon: "📱",
      url: "https://demo-tech.shopifree.app",
      description: "Lo último en tecnología y gadgets",
      mobileColor: "bg-gradient-to-br from-blue-400 to-indigo-500",
      desktopColor: "bg-gradient-to-br from-blue-300 to-indigo-400"
    },
    {
      name: "FitLife Store",
      category: "Deportes",
      theme: "Shopifree Default",
      icon: "💪",
      url: "https://demo-fitness.shopifree.app",
      description: "Equipamiento deportivo y fitness",
      mobileColor: "bg-gradient-to-br from-cyan-400 to-blue-600",
      desktopColor: "bg-gradient-to-br from-cyan-300 to-blue-500"
    },
    {
      name: "Glow Beauty",
      category: "Belleza",
      theme: "Minimal Clean",
      icon: "💄",
      url: "https://demo-beauty.shopifree.app",
      description: "Cosmética y cuidado personal",
      mobileColor: "bg-gradient-to-br from-rose-400 to-amber-400",
      desktopColor: "bg-gradient-to-br from-rose-300 to-amber-300"
    }
  ]

  const pricingPlans = [
    // Plan Gratis (index 0)
    {
      id: 'free',
      name: t('pricing.freePlan'),
      price: t('pricing.free'),
      period: t('pricing.freeForLife'),
      description: t('pricing.freeDescription'),
      features: [
        t('pricing.freeFeatures.unlimitedSales'),
        t('pricing.freeFeatures.manualPayments'),
        t('pricing.freeFeatures.whatsappSales'),
        t('pricing.freeFeatures.freeSubdomain'),
        t('pricing.freeFeatures.freeSSL'),
        t('pricing.freeFeatures.adminPanel'),
        t('pricing.freeFeatures.products12'),
        t('pricing.freeFeatures.discountCoupons'),
        t('pricing.freeFeatures.basicReports'),
        t('pricing.freeFeatures.advancedSeo'),
        t('pricing.freeFeatures.unlimitedHosting')
      ],
      cta: t('pricing.startNowFree'),
      colors: {
        badge: 'bg-gray-600',
        price: 'text-gray-800',
        border: 'border-gray-300',
        button: 'bg-emerald-600 hover:bg-emerald-700',
        check: 'text-emerald-500'
      },
      emoji: '💚',
      background: 'bg-white'
    },
    // Plan Premium (index 1) - Default
    {
      id: 'premium',
      name: t('pricing.premiumPlan'),
      monthlyPrice: 15,
      annualPrice: 120,
      description: t('pricing.premiumDescription'),
      includesFrom: t('pricing.freePlan'),
      features: [
        t('pricing.proFeatures.integratedPayments'),
        t('pricing.premiumFeatures.traditionalCheckout'),
        t('pricing.premiumFeatures.cartRecovery'),
        t('pricing.premiumFeatures.autoEmails'),
        t('pricing.premiumFeatures.customDomain'),
        t('pricing.premiumFeatures.products50'),
        t('pricing.premiumFeatures.completeReports'),
        t('pricing.premiumFeatures.googleAnalytics'),
        t('pricing.premiumFeatures.searchConsole'),
        t('pricing.premiumFeatures.metaTikTokPixel')
      ],
      cta: t('pricing.growBusiness'),
      colors: {
        badge: 'bg-gray-700',
        price: 'text-gray-800',
        border: 'border-gray-400',
        button: 'bg-emerald-600 hover:bg-emerald-700',
        check: 'text-emerald-500'
      },
      emoji: '💚',
      background: 'bg-gray-50',
      isRecommended: true
    },
    // Plan Pro (index 2)
    {
      id: 'pro',
      name: t('pricing.proPlan'),
      monthlyPrice: 30,
      annualPrice: 300,
      description: t('pricing.proDescription'),
      includesFrom: t('pricing.premiumPlan'),
      features: [
        t('pricing.proFeatures.unlimitedProducts'),
        t('pricing.proFeatures.internationalSales'),
        t('pricing.proFeatures.multipleLanguages'),
        t('pricing.proFeatures.automaticTranslation'),
        t('pricing.proFeatures.customerSegmentation'),
        t('pricing.proFeatures.advancedMarketing'),
        t('pricing.proFeatures.countryAnalytics'),
        t('pricing.proFeatures.exclusiveThemes'),
        t('pricing.proFeatures.prioritySupport')
      ],
      cta: t('pricing.scaleUp'),
      colors: {
        badge: 'bg-gray-800',
        price: 'text-gray-800',
        border: 'border-gray-500',
        button: 'bg-emerald-600 hover:bg-emerald-700',
        check: 'text-emerald-500'
      },
      emoji: '💚',
      background: 'bg-white'
    }
  ]

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (email && !isSubmitting) {
      setIsSubmitting(true)

      try {
        // Guardar email en colección leads para email marketing
        console.log('📧 Enviando email a API:', email)
        const response = await fetch('/api/leads/capture', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            locale,
            source: 'landing-hero'
          })
        })

        const data = await response.json()
        console.log('✅ Respuesta de API:', data)

        if (!response.ok) {
          console.error('❌ Error en API:', data)
        }
      } catch (error) {
        console.error('❌ Error capturing lead:', error)
        // No bloquear el flujo si falla la captura del lead
      }

      // Redirigir a registro con el email como parámetro
      const encodedEmail = encodeURIComponent(email)
      window.location.href = `https://dashboard.shopifree.app/${locale}/register?email=${encodedEmail}`
    }
  }

  const nextPlan = () => {
    setCurrentPlan((prev) => (prev + 1) % pricingPlans.length)
  }

  const prevPlan = () => {
    setCurrentPlan((prev) => (prev - 1 + pricingPlans.length) % pricingPlans.length)
  }

  const goToPlan = (index: number) => {
    setCurrentPlan(index)
  }

  // Demo stores navigation
  const nextDemoStore = () => {
    setCurrentDemoStore((prev) => (prev + 1) % demoStores.length)
  }

  const prevDemoStore = () => {
    setCurrentDemoStore((prev) => (prev - 1 + demoStores.length) % demoStores.length)
  }

  const goToDemoStore = (index: number) => {
    setCurrentDemoStore(index)
  }

  // Helper functions for pricing
  const calculateDiscount = (monthlyPrice: number, annualPrice: number) => {
    const yearlyPriceIfMonthly = monthlyPrice * 12
    const discount = ((yearlyPriceIfMonthly - annualPrice) / yearlyPriceIfMonthly) * 100
    return Math.round(discount)
  }

  const formatPrice = (plan: typeof pricingPlans[0]) => {
    if (plan.id === 'free') return t('pricing.free')

    if (isAnnual && plan.annualPrice) {
      const monthlyEquivalent = (plan.annualPrice / 12).toFixed(2)
      return `$${monthlyEquivalent}`
    }
    return `$${plan.monthlyPrice}`
  }

  const formatPeriod = (plan: typeof pricingPlans[0]) => {
    if (plan.id === 'free') return t('pricing.freeForLife')
    
    if (isAnnual && plan.annualPrice) {
      return t('pricing.perMonth')
    }
    return t('pricing.perMonth')
  }

  useEffect(() => {
    const startWordAnimation = () => {
      const currentPhrase = dynamicPhrases[currentPhraseIndex]
      const words = currentPhrase.split(' ')
      
      // Resetear a 0 palabras visibles al inicio
      setVisibleWords(0)
      
      // Empezar la animación palabra por palabra después de un pequeño delay
      setTimeout(() => {
        words.forEach((_, index) => {
          setTimeout(() => {
            setVisibleWords(index + 1)
          }, index * 200)
        })
      }, 300) // Delay inicial más largo
    }

    // Solo ejecutar si tenemos las frases cargadas
    if (dynamicPhrases.length > 0) {
      // Primera vez - iniciar inmediatamente
      if (currentPhraseIndex === 0) {
        startWordAnimation()
      }
      
      const interval = setInterval(() => {
        // Primero ocultar todas las palabras
        setVisibleWords(0)
        
        // Cambiar frase después de que se hayan ocultado
        setTimeout(() => {
          setCurrentPhraseIndex((prev) => (prev + 1) % dynamicPhrases.length)
        }, 500) // Tiempo para que se oculten las palabras
        
      }, 6000) // Más tiempo total por frase

      return () => clearInterval(interval)
    }
  }, [dynamicPhrases, currentPhraseIndex])

  // Efecto separado para cuando cambia el índice de frase
  useEffect(() => {
    if (dynamicPhrases.length > 0 && currentPhraseIndex !== 0) {
      const currentPhrase = dynamicPhrases[currentPhraseIndex]
      const words = currentPhrase.split(' ')
      
      // Animar palabras una por una
      setTimeout(() => {
        words.forEach((_, index) => {
          setTimeout(() => {
            setVisibleWords(index + 1)
          }, index * 200)
        })
      }, 300)
    }
  }, [currentPhraseIndex, dynamicPhrases])

  // Seamless carousel effect with smooth animation
  useEffect(() => {
    let animationId: number
    
    const animate = () => {
      if (!carouselRef.current) {
        animationId = requestAnimationFrame(animate)
        return
      }
      
      const containerWidth = carouselRef.current.scrollWidth
      const singleSetWidth = containerWidth / 2 // Since we have 2 sets of 11 images

      setCarouselPosition(prev => {
        const newPosition = prev - 1.5 // Smooth movement speed

        // Reset when we've moved exactly one full set (11 images)
        if (Math.abs(newPosition) >= singleSetWidth) {
          return 0
        }
        return newPosition
      })
      
      animationId = requestAnimationFrame(animate)
    }
    
    animationId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationId)
  }, [])

  const renderAnimatedText = () => {
    if (!dynamicPhrases.length) return null

    const currentPhrase = dynamicPhrases[currentPhraseIndex]
    const words = currentPhrase.split(' ')

    return words.map((word, index) => (
      <span
        key={`${currentPhraseIndex}-${index}`}
        className={`inline-block mr-2 transition-all duration-500 ease-out ${
          index < visibleWords
            ? 'opacity-100 transform translate-y-0'
            : 'opacity-0 transform translate-y-4'
        }`}
        style={{ transitionDelay: `${index * 50}ms` }}
      >
        {word}
      </span>
    ))
  }

  const renderPlanCard = (plan: typeof pricingPlans[0], isMobile = false) => {
    return (
      <div className={`${plan.background} rounded-2xl ${isMobile ? 'shadow-lg' : plan.isRecommended ? 'shadow-xl' : 'shadow-lg'} ${isMobile ? 'p-6' : 'p-6'} relative border-2 ${plan.colors.border} ${plan.isRecommended && !isMobile ? 'ring-2 ring-blue-200' : ''} w-full ${isMobile ? 'h-[650px]' : ''} flex flex-col text-left`}>
        <div className="absolute -top-3 left-4 z-10">
          <span className={`${plan.colors.badge} text-white px-4 py-1.5 rounded-full ${isMobile ? 'text-sm' : 'text-xs'} font-medium whitespace-nowrap`}>
            {plan.name}
          </span>
        </div>
        <div className={`mt-4 ${isMobile ? 'mb-4' : 'mb-4'} text-left`}>
          <div className="flex items-baseline gap-2 mb-1 justify-start">
            <div className={`${isMobile ? 'text-3xl' : 'text-3xl'} font-light ${plan.colors.price}`}>{formatPrice(plan)}</div>
            {isAnnual && plan.annualPrice && plan.monthlyPrice && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full font-medium">
                {calculateDiscount(plan.monthlyPrice, plan.annualPrice)}% OFF
              </span>
            )}
          </div>
          <div className={`${isMobile ? 'text-sm' : 'text-xs'} text-gray-600 font-medium text-left`}>
            {formatPeriod(plan)}
            {isAnnual && plan.annualPrice && plan.id !== 'free' && (
              <span className="text-xs text-gray-500 block">
                {t('pricing.billedAnnually')}
              </span>
            )}
          </div>
          {isAnnual && plan.annualPrice && plan.monthlyPrice && (
            <div className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-500 line-through mt-1 text-left`}>
              ${plan.monthlyPrice}{t('pricing.perMonth')}
            </div>
          )}
        </div>
        <p className={`text-gray-600 ${isMobile ? 'mb-4 text-sm' : 'mb-4 text-sm'} text-left`}>{plan.description}</p>

        {plan.includesFrom && (
          <div className={`${isMobile ? 'mb-3' : 'mb-3'}`}>
            <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-gray-700 font-medium`}>
              {t('pricing.includesEverything')} {plan.includesFrom}{t('pricing.plus')}
            </p>
          </div>
        )}

        <div className="flex-1">
          <ul className={`text-left ${isMobile ? 'space-y-2 mb-4' : 'space-y-2 mb-4'}`}>
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <svg className={`${isMobile ? 'w-4 h-4' : 'w-4 h-4'} ${plan.colors.check} ${isMobile ? 'mr-2' : 'mr-2'} mt-0.5 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className={`${isMobile ? 'text-xs' : 'text-xs'} leading-relaxed`}>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-auto">
          <a href={`https://dashboard.shopifree.app/${locale}/register`}>
            {plan.isRecommended ? (
              <button className="w-full group relative overflow-hidden rounded-full bg-emerald-600 hover:bg-emerald-700 px-6 py-3 transition-all duration-300 shadow-lg hover:shadow-xl">
                <span className="relative flex items-center justify-center gap-2 text-sm font-medium text-white">
                  {plan.cta}
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </button>
            ) : (
              <button className="w-full group relative overflow-hidden rounded-full border-2 border-gray-300 hover:border-emerald-600 px-6 py-3 transition-all duration-300">
                <span className="absolute inset-0 bg-emerald-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                <span className="relative flex items-center justify-center gap-2 text-sm font-medium text-gray-700 group-hover:text-white transition-colors duration-300">
                  {plan.cta}
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </button>
            )}
          </a>
        </div>
      </div>
    )
  }

  // FAQ data for structured data
  const faqData = [
    {
      question: '¿Qué es Shopifree?',
      answer: 'Shopifree es una plataforma gratuita para crear y gestionar tu tienda online sin conocimientos técnicos. Con nuestro plan gratis puedes comenzar a vender inmediatamente con hasta 12 productos, ventas ilimitadas y sin comisiones por venta. Incluye hosting gratuito, SSL, subdominio y todas las herramientas esenciales para vender en línea.'
    },
    {
      question: '¿Necesito conocimientos técnicos para usarlo?',
      answer: 'No necesitas ningún conocimiento técnico. Shopifree funciona con formularios simples donde solo completas la información de tus productos, subes imágenes y configuras tus preferencias. Elige uno de nuestros temas profesionales prediseñados y tu tienda estará lista para vender. Todo es tan simple como completar campos y hacer clic en guardar.'
    },
    {
      question: '¿Puedo conectar mi propio dominio?',
      answer: 'Sí, con el plan Premium o superior puedes conectar tu dominio personalizado (ej: tutienda.com). El plan gratis incluye un subdominio de Shopifree (ej: tutienda.shopifree.app). Te proporcionamos guías paso a paso para configurar tu dominio personalizado de manera fácil.'
    },
    {
      question: '¿Qué métodos de pago puedo habilitar en mi tienda?',
      answer: 'El plan gratis incluye pagos manuales (transferencias bancarias, efectivo). Con el plan Premium y superior puedes integrar pasarelas de pago como Mercado Pago, PayPal y Stripe para aceptar tarjetas de crédito/débito directamente en tu tienda. También soportamos ventas por WhatsApp en todos los planes.'
    },
    {
      question: '¿Cómo funciona el sistema de ventas por WhatsApp?',
      answer: 'Todos los planes incluyen ventas por WhatsApp. Tus clientes pueden navegar tu catálogo online y al realizar un pedido, se genera automáticamente un mensaje de WhatsApp con los detalles de su orden. El cliente solo debe enviarlo para completar la compra. Es la forma más rápida de vender sin necesidad de pasarelas de pago.'
    },
    {
      question: '¿Shopifree cobra comisiones por venta?',
      answer: 'No, Shopifree no cobra ninguna comisión por venta. Solo pagas tu plan mensual o anual y todas las ventas que realices son 100% tuyas. El plan gratis es completamente gratis de por vida con ventas ilimitadas y sin comisiones.'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Structured Data for SEO */}
      <OrganizationSchema locale={locale} />
      <SoftwareApplicationSchema locale={locale} />
      <WebSiteSchema locale={locale} />
      <FAQSchema faqs={faqData} />

      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href={`/${locale}`} className="transition-all duration-200 hover:scale-105">
                <Image
                  src="/logo-primary.png"
                  alt="Shopifree - Crea tu tienda online gratis sin comisiones"
                  width={224}
                  height={64}
                  className="h-12 w-auto object-contain"
                  priority
                />
              </Link>
            </div>
            
            {/* Navigation Links - Hidden on mobile, visible on desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link href={`/${locale}#features`} className="text-white hover:text-emerald-400 transition-colors drop-shadow-lg">
                {t('nav.features')}
              </Link>
              <Link href={`/${locale}#pricing`} className="text-white hover:text-emerald-400 transition-colors drop-shadow-lg">
                {t('nav.pricing')}
              </Link>
              <Link href={`/${locale}/blog`} className="text-white hover:text-emerald-400 transition-colors drop-shadow-lg">
                {t('nav.blog')}
              </Link>
            </nav>
            
            <div className="flex items-center space-x-4">
              {/* Desktop Navigation & Login */}
              <a href={`https://dashboard.shopifree.app/${locale}/login`} className="hidden md:block">
                <Button variant="secondary" size="sm" className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30 hover:border-white/50 transition-all duration-200">
                  {t('login')}
                </Button>
              </a>
              <div className="hidden md:block">
                <LanguageSelector />
              </div>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 rounded-md text-white hover:text-emerald-400 hover:bg-white/20 focus:outline-none transition-all duration-200"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <svg className="h-6 w-6 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M6 18L18 6M6 6l12 12"
                      className="animate-pulse"
                    />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Menu Sidebar */}
        <div 
          className={`fixed top-0 right-0 h-full w-80 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 shadow-2xl z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Close Button */}
          <div className="flex justify-end p-6">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all duration-200"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Menu Content */}
          <div className="px-8 py-6 h-full flex flex-col overflow-y-auto">
            {/* Logo */}
            <div className="mb-10">
              <Image
                src="/logo-primary.png"
                alt="Shopifree - Plataforma de ecommerce gratuita"
                width={160}
                height={45}
                className="h-10 w-auto object-contain"
              />
            </div>

            {/* Navigation Links */}
            <nav className="space-y-4 mb-10">
              <Link
                href={`/${locale}#features`}
                className="block text-white text-lg font-light hover:text-emerald-400 py-2 border-b border-white/10 transition-all duration-300 transform hover:translate-x-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.features')}
              </Link>
              <Link
                href={`/${locale}#pricing`}
                className="block text-white text-lg font-light hover:text-emerald-400 py-2 border-b border-white/10 transition-all duration-300 transform hover:translate-x-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.pricing')}
              </Link>
              <Link
                href={`/${locale}/blog`}
                className="block text-white text-lg font-light hover:text-emerald-400 py-2 border-b border-white/10 transition-all duration-300 transform hover:translate-x-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {t('nav.blog')}
              </Link>
            </nav>

            {/* Language Selector */}
            <div className="mb-6">
              <div className="text-white/60 text-xs uppercase tracking-wide mb-2 px-2">Idioma</div>
              <LanguageSelector variant="sidebar" />
            </div>

            {/* Login Button */}
            <a href={`https://dashboard.shopifree.app/${locale}/login`} className="block">
              <Button variant="secondary" className="w-full bg-white/10 hover:bg-white/20 text-white border-white/30 hover:border-white/50 backdrop-blur-sm text-base py-3 transition-all duration-200 hover:scale-105">
                {t('login')}
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative h-screen overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/videos/herovideo.mp4" type="video/mp4" />
          </video>
          
          {/* Overlay for better text contrast */}
          <div className="absolute inset-0 bg-black/30"></div>
        </div>
        
        <div className="relative h-full flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          {/* SEO H1 - Hidden visually but readable by search engines */}
          <h1 className="sr-only">
            Crea tu Tienda Online Gratis con Shopifree - Ecommerce sin Comisiones
          </h1>

          {/* Text Content - Left aligned on mobile, centered on desktop */}
          <div className="text-left md:text-center max-w-6xl mx-auto w-full flex-1 flex flex-col justify-center">
            <div className="h-[280px] min-[390px]:h-[330px] min-[414px]:h-[360px] sm:h-[380px] md:h-[250px] lg:h-[280px] xl:h-[300px] flex items-center justify-start md:justify-center mb-4 min-[390px]:mb-6 min-[414px]:mb-10 sm:mb-12 md:mb-6 lg:mb-8">
              <div className="text-4xl min-[390px]:text-5xl min-[414px]:text-6xl sm:text-7xl md:text-5xl lg:text-6xl xl:text-7xl font-thin text-white drop-shadow-xl leading-tight" aria-label="Tu tienda puede conquistar el mundo digital">
                <span className="block">
                  {renderAnimatedText()}
                </span>
              </div>
            </div>
            <div className="text-left md:text-center mb-6 min-[390px]:mb-8 min-[414px]:mb-12 sm:mb-16 md:mb-8 lg:mb-10">
              <p className="text-lg min-[390px]:text-xl min-[414px]:text-xl sm:text-2xl md:text-xl lg:text-2xl text-white/90 max-w-4xl md:mx-auto drop-shadow-lg leading-relaxed font-light">
                {t('subtitle')}
              </p>
            </div>
            <div className="flex flex-col items-start md:items-center mb-4">
              <form onSubmit={handleEmailSubmit} className="w-full max-w-md mb-3">
                <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 p-2 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 shadow-2xl">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('emailPlaceholder')}
                    required
                    className="flex-1 px-4 xs:px-6 py-3 xs:py-4 bg-transparent text-white placeholder-white/70 border-none outline-none focus:outline-none focus:ring-0 focus:border-none rounded-xl transition-all duration-200 text-base xs:text-lg font-light hero-email-input"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 xs:px-8 py-3 xs:py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-base xs:text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl whitespace-nowrap disabled:opacity-75 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                  >
                    {isSubmitting && (
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    {t('startFreeButton')}
                  </button>
                </div>
              </form>
              <p className="text-white/80 text-xs max-w-md text-left md:text-center leading-relaxed px-2">
                {t('emailDisclaimer')}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Demo Stores Carousel */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-8 md:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-6 md:mb-8 px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-2">
              {t('demoStores.title')}
            </h2>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
              {t('demoStores.subtitle')}
            </p>
          </div>

          {/* Carousel Container */}
          <div className="relative px-4 sm:px-6 lg:px-8">
            {/* Desktop View - Slide carousel with arrows */}
            <div className="hidden md:block">
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentDemoStore * 100}%)` }}
                >
                  {demoStores.map((store, index) => (
                    <div key={index} className="w-full flex-shrink-0 px-4">
                      <div className="flex items-center justify-center gap-8 max-w-6xl mx-auto">
                        {/* Mobile Mockup */}
                        <div className="flex-shrink-0">
                          <div className="relative">
                            {/* Phone frame */}
                            <div className="relative mx-auto border-gray-800 bg-gray-800 border-[10px] rounded-[2rem] h-[450px] w-[225px] shadow-2xl">
                              {/* Phone buttons */}
                              <div className="h-[24px] w-[2px] bg-gray-800 absolute -left-[12px] top-[54px] rounded-l-lg"></div>
                              <div className="h-[34px] w-[2px] bg-gray-800 absolute -left-[12px] top-[93px] rounded-l-lg"></div>
                              <div className="h-[34px] w-[2px] bg-gray-800 absolute -left-[12px] top-[133px] rounded-l-lg"></div>
                              <div className="h-[48px] w-[2px] bg-gray-800 absolute -right-[12px] top-[106px] rounded-r-lg"></div>

                              {/* Screen content */}
                              <div className={`rounded-[1.5rem] overflow-hidden w-full h-full ${index === 0 || index === 1 || index === 2 || index === 3 ? '' : store.mobileColor} cursor-pointer`}
                                   onClick={() => window.open(store.url, '_blank')}>
                                {index === 0 ? (
                                  <video
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-full object-contain"
                                  >
                                    <source src="/images/restaurant-movil.mp4" type="video/mp4" />
                                  </video>
                                ) : index === 1 ? (
                                  <video
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-full object-contain"
                                  >
                                    <source src="/images/ropa-movil.mp4" type="video/mp4" />
                                  </video>
                                ) : index === 2 ? (
                                  <video
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-full object-contain"
                                  >
                                    <source src="/images/mascotas-movil.mp4" type="video/mp4" />
                                  </video>
                                ) : index === 3 ? (
                                  <video
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-full object-contain"
                                  >
                                    <source src="/images/tech-movil.mp4" type="video/mp4" />
                                  </video>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center">
                                    <span className="text-5xl">{store.icon}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Desktop Mockup */}
                        <div className="flex-1 max-w-3xl">
                          <div className="relative">
                            {/* Browser chrome */}
                            <div className="bg-gray-200 rounded-t-lg px-3 py-2 flex items-center space-x-2">
                              <div className="flex space-x-1.5">
                                <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                              </div>
                              <div className="flex-1 ml-3">
                                <div className="bg-white rounded px-2 py-0.5 text-xs text-gray-600 max-w-md">
                                  {store.url}
                                </div>
                              </div>
                            </div>

                            {/* Browser content */}
                            <div className={`${index === 0 || index === 1 || index === 2 || index === 3 ? '' : store.desktopColor} h-[350px] cursor-pointer shadow-2xl overflow-hidden`}
                                 onClick={() => window.open(store.url, '_blank')}>
                              {index === 0 ? (
                                <img
                                  src="/images/restaurant-desktop.png"
                                  alt={`${store.name} - Vista desktop`}
                                  className="w-full h-full object-cover object-top"
                                />
                              ) : index === 1 ? (
                                <img
                                  src="/images/ropa-desktop.png"
                                  alt={`${store.name} - Vista desktop`}
                                  className="w-full h-full object-cover object-top"
                                />
                              ) : index === 2 ? (
                                <img
                                  src="/images/mascotas-desktop.png"
                                  alt={`${store.name} - Vista desktop`}
                                  className="w-full h-full object-cover object-top"
                                />
                              ) : index === 3 ? (
                                <img
                                  src="/images/tech-desktop.png"
                                  alt={`${store.name} - Vista desktop`}
                                  className="w-full h-full object-cover object-top"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-7xl">{store.icon}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Store Info */}
                          <div className="mt-4 text-center md:text-left">
                            <h3 className="text-xl font-medium text-gray-900 mb-1">
                              {store.name}
                            </h3>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-gray-600 mb-2">
                              <span className="text-lg">{store.icon}</span>
                              <span className="font-medium text-sm">{store.category}</span>
                              <span className="text-gray-400">•</span>
                              <span className="text-xs">{t('demoStores.theme')} {store.theme}</span>
                            </div>
                            <p className="text-gray-600 text-sm mb-3">{store.description}</p>
                            <button
                              onClick={() => window.open(store.url, '_blank')}
                              className="group relative overflow-hidden rounded-full border-2 border-emerald-600 px-6 py-2.5 transition-all duration-300 hover:border-emerald-700"
                            >
                              <span className="absolute inset-0 bg-emerald-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                              <span className="relative flex items-center justify-center gap-2 text-sm font-medium text-emerald-600 group-hover:text-white transition-colors duration-300">
                                {t('demoStores.viewFullDemo')}
                                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Arrows - Desktop */}
              <button
                onClick={prevDemoStore}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white shadow-xl rounded-full p-3 hover:bg-gray-50 transition-all z-10"
                aria-label="Previous demo"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={nextDemoStore}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white shadow-xl rounded-full p-3 hover:bg-gray-50 transition-all z-10"
                aria-label="Next demo"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Mobile View - Horizontal scroll carousel */}
            <div className="md:hidden">
              <div className="overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory -mx-4">
                <div className="flex gap-6 pb-4 px-4">
                  {demoStores.map((store, index) => (
                    <div key={index} className="flex-shrink-0 w-[280px] snap-center">
                      <div className="flex flex-col items-center w-full">
                        {/* Mobile Mockup */}
                        <div className="relative mb-4">
                          <div className="relative mx-auto border-gray-800 bg-gray-800 border-[14px] rounded-[2.5rem] h-[500px] w-[250px] shadow-2xl">
                            <div className="h-[32px] w-[3px] bg-gray-800 absolute -left-[17px] top-[72px] rounded-l-lg"></div>
                            <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[124px] rounded-l-lg"></div>
                            <div className="h-[46px] w-[3px] bg-gray-800 absolute -left-[17px] top-[178px] rounded-l-lg"></div>
                            <div className="h-[64px] w-[3px] bg-gray-800 absolute -right-[17px] top-[142px] rounded-r-lg"></div>

                            <div className={`rounded-[2rem] overflow-hidden w-full h-full ${index === 0 || index === 1 || index === 2 || index === 3 ? '' : store.mobileColor} cursor-pointer`}
                                 onClick={() => window.open(store.url, '_blank')}>
                              {index === 0 ? (
                                <video
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                  className="w-full h-full object-contain"
                                >
                                  <source src="/images/restaurant-movil.mp4" type="video/mp4" />
                                </video>
                              ) : index === 1 ? (
                                <video
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                  className="w-full h-full object-contain"
                                >
                                  <source src="/images/ropa-movil.mp4" type="video/mp4" />
                                </video>
                              ) : index === 2 ? (
                                <video
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                  className="w-full h-full object-contain"
                                >
                                  <source src="/images/mascotas-movil.mp4" type="video/mp4" />
                                </video>
                              ) : index === 3 ? (
                                <video
                                  autoPlay
                                  loop
                                  muted
                                  playsInline
                                  className="w-full h-full object-contain"
                                >
                                  <source src="/images/tech-movil.mp4" type="video/mp4" />
                                </video>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <span className="text-6xl">{store.icon}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Store Info */}
                        <div className="text-center w-full px-2">
                          <h3 className="text-xl font-medium text-gray-900 mb-2">
                            {store.name}
                          </h3>
                          <div className="flex items-center justify-center gap-2 text-gray-600 mb-3">
                            <span className="text-lg">{store.icon}</span>
                            <span className="font-medium text-sm">{store.category}</span>
                          </div>
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{store.description}</p>
                          <button
                            onClick={() => window.open(store.url, '_blank')}
                            className="w-full max-w-[250px] mx-auto group relative overflow-hidden rounded-full border-2 border-emerald-600 px-6 py-3 transition-all duration-300 hover:border-emerald-700"
                          >
                            <span className="absolute inset-0 bg-emerald-600 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></span>
                            <span className="relative flex items-center justify-center gap-2 text-sm font-medium text-emerald-600 group-hover:text-white transition-colors duration-300">
                              {t('demoStores.viewDemo')}
                              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                              </svg>
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Scroll hint - Mobile only */}
              <div className="text-center mt-4 text-sm text-gray-500">
                {t('demoStores.swipeHint')}
              </div>
            </div>

            {/* Dots Indicator - Desktop only */}
            <div className="hidden md:flex justify-center mt-4 space-x-2">
              {demoStores.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToDemoStore(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentDemoStore
                      ? 'bg-emerald-600 w-8'
                      : 'bg-gray-300 w-2 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to demo ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Integrations Carousel */}
      <section className="bg-gray-50 py-12" aria-labelledby="integrations-heading">
        <div className="mx-auto">
          <div className="text-center mb-12 px-4 sm:px-6 lg:px-8">
            <h2 id="integrations-heading" className="text-3xl font-light text-gray-900 mb-4">
              {t('integrations.title')}
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              {t('integrations.subtitle')}
            </p>
          </div>

          <div className="overflow-hidden">
            <div 
              ref={carouselRef}
              className="flex space-x-8 items-center"
              style={{ 
                transform: `translateX(${carouselPosition}px)`,
                transition: carouselPosition === 0 ? 'none' : 'none'
              }}
            >
              {/* Integration images - duplicated for seamless loop */}
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num, index) => (
                <img
                  key={index}
                  src={`/integraciones/integracion${num}.png`}
                  alt={`Integración con ${integrationNames[num - 1]} - Shopifree`}
                  className="flex-shrink-0 h-10 md:h-20 w-auto object-contain opacity-80 hover:opacity-100 transition-all duration-300"
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-gray-50 py-8 md:py-12" aria-labelledby="pricing-heading">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 id="pricing-heading" className="text-2xl md:text-3xl font-light text-gray-900 mb-2 md:mb-3">
              {t('pricing.title')}
            </h2>
            <p className="text-base md:text-lg text-gray-600 mb-4 md:mb-6">
              {t('pricing.subtitle')}
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center mb-6 md:mb-8">
              <div className="bg-gray-100 rounded-full p-1 relative">
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setIsAnnual(false)}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      !isAnnual
                        ? 'bg-white text-gray-900 shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {t('pricing.monthly')}
                  </button>
                  <button
                    onClick={() => setIsAnnual(true)}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 relative ${
                      isAnnual
                        ? 'bg-white text-gray-900 shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {t('pricing.annual')}
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      {t('pricing.savePercent')}
                    </span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Desktop View - Grid */}
            <div className="hidden md:grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {pricingPlans.map((plan) => (
                <div key={plan.id}>
                  {renderPlanCard(plan)}
                </div>
              ))}
            </div>

            {/* Mobile View - Carousel */}
            <div className="md:hidden">
              <div className="relative max-w-md mx-auto">
                {/* Carousel Container */}
                <div className="overflow-hidden pt-4">
                  <div 
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{ transform: `translateX(-${currentPlan * 100}%)` }}
                  >
                    {pricingPlans.map((plan) => (
                      <div key={plan.id} className="w-full flex-shrink-0 px-2">
                        {renderPlanCard(plan, true)}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Navigation Arrows */}
                <button
                  onClick={prevPlan}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors z-10"
                  aria-label="Previous plan"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={nextPlan}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors z-10"
                  aria-label="Next plan"
                >
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>

              {/* Dots Indicator */}
              <div className="flex justify-center mt-4 space-x-2">
                {pricingPlans.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToPlan(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      index === currentPlan 
                        ? 'bg-blue-500 w-8' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to plan ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-light text-gray-900 mb-8 text-center">
          {t('feature1.title')}, {t('feature2.title')}, {t('feature3.title')}
        </h2>
        {/* Features Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-normal text-gray-900 mb-2">{t('feature1.title')}</h3>
            <p className="text-gray-600">{t('feature1.description')}</p>
          </div>

          <div className="text-center">
            <div className="bg-gray-200 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <h3 className="text-xl font-normal text-gray-900 mb-2">{t('feature2.title')}</h3>
            <p className="text-gray-600">{t('feature2.description')}</p>
          </div>

          <div className="text-center">
            <div className="bg-gray-300 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-normal text-gray-900 mb-2">{t('feature3.title')}</h3>
            <p className="text-gray-600">{t('feature3.description')}</p>
          </div>
        </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQ />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center">
              <Image
                src="/footerlogo.png"
                alt="Shopifree - Crea tu tienda online gratis"
                width={160}
                height={45}
                className="h-8 w-auto object-contain"
              />
            </div>
            <div className="flex items-center space-x-8 text-sm text-gray-600">
              <Link href={`/${locale}/privacy`} className="hover:text-gray-900 transition-colors">
                {t('footer.privacy')}
              </Link>
              <Link href={`/${locale}/terms`} className="hover:text-gray-900 transition-colors">
                {t('footer.terms')}
              </Link>
              <Link href={`/${locale}/contact`} className="hover:text-gray-900 transition-colors">
                {t('footer.contact')}
              </Link>
            </div>
            <div className="text-sm text-gray-500">
              © 2025 Shopifree
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
        
        @keyframes scroll-fast {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
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
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .hero-email-input:focus {
          outline: none !important;
          border: none !important;
          box-shadow: none !important;
          ring: none !important;
        }
      `}</style>
    </div>
  )
} 