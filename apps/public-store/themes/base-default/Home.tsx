import { ThemeComponentProps } from "../theme-component";
import { useState, useRef, useEffect } from 'react';
import { collection, query, getDocs, orderBy, where } from 'firebase/firestore';
import { getFirebaseDb } from '../../lib/firebase';

interface Category {
  id: string;
  name: string;
  slug: string;
  order: number;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  comparePrice?: number;
  mediaFiles: Array<{
    id: string;
    url: string;
  }>;
  status: 'draft' | 'active' | 'archived';
  selectedCategory?: string;
  selectedParentCategoryIds: string[];
  selectedSubcategoryIds: string[];
}

// Función para obtener categorías padre de la tienda
const getStoreCategories = async (storeId: string): Promise<Category[]> => {
  try {
    const db = getFirebaseDb();
    if (!db) return [];

    const categoriesQuery = query(
      collection(db, 'stores', storeId, 'categories')
    );
    
    const querySnapshot = await getDocs(categoriesQuery);
    
    const categories = querySnapshot.docs.map(doc => ({
      id: doc.id,
      name: doc.data().name,
      slug: doc.data().slug,
      order: doc.data().order || 0
    })) as Category[];
    
    // Ordenar por orden
    categories.sort((a, b) => a.order - b.order);
    
    return categories;
  } catch (error) {
    console.error('Error getting store categories:', error);
    return [];
  }
};

// Función para obtener productos de la tienda
const getStoreProducts = async (storeId: string): Promise<Product[]> => {
  try {
    console.log('Obteniendo productos para store:', storeId);
    const db = getFirebaseDb();
    if (!db) {
      console.log('Firebase DB no disponible');
      return [];
    }

    // Usar query simple sin filtros complejos
    const productsQuery = query(
      collection(db, 'stores', storeId, 'products')
    );
    
    const querySnapshot = await getDocs(productsQuery);
    console.log('Productos encontrados en total:', querySnapshot.size);
    
    const allProducts = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      };
    }) as Product[];
    
    // Filtrar por status activo en JavaScript
    const activeProducts = allProducts.filter(product => {
      console.log('Producto:', {
        id: product.id,
        name: product.name,
        status: product.status,
        selectedCategory: product.selectedCategory
      });
      return product.status === 'active';
    });
    
    console.log('Productos activos:', activeProducts.length);
    return activeProducts;
  } catch (error) {
    console.error('Error getting store products:', error);
    return [];
  }
};

