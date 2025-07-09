import { ThemeComponentProps, ThemeLayoutProps } from "../theme-component";
import HeroCarousel from '../../components/HeroCarousel';

const Header = ({ tienda }: ThemeComponentProps) => {
  const primaryColor = tienda.primaryColor || '#111827';
  const secondaryColor = tienda.secondaryColor || '#1F2937';

  return (
    <header className="sticky top-0 z-20 px-4 py-6">
      <div 
        className="backdrop-blur-sm shadow-lg rounded-full flex justify-between items-center px-6 py-3 mx-auto max-w-7xl"
        style={{ backgroundColor: `${primaryColor}40` }}
      >
        <div className="flex items-center">
          {tienda.headerLogoUrl ? (
            <img src={tienda.headerLogoUrl} alt={`${tienda.storeName} logo`} className="h-8 max-w-xs object-contain" />
          ) : (
            <div className="text-lg font-bold text-white tracking-wide">{tienda.storeName}</div>
          )}
        </div>
        <nav className="flex items-center space-x-4">
          <a 
            href="#" 
            className="text-white px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200"
            style={{ backgroundColor: secondaryColor }}
          >
            Products
          </a>
          <a 
            href="#" 
            className="text-white/90 px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200 hover:text-white"
            style={{ backgroundColor: `${secondaryColor}99` }}
          >
            About us
          </a>
          <a 
            href="#" 
            className="text-white/90 p-3 rounded-full transition-colors duration-200 hover:text-white flex items-center justify-center"
            style={{ backgroundColor: `${secondaryColor}99` }}
            aria-label="Mi cuenta"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </a>
          <a 
            href="#" 
            className="text-white/90 p-3 rounded-full transition-colors duration-200 hover:text-white flex items-center justify-center"
            style={{ backgroundColor: `${secondaryColor}99` }}
            aria-label="Carrito de compras"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
          </a>
        </nav>
      </div>
    </header>
  );
};

export default function BaseDefaultLayout({ tienda, children }: ThemeLayoutProps) {
  // Usar las imágenes del carrusel configuradas en el dashboard
  const carouselImages = tienda.carouselImages
    ?.sort((a, b) => a.order - b.order) // Ordenar por el campo order
    ?.map(img => img.url) || [];

  // Fallback: si no hay imágenes del carrusel, usar heroImageUrl
  const heroImages = carouselImages.length > 0 ? carouselImages : 
    (tienda.heroImageUrl ? [tienda.heroImageUrl] : []);

  return (
    <div className="min-h-screen font-sans bg-[#1a1a1a] text-white">
      <Header tienda={tienda} />
      {heroImages.length > 0 && (
        <div className="py-6">
          <HeroCarousel images={heroImages} />
        </div>
      )}
      <main className="max-w-7xl mx-auto px-4 py-12">
        {children}
      </main>
    </div>
  )
} 