'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Tienda } from '../../lib/types'
import { Category } from '../../lib/categories'

interface ElegantFooterProps {
  tienda: Tienda
  categorias: Category[]
}

export default function ElegantFooter({ tienda, categorias }: ElegantFooterProps) {
  // Separar categorías padre de subcategorías (conservando orden desde Firestore)
  const parentCategories = categorias.filter(cat => !cat.parentCategoryId)

  // API Key de Google Maps desde variables de entorno
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  return (
    <footer className="border-t mt-auto" style={{ 
      backgroundColor: 'rgb(var(--theme-secondary))', 
      borderColor: 'rgb(var(--theme-primary) / 0.1)' 
    }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ padding: '3rem 1rem' }}>
        {/* Separador elegante */}
        <div className="separator-elegant mb-8 md:mb-12"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
          {/* Información de la tienda */}
          <div className="space-y-6">
            <div className="flex flex-col items-start space-y-4">
              <div className="flex items-center space-x-3">
                {tienda?.logoUrl ? (
                  <div className="w-8 h-8 relative logo-boutique">
                    <Image
                      src={tienda.logoUrl}
                      alt={`${tienda.storeName} logo`}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div 
                    className="w-8 h-8 logo-boutique flex items-center justify-center"
                    style={{ backgroundColor: 'rgb(var(--theme-primary))' }}
                  >
                    <span 
                      className="text-white font-bold text-sm text-serif"
                    >
                      {tienda?.storeName?.charAt(0) || 'S'}
                    </span>
                  </div>
                )}
                <span 
                  className="text-xl font-medium text-serif"
                  style={{ color: 'rgb(var(--theme-neutral-dark))' }}
                >
                  {tienda?.storeName || 'Elegant Boutique'}
                </span>
              </div>
              
              <p 
                className="text-sm text-sans leading-relaxed max-w-sm"
                style={{ color: 'rgb(var(--theme-neutral-medium))' }}
              >
                {tienda?.description || 'Descubre nuestra exclusiva colección de productos premium, cuidadosamente seleccionados para quienes aprecian la verdadera elegancia.'}
              </p>
            </div>
          </div>

          {/* Navegación */}
          <div className="space-y-6">
            <h3 
              className="text-lg font-medium text-serif"
              style={{ color: 'rgb(var(--theme-neutral-dark))' }}
            >
              Navegación
            </h3>
            <nav className="space-y-3">
              <Link 
                href="/" 
                className="block text-sm text-sans hover-elegant transition-colors"
                style={{ color: 'rgb(var(--theme-neutral-medium))' }}
              >
                Inicio
              </Link>
              {parentCategories.slice(0, 5).map((category) => (
                <Link
                  key={category.id}
                  href={`/categoria/${category.slug}`}
                  className="block text-sm text-sans hover-elegant transition-colors"
                  style={{ color: 'rgb(var(--theme-neutral-medium))' }}
                >
                  {category.name}
                </Link>
              ))}
              <Link 
                href="/favoritos" 
                className="block text-sm text-sans hover-elegant transition-colors"
                style={{ color: 'rgb(var(--theme-neutral-medium))' }}
              >
                Favoritos
              </Link>
            </nav>
          </div>

          {/* Ayuda */}
          <div className="space-y-6">
            <h3 
              className="text-lg font-medium text-serif"
              style={{ color: 'rgb(var(--theme-neutral-dark))' }}
            >
              Ayuda
            </h3>
            <nav className="space-y-3">
              <Link 
                href="/mi-cuenta" 
                className="block text-sm text-sans hover-elegant transition-colors"
                style={{ color: 'rgb(var(--theme-neutral-medium))' }}
              >
                Mi Cuenta
              </Link>
              <a 
                href={`https://wa.me/${tienda?.phone?.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block text-sm text-sans hover-elegant transition-colors"
                style={{ color: 'rgb(var(--theme-neutral-medium))' }}
              >
                Contacto
              </a>
              <a 
                href="#"
                className="block text-sm text-sans hover-elegant transition-colors"
                style={{ color: 'rgb(var(--theme-neutral-medium))' }}
              >
                Envíos
              </a>
              <a 
                href="#"
                className="block text-sm text-sans hover-elegant transition-colors"
                style={{ color: 'rgb(var(--theme-neutral-medium))' }}
              >
                Devoluciones
              </a>
              <a 
                href="#"
                className="block text-sm text-sans hover-elegant transition-colors"
                style={{ color: 'rgb(var(--theme-neutral-medium))' }}
              >
                FAQ
              </a>
            </nav>
          </div>

          {/* Ubicación */}
          <div className="space-y-6">
            <h3 
              className="text-lg font-medium text-serif"
              style={{ color: 'rgb(var(--theme-neutral-dark))' }}
            >
              📌 Ubícanos
            </h3>
            
            {tienda?.hasPhysicalLocation && tienda?.address ? (
              <>
                <p 
                  className="text-sm text-sans"
                  style={{ color: 'rgb(var(--theme-neutral-medium))' }}
                >
                  Encuéntranos fácilmente
                </p>
                
                {/* Mapa interactivo de Google Maps */}
                <div className="w-full">
                  <div 
                    className="w-full h-[150px] rounded-lg overflow-hidden"
                    style={{ 
                      backgroundColor: 'rgb(var(--theme-primary) / 0.05)',
                      border: '1px solid rgb(var(--theme-primary) / 0.1)'
                    }}
                  >
                    {googleMapsApiKey ? (
                      <iframe
                        src={`https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${encodeURIComponent(tienda.address)}&zoom=16`}
                        width="100%"
                        height="150"
                        style={{ border: 0, borderRadius: '8px' }}
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Ubicación de la tienda"
                      />
                    ) : (
                      <>
                        {/* Fallback si no hay API key */}
                        <div className="w-full h-full flex items-center justify-center relative">
                          <div className="text-center">
                            <div className="text-4xl mb-2">🗺️</div>
                            <p 
                              className="text-sm text-sans font-medium"
                              style={{ color: 'rgb(var(--theme-neutral-dark))' }}
                            >
                              Ver en Google Maps
                            </p>
                          </div>
                          
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tienda.address)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute inset-0 hover:bg-black hover:bg-opacity-5 transition-colors"
                            title="Ver ubicación en Google Maps"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Dirección */}
                <div className="space-y-2">
                  <div className="flex items-start space-x-2">
                    <span 
                      className="text-sm mt-0.5"
                      style={{ color: 'rgb(var(--theme-primary))' }}
                    >
                      📍
                    </span>
                    <p 
                      className="text-sm text-sans leading-relaxed"
                      style={{ color: 'rgb(var(--theme-neutral-medium))' }}
                    >
                      {tienda.address}
                    </p>
                  </div>
                  
                  {/* Enlace para abrir en Google Maps */}
                  <div className="mt-2">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tienda.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-sans hover-elegant transition-colors"
                      style={{ color: 'rgb(var(--theme-accent))' }}
                    >
                      Abrir en Google Maps →
                    </a>
                  </div>
                </div>
              </>
            ) : (
              <>
                <p 
                  className="text-sm text-sans"
                  style={{ color: 'rgb(var(--theme-neutral-medium))' }}
                >
                  Tienda en línea
                </p>
                <div 
                  className="w-full h-[150px] rounded-lg flex items-center justify-center"
                  style={{ 
                    backgroundColor: 'rgb(var(--theme-primary) / 0.05)',
                    border: '1px solid rgb(var(--theme-primary) / 0.1)'
                  }}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">🌐</div>
                    <p 
                      className="text-sm text-sans"
                      style={{ color: 'rgb(var(--theme-neutral-medium))' }}
                    >
                      Disponible en línea
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Separador elegante */}
        <div className="separator-elegant my-8 md:my-12"></div>

        {/* Redes sociales y copyright */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center space-x-6">
            {tienda?.socialMedia?.instagram && (
              <a
                href={tienda.socialMedia.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover-elegant"
                style={{ color: 'rgb(var(--theme-neutral-medium))' }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            )}
            
            {tienda?.socialMedia?.facebook && (
              <a
                href={tienda.socialMedia.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="hover-elegant"
                style={{ color: 'rgb(var(--theme-neutral-medium))' }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            )}
            
            {tienda?.socialMedia?.whatsapp && (
              <a
                href={`https://wa.me/${tienda.socialMedia.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="hover-elegant"
                style={{ color: 'rgb(var(--theme-neutral-medium))' }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
              </a>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
            <p 
              className="text-sm text-sans"
              style={{ color: 'rgb(var(--theme-neutral-medium))' }}
            >
              © 2024 {tienda?.storeName || 'Elegant Boutique'}. Todos los derechos reservados.
            </p>
            <div className="flex items-center space-x-4">
              <a 
                href="#"
                className="text-sm text-sans hover-elegant transition-colors"
                style={{ color: 'rgb(var(--theme-neutral-medium))' }}
              >
                Privacidad
              </a>
              <a 
                href="#"
                className="text-sm text-sans hover-elegant transition-colors"
                style={{ color: 'rgb(var(--theme-neutral-medium))' }}
              >
                Términos
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
} 