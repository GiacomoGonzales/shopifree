// Sistema simplificado de categorización
// Reducido de 6598 líneas a ~200 líneas

// Interfaces
interface MetaField {
  id: string
  name: string
  type: 'text' | 'select' | 'tags'
  options?: string[]
  value?: string | string[]
}

interface CategoryNode {
  id: string
  name: string
  children?: CategoryNode[]
  isLeaf?: boolean
}

// ===============================================
// 1. CATEGORÍAS PRINCIPALES SIMPLIFICADAS (2 NIVELES MÁXIMO)
// ===============================================

export const SIMPLIFIED_CATEGORIES: CategoryNode[] = [
  {
    id: 'ropa-y-accesorios',
    name: 'Ropa y Accesorios',
    isLeaf: true,
    children: [
      { id: 'ropa-mujer', name: 'Ropa para Mujer', isLeaf: true },
      { id: 'ropa-hombre', name: 'Ropa para Hombre', isLeaf: true },
      { id: 'ropa-niños', name: 'Ropa para Niños', isLeaf: true },
      { id: 'ropa-deportiva', name: 'Ropa Deportiva', isLeaf: true },
      { id: 'calzado', name: 'Calzado', isLeaf: true },
      { id: 'accesorios-moda', name: 'Accesorios de Moda', isLeaf: true },
      { id: 'joyeria', name: 'Joyería y Relojes', isLeaf: true },
      { id: 'bolsos-carteras', name: 'Bolsos y Carteras', isLeaf: true }
    ]
  },
  {
    id: 'productos-mascotas',
    name: 'Productos para Mascotas',
    isLeaf: true,
    children: [
      { id: 'alimento-mascotas', name: 'Alimentos para Mascotas', isLeaf: true },
      { id: 'accesorios-perros', name: 'Accesorios para Perros', isLeaf: true },
      { id: 'accesorios-gatos', name: 'Accesorios para Gatos', isLeaf: true },
      { id: 'juguetes-mascotas', name: 'Juguetes para Mascotas', isLeaf: true },
      { id: 'cuidado-higiene-mascotas', name: 'Cuidado e Higiene', isLeaf: true },
      { id: 'casas-camas-mascotas', name: 'Casas y Camas', isLeaf: true },
      { id: 'transportadores', name: 'Transportadores y Jaulas', isLeaf: true }
    ]
  },
  {
    id: 'tecnologia',
    name: 'Tecnología',
    isLeaf: true,
    children: [
      { id: 'celulares-tablets', name: 'Celulares y Tablets', isLeaf: true },
      { id: 'computadoras', name: 'Computadoras y Laptops', isLeaf: true },
      { id: 'accesorios-tecnologia', name: 'Accesorios Tecnológicos', isLeaf: true },
      { id: 'audio-video', name: 'Audio y Video', isLeaf: true },
      { id: 'gaming', name: 'Gaming', isLeaf: true },
      { id: 'smart-home', name: 'Casa Inteligente', isLeaf: true }
    ]
  },
  {
    id: 'hogar-decoracion',
    name: 'Hogar y Decoración',
    isLeaf: true,
    children: [
      { id: 'muebles', name: 'Muebles', isLeaf: true },
      { id: 'decoracion', name: 'Decoración', isLeaf: true },
      { id: 'textiles-hogar', name: 'Textiles para el Hogar', isLeaf: true },
      { id: 'cocina-comedor', name: 'Cocina y Comedor', isLeaf: true },
      { id: 'baño', name: 'Baño', isLeaf: true },
      { id: 'jardin-exterior', name: 'Jardín y Exterior', isLeaf: true },
      { id: 'herramientas-mejoras', name: 'Herramientas y Mejoras', isLeaf: true }
    ]
  },
  {
    id: 'salud-belleza',
    name: 'Salud y Belleza',
    isLeaf: true,
    children: [
      { id: 'cuidado-piel', name: 'Cuidado de la Piel', isLeaf: true },
      { id: 'maquillaje', name: 'Maquillaje', isLeaf: true },
      { id: 'cuidado-cabello', name: 'Cuidado del Cabello', isLeaf: true },
      { id: 'fragancias', name: 'Fragancias', isLeaf: true },
      { id: 'cuidado-personal', name: 'Cuidado Personal', isLeaf: true },
      { id: 'suplementos', name: 'Suplementos y Vitaminas', isLeaf: true }
    ]
  },
  {
    id: 'deportes-fitness',
    name: 'Deportes y Fitness',
    isLeaf: true,
    children: [
      { id: 'fitness-gym', name: 'Fitness y Gym', isLeaf: true },
      { id: 'deportes-acuaticos', name: 'Deportes Acuáticos', isLeaf: true },
      { id: 'deportes-aire-libre', name: 'Deportes al Aire Libre', isLeaf: true },
      { id: 'ciclismo', name: 'Ciclismo', isLeaf: true },
      { id: 'running', name: 'Running', isLeaf: true },
      { id: 'deportes-equipo', name: 'Deportes de Equipo', isLeaf: true }
    ]
  },
  {
    id: 'alimentos-bebidas',
    name: 'Alimentos y Bebidas',
    isLeaf: true,
    children: [
      { id: 'despensa', name: 'Despensa', isLeaf: true },
      { id: 'bebidas', name: 'Bebidas', isLeaf: true },
      { id: 'frescos', name: 'Productos Frescos', isLeaf: true },
      { id: 'gourmet', name: 'Gourmet y Especialidades', isLeaf: true },
      { id: 'organicos', name: 'Productos Orgánicos', isLeaf: true },
      { id: 'snacks-dulces', name: 'Snacks y Dulces', isLeaf: true }
    ]
  },
  {
    id: 'libros-educacion',
    name: 'Libros y Educación',
    isLeaf: true,
    children: [
      { id: 'libros-literatura', name: 'Libros y Literatura', isLeaf: true },
      { id: 'educacion-infantil', name: 'Educación Infantil', isLeaf: true },
      { id: 'material-escolar', name: 'Material Escolar', isLeaf: true },
      { id: 'cursos-online', name: 'Cursos Online', isLeaf: true },
      { id: 'arte-manualidades', name: 'Arte y Manualidades', isLeaf: true }
    ]
  },
  {
    id: 'juguetes-niños',
    name: 'Juguetes y Niños',
    isLeaf: true,
    children: [
      { id: 'juguetes-bebes', name: 'Juguetes para Bebés', isLeaf: true },
      { id: 'juguetes-niños-edad', name: 'Juguetes por Edad', isLeaf: true },
      { id: 'juegos-mesa', name: 'Juegos de Mesa', isLeaf: true },
      { id: 'muñecas-figuras', name: 'Muñecas y Figuras', isLeaf: true },
      { id: 'vehiculos-juguete', name: 'Vehículos de Juguete', isLeaf: true },
      { id: 'aire-libre-niños', name: 'Juguetes de Aire Libre', isLeaf: true }
    ]
  },
  {
    id: 'vehiculos-repuestos',
    name: 'Vehículos y Repuestos',
    isLeaf: true,
    children: [
      { id: 'accesorios-auto', name: 'Accesorios para Auto', isLeaf: true },
      { id: 'repuestos-auto', name: 'Repuestos para Auto', isLeaf: true },
      { id: 'motocicletas', name: 'Motocicletas y Accesorios', isLeaf: true },
      { id: 'herramientas-auto', name: 'Herramientas Automotrices', isLeaf: true }
    ]
  }
]

