import React, { useEffect, useState } from 'react';

const BrandsCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Se conectará con Firestore colecciones de tipo 'marca'
  const brands = [
    {
      id: 1,
      name: 'Royal Canin',
      logo: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      description: 'Nutrición premium para mascotas'
    },
    {
      id: 2,
      name: 'Hill\'s Pet',
      logo: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      description: 'Salud y bienestar animal'
    },
    {
      id: 3,
      name: 'Purina',
      logo: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      description: 'Alimentación balanceada'
    },
    {
      id: 4,
      name: 'Whiskas',
      logo: 'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      description: 'Especialistas en gatos'
    },
    {
      id: 5,
      name: 'Pedigree',
      logo: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      description: 'Nutrición para perros'
    },
    {
      id: 6,
      name: 'Eukanuba',
      logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      description: 'Rendimiento superior'
    },
    {
      id: 7,
      name: 'Acana',
      logo: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      description: 'Ingredientes naturales'
    },
    {
      id: 8,
      name: 'Orijen',
      logo: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
      description: 'Biológicamente apropiado'
    }
  ];

  // Auto-scroll del carrusel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % Math.ceil(brands.length / 4));
    }, 4000);

    return () => clearInterval(timer);
  }, [brands.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.ceil(brands.length / 4));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.ceil(brands.length / 4)) % Math.ceil(brands.length / 4));
  };

  // Agrupar marcas de 4 en 4 para desktop
  const groupedBrands = [];
  for (let i = 0; i < brands.length; i += 4) {
    groupedBrands.push(brands.slice(i, i + 4));
  }

  return (
    <div className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Marcas de confianza
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Trabajamos con las mejores marcas del mercado para ofrecerte productos de calidad superior
          </p>
        </div>

        <div className="relative">
          {/* Carrusel de marcas */}
          <div className="overflow-hidden">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {groupedBrands.map((group, groupIndex) => (
                <div key={groupIndex} className="w-full flex-shrink-0">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {group.map((brand) => (
                      <div
                        key={brand.id}
                        className="flex flex-col items-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer group"
                      >
                        <div className="w-24 h-24 mb-4 bg-white rounded-full flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            className="w-16 h-16 object-contain rounded-full"
                          />
                        </div>
                        <h3 className="font-semibold text-gray-800 text-center mb-2">
                          {brand.name}
                        </h3>
                        <p className="text-sm text-gray-600 text-center">
                          {brand.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Botones de navegación */}
          {groupedBrands.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                onClick={nextSlide}
                className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white shadow-lg rounded-full p-3 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Indicadores */}
        {groupedBrands.length > 1 && (
          <div className="flex justify-center space-x-2 mt-8">
            {groupedBrands.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}

        {/* Versión móvil - scroll horizontal */}
        <div className="md:hidden mt-8">
          <div className="flex space-x-4 overflow-x-auto pb-4">
            {brands.map((brand) => (
              <div
                key={brand.id}
                className="flex-shrink-0 w-32 flex flex-col items-center p-4 bg-gray-50 rounded-lg"
              >
                <div className="w-16 h-16 mb-3 bg-white rounded-full flex items-center justify-center shadow-md">
                  <img
                    src={brand.logo}
                    alt={brand.name}
                    className="w-12 h-12 object-contain rounded-full"
                  />
                </div>
                <h3 className="font-semibold text-gray-800 text-center text-sm">
                  {brand.name}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrandsCarousel; 