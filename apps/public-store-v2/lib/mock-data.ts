// Mock data para desarrollo local de TiendaVerde

export const mockStoreData = {
  storeId: 'mock-tiendaverde',
  subdomain: 'tiendaverde',
  storeName: 'TiendaVerde',
  title: 'TiendaVerde - Productos Naturales | Shopifree',
  description: 'Descubre los mejores productos naturales y orgánicos en TiendaVerde. Alimentación saludable, cosmética natural y más.',
  logo: '/logo-primary.svg',
  seo: {
    title: 'TiendaVerde - Productos Naturales',
    description: 'Los mejores productos naturales y orgánicos',
    language: 'es',
    keywords: 'productos naturales, orgánicos, alimentación saludable',
    googleSearchConsole: 'mock-verification-token'
  },
  language: 'es',
  colors: {
    primary: '#22c55e',
    secondary: '#16a34a',
    accent: '#15803d'
  }
};

export const mockCategories = [
  {
    id: 'alimentacion',
    name: 'Alimentación',
    slug: 'alimentacion',
    description: 'Productos alimenticios naturales y orgánicos',
    image: '/images/categories/alimentacion.jpg',
    parentCategoryId: null,
    subcategories: [
      {
        id: 'frutas-verduras',
        name: 'Frutas y Verduras',
        slug: 'frutas-verduras',
        parentCategoryId: 'alimentacion'
      },
      {
        id: 'cereales-granos',
        name: 'Cereales y Granos',
        slug: 'cereales-granos', 
        parentCategoryId: 'alimentacion'
      }
    ]
  },
  {
    id: 'cosmetica',
    name: 'Cosmética Natural',
    slug: 'cosmetica',
    description: 'Productos de belleza y cuidado personal naturales',
    image: '/images/categories/cosmetica.jpg',
    parentCategoryId: null,
    subcategories: []
  },
  {
    id: 'suplementos',
    name: 'Suplementos',
    slug: 'suplementos',
    description: 'Vitaminas y suplementos naturales',
    image: '/images/categories/suplementos.jpg',
    parentCategoryId: null,
    subcategories: []
  }
];

export const mockProducts = [
  {
    id: 'quinoa-organica',
    name: 'Quinoa Orgánica Premium',
    slug: 'quinoa-organica',
    description: 'Quinoa 100% orgánica, rica en proteínas y sin gluten. Perfecta para una alimentación saludable.',
    price: 12.99,
    images: ['/images/products/quinoa.jpg'],
    category: 'alimentacion',
    subcategory: 'cereales-granos',
    stock: 50,
    featured: true
  },
  {
    id: 'miel-cruda',
    name: 'Miel Cruda de Montaña',
    slug: 'miel-cruda',
    description: 'Miel pura sin procesar, directamente de colmenas de montaña. Sabor intenso y propiedades naturales.',
    price: 8.50,
    images: ['/images/products/miel.jpg'],
    category: 'alimentacion',
    stock: 25,
    featured: true
  },
  {
    id: 'jabon-avena',
    name: 'Jabón Natural de Avena',
    slug: 'jabon-avena',
    description: 'Jabón artesanal elaborado con avena y aceites esenciales. Ideal para pieles sensibles.',
    price: 4.99,
    images: ['/images/products/jabon-avena.jpg'],
    category: 'cosmetica',
    stock: 30,
    featured: false
  },
  {
    id: 'vitamina-c',
    name: 'Vitamina C Natural',
    slug: 'vitamina-c',
    description: 'Suplemento de vitamina C extraída de acerola. Refuerza el sistema inmunológico.',
    price: 15.99,
    images: ['/images/products/vitamina-c.jpg'],
    category: 'suplementos',
    stock: 40,
    featured: true
  }
];

// Función helper para obtener datos mock según el contexto
export function getMockStoreData(subdomain: string) {
  if (subdomain === 'tiendaverde') {
    return mockStoreData;
  }
  
  if (subdomain === 'tiendaenglish') {
    return {
      ...mockStoreData,
      storeId: 'mock-english-store',
      subdomain: 'tiendaenglish',
      storeName: 'GreenShop',
      title: 'GreenShop - Natural Products | Shopifree',
      description: 'Discover the best natural and organic products at GreenShop. Healthy food, natural cosmetics and more.',
      seo: {
        title: 'GreenShop - Natural Products',
        description: 'The best natural and organic products',
        language: 'en',
        keywords: 'natural products,organic,healthy food',
        googleSearchConsole: 'mock-verification-token-en'
      },
      language: 'en'
    };
  }
  
  // Default fallback
  return {
    ...mockStoreData,
    subdomain,
    storeName: `Tienda ${subdomain}`,
    title: `${subdomain} | Shopifree`
  };
}

export function getMockCategories() {
  return mockCategories;
}

export function getMockProducts() {
  return mockProducts;
}

export function getMockProductBySlug(slug: string) {
  return mockProducts.find(p => p.slug === slug);
}

export function getMockCategoryBySlug(slug: string) {
  return mockCategories.find(c => c.slug === slug);
}
