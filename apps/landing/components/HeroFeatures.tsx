'use client'

import { useTranslations } from 'next-intl'

export default function HeroFeatures() {
  const t = useTranslations('heroFeatures')

  return (
    <section className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Crea tu sitio web en minutos
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubre las funcionalidades que harán de tu tienda online un éxito
          </p>
        </div>

        {/* Modern Features Mosaic */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          {/* Feature 1 - Easy Setup */}
          <div className="lg:col-span-2 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-8 text-white relative overflow-hidden group hover:shadow-xl transition-shadow duration-300">
            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">Setup en 5 minutos</h3>
                  <p className="text-emerald-100">Sin código, sin complicaciones</p>
                </div>
              </div>
              
              {/* Progress Bar Animation */}
              <div className="bg-white/20 rounded-full h-2 mb-4 overflow-hidden">
                <div className="h-full bg-white rounded-full animate-pulse" style={{width: '85%'}}></div>
              </div>
              
              {/* Steps */}
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                  <span>Registra tu cuenta</span>
                </div>
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-white rounded-full mr-3"></div>
                  <span>Elige tu diseño</span>
                </div>
                <div className="flex items-center opacity-60">
                  <div className="w-2 h-2 bg-white/50 rounded-full mr-3"></div>
                  <span>¡Tu tienda está lista!</span>
                </div>
              </div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
          </div>

          {/* Feature 2 - Mobile Ready */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-8 text-white relative overflow-hidden group hover:shadow-xl transition-shadow duration-300">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a1 1 0 001-1V4a1 1 0 00-1-1H8a1 1 0 00-1 1v16a1 1 0 001 1z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Responsive</h3>
              <p className="text-blue-100 text-sm mb-6">Perfecto en móviles y tablets</p>
              
              {/* Phone mockup */}
              <div className="mx-auto w-20 h-32 bg-gray-800 rounded-xl p-1 relative">
                <div className="w-full h-full bg-white rounded-lg overflow-hidden">
                  <div className="bg-emerald-500 h-8 flex items-center justify-center">
                    <div className="w-3 h-3 bg-white rounded-sm"></div>
                  </div>
                  <div className="p-2 space-y-1">
                    <div className="bg-gray-200 h-1.5 rounded w-full"></div>
                    <div className="bg-gray-200 h-1.5 rounded w-3/4"></div>
                    <div className="bg-gray-200 h-1.5 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="absolute -top-8 -right-8 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
          </div>

          {/* Feature 3 - Analytics */}
          <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-8 text-white relative overflow-hidden group hover:shadow-xl transition-shadow duration-300">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Analytics</h3>
              <p className="text-purple-100 text-sm mb-6">Reportes en tiempo real</p>
              
              {/* Mini chart */}
              <div className="flex items-end space-x-1 h-12">
                <div className="w-2 bg-white/60 rounded-t" style={{height: '40%'}}></div>
                <div className="w-2 bg-white/80 rounded-t" style={{height: '70%'}}></div>
                <div className="w-2 bg-white rounded-t" style={{height: '100%'}}></div>
                <div className="w-2 bg-white/80 rounded-t" style={{height: '60%'}}></div>
                <div className="w-2 bg-white/60 rounded-t" style={{height: '85%'}}></div>
              </div>
            </div>
            
            <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-110 transition-transform duration-700"></div>
          </div>

          {/* Feature 4 - No Commission */}
          <div className="lg:col-span-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-8 text-white relative overflow-hidden group hover:shadow-xl transition-shadow duration-300">
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">0% Comisiones</h3>
                    <p className="text-orange-100">Mantén el 100% de tus ganancias</p>
                  </div>
                </div>
                
                <div className="text-sm opacity-90">
                  <p>A diferencia de otras plataformas, no cobramos comisión por venta.</p>
                </div>
              </div>
              
              {/* Money illustration */}
              <div className="hidden md:block">
                <div className="text-6xl font-bold opacity-20 transform rotate-12">
                  100%
                </div>
              </div>
            </div>
            
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
          </div>

        </div>

        {/* Additional features grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto">
          
          <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">SSL Gratis</h4>
            <p className="text-sm text-gray-600">Seguridad incluida</p>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">SEO Optimizado</h4>
            <p className="text-sm text-gray-600">Mayor visibilidad</p>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25A9.75 9.75 0 102.25 12 9.75 9.75 0 0012 2.25z" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Soporte 24/7</h4>
            <p className="text-sm text-gray-600">Ayuda cuando la necesites</p>
          </div>

          <div className="text-center p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Sin Límites</h4>
            <p className="text-sm text-gray-600">Productos ilimitados</p>
          </div>

        </div>
      </div>
    </section>
  )
}