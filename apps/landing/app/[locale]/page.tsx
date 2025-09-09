'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@shopifree/ui'
import LanguageSelector from '../../components/LanguageSelector'
import FAQ from '../../components/FAQ'

export default function HomePage() {
  const t = useTranslations('home')
  const locale = useLocale()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0)
  const [visibleWords, setVisibleWords] = useState<number>(0)
  const [email, setEmail] = useState('')
  const [currentPlan, setCurrentPlan] = useState(1) // Start with Premium plan (index 1)
  const [isAnnual, setIsAnnual] = useState(true) // Start with annual pricing as default
  const [carouselPosition, setCarouselPosition] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  const dynamicPhrases = t.raw('dynamicPhrases') as string[]
  
  const pricingPlans = [
    // Plan Gratis (index 0)
    {
      id: 'free',
      name: t('pricing.freePlan'),
      price: 'Gratis',
      period: t('pricing.freeForLife'),
      description: t('pricing.freeDescription'),
      features: [
        t('pricing.freeFeatures.products12'),
        t('pricing.freeFeatures.unlimitedSales'),
        t('pricing.freeFeatures.whatsappSales'),
        t('pricing.freeFeatures.manualPayments'),
        t('pricing.freeFeatures.freeSubdomain'),
        t('pricing.freeFeatures.discountCoupons'),
        t('pricing.freeFeatures.basicReports'),
        t('pricing.freeFeatures.advancedSeo'),
        t('pricing.freeFeatures.unlimitedHosting'),
        t('pricing.freeFeatures.freeSSL'),
        t('pricing.freeFeatures.adminPanel'),
        t('pricing.freeFeatures.zeroCommission')
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
      monthlyPrice: 19,
      annualPrice: 99,
      description: t('pricing.premiumDescription'),
      includesFrom: t('pricing.freePlan'),
      features: [
        t('pricing.premiumFeatures.products50'),
        t('pricing.premiumFeatures.traditionalCheckout'),
        t('pricing.premiumFeatures.autoEmails'),
        t('pricing.premiumFeatures.completeReports'),
        t('pricing.premiumFeatures.googleAnalytics'),
        t('pricing.premiumFeatures.searchConsole'),
        t('pricing.premiumFeatures.metaTikTokPixel'),
        t('pricing.premiumFeatures.customDomain')
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
      monthlyPrice: 49,
      annualPrice: 399,
      description: t('pricing.proDescription'),
      includesFrom: t('pricing.premiumPlan'),
      features: [
        t('pricing.proFeatures.unlimitedProducts'),
        t('pricing.proFeatures.integratedPayments'),
        t('pricing.premiumFeatures.cartRecovery'),
        t('pricing.proFeatures.customerSegmentation'),
        t('pricing.proFeatures.advancedMarketing'),
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

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email) {
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

  // Helper functions for pricing
  const calculateDiscount = (monthlyPrice: number, annualPrice: number) => {
    const yearlyPriceIfMonthly = monthlyPrice * 12
    const discount = ((yearlyPriceIfMonthly - annualPrice) / yearlyPriceIfMonthly) * 100
    return Math.round(discount)
  }

  const formatPrice = (plan: typeof pricingPlans[0]) => {
    if (plan.id === 'free') return 'Gratis'
    
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
      const singleSetWidth = containerWidth / 2 // Since we have 2 sets of 9 images
      
      setCarouselPosition(prev => {
        const newPosition = prev - 1.5 // Smooth movement speed
        
        // Reset when we've moved exactly one full set (9 images)
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
      <div className={`${plan.background} rounded-2xl ${isMobile ? 'shadow-lg' : plan.isRecommended ? 'shadow-xl' : 'shadow-lg'} ${isMobile ? 'p-8' : 'p-8'} relative border-2 ${plan.colors.border} ${plan.isRecommended && !isMobile ? 'transform md:scale-105 ring-2 ring-blue-200' : ''} w-full ${isMobile ? 'h-[750px]' : ''} flex flex-col text-left`}>
        <div className="absolute -top-4 left-6 z-10">
          <span className={`${plan.colors.badge} text-white px-5 py-2 rounded-full ${isMobile ? 'text-base' : 'text-sm'} font-medium whitespace-nowrap`}>
            {plan.name}
          </span>
        </div>
        <div className={`mt-6 ${isMobile ? 'mb-6' : 'mb-6'} text-left`}>
          <div className="flex items-baseline gap-2 mb-2 justify-start">
            <div className={`${isMobile ? 'text-4xl' : 'text-4xl'} font-light ${plan.colors.price}`}>{formatPrice(plan)}</div>
            {isAnnual && plan.annualPrice && plan.monthlyPrice && (
              <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                {calculateDiscount(plan.monthlyPrice, plan.annualPrice)}% OFF
              </span>
            )}
          </div>
          <div className={`${isMobile ? 'text-base' : 'text-sm'} text-gray-600 font-medium text-left`}>
            {formatPeriod(plan)}
            {isAnnual && plan.annualPrice && plan.id !== 'free' && (
              <span className="text-xs text-gray-500 block">
                facturado anualmente
              </span>
            )}
          </div>
          {isAnnual && plan.annualPrice && plan.monthlyPrice && (
            <div className={`${isMobile ? 'text-sm' : 'text-xs'} text-gray-500 line-through mt-1 text-left`}>
              ${plan.monthlyPrice}/mes
            </div>
          )}
        </div>
        <p className={`text-gray-600 ${isMobile ? 'mb-6 text-base' : 'mb-6'} text-left`}>{plan.description}</p>
        
        {plan.includesFrom && (
          <div className={`${isMobile ? 'mb-6' : 'mb-4'}`}>
            <p className={`${isMobile ? 'text-sm' : 'text-sm'} text-gray-700 font-medium`}>
              {t('pricing.includesEverything')} {plan.includesFrom}{t('pricing.plus')}
            </p>
          </div>
        )}
        
        <div className="flex-1">
          <ul className={`text-left ${isMobile ? 'space-y-3 mb-8' : 'space-y-3 mb-8'}`}>
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <svg className={`${isMobile ? 'w-5 h-5' : 'w-5 h-5'} ${plan.colors.check} ${isMobile ? 'mr-3' : 'mr-3'} mt-0.5 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span className={`${isMobile ? 'text-sm' : 'text-sm'} leading-relaxed`}>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mt-auto">
          <a href={`https://dashboard.shopifree.app/${locale}/register`}>
            <Button className={`w-full ${plan.colors.button} text-white font-medium ${isMobile ? 'py-4 text-base' : 'py-3'}`}>
              {plan.cta}
            </Button>
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href={`/${locale}`} className="transition-all duration-200 hover:scale-105">
                <Image 
                  src="/logo-primary.png" 
                  alt="Shopifree Logo" 
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
          <div className="px-8 py-4 h-full flex flex-col">
            {/* Logo */}
            <div className="mb-12">
              <Image 
                src="/logo-primary.png" 
                alt="Shopifree Logo" 
                width={160} 
                height={45}
                className="h-10 w-auto object-contain"
              />
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 space-y-4">
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

            {/* Bottom Section */}
            <div className="space-y-4 pb-8">
              <a href={`https://dashboard.shopifree.app/${locale}/login`} className="block">
                <Button variant="secondary" className="w-full bg-white/10 hover:bg-white/20 text-white border-white/30 hover:border-white/50 backdrop-blur-sm text-base py-3 transition-all duration-200 hover:scale-105">
                  {t('login')}
                </Button>
              </a>
              <div className="flex justify-center pt-2">
                <div className="scale-90">
                  <LanguageSelector />
                </div>
              </div>
            </div>
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
          {/* Text Content - Left aligned on mobile, centered on desktop */}
          <div className="text-left md:text-center max-w-6xl mx-auto w-full flex-1 flex flex-col justify-center">
            <div className="h-[280px] min-[390px]:h-[330px] min-[414px]:h-[360px] sm:h-[380px] md:h-[250px] lg:h-[280px] xl:h-[300px] flex items-center justify-start md:justify-center mb-4 min-[390px]:mb-6 min-[414px]:mb-10 sm:mb-12 md:mb-6 lg:mb-8">
              <h1 className="text-4xl min-[390px]:text-5xl min-[414px]:text-6xl sm:text-7xl md:text-5xl lg:text-6xl xl:text-7xl font-thin text-white drop-shadow-xl leading-tight">
                <span className="block">
                  {renderAnimatedText()}
                </span>
              </h1>
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
                    className="px-6 xs:px-8 py-3 xs:py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-base xs:text-lg transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl whitespace-nowrap"
                  >
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

      {/* Features Section */}
      <section id="features" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

      {/* Integrations Carousel */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-light text-gray-900 mb-4">
              Intégrate con las mejores herramientas
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Conecta tu tienda con pasarelas de pago, herramientas de analytics, marketing y más
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
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num, index) => (
                <img
                  key={index}
                  src={`/integraciones/integracion${num}.png`}
                  alt={`Integración ${num}`}
                  className="flex-shrink-0 h-10 md:h-20 w-auto object-contain opacity-80 hover:opacity-100 transition-all duration-300"
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-light text-gray-900 mb-4">
              {t('nav.pricing')}
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              {t('pricing.subtitle')}
            </p>

            {/* Billing Toggle */}
            <div className="flex items-center justify-center mb-12">
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
                    Mensual
                  </button>
                  <button
                    onClick={() => setIsAnnual(true)}
                    className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 relative ${
                      isAnnual
                        ? 'bg-white text-gray-900 shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Anual
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                      Ahorra 57%
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
                <div className="overflow-hidden pt-6">
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
              <div className="flex justify-center mt-8 space-x-2">
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

      {/* FAQ Section */}
      <FAQ />

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center">
              <Image 
                src="/footerlogo.png" 
                alt="Shopifree Logo" 
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
              © 2024 Shopifree
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