// ===============================================
// 2. METADATOS GLOBALES REUTILIZABLES
// ===============================================

export const GLOBAL_METADATA: Record<string, MetaField> = {
  // Comunes - Color
  'color': {
    id: 'color',
    name: 'Color',
    type: 'tags',
    options: [
      'Negro', 'Blanco', 'Gris', 'Azul', 'Verde', 'Rosa', 'Rojo', 
      'Marrón', 'Beige', 'Amarillo', 'Naranja', 'Morado', 'Multicolor'
    ]
  },

  // Tallas - Ropa
  'size_clothing': {
    id: 'size_clothing',
    name: 'Talla',
    type: 'tags',
    options: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'Talla única']
  },

  // Tallas - Calzado
  'size_shoes': {
    id: 'size_shoes',
    name: 'Talla de Calzado',
    type: 'tags',
    options: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45']
  },

  // Género
  'gender': {
    id: 'gender',
    name: 'Género',
    type: 'select',
    options: ['Mujer', 'Hombre', 'Unisex', 'Niño', 'Niña']
  },

  // Material
  'material': {
    id: 'material',
    name: 'Material Principal',
    type: 'select',
    options: [
      'Algodón', 'Poliéster', 'Lino', 'Seda', 'Lana', 'Cuero', 
      'Sintético', 'Mezclilla', 'Spandex', 'Nylon'
    ]
  },

  // Estilo de ropa
  'clothing_style': {
    id: 'clothing_style',
    name: 'Estilo',
    type: 'tags',
    options: [
      'Casual', 'Formal', 'Deportivo', 'Elegante', 'Vintage', 
      'Moderno', 'Bohemio', 'Clásico', 'Urbano'
    ]
  },

  // Temporada
  'season': {
    id: 'season',
    name: 'Temporada',
    type: 'select',
    options: ['Primavera', 'Verano', 'Otoño', 'Invierno', 'Todo el año']
  },

  // Ocasión
  'occasion': {
    id: 'occasion',
    name: 'Ocasión',
    type: 'tags',
    options: [
      'Diario', 'Trabajo', 'Fiesta', 'Boda', 'Playa', 'Viaje', 
      'Deporte', 'Casa', 'Noche'
    ]
  },

  // Mascotas - Tipo de animal
  'pet_type': {
    id: 'pet_type',
    name: 'Tipo de Mascota',
    type: 'select',
    options: ['Perro', 'Gato', 'Ave', 'Pez', 'Roedor', 'Reptil', 'Otro']
  },

  // Mascotas - Tamaño
  'pet_size': {
    id: 'pet_size',
    name: 'Tamaño de Mascota',
    type: 'select',
    options: ['Muy pequeño', 'Pequeño', 'Mediano', 'Grande', 'Muy grande']
  },

  // Mascotas - Edad
  'pet_age': {
    id: 'pet_age',
    name: 'Edad de Mascota',
    type: 'select',
    options: ['Cachorro/Bebé', 'Joven', 'Adulto', 'Senior', 'Todas las edades']
  },

  // Tecnología - Marca
  'tech_brand': {
    id: 'tech_brand',
    name: 'Marca',
    type: 'select',
    options: [
      'Apple', 'Samsung', 'Xiaomi', 'Huawei', 'Sony', 'LG', 
      'HP', 'Dell', 'Lenovo', 'Asus', 'Otra'
    ]
  },

  // Tecnología - Conectividad
  'connectivity': {
    id: 'connectivity',
    name: 'Conectividad',
    type: 'tags',
    options: [
      'WiFi', 'Bluetooth', 'USB', 'USB-C', 'Lightning', 
      '4G', '5G', 'NFC', 'Inalámbrico'
    ]
  },

  // Tecnología - Capacidad de almacenamiento
  'storage_capacity': {
    id: 'storage_capacity',
    name: 'Capacidad de Almacenamiento',
    type: 'select',
    options: [
      '32GB', '64GB', '128GB', '256GB', '512GB', '1TB', 
      '2TB', '4TB', '8TB', '16TB'
    ]
  },

  // Tecnología - Sistema operativo
  'operating_system': {
    id: 'operating_system',
    name: 'Sistema Operativo',
    type: 'select',
    options: [
      'Windows', 'macOS', 'Linux', 'Android', 'iOS', 
      'Chrome OS', 'watchOS', 'iPadOS', 'Otro'
    ]
  },

  // Tecnología - Tamaño de pantalla
  'screen_size': {
    id: 'screen_size',
    name: 'Tamaño de Pantalla',
    type: 'select',
    options: [
      '5_menos', '5_1_6', '6_1_7',
      '7_1_10', '10_1_13', '13_1_15',
      '15_1_17', '17_mas', 'sin_pantalla'
    ]
  },

  // Tecnología - Procesador/Chip
  'processor': {
    id: 'processor',
    name: 'Procesador',
    type: 'select',
    options: [
      'intel_i3', 'intel_i5', 'intel_i7', 'intel_i9',
      'amd_r3', 'amd_r5', 'amd_r7', 'amd_r9',
      'apple_m1', 'apple_m2', 'apple_m3', 'snapdragon', 'mediatek', 'otro'
    ]
  },

  // Tecnología - Memoria RAM
  'ram_memory': {
    id: 'ram_memory',
    name: 'Memoria RAM',
    type: 'select',
    options: [
      '2GB', '4GB', '6GB', '8GB', '12GB', '16GB', 
      '32GB', '64GB', '128GB'
    ]
  },

  // Tecnología - Tipo de dispositivo
  'device_type': {
    id: 'device_type',
    name: 'Tipo de Dispositivo',
    type: 'select',
    options: [
      'Smartphone', 'Tablet', 'Laptop', 'Desktop', 'Smartwatch', 
      'Auriculares', 'Altavoces', 'Consola', 'Accesorio', 'Smart TV',
      'Cámara', 'Drone', 'Router', 'Hub inteligente'
    ]
  }
}

