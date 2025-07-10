'use client'

import { useState, useEffect } from 'react'
import { ThemeLayoutProps } from "../theme-component"
import Image from 'next/image'

// Iconos modernos para el header
const Icons = {
  Search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  ShoppingBag: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  User: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Menu: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Close: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  Heart: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
}

export default function BaseDefaultLayout({ tienda, categorias = [], children }: ThemeLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)
  const [isScrolled, setIsScrolled] = useState(false)

  // Efecto para detectar scroll y cambiar estilo del header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Usar categorías reales o fallback a categorías de ejemplo
  const categories = categorias.length > 0 
    ? categorias.map(cat => ({ name: cat.name, href: `#${cat.slug}` }))
    : [
        { name: 'Nuevos', href: '#' },
        { name: 'Mujer', href: '#' },
        { name: 'Hombre', href: '#' },
        { name: 'Accesorios', href: '#' },
        { name: 'Ofertas', href: '#' },
      ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-sm' 
          : 'bg-white/90 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <a href="/" className="flex items-center space-x-3 hover-scale">
                <div className="w-8 h-8 bg-neutral-900 rounded-sm flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {tienda?.storeName?.charAt(0) || 'S'}
                  </span>
                </div>
                <span className="text-xl font-light text-neutral-900 tracking-tight">
                  {tienda?.storeName || 'Mi Tienda'}
                </span>
              </a>
            </div>

            {/* Navegación principal - Desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              {categories.map((category) => (
                <a
                  key={category.name}
                  href={category.href}
                  className="text-sm font-light text-neutral-600 hover:text-neutral-900 transition-colors duration-200 relative group"
                >
                  {category.name}
                  <span className="absolute -bottom-1 left-0 w-0 h-px bg-neutral-900 transition-all duration-200 group-hover:w-full"></span>
                </a>
              ))}
            </nav>

            {/* Acciones del header */}
            <div className="flex items-center space-x-3">
              {/* Búsqueda */}
              <button className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors duration-200 hover-scale">
                <Icons.Search />
              </button>

              {/* Favoritos */}
              <button className="hidden sm:flex p-2 text-neutral-600 hover:text-neutral-900 transition-colors duration-200 hover-scale">
                <Icons.Heart />
              </button>

              {/* Usuario */}
              <button className="hidden sm:flex p-2 text-neutral-600 hover:text-neutral-900 transition-colors duration-200 hover-scale">
                <Icons.User />
              </button>

              {/* Carrito */}
              <button className="relative p-2 text-neutral-600 hover:text-neutral-900 transition-colors duration-200 hover-scale">
                <Icons.ShoppingBag />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-neutral-900 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Menú móvil */}
              <button
                className="md:hidden p-2 text-neutral-600 hover:text-neutral-900 transition-colors duration-200"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Icons.Menu />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Menú móvil */}
      <div className={`fixed inset-0 z-50 md:hidden ${mobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        {/* Overlay */}
        <div 
          className={`fixed inset-0 bg-black transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-25' : 'opacity-0'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />
        
        {/* Panel del menú */}
        <div className={`fixed right-0 top-0 h-full w-80 max-w-sm bg-white shadow-soft-lg transform transition-transform duration-300 ease-out ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex items-center justify-between p-4 border-b border-neutral-200">
            <span className="text-lg font-light text-neutral-900">Menú</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors duration-200"
            >
              <Icons.Close />
            </button>
          </div>
          
          <nav className="px-4 py-6 space-y-4">
            {categories.map((category) => (
              <a
                key={category.name}
                href={category.href}
                className="block py-3 text-neutral-900 font-light border-b border-neutral-100 hover:text-neutral-600 transition-colors duration-200"
              >
                {category.name}
              </a>
            ))}
          </nav>
          
          <div className="px-4 py-6 border-t border-neutral-200 space-y-4">
            <a href="#" className="flex items-center space-x-3 py-2 text-neutral-600 hover:text-neutral-900 transition-colors duration-200">
              <Icons.User />
              <span className="font-light">Mi cuenta</span>
            </a>
            <a href="#" className="flex items-center space-x-3 py-2 text-neutral-600 hover:text-neutral-900 transition-colors duration-200">
              <Icons.Heart />
              <span className="font-light">Favoritos</span>
            </a>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <main className="animate-fade-in bg-white">
      {children}
    </main>

      {/* Footer */}
      <footer className="bg-neutral-50 border-t border-neutral-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Información de la tienda */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-neutral-900 rounded-sm flex items-center justify-center">
                  <span className="text-white font-bold text-xs">
                    {tienda?.storeName?.charAt(0) || 'S'}
                  </span>
                </div>
                <span className="text-lg font-light text-neutral-900">
                  {tienda?.storeName || 'Mi Tienda'}
                </span>
              </div>
              <p className="text-neutral-600 font-light leading-relaxed">
                {tienda?.description || 'Descubre nuestra colección única de productos cuidadosamente seleccionados para ti.'}
              </p>
            </div>

            {/* Enlaces rápidos */}
            <div>
              <h3 className="text-neutral-900 font-medium mb-4">Navegación</h3>
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category.name}>
                    <a href={category.href} className="text-neutral-600 hover:text-neutral-900 transition-colors duration-200 font-light">
                      {category.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Atención al cliente */}
            <div>
              <h3 className="text-neutral-900 font-medium mb-4">Ayuda</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-neutral-600 hover:text-neutral-900 transition-colors duration-200 font-light">Contacto</a></li>
                <li><a href="#" className="text-neutral-600 hover:text-neutral-900 transition-colors duration-200 font-light">Envíos</a></li>
                <li><a href="#" className="text-neutral-600 hover:text-neutral-900 transition-colors duration-200 font-light">Devoluciones</a></li>
                <li><a href="#" className="text-neutral-600 hover:text-neutral-900 transition-colors duration-200 font-light">FAQ</a></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-neutral-900 font-medium mb-4">Newsletter</h3>
              <p className="text-neutral-600 font-light mb-4">
                Suscríbete para recibir ofertas exclusivas
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="flex-1 px-3 py-2 bg-white border border-neutral-300 rounded-l-md text-sm font-light focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400"
                />
                <button className="px-4 py-2 bg-neutral-900 text-white rounded-r-md hover:bg-neutral-800 transition-colors duration-200 font-medium text-sm">
                  Enviar
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-neutral-200 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-neutral-600 font-light text-sm">
              © 2024 {tienda?.storeName || 'Mi Tienda'}. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <a href="#" className="text-neutral-600 hover:text-neutral-900 transition-colors duration-200 text-sm font-light">
                Privacidad
              </a>
              <a href="#" className="text-neutral-600 hover:text-neutral-900 transition-colors duration-200 text-sm font-light">
                Términos
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 