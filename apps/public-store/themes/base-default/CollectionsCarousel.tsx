import React, { useRef } from 'react';

const CollectionsCarousel = () => {
  // Productos de ejemplo para cada sección
  const mockProducts = [
    {
      id: 1,
      name: 'Collar Premium para Perro',
      price: 29.99,
      image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      originalPrice: 39.99
    },
    {
      id: 2,
      name: 'Juguete Interactivo para Gatos',
      price: 15.99,
      image: 'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      originalPrice: null
    },
    {
      id: 3,
      name: 'Cama Ortopédica para Mascotas',
      price: 89.99,
      image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      originalPrice: 119.99
    },
    {
      id: 4,
      name: 'Alimento Premium para Perros',
      price: 45.99,
      image: 'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      originalPrice: null
    },
    {
      id: 5,
      name: 'Transportadora de Viaje',
      price: 79.99,
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      originalPrice: 99.99
    },
    {
      id: 6,
      name: 'Set de Juguetes para Cachorros',
      price: 24.99,
      image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      originalPrice: null
    }
  ];

  const collections = [
    {
      title: 'Destacados',
      products: mockProducts.slice(0, 6)
    },
    {
      title: 'En oferta',
      products: mockProducts.filter(p => p.originalPrice).slice(0, 6)
    },
    {
      title: 'Todo perros',
      products: mockProducts.slice(0, 6)
    }
  ];

  const ProductCard = ({ product }: { product: any }) => (
    <div className="flex-shrink-0 w-64 bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        {product.originalPrice && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-medium">
            Oferta
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-blue-600">${product.price}</span>
            {product.originalPrice && (
              <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
            )}
          </div>
          <button className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm hover:bg-blue-700 transition-colors">
            Agregar
          </button>
        </div>
      </div>
    </div>
  );

  const CollectionSection = ({ title, products }: { title: string; products: any[] }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
      if (scrollRef.current) {
        const scrollAmount = 280; // Ancho de tarjeta + gap
        const currentScroll = scrollRef.current.scrollLeft;
        const newScroll = direction === 'left' 
          ? currentScroll - scrollAmount 
          : currentScroll + scrollAmount;
        
        scrollRef.current.scrollTo({
          left: newScroll,
          behavior: 'smooth'
        });
      }
    };

    return (
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <div className="flex space-x-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
        
        <div
          ref={scrollRef}
          className="flex space-x-4 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {collections.map((collection, index) => (
        <CollectionSection
          key={index}
          title={collection.title}
          products={collection.products}
        />
      ))}
    </div>
  );
};

export default CollectionsCarousel; 