// ===============================================
// 3. MAPEO DE CATEGORÍAS A METADATOS
// ===============================================

export const CATEGORY_METADATA_MAP: Record<string, string[]> = {
  // Ropa y Accesorios
  'ropa-y-accesorios': ['color', 'gender', 'season', 'material', 'clothing_style'],
  'ropa-mujer': ['color', 'size_clothing', 'material', 'clothing_style', 'season', 'occasion'],
  'ropa-hombre': ['color', 'size_clothing', 'material', 'clothing_style', 'season', 'occasion'],
  'ropa-niños': ['color', 'size_clothing', 'material', 'gender', 'season'],
  'ropa-deportiva': ['color', 'size_clothing', 'material', 'gender', 'clothing_style'],
  'calzado': ['color', 'size_shoes', 'material', 'gender', 'clothing_style', 'season'],
  'accesorios-moda': ['color', 'material', 'gender', 'occasion'],
  'joyeria': ['color', 'material', 'gender', 'occasion'],
  'bolsos-carteras': ['color', 'material', 'gender', 'occasion'],

  // Mascotas
  'productos-mascotas': ['pet_type', 'pet_size', 'color'],
  'alimento-mascotas': ['pet_type', 'pet_age', 'pet_size'],
  'accesorios-perros': ['pet_size', 'color', 'material'],
  'accesorios-gatos': ['pet_size', 'color', 'material'],
  'juguetes-mascotas': ['pet_type', 'pet_size', 'color', 'material'],
  'cuidado-higiene-mascotas': ['pet_type', 'pet_age'],
  'casas-camas-mascotas': ['pet_type', 'pet_size', 'color', 'material'],
  'transportadores': ['pet_type', 'pet_size', 'material'],

  // Tecnología
  'tecnologia': ['tech_brand', 'color', 'connectivity', 'device_type'],
  'celulares-tablets': ['tech_brand', 'color', 'connectivity', 'screen_size', 'storage_capacity', 'operating_system', 'ram_memory'],
  'computadoras': ['tech_brand', 'color', 'connectivity', 'screen_size', 'storage_capacity', 'operating_system', 'processor', 'ram_memory'],
  'accesorios-tecnologia': ['tech_brand', 'color', 'connectivity', 'device_type'],
  'audio-video': ['tech_brand', 'color', 'connectivity', 'device_type'],
  'gaming': ['tech_brand', 'color', 'connectivity', 'device_type', 'storage_capacity', 'processor', 'ram_memory'],
  'smart-home': ['tech_brand', 'color', 'connectivity', 'device_type'],

  // Otras categorías con metadatos básicos
  'hogar-decoracion': ['color', 'material'],
  'muebles': ['color', 'material'],
  'decoracion': ['color', 'material'],
  'textiles-hogar': ['color', 'material'],
  'cocina-comedor': ['color', 'material'],
  'baño': ['color', 'material'],
  'jardin-exterior': ['color', 'material'],

  'salud-belleza': ['gender'],
  'cuidado-piel': ['gender'],
  'maquillaje': ['color', 'gender'],
  'cuidado-cabello': ['gender'],
  'fragancias': ['gender'],

  'deportes-fitness': ['color', 'gender'],
  'fitness-gym': ['color', 'gender'],
  'deportes-acuaticos': ['color', 'gender'],
  'ciclismo': ['color', 'gender'],
  'running': ['color', 'gender'],

  // Categorías básicas sin metadatos específicos
  'alimentos-bebidas': [],
  'libros-educacion': [],
  'juguetes-niños': ['color', 'gender'],
  'vehiculos-repuestos': ['color']
}

// ===============================================
// 4. FUNCIÓN HELPER PARA OBTENER METADATOS
// ===============================================

export const getMetadataForCategory = (categoryId: string): MetaField[] => {
  const metadataIds = CATEGORY_METADATA_MAP[categoryId] || []
  return metadataIds.map(id => GLOBAL_METADATA[id]).filter(Boolean)
}

// ===============================================
// 5. FUNCIÓN HELPER PARA BUSCAR CATEGORÍAS
// ===============================================

export const findCategoryById = (categories: CategoryNode[], id: string): CategoryNode | null => {
  for (const category of categories) {
    if (category.id === id) return category
    if (category.children) {
      const found = findCategoryById(category.children, id)
      if (found) return found
    }
  }
  return null
}
