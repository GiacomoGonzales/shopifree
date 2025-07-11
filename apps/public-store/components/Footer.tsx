import { Tienda } from '../lib/types'
import { Category } from '../lib/categories'

interface FooterProps {
  tienda: Tienda
  categorias?: Category[]
}

export default function Footer({ tienda, categorias = [] }: FooterProps) {
  // Separar categorías padre de subcategorías para el footer
  const parentCategories = categorias.filter(cat => !cat.parentCategoryId)
  
  // Usar solo categorías padre para la navegación del footer
  const categories = parentCategories.length > 0 
    ? parentCategories.map(cat => ({ 
        name: cat.name, 
        href: `/#${cat.slug}`
      }))
    : []

  return (
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
              <li>
                <a href="/" className="text-neutral-600 hover:text-neutral-900 transition-colors duration-200 font-light">
                  Inicio
                </a>
              </li>
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
  )
} 