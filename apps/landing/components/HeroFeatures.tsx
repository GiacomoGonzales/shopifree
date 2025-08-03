'use client'

import Image from 'next/image'
import { useTranslations } from 'next-intl'

export default function HeroFeatures() {
  const t = useTranslations('heroFeatures')

  return (
    <section className="bg-gray-50 py-20">
      <div className="container-landing">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4 drop-shadow-sm">
            {t('title')}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t('subtitle')}
          </p>
        </div>

        {/* Mosaico Grid - Layout reorganizado */}
        <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto">
          
          {/* Lado izquierdo: Carrusel de productos - Ocupa toda la altura */}
          <div className="lg:w-1/2 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl p-8 lg:h-[500px] h-80 overflow-hidden relative shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="text-white mb-6 relative z-10">
              <h3 className="text-2xl font-bold mb-2 drop-shadow-sm">{t('carousel.title')}</h3>
              <p className="text-emerald-100 text-sm">{t('carousel.description')}</p>
            </div>
            
            {/* Contenedor del carrusel */}
            <div className="absolute bottom-6 left-6 right-6 h-48 overflow-hidden">
              <div className="carousel-container flex animate-carousel-slide items-center h-full">
                {/* Primera serie de imágenes */}
                <div className="carousel-set flex space-x-8 min-w-full items-center px-4">
                  <Image
                    src="/images/demo/product1.PNG"
                    alt="Producto 1"
                    width={160}
                    height={160}
                    className="w-36 h-36 object-contain rounded-xl shadow-2xl bg-white/10 backdrop-blur-sm p-2"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' fill='%23e5e7eb'%3E%3Crect width='160' height='160' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='0.3em' fill='%236b7280' font-size='14'%3ET-Shirt%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  
                  <Image
                    src="/images/demo/product2.PNG"
                    alt="Producto 2"
                    width={160}
                    height={160}
                    className="w-36 h-36 object-contain rounded-xl shadow-2xl bg-white/10 backdrop-blur-sm p-2"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' fill='%23e5e7eb'%3E%3Crect width='160' height='160' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='0.3em' fill='%236b7280' font-size='14'%3EShirts%3C/text%3E%3C/svg%3E";
                    }}
                  />

                  <Image
                    src="/images/demo/product3.PNG"
                    alt="Producto 3"
                    width={160}
                    height={160}
                    className="w-36 h-36 object-contain rounded-xl shadow-2xl bg-white/10 backdrop-blur-sm p-2"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' fill='%23e5e7eb'%3E%3Crect width='160' height='160' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='0.3em' fill='%236b7280' font-size='14'%3EPizza%3C/text%3E%3C/svg%3E";
                    }}
                  />

                  <Image
                    src="/images/demo/product4.PNG"
                    alt="Producto 4"
                    width={160}
                    height={160}
                    className="w-36 h-36 object-contain rounded-xl shadow-2xl bg-white/10 backdrop-blur-sm p-2"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' fill='%23e5e7eb'%3E%3Crect width='160' height='160' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='0.3em' fill='%236b7280' font-size='14'%3EWatch%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>

                {/* Segunda serie de imágenes (duplicado para loop infinito) */}
                <div className="carousel-set flex space-x-8 min-w-full items-center px-4">
                  <Image
                    src="/images/demo/product1.PNG"
                    alt="Producto 1"
                    width={160}
                    height={160}
                    className="w-36 h-36 object-contain rounded-xl shadow-2xl bg-white/10 backdrop-blur-sm p-2"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' fill='%23e5e7eb'%3E%3Crect width='160' height='160' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='0.3em' fill='%236b7280' font-size='14'%3ET-Shirt%3C/text%3E%3C/svg%3E";
                    }}
                  />
                  
                  <Image
                    src="/images/demo/product2.PNG"
                    alt="Producto 2"
                    width={160}
                    height={160}
                    className="w-36 h-36 object-contain rounded-xl shadow-2xl bg-white/10 backdrop-blur-sm p-2"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' fill='%23e5e7eb'%3E%3Crect width='160' height='160' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='0.3em' fill='%236b7280' font-size='14'%3EShirts%3C/text%3E%3C/svg%3E";
                    }}
                  />

                  <Image
                    src="/images/demo/product3.PNG"
                    alt="Producto 3"
                    width={160}
                    height={160}
                    className="w-36 h-36 object-contain rounded-xl shadow-2xl bg-white/10 backdrop-blur-sm p-2"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' fill='%23e5e7eb'%3E%3Crect width='160' height='160' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='0.3em' fill='%236b7280' font-size='14'%3EPizza%3C/text%3E%3C/svg%3E";
                    }}
                  />

                  <Image
                    src="/images/demo/product4.PNG"
                    alt="Producto 4"
                    width={160}
                    height={160}
                    className="w-36 h-36 object-contain rounded-xl shadow-2xl bg-white/10 backdrop-blur-sm p-2"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' fill='%23e5e7eb'%3E%3Crect width='160' height='160' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='0.3em' fill='%236b7280' font-size='14'%3EWatch%3C/text%3E%3C/svg%3E";
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Lado derecho: Contenedores apilados */}
          <div className="lg:w-1/2 flex flex-col gap-6">
            
            {/* Fila superior: Dominio y Móvil */}
            <div className="flex flex-col md:flex-row gap-6">
              
              {/* Dominio */}
              <div className="md:w-1/2 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl p-6 h-60 relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="text-white mb-4 relative z-10">
                  <h3 className="text-lg font-bold mb-2 drop-shadow-sm">{t('domain.title')}</h3>
                  <p className="text-teal-100 text-sm">{t('domain.description')}</p>
                </div>
                
                {/* Simulación del browser */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="bg-white rounded-lg p-3 shadow-lg">
                    <div className="flex items-center mb-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    </div>
                    <div className="bg-gray-100 rounded px-3 py-2">
                      <span className="text-gray-500 text-xs">🔒 https://</span>
                      <span className="typing-text text-teal-600 font-semibold text-sm">balidining</span>
                      <span className="cursor animate-pulse text-sm">|</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Móvil Design */}
              <div className="md:w-1/2 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl p-6 h-60 relative overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="text-white mb-4 relative z-10">
                  <h3 className="text-lg font-bold mb-2 drop-shadow-sm">{t('mobile.title')}</h3>
                  <p className="text-emerald-100 text-sm">{t('mobile.description')}</p>
                </div>
                
                {/* Frame del móvil cortado */}
                <div className="absolute bottom-0 right-4 w-20 h-28 overflow-hidden">
                  <div className="w-20 h-40 bg-gray-900 rounded-xl p-1">
                    <div className="w-full h-full bg-white rounded-lg overflow-hidden relative">
                      {/* Notch */}
                      <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gray-900 rounded-full"></div>
                      
                      {/* Contenido */}
                      <div className="pt-3 px-1">
                        <div className="text-center mb-1">
                          <h4 className="text-xs font-bold text-gray-900">Take Burger</h4>
                          <p className="text-xs text-gray-600">Ver mapa</p>
                        </div>
                        
                        {/* Mapa */}
                        <div className="bg-emerald-100 h-8 rounded relative">
                          <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                            <div className="w-1 h-1 bg-white rounded-full"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>

            {/* Fila inferior: SEO */}
            <div className="bg-gradient-to-br from-gray-600 to-gray-800 rounded-2xl p-6 h-56 relative shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="text-white mb-4 relative z-10">
                <h3 className="text-xl font-bold mb-2 drop-shadow-sm">{t('seo.title')}</h3>
                <p className="text-gray-300 text-sm">{t('seo.description')}</p>
              </div>
              
              {/* Google Search Result */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white rounded-lg p-4 shadow-lg">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-blue-600 rounded-sm flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-xs font-bold">B</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-blue-600 text-xs mb-1">balidining.me</div>
                      <div className="text-blue-800 text-sm font-semibold hover:underline cursor-pointer truncate">
                        Bali Dining | Take App
                      </div>
                      <div className="text-gray-600 text-xs mt-1 line-clamp-2">
                        Category: Main Dish, Italian, Beverages, Digital, Restaurant Website • 
                        Pizza: $16.00, Spaghetti: $12.00, Classic Burger: $30.00.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Estilos CSS */}
      <style jsx>{`
        .carousel-container {
          animation: scrollUp 12s linear infinite;
        }
        
        .carousel-set {
          display: flex;
          flex-direction: column;
        }
        
        @keyframes scrollUp {
          0% {
            transform: translateY(100%);
          }
          100% {
            transform: translateY(-100%);
          }
        }
        
        .typing-text {
          animation: typing 4s infinite;
          display: inline-block;
          overflow: hidden;
          white-space: nowrap;
        }
        
        @keyframes typing {
          0% { 
            width: 0; 
            border-right: 2px solid transparent;
          }
          50% { 
            width: 80px; 
            border-right: 2px solid #0d9488;
          }
          100% { 
            width: 80px; 
            border-right: 2px solid transparent;
          }
        }
        
        .cursor {
          animation: blink 1s infinite;
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </section>
  )
}