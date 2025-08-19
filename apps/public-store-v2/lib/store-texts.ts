// Textos de UI que cambian según el idioma seleccionado por el dueño de la tienda
// Estos son textos fijos de la interfaz, NO contenido de productos/categorías

export type StoreLanguage = 'es' | 'en' | 'pt';

export interface StoreTexts {
  // Navegación
  categories: string;
  home: string;
  catalog: string;
  search: string;
  
  // Carrito
  cart: string;
  addToCart: string;
  viewCart: string;
  cartEmpty: string;
  total: string;
  checkout: string;
  quantity: string;
  
  // Productos
  products: string;
  viewProduct: string;
  outOfStock: string;
  inStock: string;
  price: string;
  description: string;
  
  // Categorías
  allCategories: string;
  viewCategory: string;
  subcategories: string;
  
  // Generales
  loading: string;
  viewMore: string;
  viewAll: string;
  back: string;
  next: string;
  previous: string;
  close: string;
  
  // Footer
  aboutUs: string;
  contact: string;
  followUs: string;
  allRightsReserved: string;
  
  // Filtros y búsqueda
  filters: string;
  sortBy: string;
  priceRange: string;
  brands: string;
  noResults: string;
  searchResults: string;
  searchPlaceholder: string;
  searchCancel: string;
  searchDescription: string;
  searchNoResultsTitle: string;
  searchNoResultsText: string;
  searchNoResultsTip: string;
  searchResultsCount: string;
  
  // Botones y acciones
  exploreProducts: string;
  viewCategories: string;
  addProducts: string;
  
  // Footer
  navigation: string;
  information: string;
  subscribe: string;
  
  // Ordenamiento y vista
  sortOrder: string;
  viewType: string;
  
  // Footer adicional
  privacyPolicy: string;
  termsConditions: string;
  shippingReturns: string;
  poweredBy: string;
}

