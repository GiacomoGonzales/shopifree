import { ThemeLayoutProps } from '../theme-component'
import Header from './Header'
import BannerCarousel from './BannerCarousel'
import ProductNavBar from './ProductNavBar'
import CollectionsCarousel from './CollectionsCarousel'
import Testimonials from './Testimonials'
import BrandsCarousel from './BrandsCarousel'
import Footer from './Footer'

export default function BaseDefaultLayout({ tienda, children }: ThemeLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <Header tienda={tienda} />

      {/* Contenido principal */}
      <main className="flex-1">
        {/* Banner Carousel */}
        <section className="max-w-7xl mx-auto px-4 py-6">
          <BannerCarousel />
        </section>

        {/* Barra de navegación de productos */}
        <section className="max-w-7xl mx-auto px-4 py-4">
          <ProductNavBar />
        </section>

        {/* Carruseles de colecciones */}
        <section className="max-w-7xl mx-auto px-4 py-8">
          <CollectionsCarousel />
        </section>

        {/* Contenido dinámico de la página */}
        <section className="max-w-7xl mx-auto px-4 py-8">
          {children}
        </section>

        {/* Testimoniales */}
        <section className="py-8">
          <Testimonials />
        </section>

        {/* Carrusel de marcas */}
        <section className="py-8">
          <BrandsCarousel />
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
} 