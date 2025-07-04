import { ThemeLayoutProps } from '../theme-component'
import Image from 'next/image'

export default function BaseDefaultLayout({ tienda, children }: ThemeLayoutProps) {
  return (
    <>
      {/* Header */}
      <header 
        className="bg-white shadow-sm border-b-4 sticky top-0 z-50"
        style={{ borderBottomColor: tienda.primaryColor }}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {tienda.logoUrl && (
                <div className="w-10 h-10 relative">
                  <Image
                    src={tienda.logoUrl}
                    alt={`${tienda.storeName} logo`}
                    fill
                    className="object-contain rounded-lg"
                  />
                </div>
              )}
              <div>
                <h1 
                  className="text-xl font-bold"
                  style={{ color: tienda.primaryColor }}
                >
                  {tienda.storeName}
                </h1>
                {tienda.slogan && (
                  <p className="text-sm text-gray-600">
                    {tienda.slogan}
                  </p>
                )}
              </div>
            </div>
            
            {/* Contact info */}
            {tienda.phone && (
              <a
                href={`https://wa.me/${tienda.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                style={{ backgroundColor: tienda.secondaryColor }}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"/>
                </svg>
                <span>WhatsApp</span>
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main 
        className="min-h-screen"
        style={{
          background: `linear-gradient(135deg, ${tienda.primaryColor}10, ${tienda.secondaryColor}10)`
        }}
      >
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <p className="text-gray-600 text-sm">
              © {new Date().getFullYear()} {tienda.storeName}. Potenciado por{' '}
              <a 
                href="https://shopifree.app" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium hover:underline"
                style={{ color: tienda.primaryColor }}
              >
                Shopifree
              </a>
            </p>
          </div>
        </div>
      </footer>
    </>
  )
} 