import React from 'react';

interface HeaderProps {
  tienda?: any;
}

const Header = ({ tienda }: HeaderProps) => {
  // Obtener nombre y logo desde la estructura correcta de Firestore
  const storeName = tienda?.storeName;
  const storeLogo = tienda?.location?.logo;

  return (
    <header className="flex justify-between items-center px-6 py-4 shadow-md sticky top-0 z-50 bg-white">
      {/* Logo y nombre de la tienda */}
      <div className="flex items-center space-x-2">
        {storeLogo && (
          <img
            src={storeLogo}
            alt={storeName}
            className="w-10 h-10 object-contain rounded"
          />
        )}
        {storeName && (
          <span className="font-semibold text-lg text-gray-800">{storeName}</span>
        )}
      </div>

      {/* Navegación central */}
      <nav className="hidden md:flex space-x-8">
        <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">
          Home
        </a>
        <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">
          Categorías
        </a>
        <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">
          Acerca de Nosotros
        </a>
        <a href="#" className="text-gray-700 hover:text-blue-600 transition-colors">
          Contacto
        </a>
      </nav>

      {/* Elementos de la derecha */}
      <div className="flex items-center space-x-4">
        {/* Barra de búsqueda */}
        <div className="relative hidden md:block">
          <input
            type="text"
            placeholder="Buscar productos..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Carrito de compras */}
        <button className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h7M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
          </svg>
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            0
          </span>
        </button>

        {/* Mi cuenta */}
        <button className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="hidden lg:block">Mi cuenta</span>
        </button>

        {/* Menú móvil */}
        <button className="md:hidden p-2 text-gray-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header; 