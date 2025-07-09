import { ThemeComponentProps } from "../theme-component";

export default function Home({ tienda }: ThemeComponentProps) {
  const primaryColor = tienda.primaryColor || '#111827';
  const secondaryColor = tienda.secondaryColor || '#1F2937';

  return (
    <main>
      {/* Contenedor de categorías y controles */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Categorías a la izquierda */}
            <div className="flex items-center space-x-6">
              <h3 className="text-sm font-medium text-gray-700">Categorías:</h3>
              <div className="flex items-center space-x-4">
                <button 
                  className="text-white px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200"
                  style={{ backgroundColor: primaryColor }}
                >
                  Todas
                </button>
                <button 
                  className="text-white/90 px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200 hover:text-white"
                  style={{ backgroundColor: `${secondaryColor}99` }}
                >
                  Ropa
                </button>
                <button 
                  className="text-white/90 px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200 hover:text-white"
                  style={{ backgroundColor: `${secondaryColor}99` }}
                >
                  Accesorios
                </button>
                <button 
                  className="text-white/90 px-6 py-2 rounded-full text-sm font-medium transition-colors duration-200 hover:text-white"
                  style={{ backgroundColor: `${secondaryColor}99` }}
                >
                  Zapatos
                </button>
              </div>
            </div>

            {/* Controles a la derecha */}
            <div className="flex items-center space-x-4">
              {/* Barra de búsqueda */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  className="w-64 px-4 py-2 pl-10 text-sm rounded-full border-0 text-white/90 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                  style={{ backgroundColor: `${secondaryColor}99` }}
                />
                <svg 
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/60"
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Botón de filtros */}
              <button 
                className="flex items-center space-x-2 text-white/90 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 hover:text-white"
                style={{ backgroundColor: `${secondaryColor}99` }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
                </svg>
                <span>Filtros</span>
              </button>

              {/* Botón de ordenar */}
              <button 
                className="flex items-center space-x-2 text-white/90 px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 hover:text-white"
                style={{ backgroundColor: `${secondaryColor}99` }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                </svg>
                <span>Ordenar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="container mx-auto px-6 py-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Nuestros Productos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {/* Las tarjetas de producto se agregarán aquí más adelante */}
        </div>
      </div>
    </main>
  )
} 