// Componente para la card de producto
const ProductCard = ({ product, primaryColor }: { product: Product; primaryColor: string }) => {
  const mainImage = product.mediaFiles?.[0]?.url || '/api/placeholder/300/300';
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;
  
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group">
      <div className="relative aspect-square overflow-hidden">
        <img 
          src={mainImage} 
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {hasDiscount && (
          <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-light">
            {Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)}% OFF
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="font-light text-gray-900 mb-4 line-clamp-2 tracking-wide">{product.name}</h3>
        
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-lg font-normal text-gray-900">${product.price}</span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through font-light">${product.comparePrice}</span>
            )}
          </div>
          
          <button 
            className="px-4 py-2 rounded-full text-white text-sm font-light hover:opacity-90 transition-opacity duration-200"
            style={{ backgroundColor: primaryColor }}
          >
            Comprar
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Home({ tienda }: ThemeComponentProps) {
  const primaryColor = tienda.primaryColor || '#111827';
  const secondaryColor = tienda.secondaryColor || '#1F2937';
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const categoryScrollRef = useRef<HTMLDivElement>(null);

  // Función para centrar la categoría seleccionada en móvil
  const scrollToCategory = (categorySlug: string) => {
    if (categoryScrollRef.current) {
      const container = categoryScrollRef.current;
      const button = container.querySelector(`[data-category="${categorySlug}"]`) as HTMLElement;
      if (button) {
        const containerWidth = container.offsetWidth;
        const buttonLeft = button.offsetLeft;
        const buttonWidth = button.offsetWidth;
        const scrollLeft = buttonLeft - (containerWidth / 2) + (buttonWidth / 2);
        
        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        });
      }
    }
  };

  // Cargar categorías y productos al montar el componente
  useEffect(() => {
    const loadData = async () => {
      console.log('Iniciando carga de datos para tienda:', tienda);
      if (tienda.id) {
        setLoading(true);
        try {
          console.log('Cargando datos para store ID:', tienda.id);
          const [storeCategories, storeProducts] = await Promise.all([
            getStoreCategories(tienda.id),
            getStoreProducts(tienda.id)
          ]);
          console.log('Datos cargados:', {
            categories: storeCategories.length,
            products: storeProducts.length
          });
          setCategories(storeCategories);
          setProducts(storeProducts);
          setFilteredProducts(storeProducts);
        } catch (error) {
          console.error('Error loading data:', error);
        } finally {
          setLoading(false);
        }
      } else {
        console.log('No hay ID de tienda disponible');
      }
    };
    
    loadData();
  }, [tienda.id]);

  // Filtrar productos por búsqueda y categoría
  useEffect(() => {
    console.log('Filtrando productos:', {
      selectedCategory,
      searchQuery,
      totalProducts: products.length,
      categories: categories.map(cat => ({ id: cat.id, slug: cat.slug, name: cat.name }))
    });

    let filtered = products;

    // Filtrar por búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    }

    // Filtrar por categoría
    if (selectedCategory !== 'todas') {
      const category = categories.find(cat => cat.slug === selectedCategory);
      console.log('Categoría encontrada:', category);
      
      if (category) {
        filtered = filtered.filter(product => {
          console.log('Evaluando producto:', {
            name: product.name,
            selectedCategory: product.selectedCategory,
            selectedParentCategoryIds: product.selectedParentCategoryIds,
            selectedSubcategoryIds: product.selectedSubcategoryIds
          });
          
          // Comparar con slug (nuevo formato) o ID (formato legacy)
          const matchesSelectedCategory = product.selectedCategory === category.slug || product.selectedCategory === category.id;
          const matchesParentCategory = product.selectedParentCategoryIds?.includes(category.id) || product.selectedParentCategoryIds?.includes(category.slug);
          const matchesSubcategory = product.selectedSubcategoryIds?.includes(category.id) || product.selectedSubcategoryIds?.includes(category.slug);
          
          const matches = matchesSelectedCategory || matchesParentCategory || matchesSubcategory;
          console.log('Producto matches:', matches);
          
          return matches;
        });
      }
    }

    console.log('Productos filtrados final:', filtered.length);
    setFilteredProducts(filtered);
  }, [selectedCategory, searchQuery, products, categories]);

  return (
    <main 
      className="overflow-x-hidden"
      style={{ fontFamily: '"Inter", "Helvetica Neue", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
    >
      {/* Barra de búsqueda principal */}
      <div className="bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-light text-gray-900 mb-2 tracking-wide">
              Encuentra lo que buscas
            </h1>
            <p className="text-gray-600 font-light">
              Descubre nuestros productos únicos y de calidad
            </p>
          </div>
          
          <div className="relative max-w-2xl mx-auto">
            <div className="relative bg-white rounded-full shadow-md border border-gray-200 overflow-hidden">
              <div className="flex items-center">
                <div className="flex-shrink-0 pl-5">
                  <svg 
                    className="w-5 h-5 text-gray-400" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={1.5} 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                    />
                  </svg>
                </div>
                
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                  className="w-full px-4 py-4 text-gray-700 placeholder-gray-400 bg-transparent border-0 focus:outline-none focus:ring-0 text-base"
                />
                
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="flex-shrink-0 p-2 mr-3 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
            
            {/* Dropdown de sugerencias */}
            {searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-60 overflow-y-auto">
                {filteredProducts.slice(0, 5).map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center p-3 hover:bg-gray-50 cursor-pointer transition-colors first:rounded-t-lg last:rounded-b-lg"
                    onClick={() => setSearchQuery(product.name)}
                  >
                    <img 
                      src={product.mediaFiles?.[0]?.url || '/api/placeholder/40/40'} 
                      alt={product.name}
                      className="w-10 h-10 rounded-lg object-cover mr-3"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-light text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500 font-light">${product.price}</p>
                    </div>
                  </div>
                ))}
                {filteredProducts.length === 0 && (
                  <div className="p-4 text-center text-gray-500">
                    No se encontraron productos
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenedor de categorías - Carrusel en móvil, centradas en desktop */}
      <nav className="bg-white border-b border-gray-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Desktop: Categorías centradas */}
          <div className="hidden md:flex items-center justify-center gap-4">
            <button 
              className={`px-3 py-2 rounded-full text-sm font-light transition-colors duration-200 ${
                selectedCategory === 'todas'
                  ? 'text-white'
                  : 'text-white/90 hover:text-white'
              }`}
              style={{ 
                backgroundColor: selectedCategory === 'todas' 
                  ? primaryColor 
                  : `${secondaryColor}99` 
              }}
              onClick={() => setSelectedCategory('todas')}
            >
              Todas
            </button>
            {categories.map((category) => (
              <button 
                key={category.id}
                className={`px-3 py-2 rounded-full text-sm font-light transition-colors duration-200 ${
                  selectedCategory === category.slug
                    ? 'text-white'
                    : 'text-white/90 hover:text-white'
                }`}
                style={{ 
                  backgroundColor: selectedCategory === category.slug 
                    ? primaryColor 
                    : `${secondaryColor}99` 
                }}
                onClick={() => setSelectedCategory(category.slug)}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Mobile: Carrusel horizontal */}
          <div className="md:hidden relative w-full">
            <div 
              ref={categoryScrollRef}
              className="flex items-center gap-3 overflow-x-auto pb-1 w-full" 
              style={{ 
                scrollbarWidth: 'none', 
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>
              <button 
                data-category="todas"
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-light transition-colors duration-200 ${
                  selectedCategory === 'todas'
                    ? 'text-white'
                    : 'text-white/90 hover:text-white'
                }`}
                style={{ 
                  backgroundColor: selectedCategory === 'todas' 
                    ? primaryColor 
                    : `${secondaryColor}99` 
                }}
                onClick={() => {
                  setSelectedCategory('todas');
                  scrollToCategory('todas');
                }}
              >
                Todas
              </button>
              {categories.map((category) => (
                <button 
                  key={category.id}
                  data-category={category.slug}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-light transition-colors duration-200 whitespace-nowrap ${
                    selectedCategory === category.slug
                      ? 'text-white'
                      : 'text-white/90 hover:text-white'
                  }`}
                  style={{ 
                    backgroundColor: selectedCategory === category.slug 
                      ? primaryColor 
                      : `${secondaryColor}99` 
                  }}
                  onClick={() => {
                    setSelectedCategory(category.slug);
                    scrollToCategory(category.slug);
                  }}
                >
                  {category.name}
                </button>
              ))}
            </div>
            
            {/* Indicador de scroll - Fade derecho */}
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent pointer-events-none" />
          </div>
        </div>
      </nav>

      {/* Grilla de productos */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-light text-gray-900 mb-2 tracking-wide">
            {searchQuery ? `Resultados para "${searchQuery}"` : 
             selectedCategory === 'todas' ? 'Todos los productos' : 
             categories.find(cat => cat.slug === selectedCategory)?.name || 'Productos'}
          </h2>
          <p className="text-gray-600 font-light">
            {loading ? 'Cargando productos...' : `${filteredProducts.length} productos disponibles`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-200 rounded-xl h-80 animate-pulse"></div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                primaryColor={primaryColor}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            </div>
            <h3 className="text-lg font-light text-gray-900 mb-2">No hay productos disponibles</h3>
            <p className="text-gray-600 font-light">
              {searchQuery ? `No se encontraron productos para "${searchQuery}"` :
               selectedCategory === 'todas' 
                ? 'Aún no hay productos en esta tienda.' 
                : 'No hay productos en esta categoría.'}
            </p>
          </div>
        )}
      </div>
    </main>
  )
} 