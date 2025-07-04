import { ThemeLayoutProps } from '../theme-component'
import Image from 'next/image'

export default function MinimalSushiLayout({ tienda, children }: ThemeLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* Header Minimalista */}
      <header className="py-6 bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {tienda.logoUrl && (
                <div className="w-8 h-8 relative">
                  <Image
                    src={tienda.logoUrl}
                    alt={`${tienda.storeName} logo`}
                    fill
                    className="object-contain"
                  />
                </div>
              )}
              <h1 className="text-xl font-light tracking-wide text-gray-900">
                {tienda.storeName}
              </h1>
            </div>
            
            {/* Contact button with minimal style */}
            {tienda.phone && (
              <a
                href={`https://wa.me/${tienda.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 text-sm border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-colors duration-200"
              >
                Contactar
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-12">
        {children}
      </main>

      {/* Footer Minimalista */}
      <footer className="py-12 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} {tienda.storeName}
              <span className="mx-2">·</span>
              <a 
                href="https://shopifree.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-gray-900 transition-colors duration-200"
              >
                Shopifree
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
} 