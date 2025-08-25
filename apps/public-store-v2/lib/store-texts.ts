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
  shoppingCart: string;
  addToCart: string;
  viewCart: string;
  cartEmpty: string;
  total: string;
  subtotal: string;
  subtotalProducts: string; // "Subtotal (N productos)"
  shippingCalculated: string; // "Los gastos de envío se calcularán en el checkout"
  continueShopping: string;
  proceedToCheckout: string;
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
  
  // Checkout
  contactInformation: string;
  fullName: string;
  fullNamePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  phone: string;
  phonePlaceholder: string;
  shippingMethod: string;
  pickupInStore: string;
  availableToday: string;
  homeDelivery: string;
  expressShipping: string;
  shippingAddress: string;
  shippingAddressPlaceholder: string;
  getMyLocation: string;
  searchAddress: string;
  suggestedAddress: string;
  dragMarker: string;
  loadingMap: string;
  checkConnection: string;
  mapLoadError: string;
  verifyConnection: string;
  paymentMethod: string;
  choosePayment: string;
  cashPayment: string;
  cashOnDelivery: string;
  bankTransfer: string;
  whatsappData: string;
  closeCheckout: string;
  
  // Checkout adicional
  information: string;
  shipping: string;
  payment: string;
  orderSummary: string;
  quantity: string;
  yourLocation: string;
  useMyLocation: string;
  previous: string;
  next: string;
  confirmOrder: string;
  discount: string;
  discountCode: string;
  discountPlaceholder: string;
  apply: string;
  additionalNotes: string;
  notesPlaceholder: string;
  creditCard: string;
  visaMastercard: string;
  businessDays3to5: string;
  businessDays1to2: string;
  
  // Textos adicionales del checkout
  getting: string;
  validating: string;
  validatingShort: string; // Versión corta para móviles
  processing: string;
  suggestedAddressLabel: string;
  free: string;
  provideLocation: string;
  enterCouponCode: string;
  invalidCouponCode: string;
  
  // Mensajes de error de ubicación
  locationPermissionDenied: string;
  locationUnavailable: string;
  locationTimeout: string;
  locationError: string;
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
    shoppingCart: 'Carrito de compras',
    addToCart: 'Agregar al carrito',
    viewCart: 'Ver carrito',
    cartEmpty: 'Tu carrito está vacío',
    total: 'Total',
    subtotal: 'Subtotal',
    subtotalProducts: 'Subtotal ({count} producto{plural})',
    shippingCalculated: 'Los gastos de envío se calcularán en el checkout',
    continueShopping: 'Seguir comprando',
    proceedToCheckout: 'Proceder al checkout',
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
    poweredBy: 'Desarrollado por',
    
    // Checkout
    contactInformation: 'Información de contacto',
    fullName: 'Nombre completo',
    fullNamePlaceholder: 'Juan García López',
    email: 'Email',
    emailPlaceholder: 'tu@email.com',
    phone: 'Teléfono',
    phonePlaceholder: '+99 999 999 999',
    shippingMethod: 'Método de envío',
    pickupInStore: 'Recojo en tienda',
    availableToday: 'Disponible hoy',
    homeDelivery: 'Envío a domicilio',
    expressShipping: 'Envío Express',
    shippingAddress: 'Dirección de envío',
    shippingAddressPlaceholder: 'Escribe tu dirección completa...',
    getMyLocation: 'Obtener mi ubicación actual',
    searchAddress: 'Buscar dirección',
    suggestedAddress: 'Dirección sugerida:',
    dragMarker: 'Arrastra el marcador para ajustar tu ubicación exacta',
    loadingMap: 'Cargando mapa...',
    checkConnection: 'Si no aparece, verifica tu conexión',
    mapLoadError: 'No se pudo cargar el mapa',
    verifyConnection: 'Verifica tu conexión a internet',
    paymentMethod: 'Método de pago',
    choosePayment: 'Elige cómo quieres pagar',
    cashPayment: 'Pago en efectivo',
    cashOnDelivery: 'Contraentrega',
    bankTransfer: 'Transferencia bancaria',
    whatsappData: 'Envío datos por WhatsApp',
    closeCheckout: 'Cerrar checkout',
    
    // Checkout adicional
    information: 'Información',
    shipping: 'Envío',
    payment: 'Pago',
    orderSummary: 'Resumen del pedido',
    quantity: 'Cantidad:',
    yourLocation: 'Tu ubicación',
    useMyLocation: 'Usar mi ubicación',
    previous: 'Anterior',
    next: 'Siguiente',
    confirmOrder: 'Confirmar pedido',
    discount: 'Descuento',
    discountCode: 'Código de descuento',
    discountPlaceholder: 'Código de descuento',
    apply: 'Aplicar',
    additionalNotes: 'Notas adicionales (opcional)',
    notesPlaceholder: 'Instrucciones especiales, horario de entrega, etc.',
    creditCard: 'Tarjeta de crédito',
    visaMastercard: 'Visa, Mastercard',
    businessDays3to5: '3-5 días hábiles',
    businessDays1to2: '1-2 días hábiles',
    
    // Textos adicionales del checkout
    getting: 'Obteniendo...',
    validating: 'Validando...',
    validatingShort: '...',
    processing: 'Procesando...',
    suggestedAddressLabel: 'Dirección sugerida:',
    free: 'Gratis',
    provideLocation: 'Proporciona tu ubicación',
    enterCouponCode: 'Ingresa un código de cupón',
    invalidCouponCode: 'Código de cupón no válido',
    
    // Mensajes de error de ubicación
    locationPermissionDenied: 'Debes permitir el acceso a la ubicación para usar esta función. Revisa la configuración de tu navegador.',
    locationUnavailable: 'La información de ubicación no está disponible. Por favor ingresa tu dirección manualmente.',
    locationTimeout: 'Se agotó el tiempo para obtener la ubicación. Intenta de nuevo o ingresa tu dirección manualmente.',
    locationError: 'Ocurrió un error al obtener la ubicación. Por favor ingresa tu dirección manualmente.'
  },
  
  en: {
    // Navegación
    categories: 'Categories',
    home: 'Home',
    catalog: 'Catalog',
    search: 'Search',
    
    // Carrito
    cart: 'Shopping Cart',
    shoppingCart: 'Shopping Cart',
    addToCart: 'Add to Cart',
    viewCart: 'View Cart',
    cartEmpty: 'Your cart is empty',
    total: 'Total',
    subtotal: 'Subtotal',
    subtotalProducts: 'Subtotal ({count} item{plural})',
    shippingCalculated: 'Shipping costs will be calculated at checkout',
    continueShopping: 'Continue Shopping',
    proceedToCheckout: 'Proceed to Checkout',
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
    poweredBy: 'Powered by',
    
    // Checkout
    contactInformation: 'Contact Information',
    fullName: 'Full Name',
    fullNamePlaceholder: 'John Smith',
    email: 'Email',
    emailPlaceholder: 'your@email.com',
    phone: 'Phone',
    phonePlaceholder: '+1 999 999 999',
    shippingMethod: 'Shipping Method',
    pickupInStore: 'Store Pickup',
    availableToday: 'Available today',
    homeDelivery: 'Home Delivery',
    expressShipping: 'Express Shipping',
    shippingAddress: 'Shipping Address',
    shippingAddressPlaceholder: 'Enter your full address...',
    getMyLocation: 'Get my current location',
    searchAddress: 'Search address',
    suggestedAddress: 'Suggested address:',
    dragMarker: 'Drag the marker to adjust your exact location',
    loadingMap: 'Loading map...',
    checkConnection: 'If it doesn\'t appear, check your connection',
    mapLoadError: 'Could not load map',
    verifyConnection: 'Check your internet connection',
    paymentMethod: 'Payment Method',
    choosePayment: 'Choose how you want to pay',
    cashPayment: 'Cash Payment',
    cashOnDelivery: 'Cash on delivery',
    bankTransfer: 'Bank Transfer',
    whatsappData: 'Send data via WhatsApp',
    closeCheckout: 'Close checkout',
    
    // Checkout adicional
    information: 'Information',
    shipping: 'Shipping',
    payment: 'Payment',
    orderSummary: 'Order Summary',
    quantity: 'Quantity:',
    yourLocation: 'Your location',
    useMyLocation: 'Use my location',
    previous: 'Previous',
    next: 'Next',
    confirmOrder: 'Confirm Order',
    discount: 'Discount',
    discountCode: 'Discount Code',
    discountPlaceholder: 'Discount code',
    apply: 'Apply',
    additionalNotes: 'Additional notes (optional)',
    notesPlaceholder: 'Special instructions, delivery time, etc.',
    creditCard: 'Credit Card',
    visaMastercard: 'Visa, Mastercard',
    businessDays3to5: '3-5 business days',
    businessDays1to2: '1-2 business days',
    
    // Textos adicionales del checkout
    getting: 'Getting...',
    validating: 'Validating...',
    validatingShort: '...',
    processing: 'Processing...',
    suggestedAddressLabel: 'Suggested address:',
    free: 'Free',
    provideLocation: 'Provide your location',
    enterCouponCode: 'Enter a coupon code',
    invalidCouponCode: 'Invalid coupon code',
    
    // Mensajes de error de ubicación
    locationPermissionDenied: 'You must allow location access to use this feature. Check your browser settings.',
    locationUnavailable: 'Location information is not available. Please enter your address manually.',
    locationTimeout: 'Timeout getting location. Try again or enter your address manually.',
    locationError: 'An error occurred getting location. Please enter your address manually.'
  },
  
  pt: {
    // Navegação
    categories: 'Categorias',
    home: 'Início',
    catalog: 'Catálogo',
    search: 'Buscar',
    
    // Carrinho
    cart: 'Carrinho de compras',
    shoppingCart: 'Carrinho de compras',
    addToCart: 'Adicionar ao carrinho',
    viewCart: 'Ver carrinho',
    cartEmpty: 'Seu carrinho está vazio',
    total: 'Total',
    subtotal: 'Subtotal',
    subtotalProducts: 'Subtotal ({count} produto{plural})',
    shippingCalculated: 'Os custos de envio serão calculados no checkout',
    continueShopping: 'Continuar comprando',
    proceedToCheckout: 'Proceder ao checkout',
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
    poweredBy: 'Desenvolvido por',
    
    // Checkout
    contactInformation: 'Informações de contato',
    fullName: 'Nome completo',
    fullNamePlaceholder: 'João Silva Santos',
    email: 'Email',
    emailPlaceholder: 'seu@email.com',
    phone: 'Telefone',
    phonePlaceholder: '+55 999 999 999',
    shippingMethod: 'Método de envio',
    pickupInStore: 'Retirada na loja',
    availableToday: 'Disponível hoje',
    homeDelivery: 'Entrega em casa',
    expressShipping: 'Envio Expresso',
    shippingAddress: 'Endereço de entrega',
    shippingAddressPlaceholder: 'Digite seu endereço completo...',
    getMyLocation: 'Obter minha localização atual',
    searchAddress: 'Buscar endereço',
    suggestedAddress: 'Endereço sugerido:',
    dragMarker: 'Arraste o marcador para ajustar sua localização exata',
    loadingMap: 'Carregando mapa...',
    checkConnection: 'Se não aparecer, verifique sua conexão',
    mapLoadError: 'Não foi possível carregar o mapa',
    verifyConnection: 'Verifique sua conexão com a internet',
    paymentMethod: 'Método de pagamento',
    choosePayment: 'Escolha como quer pagar',
    cashPayment: 'Pagamento em dinheiro',
    cashOnDelivery: 'Pagamento na entrega',
    bankTransfer: 'Transferência bancária',
    whatsappData: 'Enviar dados via WhatsApp',
    closeCheckout: 'Fechar checkout',
    
    // Checkout adicional
    information: 'Informação',
    shipping: 'Envio',
    payment: 'Pagamento',
    orderSummary: 'Resumo do pedido',
    quantity: 'Quantidade:',
    yourLocation: 'Sua localização',
    useMyLocation: 'Usar minha localização',
    previous: 'Anterior',
    next: 'Próximo',
    confirmOrder: 'Confirmar Pedido',
    discount: 'Desconto',
    discountCode: 'Código de Desconto',
    discountPlaceholder: 'Código de desconto',
    apply: 'Aplicar',
    additionalNotes: 'Notas adicionais (opcional)',
    notesPlaceholder: 'Instruções especiais, horário de entrega, etc.',
    creditCard: 'Cartão de Crédito',
    visaMastercard: 'Visa, Mastercard',
    businessDays3to5: '3-5 dias úteis',
    businessDays1to2: '1-2 dias úteis',
    
    // Textos adicionales del checkout
    getting: 'Obtendo...',
    validating: 'Validando...',
    validatingShort: '...',
    processing: 'Processando...',
    suggestedAddressLabel: 'Endereço sugerido:',
    free: 'Grátis',
    provideLocation: 'Forneça sua localização',
    enterCouponCode: 'Digite um código de cupom',
    invalidCouponCode: 'Código de cupom inválido',
    
    // Mensajes de error de ubicación
    locationPermissionDenied: 'Você deve permitir acesso à localização para usar esta função. Verifique as configurações do seu navegador.',
    locationUnavailable: 'As informações de localização não estão disponíveis. Digite seu endereço manualmente.',
    locationTimeout: 'Tempo limite para obter localização. Tente novamente ou digite seu endereço manualmente.',
    locationError: 'Ocorreu um erro ao obter a localização. Digite seu endereço manualmente.'
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
    t: (key: keyof StoreTexts) => texts[key],
    formatSubtotalProducts: (count: number) => {
      const plural = count === 1 ? '' : 's';
      return texts.subtotalProducts.replace('{count}', count.toString()).replace('{plural}', plural);
    }
  };
}

/**
 * Función helper para formatear texto de subtotal con productos
 * @param count Número de productos
 * @param language Idioma de la tienda
 * @returns Texto formateado
 */
export function formatSubtotalProducts(count: number, language: StoreLanguage = 'es'): string {
  const texts = getStoreTexts(language);
  
  // Plurales según el idioma
  let plural = '';
  if (language === 'es') {
    plural = count === 1 ? '' : 's';
  } else if (language === 'en') {
    plural = count === 1 ? '' : 's';
  } else if (language === 'pt') {
    plural = count === 1 ? '' : 's';
  }
  
  return texts.subtotalProducts
    .replace('{count}', count.toString())
    .replace('{plural}', plural);
}
