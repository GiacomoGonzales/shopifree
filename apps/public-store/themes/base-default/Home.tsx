import { ThemeComponentProps } from '../theme-component'
import Image from 'next/image'

export default function BaseDefaultHome({ tienda }: ThemeComponentProps) {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
          Bienvenido a {tienda.storeName}
        </h2>
        {tienda.description && (
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {tienda.description}
          </p>
        )}
      </div>

      {/* Store info cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Location card */}
        {tienda.hasPhysicalLocation && tienda.address && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                style={{ backgroundColor: `${tienda.primaryColor}20` }}
              >
                <svg className="w-5 h-5" style={{ color: tienda.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Ubicación</h3>
            </div>
            <p className="text-gray-600">{tienda.address}</p>
          </div>
        )}

        {/* Contact card */}
        {tienda.phone && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                style={{ backgroundColor: `${tienda.primaryColor}20` }}
              >
                <svg className="w-5 h-5" style={{ color: tienda.primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Contacto</h3>
            </div>
            <p className="text-gray-600">{tienda.phone}</p>
          </div>
        )}

        {/* Social Media */}
        {tienda.socialMedia && Object.keys(tienda.socialMedia).length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-3">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center mr-3"
                style={{ backgroundColor: `${tienda.secondaryColor}20` }}
              >
                <svg className="w-5 h-5" style={{ color: tienda.secondaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Redes Sociales</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(tienda.socialMedia).map(([key, value]) => 
                value && (
                  <a
                    key={key}
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    {key}
                  </a>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 