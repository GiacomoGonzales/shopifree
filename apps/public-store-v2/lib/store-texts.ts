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
  shippingCalculated: string;
  continueShopping: string;
  proceedToCheckout: string;
  checkout: string;
  
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
  findUs: string;
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
  viewCollections: string;
  viewBrands: string;
  addProducts: string;
  
  // Footer
  navigation: string;
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
  confirmOrder: string;
  sendViaWhatsApp: string;
  goToPayment: string;
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

  // Textos de modales de confirmación y carga
  sending: string;
  processingPayment: string;
  loadingMapMobile: string;
  zoneFound: string;

  // Textos del modal de confirmación de pedido
  processingOrder: string;
  processingOrderEllipsis: string;
  preparingEverything: string;
  orderSuccessful: string;
  thankYouPurchase: string;
  orderReceivedProcessing: string;
  backToStore: string;
  contactWhatsApp: string;
  downloadPDF: string;
  orderNumber: string;
  customerInformation: string;
  deliveryInformation: string;
  name: string;
  address: string;
  notes: string;
  whatsappNotConfigured: string;
  closeModal: string;

  // Métodos de pago
  paymentMethodCash: string;
  paymentMethodCard: string;
  paymentMethodTransfer: string;
  paymentMethodBankTransfer: string;
  paymentMethodYape: string;
  paymentMethodMercadopago: string;

  // Descripciones de métodos de pago
  paymentMethodCashDesc: string;
  paymentMethodCardDesc: string;
  paymentMethodTransferDesc: string;
  paymentMethodBankTransferDesc: string;
  paymentMethodYapeDesc: string;
  paymentMethodMercadopagoDesc: string;

  // Textos del modal de información de envío
  shippingZone: string;
  shippingCost: string;
  shippingTime: string;
  timeToCalculate: string;

  // Textos de dirección sugerida
  useThisAddress: string;
  keepMine: string;

  // ProductQuickView
  selectOptions: string;
  addingToCart: string;
  noImage: string;

  // ProductModifiers
  modifierRequired: string;
  modifierOptional: string;
  modifierSelectAtLeast: string;
  modifierSelectOptions: string;
  modifierSelectBetween: string;
  modifierSelectExactly: string;
  modifierUpTo: string;
  modifierOptions: string;
  modifierSelectOne: string;
  modifierDecreaseQuantity: string;
  modifierIncreaseQuantity: string;
  modifierOption: string; // singular
  modifierOptionsPlural: string; // plural
  and: string; // "y" / "and" / "e"
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
    shippingCalculated: 'Costo de envío calculado',
    continueShopping: 'Seguir comprando',
    proceedToCheckout: 'Proceder al checkout',
    checkout: 'Finalizar compra',
    
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
    findUs: 'Ubícanos',
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
    viewCollections: 'Ver colecciones',
    viewBrands: 'Ver marcas',
    addProducts: 'Agrega productos para comenzar tu compra.',
    
    // Footer
    navigation: 'Navegación',
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
    confirmOrder: 'Confirmar pedido',
    sendViaWhatsApp: 'Enviar por WhatsApp',
    goToPayment: 'Ir al pago',
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
    locationError: 'Ocurrió un error al obtener la ubicación. Por favor ingresa tu dirección manualmente.',

    // Textos de modales de confirmación y carga
    sending: 'Enviando...',
    processingPayment: 'Procesando pago...',
    loadingMapMobile: '🔄 Cargando mapa para móvil...',
    zoneFound: 'Zona Encontrada',

    // Textos del modal de confirmación de pedido
    processingOrder: 'Procesando tu pedido',
    processingOrderEllipsis: 'Procesando tu pedido...',
    preparingEverything: 'Estamos preparando todo para ti, esto solo tomará unos segundos',
    orderSuccessful: '¡Pedido realizado con éxito!',
    thankYouPurchase: '¡Gracias por tu compra!',
    orderReceivedProcessing: 'Tu pedido ha sido recibido y está siendo procesado',
    backToStore: 'Volver a la tienda',
    contactWhatsApp: 'Contactar por WhatsApp',
    downloadPDF: 'Descargar PDF',
    orderNumber: 'Número de pedido:',
    customerInformation: 'Información del cliente',
    deliveryInformation: 'Información de entrega',
    name: 'Nombre',
    address: 'Dirección',
    notes: 'Notas',
    whatsappNotConfigured: 'El número de WhatsApp no está configurado para esta tienda',
    closeModal: 'Cerrar modal',

    // Métodos de pago
    paymentMethodCash: 'Pago en efectivo',
    paymentMethodCard: 'Tarjeta al repartidor',
    paymentMethodTransfer: 'Transferencia',
    paymentMethodBankTransfer: 'Transferencia bancaria',
    paymentMethodYape: 'Pago con Yape',
    paymentMethodMercadopago: 'Pago Online con MercadoPago',

    // Descripciones de métodos de pago
    paymentMethodCashDesc: 'Efectivo contra entrega',
    paymentMethodCardDesc: 'POS móvil para tarjetas',
    paymentMethodTransferDesc: 'Transferencia móvil',
    paymentMethodBankTransferDesc: 'Transferencia directa a cuenta bancaria',
    paymentMethodYapeDesc: 'Transferencia móvil Yape',
    paymentMethodMercadopagoDesc: 'Paga seguro con tarjetas, Yape, PagoEfectivo y más',

    // Textos del modal de información de envío
    shippingZone: 'Zona',
    shippingCost: 'Costo',
    shippingTime: 'Tiempo',
    timeToCalculate: 'Tiempo por calcular',

    // Textos de dirección sugerida
    useThisAddress: 'Usar esta dirección',
    keepMine: 'Mantener la mía',

    // ProductQuickView
    selectOptions: 'Selecciona opciones',
    addingToCart: 'Agregando...',
    noImage: 'Sin imagen',

    // ProductModifiers
    modifierRequired: '*',
    modifierOptional: 'Opcional',
    modifierSelectAtLeast: 'Selecciona al menos',
    modifierSelectOptions: 'Selecciona las opciones que desees',
    modifierSelectBetween: 'Selecciona entre',
    modifierSelectExactly: 'Selecciona',
    modifierUpTo: 'Hasta',
    modifierOptions: 'opciones',
    modifierSelectOne: 'Selecciona una opción',
    modifierDecreaseQuantity: 'Disminuir cantidad',
    modifierIncreaseQuantity: 'Aumentar cantidad',
    modifierOption: 'opción',
    modifierOptionsPlural: 'opciones',
    and: 'y'
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
    shippingCalculated: 'Shipping cost calculated',
    continueShopping: 'Continue Shopping',
    proceedToCheckout: 'Proceed to Checkout',
    checkout: 'Checkout',
    
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
    findUs: 'Find Us',
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
    viewCollections: 'View collections',
    viewBrands: 'View brands',
    addProducts: 'Add products to start your purchase.',
    
    // Footer
    navigation: 'Navigation',
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
    confirmOrder: 'Confirm Order',
    sendViaWhatsApp: 'Send via WhatsApp',
    goToPayment: 'Go to Payment',
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
    locationError: 'An error occurred getting location. Please enter your address manually.',

    // Textos de modales de confirmación y carga
    sending: 'Sending...',
    processingPayment: 'Processing payment...',
    loadingMapMobile: '🔄 Loading mobile map...',
    zoneFound: 'Zone Found',

    // Textos del modal de confirmación de pedido
    processingOrder: 'Processing your order',
    processingOrderEllipsis: 'Processing your order...',
    preparingEverything: 'We are preparing everything for you, this will only take a few seconds',
    orderSuccessful: 'Order placed successfully!',
    thankYouPurchase: 'Thank you for your purchase!',
    orderReceivedProcessing: 'Your order has been received and is being processed',
    backToStore: 'Back to store',
    contactWhatsApp: 'Contact via WhatsApp',
    downloadPDF: 'Download PDF',
    orderNumber: 'Order number:',
    customerInformation: 'Customer information',
    deliveryInformation: 'Delivery information',
    name: 'Name',
    address: 'Address',
    notes: 'Notes',
    whatsappNotConfigured: 'WhatsApp number is not configured for this store',
    closeModal: 'Close modal',

    // Métodos de pago
    paymentMethodCash: 'Cash',
    paymentMethodCard: 'Card on delivery',
    paymentMethodTransfer: 'Transfer',
    paymentMethodBankTransfer: 'Bank transfer',
    paymentMethodYape: 'Yape',
    paymentMethodMercadopago: 'Online Payment with MercadoPago',

    // Descripciones de métodos de pago
    paymentMethodCashDesc: 'Cash on delivery',
    paymentMethodCardDesc: 'Mobile POS for cards',
    paymentMethodTransferDesc: 'Mobile transfer',
    paymentMethodBankTransferDesc: 'Direct bank account transfer',
    paymentMethodYapeDesc: 'Yape mobile transfer',
    paymentMethodMercadopagoDesc: 'Pay securely with cards, Yape, PagoEfectivo and more',

    // Textos del modal de información de envío
    shippingZone: 'Zone',
    shippingCost: 'Cost',
    shippingTime: 'Time',
    timeToCalculate: 'Time to calculate',

    // Textos de dirección sugerida
    useThisAddress: 'Use this address',
    keepMine: 'Keep mine',

    // ProductQuickView
    selectOptions: 'Select options',
    addingToCart: 'Adding...',
    noImage: 'No image',

    // ProductModifiers
    modifierRequired: '*',
    modifierOptional: 'Optional',
    modifierSelectAtLeast: 'Select at least',
    modifierSelectOptions: 'Select the options you want',
    modifierSelectBetween: 'Select between',
    modifierSelectExactly: 'Select',
    modifierUpTo: 'Up to',
    modifierOptions: 'options',
    modifierSelectOne: 'Select one option',
    modifierDecreaseQuantity: 'Decrease quantity',
    modifierIncreaseQuantity: 'Increase quantity',
    modifierOption: 'option',
    modifierOptionsPlural: 'options',
    and: 'and'
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
    shippingCalculated: 'Custo de envio calculado',
    continueShopping: 'Continuar comprando',
    proceedToCheckout: 'Proceder ao checkout',
    checkout: 'Finalizar compra',
    
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
    findUs: 'Encontre-nos',
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
    viewCollections: 'Ver coleções',
    viewBrands: 'Ver marcas',
    addProducts: 'Adicione produtos para começar sua compra.',
    
    // Rodapé
    navigation: 'Navegação',
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
    confirmOrder: 'Confirmar Pedido',
    sendViaWhatsApp: 'Enviar via WhatsApp',
    goToPayment: 'Ir para o Pagamento',
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
    locationError: 'Ocorreu um erro ao obter a localização. Digite seu endereço manualmente.',

    // Textos de modales de confirmación y carga
    sending: 'Enviando...',
    processingPayment: 'Processando pagamento...',
    loadingMapMobile: '🔄 Carregando mapa para celular...',
    zoneFound: 'Zona Encontrada',

    // Textos del modal de confirmación de pedido
    processingOrder: 'Processando seu pedido',
    processingOrderEllipsis: 'Processando seu pedido...',
    preparingEverything: 'Estamos preparando tudo para você, isso levará apenas alguns segundos',
    orderSuccessful: 'Pedido realizado com sucesso!',
    thankYouPurchase: 'Obrigado pela sua compra!',
    orderReceivedProcessing: 'Seu pedido foi recebido e está sendo processado',
    backToStore: 'Voltar à loja',
    contactWhatsApp: 'Contatar via WhatsApp',
    downloadPDF: 'Baixar PDF',
    orderNumber: 'Número do pedido:',
    customerInformation: 'Informações do cliente',
    deliveryInformation: 'Informações de entrega',
    name: 'Nome',
    address: 'Endereço',
    notes: 'Notas',
    whatsappNotConfigured: 'O número do WhatsApp não está configurado para esta loja',
    closeModal: 'Fechar modal',

    // Métodos de pago
    paymentMethodCash: 'Dinheiro',
    paymentMethodCard: 'Cartão na entrega',
    paymentMethodTransfer: 'Transferência',
    paymentMethodBankTransfer: 'Transferência bancária',
    paymentMethodYape: 'Yape',
    paymentMethodMercadopago: 'Pagamento Online com MercadoPago',

    // Descripciones de métodos de pago
    paymentMethodCashDesc: 'Dinheiro na entrega',
    paymentMethodCardDesc: 'POS móvel para cartões',
    paymentMethodTransferDesc: 'Transferência móvel',
    paymentMethodBankTransferDesc: 'Transferência direta para conta bancária',
    paymentMethodYapeDesc: 'Transferência móvel Yape',
    paymentMethodMercadopagoDesc: 'Pague com segurança com cartões, Yape, PagoEfectivo e mais',

    // Textos del modal de información de envío
    shippingZone: 'Zona',
    shippingCost: 'Custo',
    shippingTime: 'Tempo',
    timeToCalculate: 'Tempo a calcular',

    // Textos de dirección sugerida
    useThisAddress: 'Usar este endereço',
    keepMine: 'Manter o meu',

    // ProductQuickView
    selectOptions: 'Selecionar opções',
    addingToCart: 'Adicionando...',
    noImage: 'Sem imagem',

    // ProductModifiers
    modifierRequired: '*',
    modifierOptional: 'Opcional',
    modifierSelectAtLeast: 'Selecione pelo menos',
    modifierSelectOptions: 'Selecione as opções que desejar',
    modifierSelectBetween: 'Selecione entre',
    modifierSelectExactly: 'Selecione',
    modifierUpTo: 'Até',
    modifierOptions: 'opções',
    modifierSelectOne: 'Selecione uma opção',
    modifierDecreaseQuantity: 'Diminuir quantidade',
    modifierIncreaseQuantity: 'Aumentar quantidade',
    modifierOption: 'opção',
    modifierOptionsPlural: 'opções',
    and: 'e'
  }
};

