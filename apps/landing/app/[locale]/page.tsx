'use client'

import { useState, useEffect, useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import Image from 'next/image'
import LanguageSelector from '../../components/LanguageSelector'

export default function HomePage() {
  const t = useTranslations('home')
  const locale = useLocale()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [carouselPosition, setCarouselPosition] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  const testimonials = [
    {
      name: 'Maria Garcia',
      business: 'Dulces Artesanales',
      location: 'Lima, Peru',
      text: 'En 10 minutos tenia mi catalogo listo. Ahora recibo pedidos por WhatsApp todos los dias.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face'
    },
    {
      name: 'Carlos Rodriguez',
      business: 'Accesorios CR',
      location: 'Bogota, Colombia',
      text: 'Antes usaba solo Instagram. Con Shopifree mis clientes ven todo el catalogo y hacen pedidos mas facil.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    },
    {
      name: 'Ana Martinez',
      business: 'Ropa Vintage',
      location: 'CDMX, Mexico',
      text: 'Lo mejor es que es gratis. Empece sin invertir nada y ya tengo ventas constantes.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    }
  ]

  const stats = [
    { number: '500+', label: 'Catalogos creados' },
    { number: '10k+', label: 'Productos publicados' },
    { number: '0%', label: 'Comision por venta' }
  ]

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Carousel animation
  useEffect(() => {
    let animationId: number
    const animate = () => {
      setCarouselPosition(prev => {
        const newPosition = prev - 1
        if (Math.abs(newPosition) >= 1200) return 0
        return newPosition
      })
      animationId = requestAnimationFrame(animate)
    }
    animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [])

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (email && !isSubmitting) {
      setIsSubmitting(true)
      try {
        await fetch('/api/leads/capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, locale, source: 'landing-hero' })
        })
      } catch (error) {
        console.error('Error capturing lead:', error)
      }
      const encodedEmail = encodeURIComponent(email)
      window.location.href = `https://dashboard.shopifree.app/${locale}/register?email=${encodedEmail}`
    }
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center py-4">
            <Link href={`/${locale}`} className="hover:opacity-80 transition-opacity">
              <Image
                src="/footerlogo.png"
                alt="Shopifree"
                width={180}
                height={50}
                className="h-10 w-auto"
                priority
              />
            </Link>

            <div className="hidden md:flex items-center gap-6">
              <Link href="#como-funciona" className="text-gray-600 hover:text-emerald-600 text-sm transition-colors">
                Como funciona
              </Link>
              <Link href="#precios" className="text-gray-600 hover:text-emerald-600 text-sm transition-colors">
                Precios
              </Link>
              <LanguageSelector />
              <a href={`https://dashboard.shopifree.app/${locale}/login`}>
                <button className="text-gray-600 hover:text-emerald-600 text-sm transition-colors">
                  Iniciar sesion
                </button>
              </a>
              <a href={`https://dashboard.shopifree.app/${locale}/register`}>
                <button className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-full text-sm font-medium transition-all hover:shadow-lg hover:shadow-emerald-200 hover:-translate-y-0.5">
                  Crear catalogo gratis
                </button>
              </a>
            </div>

            <button className="md:hidden p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100 animate-fadeIn">
              <div className="flex flex-col gap-4">
                <Link href="#como-funciona" className="text-gray-600 py-2" onClick={() => setIsMobileMenuOpen(false)}>
                  Como funciona
                </Link>
                <Link href="#precios" className="text-gray-600 py-2" onClick={() => setIsMobileMenuOpen(false)}>
                  Precios
                </Link>
                <a href={`https://dashboard.shopifree.app/${locale}/login`} className="text-gray-600 py-2">
                  Iniciar sesion
                </a>
                <a href={`https://dashboard.shopifree.app/${locale}/register`}>
                  <button className="w-full bg-emerald-600 text-white py-3 rounded-full font-medium">
                    Crear catalogo gratis
                  </button>
                </a>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-28 pb-20 px-4 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-teal-50"></div>
        <div className="absolute top-20 right-0 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-200/30 rounded-full blur-3xl"></div>

        <div className="relative max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text content */}
            <div className="text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm mb-6 animate-bounce-slow">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Vende por WhatsApp
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Crea tu catalogo
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                  en 3 minutos
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-lg mx-auto lg:mx-0">
                Sube tus productos, comparte tu link y recibe pedidos directo a tu WhatsApp.
                <span className="font-semibold text-gray-800"> Sin complicaciones, sin comisiones.</span>
              </p>

              {/* CTA Form */}
              <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto lg:mx-0 mb-6">
                <div className="flex flex-col sm:flex-row gap-3 p-2 bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    required
                    className="flex-1 px-5 py-3 bg-transparent outline-none text-gray-800 placeholder-gray-400"
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 text-white px-6 py-3 rounded-xl font-medium transition-all disabled:opacity-70 whitespace-nowrap shadow-lg shadow-emerald-200 hover:shadow-xl hover:-translate-y-0.5"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Creando...
                      </span>
                    ) : 'Crear gratis'}
                  </button>
                </div>
              </form>

              <p className="text-sm text-gray-500 flex items-center justify-center lg:justify-start gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Gratis para siempre. Sin tarjeta de credito.
              </p>
            </div>

            {/* Right: Phone mockup */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative animate-float">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 rounded-[3rem] blur-2xl opacity-20 scale-110"></div>

                {/* Phone frame */}
                <div className="relative bg-gray-900 rounded-[3rem] p-3 shadow-2xl">
                  <div className="bg-white rounded-[2.5rem] w-[280px] h-[580px] overflow-hidden relative">
                    {/* Notch */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-b-2xl z-10"></div>

                    {/* Status bar */}
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3 flex justify-between items-center text-xs text-white pt-8">
                      <span className="font-medium">9:41</span>
                      <div className="flex gap-1 items-center">
                        <div className="w-4 h-2 bg-white/80 rounded-sm"></div>
                      </div>
                    </div>

                    {/* Store header */}
                    <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-4 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-2xl">🧁</span>
                        </div>
                        <div className="text-white">
                          <h3 className="font-bold text-base">Dulces Maria</h3>
                          <p className="text-emerald-100 text-xs flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                            Abierto ahora
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Products grid */}
                    <div className="p-4 grid grid-cols-2 gap-3 bg-gray-50">
                      {[
                        {
                          name: 'Torta Chocolate',
                          price: 'S/ 45',
                          image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=200&h=200&fit=crop',
                          sold: '12 vendidos'
                        },
                        {
                          name: 'Cupcakes x6',
                          price: 'S/ 24',
                          image: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?w=200&h=200&fit=crop',
                          sold: '28 vendidos'
                        },
                        {
                          name: 'Galletas Mix',
                          price: 'S/ 15',
                          image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=200&h=200&fit=crop',
                          sold: '45 vendidos'
                        },
                        {
                          name: 'Brownies',
                          price: 'S/ 12',
                          image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=200&h=200&fit=crop',
                          sold: '33 vendidos'
                        },
                      ].map((product, i) => (
                        <div key={i} className="bg-white rounded-2xl p-2 shadow-sm hover:shadow-md transition-shadow">
                          <div className="aspect-square rounded-xl overflow-hidden mb-2">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <p className="text-xs font-normal text-gray-700 truncate">{product.name}</p>
                          <p className="text-xs font-light text-gray-900">{product.price}</p>
                        </div>
                      ))}
                    </div>

                    {/* WhatsApp button */}
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="bg-[#25D366] text-white py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-green-200 hover:shadow-xl transition-shadow cursor-pointer">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        <span className="font-semibold">Hacer pedido</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -right-4 top-20 bg-white rounded-2xl p-3 shadow-xl animate-bounce-slow">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Nuevo pedido!</span>
                  </div>
                </div>

                <div className="absolute -left-4 bottom-32 bg-white rounded-2xl p-3 shadow-xl animate-pulse">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">💰</span>
                    <span className="text-sm font-bold text-gray-700">+S/ 45.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-16 max-w-2xl mx-auto">
            {stats.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-gray-900">{stat.number}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations Carousel */}
      <section className="py-12 bg-gray-50 overflow-hidden">
        <div className="text-center mb-8">
          <p className="text-gray-500 text-sm uppercase tracking-wide">Compatible con las herramientas que ya usas</p>
        </div>
        <div className="relative">
          <div
            ref={carouselRef}
            className="flex items-center gap-12"
            style={{ transform: `translateX(${carouselPosition}px)` }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((num, index) => (
              <img
                key={index}
                src={`/integraciones/integracion${num}.png`}
                alt="Integracion"
                className="h-8 md:h-12 w-auto object-contain opacity-60 hover:opacity-100 transition-opacity flex-shrink-0"
              />
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="como-funciona" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wide">Asi de facil</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
              3 pasos para empezar a vender
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              No necesitas conocimientos tecnicos. Si sabes usar WhatsApp, puedes crear tu catalogo.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200"></div>

            {[
              {
                step: '1',
                title: 'Sube tus productos',
                description: 'Solo foto, nombre y precio. En 1 minuto agregas un producto a tu catalogo.',
                icon: '📸',
                color: 'from-pink-500 to-rose-500'
              },
              {
                step: '2',
                title: 'Comparte tu link',
                description: 'Tu catalogo tiene un link unico. Compartelo por WhatsApp, Instagram o donde quieras.',
                icon: '🔗',
                color: 'from-blue-500 to-indigo-500'
              },
              {
                step: '3',
                title: 'Recibe pedidos',
                description: 'Tus clientes eligen productos y te contactan directo por WhatsApp. Tu respondes y vendes.',
                icon: '💬',
                color: 'from-emerald-500 to-teal-500'
              }
            ].map((item, i) => (
              <div key={i} className="relative text-center group">
                <div className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${item.color} rounded-3xl mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                  <span className="text-4xl">{item.icon}</span>
                </div>
                <div className="absolute -top-2 -right-2 md:right-auto md:left-1/2 md:translate-x-8 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-gradient-to-br from-emerald-50 via-white to-teal-50 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wide">Testimonios</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              Lo que dicen nuestros usuarios
            </h2>
          </div>

          <div className="relative">
            {testimonials.map((testimonial, i) => (
              <div
                key={i}
                className={`transition-all duration-500 ${
                  i === activeTestimonial ? 'opacity-100 translate-x-0' : 'opacity-0 absolute inset-0 translate-x-8'
                }`}
              >
                <div className="bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-gray-100">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full overflow-hidden shadow-lg">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-900">{testimonial.name}</h4>
                      <p className="text-emerald-600 text-sm font-medium">{testimonial.business}</p>
                      <p className="text-gray-400 text-xs">{testimonial.location}</p>
                    </div>
                  </div>
                  <p className="text-xl md:text-2xl font-light leading-relaxed text-gray-700">
                    "{testimonial.text}"
                  </p>
                </div>
              </div>
            ))}

            {/* Dots */}
            <div className="flex justify-center gap-2 mt-8">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTestimonial(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === activeTestimonial ? 'bg-emerald-600 w-8' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="precios" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wide">Precios</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
              Empieza gratis, mejora cuando quieras
            </h2>
            <p className="text-gray-600">
              Sin sorpresas. Sin comisiones por venta. Precio fijo mensual.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Free Plan */}
            <div className="bg-white rounded-3xl p-6 border-2 border-gray-200 hover:border-emerald-200 transition-colors relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform"></div>

              <div className="relative">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Catalogo</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold text-gray-900">Gratis</span>
                </div>
                <p className="text-gray-500 text-sm mb-6">Para siempre</p>

                <ul className="space-y-3 mb-8">
                  {[
                    'Hasta 20 productos',
                    '1 foto por producto',
                    'Pedidos por WhatsApp',
                    'Link compartible',
                    'Sin comisiones',
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a href={`https://dashboard.shopifree.app/${locale}/register`} className="block">
                  <button className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-emerald-500 hover:text-emerald-600 transition-all text-sm">
                    Empezar gratis
                  </button>
                </a>
              </div>
            </div>

            {/* Starter Plan - $1 */}
            <div className="bg-white rounded-3xl p-6 border-2 border-gray-900 hover:border-gray-700 transition-colors relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-100 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform"></div>

              <div className="relative">
                <h3 className="text-lg font-bold text-gray-900 mb-2">Emprendedor</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold text-gray-900">$1</span>
                  <span className="text-gray-500">/mes</span>
                </div>
                <p className="text-gray-500 text-sm mb-6">Para crecer</p>

                <ul className="space-y-3 mb-8">
                  {[
                    'Hasta 50 productos',
                    '5 fotos por producto',
                    'Pedidos por WhatsApp',
                    'Categorias',
                    'Sin branding Shopifree',
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a href={`https://dashboard.shopifree.app/${locale}/register`} className="block">
                  <button className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-all text-sm">
                    Comenzar
                  </button>
                </a>
              </div>
            </div>

            {/* Premium Plan - $5 */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-600 rounded-3xl p-6 text-white relative overflow-hidden shadow-2xl shadow-emerald-200">
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16"></div>

              <div className="absolute -top-1 -right-1">
                <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1.5 rounded-bl-xl rounded-tr-3xl">
                  POPULAR
                </div>
              </div>

              <div className="relative">
                <h3 className="text-lg font-bold mb-2">Tienda</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold">$5</span>
                  <span className="text-emerald-200">/mes</span>
                </div>
                <p className="text-emerald-200 text-sm mb-6">Todo incluido</p>

                <ul className="space-y-3 mb-8">
                  {[
                    'Productos ilimitados',
                    '10 fotos por producto',
                    'Checkout completo',
                    'Pagos online (Stripe)',
                    'Dominio personalizado',
                    'Cupones y promociones',
                  ].map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <svg className="w-4 h-4 text-emerald-300 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <a href={`https://dashboard.shopifree.app/${locale}/register`} className="block">
                  <button className="w-full py-3 bg-white text-emerald-600 rounded-xl font-semibold hover:bg-emerald-50 transition-colors shadow-lg text-sm">
                    Comenzar
                  </button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-emerald-600 font-semibold text-sm uppercase tracking-wide">FAQ</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              Preguntas frecuentes
            </h2>
          </div>

          <div className="space-y-6">
            {[
              {
                q: 'Necesito conocimientos tecnicos?',
                a: 'No. Solo necesitas saber subir fotos y escribir. Si usas WhatsApp, puedes usar Shopifree. La mayoria de usuarios crean su catalogo en menos de 10 minutos.'
              },
              {
                q: 'Como recibo los pedidos?',
                a: 'Tus clientes navegan tu catalogo, eligen productos y al hacer clic en "Pedir" se abre WhatsApp con un mensaje pre-escrito. Tu recibes el pedido en tu WhatsApp normal y coordinas pago/entrega.'
              },
              {
                q: 'Hay comisiones por venta?',
                a: 'No. Shopifree no cobra comisiones. El plan gratis es 100% gratis y el plan Tienda tiene un precio fijo de $5/mes sin importar cuanto vendas.'
              },
              {
                q: 'Puedo usar mi propio dominio?',
                a: 'Si, con el plan Tienda puedes conectar tu dominio (ej: mitienda.com). El plan gratis usa un subdominio tipo tutienda.shopifree.app que tambien es profesional.'
              }
            ].map((item, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 hover:bg-emerald-50 transition-colors">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-sm font-bold">?</span>
                  {item.q}
                </h3>
                <p className="text-gray-600 ml-8">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-emerald-600 via-emerald-600 to-teal-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -translate-y-48 -translate-x-48"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-y-48 translate-x-48"></div>

        <div className="relative max-w-3xl mx-auto px-4 text-center">
          <span className="inline-block text-4xl mb-4">🚀</span>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Empieza a vender hoy
          </h2>
          <p className="text-xl text-emerald-100 mb-10 max-w-xl mx-auto">
            Unete a cientos de emprendedores que ya venden con Shopifree. Crea tu catalogo gratis en minutos.
          </p>
          <a href={`https://dashboard.shopifree.app/${locale}/register`}>
            <button className="bg-white text-emerald-600 px-10 py-5 rounded-2xl font-bold text-lg hover:bg-emerald-50 transition-all shadow-2xl hover:shadow-3xl hover:-translate-y-1 inline-flex items-center gap-3">
              Crear mi catalogo gratis
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="md:col-span-2">
              <Image
                src="/logo-primary.png"
                alt="Shopifree"
                width={160}
                height={45}
                className="h-10 w-auto mb-4"
              />
              <p className="text-gray-400 max-w-sm">
                La forma mas simple de vender online. Crea tu catalogo, comparte tu link, recibe pedidos por WhatsApp.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href="#como-funciona" className="hover:text-white transition-colors">Como funciona</Link></li>
                <li><Link href="#precios" className="hover:text-white transition-colors">Precios</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link href={`/${locale}/privacy`} className="hover:text-white transition-colors">Privacidad</Link></li>
                <li><Link href={`/${locale}/terms`} className="hover:text-white transition-colors">Terminos</Link></li>
                <li><Link href={`/${locale}/contact`} className="hover:text-white transition-colors">Contacto</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              2025 Shopifree. Todos los derechos reservados.
            </p>
            <div className="flex items-center gap-4">
              <a href="https://wa.me/51958371017" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