const STORE_TEXTS: Record<StoreLanguage, StoreTexts> = {
  es: {
    // Navegación
    categories: 'Categorías',
    home: 'Inicio',
    catalog: 'Catálogo',
    search: 'Buscar',
    
    // Carrito
    cart: 'Carrito de compras',
    addToCart: 'Agregar al carrito',
    viewCart: 'Ver carrito',
    cartEmpty: 'Tu carrito está vacío',
    total: 'Total',
    checkout: 'Finalizar compra',
    quantity: 'Cantidad',
    
    // Productos
    products: 'Productos',
    viewProduct: 'Ver producto',
    outOfStock: 'Agotado',
    inStock: 'Disponible',
    price: 'Precio',
    description: 'Descripción',
    
    // Categorías
    allCategories: 'Todas las categorías',
    viewCategory: 'Ver categoría',
    subcategories: 'Subcategorías',
    
    // Generales
    loading: 'Cargando...',
    viewMore: 'Ver más',
    viewAll: 'Ver todos',
    back: 'Volver',
    next: 'Siguiente',
    previous: 'Anterior',
    close: 'Cerrar',
    
    // Footer
    aboutUs: 'Acerca de nosotros',
    contact: 'Contacto',
    followUs: 'Síguenos',
    allRightsReserved: 'Todos los derechos reservados',
    
    // Filtros y búsqueda
    filters: 'Filtros',
    sortBy: 'Ordenar por',
    priceRange: 'Rango de precios',
    brands: 'Marcas',
    noResults: 'No se encontraron resultados',
    searchResults: 'Resultados de búsqueda',
    searchPlaceholder: 'Buscar productos...',
    searchCancel: 'Cancelar',
    searchDescription: 'Encuentra lo que necesitas escribiendo el nombre del producto, marca o categoría.',
    searchNoResultsTitle: 'Sin resultados',
    searchNoResultsText: 'No encontramos productos que coincidan con',
    searchNoResultsTip: 'Intenta con términos más generales o revisa la ortografía.',
    searchResultsCount: 'Resultados',
    
    // Botones y acciones
    exploreProducts: 'Explorar productos',
    viewCategories: 'Ver categorías',
    addProducts: 'Agrega productos para comenzar tu compra.',
    
    // Footer
    navigation: 'Navegación',
    information: 'Información',
    subscribe: 'Suscribirse',
    
    // Ordenamiento y vista
    sortOrder: 'Ordenar',
    viewType: 'Vista',
    
    // Footer adicional
    privacyPolicy: 'Políticas de privacidad',
    termsConditions: 'Términos y condiciones',
    shippingReturns: 'Envíos y devoluciones',
    poweredBy: 'Desarrollado por'
  },
  
  en: {
    // Navegación
    categories: 'Categories',
    home: 'Home',
    catalog: 'Catalog',
    search: 'Search',
    
    // Carrito
    cart: 'Shopping Cart',
    addToCart: 'Add to Cart',
    viewCart: 'View Cart',
    cartEmpty: 'Your cart is empty',
    total: 'Total',
    checkout: 'Checkout',
    quantity: 'Quantity',
    
    // Productos
    products: 'Products',
    viewProduct: 'View Product',
    outOfStock: 'Out of Stock',
    inStock: 'In Stock',
    price: 'Price',
    description: 'Description',
    
    // Categorías
    allCategories: 'All Categories',
    viewCategory: 'View Category',
    subcategories: 'Subcategories',
    
    // Generales
    loading: 'Loading...',
    viewMore: 'View More',
    viewAll: 'View All',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    close: 'Close',
    
    // Footer
    aboutUs: 'About Us',
    contact: 'Contact',
    followUs: 'Follow Us',
    allRightsReserved: 'All rights reserved',
    
    // Filtros y búsqueda
    filters: 'Filters',
    sortBy: 'Sort By',
    priceRange: 'Price Range',
    brands: 'Brands',
    noResults: 'No results found',
    searchResults: 'Search Results',
    searchPlaceholder: 'Search products...',
    searchCancel: 'Cancel',
    searchDescription: 'Find what you need by typing the product name, brand, or category.',
    searchNoResultsTitle: 'No results',
    searchNoResultsText: 'No products found matching',
    searchNoResultsTip: 'Try using more general terms or check your spelling.',
    searchResultsCount: 'Results',
    
    // Botones y acciones
    exploreProducts: 'Explore products',
    viewCategories: 'View categories',
    addProducts: 'Add products to start your purchase.',
    
    // Footer
    navigation: 'Navigation',
    information: 'Information',
    subscribe: 'Subscribe',
    
    // Ordenamiento y vista
    sortOrder: 'Sort',
    viewType: 'View',
    
    // Footer adicional
    privacyPolicy: 'Privacy Policy',
    termsConditions: 'Terms and Conditions',
    shippingReturns: 'Shipping and Returns',
    poweredBy: 'Powered by'
  },
  
  pt: {
    // Navegação
    categories: 'Categorias',
    home: 'Início',
    catalog: 'Catálogo',
    search: 'Buscar',
    
    // Carrinho
    cart: 'Carrinho de compras',
    addToCart: 'Adicionar ao carrinho',
    viewCart: 'Ver carrinho',
    cartEmpty: 'Seu carrinho está vazio',
    total: 'Total',
    checkout: 'Finalizar compra',
    quantity: 'Quantidade',
    
    // Produtos
    products: 'Produtos',
    viewProduct: 'Ver produto',
    outOfStock: 'Esgotado',
    inStock: 'Disponível',
    price: 'Preço',
    description: 'Descrição',
    
    // Categorias
    allCategories: 'Todas as categorias',
    viewCategory: 'Ver categoria',
    subcategories: 'Subcategorias',
    
    // Gerais
    loading: 'Carregando...',
    viewMore: 'Ver mais',
    viewAll: 'Ver todos',
    back: 'Voltar',
    next: 'Próximo',
    previous: 'Anterior',
    close: 'Fechar',
    
    // Rodapé
    aboutUs: 'Sobre nós',
    contact: 'Contato',
    followUs: 'Siga-nos',
    allRightsReserved: 'Todos os direitos reservados',
    
    // Filtros e busca
    filters: 'Filtros',
    sortBy: 'Ordenar por',
    priceRange: 'Faixa de preço',
    brands: 'Marcas',
    noResults: 'Nenhum resultado encontrado',
    searchResults: 'Resultados da busca',
    searchPlaceholder: 'Buscar produtos...',
    searchCancel: 'Cancelar',
    searchDescription: 'Encontre o que você precisa digitando o nome do produto, marca ou categoria.',
    searchNoResultsTitle: 'Sem resultados',
    searchNoResultsText: 'Nenhum produto encontrado com',
    searchNoResultsTip: 'Tente usar termos mais gerais ou verifique a ortografia.',
    searchResultsCount: 'Resultados',
    
    // Botões e ações
    exploreProducts: 'Explorar produtos',
    viewCategories: 'Ver categorias',
    addProducts: 'Adicione produtos para começar sua compra.',
    
    // Rodapé
    navigation: 'Navegação',
    information: 'Informação',
    subscribe: 'Subscrever',
    
    // Ordenação e vista
    sortOrder: 'Ordenar',
    viewType: 'Vista',
    
    // Rodapé adicional
    privacyPolicy: 'Política de Privacidade',
    termsConditions: 'Termos e Condições',
    shippingReturns: 'Envios e Devoluções',
    poweredBy: 'Desenvolvido por'
  }
};

/**
 * Obtiene los textos de UI según el idioma configurado en la tienda
 * @param language Idioma de la tienda (es, en, pt)
 * @returns Objeto con todos los textos de UI
 */
export function getStoreTexts(language: StoreLanguage = 'es'): StoreTexts {
  return STORE_TEXTS[language] || STORE_TEXTS.es;
}

/**
 * Hook para usar textos de tienda en componentes cliente
 * @param language Idioma de la tienda
 * @returns Función para obtener textos individuales
 */
export function useStoreTexts(language: StoreLanguage = 'es') {
  const texts = getStoreTexts(language);
  
  return {
    texts,
    t: (key: keyof StoreTexts) => texts[key]
  };
}