/**
 * Mapea los códigos de métodos de pago a las claves de traducción
 */
export const PAYMENT_METHOD_KEYS = {
  cash: 'paymentMethodCash',
  card: 'paymentMethodCard',
  transfer: 'paymentMethodTransfer',
  bank_transfer: 'paymentMethodBankTransfer',
  yape: 'paymentMethodYape',
  mercadopago: 'paymentMethodMercadopago',
  // Variaciones que pueden aparecer
  efectivo: 'paymentMethodCash',
  tarjeta: 'paymentMethodCard',
  transferencia_bancaria: 'paymentMethodBankTransfer'
} as const;

export const PAYMENT_METHOD_DESC_KEYS = {
  cash: 'paymentMethodCashDesc',
  card: 'paymentMethodCardDesc',
  transfer: 'paymentMethodTransferDesc',
  bank_transfer: 'paymentMethodBankTransferDesc',
  yape: 'paymentMethodYapeDesc',
  mercadopago: 'paymentMethodMercadopagoDesc',
  // Variaciones que pueden aparecer
  efectivo: 'paymentMethodCashDesc',
  tarjeta: 'paymentMethodCardDesc',
  transferencia_bancaria: 'paymentMethodBankTransferDesc'
} as const;

/**
 * Obtiene el nombre traducido de un método de pago
 */
export function getPaymentMethodName(paymentCode: string, texts: StoreTexts): string {
  const key = PAYMENT_METHOD_KEYS[paymentCode as keyof typeof PAYMENT_METHOD_KEYS];
  if (key && texts[key as keyof StoreTexts]) {
    return texts[key as keyof StoreTexts] as string;
  }
  // Fallback: capitalizar el código
  return paymentCode.charAt(0).toUpperCase() + paymentCode.slice(1);
}

/**
 * Obtiene la descripción traducida de un método de pago
 */
export function getPaymentMethodDescription(paymentCode: string, texts: StoreTexts): string {
  const key = PAYMENT_METHOD_DESC_KEYS[paymentCode as keyof typeof PAYMENT_METHOD_DESC_KEYS];
  if (key && texts[key as keyof StoreTexts]) {
    return texts[key as keyof StoreTexts] as string;
  }
  // Fallback: descripción genérica
  return texts.paymentMethod || 'Payment method';
}

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
