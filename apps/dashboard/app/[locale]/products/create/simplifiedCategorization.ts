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
      { id: 'suplementos', name: 'Suplementos y Vitaminas', isLeaf: true },
      { id: 'bienestar-salud', name: 'Bienestar y Salud', isLeaf: true }
    ]
  },
  {
    id: 'deportes-fitness',
    name: 'Deportes y Fitness',
    isLeaf: true,
    children: [
      { id: 'fitness-gym', name: 'Fitness y Gym', isLeaf: true },
      { id: 'running-atletismo', name: 'Running y Atletismo', isLeaf: true },
      { id: 'deportes-acuaticos', name: 'Deportes Acuáticos', isLeaf: true },
      { id: 'ciclismo', name: 'Ciclismo', isLeaf: true },
      { id: 'deportes-raqueta', name: 'Deportes de Raqueta', isLeaf: true },
      { id: 'deportes-equipo', name: 'Deportes de Equipo', isLeaf: true },
      { id: 'deportes-combate', name: 'Deportes de Combate', isLeaf: true },
      { id: 'yoga-pilates', name: 'Yoga y Pilates', isLeaf: true },
      { id: 'deportes-invierno', name: 'Deportes de Invierno', isLeaf: true },
      { id: 'deportes-extremos', name: 'Deportes Extremos', isLeaf: true },
      { id: 'golf', name: 'Golf', isLeaf: true },
      { id: 'escalada-montanismo', name: 'Escalada y Montañismo', isLeaf: true },
      { id: 'suplementos-deportivos', name: 'Suplementos Deportivos', isLeaf: true },
      { id: 'nutricion-deportiva', name: 'Nutrición Deportiva', isLeaf: true }
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
  },

  // ===================================================
  // METADATOS EXPANDIDOS PARA MASCOTAS
  // ===================================================

  // Tipo de alimento para mascotas
  'pet_food_type': {
    id: 'pet_food_type',
    name: 'Tipo de Alimento',
    type: 'select',
    options: ['Seco (croquetas)', 'Húmedo (latas)', 'Semi-húmedo', 'Treats/Premios', 'Suplementos', 'Natural/BARF']
  },

  // Fuente de proteína
  'pet_protein_source': {
    id: 'pet_protein_source',
    name: 'Fuente de Proteína',
    type: 'tags',
    options: ['Pollo', 'Res', 'Cordero', 'Pescado', 'Pavo', 'Cerdo', 'Conejo', 'Venado', 'Vegetariano']
  },

  // Dieta especial para mascotas
  'pet_special_diet': {
    id: 'pet_special_diet',
    name: 'Dieta Especial',
    type: 'tags',
    options: ['Hipoalergénico', 'Sin cereales', 'Control de peso', 'Digestión sensible', 'Piel y pelaje', 'Articulaciones', 'Orgánico', 'Senior', 'Cachorro']
  },

  // Tipo de juguete para mascotas
  'pet_toy_type': {
    id: 'pet_toy_type',
    name: 'Tipo de Juguete',
    type: 'select',
    options: ['Peluche', 'Cuerda', 'Pelota', 'Hueso masticable', 'Interactivo/Puzzle', 'Frisbee', 'Squeaky', 'Catnip', 'Ratón de juguete', 'Túnel']
  },

  // Material del juguete
  'pet_toy_material': {
    id: 'pet_toy_material',
    name: 'Material del Juguete',
    type: 'tags',
    options: ['Felpa', 'Caucho', 'Cuerda', 'Plástico', 'Nylon', 'Cuero', 'Madera natural', 'Látex', 'TPR']
  },

  // Durabilidad del juguete
  'pet_toy_durability': {
    id: 'pet_toy_durability',
    name: 'Durabilidad',
    type: 'select',
    options: ['Suave (masticadores ligeros)', 'Moderada', 'Resistente (masticadores fuertes)', 'Extra resistente', 'Indestructible']
  },

  // Tipo de accesorio para mascotas
  'pet_accessory_type': {
    id: 'pet_accessory_type',
    name: 'Tipo de Accesorio',
    type: 'select',
    options: ['Collar', 'Correa', 'Arnés', 'Cama', 'Transportadora', 'Platos de comida', 'Fuente de agua', 'Ropa', 'Identificación', 'Bozal']
  },

  // Tamaño específico de collar/arnés
  'pet_collar_size': {
    id: 'pet_collar_size',
    name: 'Talla de Collar/Arnés',
    type: 'select',
    options: ['XS (20-25cm)', 'S (25-35cm)', 'M (35-45cm)', 'L (45-55cm)', 'XL (55-65cm)', 'XXL (65cm+)', 'Ajustable']
  },

  // Características de seguridad
  'pet_safety_features': {
    id: 'pet_safety_features',
    name: 'Características de Seguridad',
    type: 'tags',
    options: ['Reflectivo', 'LED', 'Hebilla de seguridad', 'Resistente al agua', 'Anti-tirones', 'Acolchado', 'Transpirable']
  },

  // Tipo de cuidado e higiene
  'pet_grooming_type': {
    id: 'pet_grooming_type',
    name: 'Tipo de Cuidado',
    type: 'select',
    options: ['Champú', 'Acondicionador', 'Cepillo', 'Peine', 'Cortauñas', 'Limpieza dental', 'Toallitas', 'Desodorante', 'Perfume']
  },

  // Tipo de pelaje
  'pet_coat_type': {
    id: 'pet_coat_type',
    name: 'Tipo de Pelaje',
    type: 'select',
    options: ['Corto', 'Largo', 'Rizado', 'Doble capa', 'Sin pelo', 'Todos los tipos']
  },

  // ===================================================
  // METADATOS EXPANDIDOS PARA TECNOLOGÍA
  // ===================================================

  // Condición del producto
  'tech_condition': {
    id: 'tech_condition',
    name: 'Condición',
    type: 'select',
    options: ['Nuevo', 'Reacondicionado', 'Usado - Excelente', 'Usado - Bueno', 'Usado - Aceptable', 'Para repuestos']
  },

  // Garantía
  'tech_warranty': {
    id: 'tech_warranty',
    name: 'Garantía',
    type: 'select',
    options: ['Sin garantía', '6 meses', '1 año', '2 años', '3 años', 'Garantía extendida', 'De por vida']
  },

  // Tipo de cámara en dispositivos
  'camera_specs': {
    id: 'camera_specs',
    name: 'Especificaciones de Cámara',
    type: 'select',
    options: ['Básica (menos de 12MP)', 'Estándar (12-20MP)', 'Avanzada (21-50MP)', 'Profesional (51-100MP)', 'Ultra (más de 100MP)', 'Sin cámara']
  },

  // Duración de batería
  'battery_life': {
    id: 'battery_life',
    name: 'Duración de Batería',
    type: 'select',
    options: ['Menos de 5h', '5-8h', '8-12h', '12-16h', '16-24h', 'Más de 24h', 'No aplica (con cable)']
  },

  // Tipo de audio
  'audio_type': {
    id: 'audio_type',
    name: 'Tipo de Audio',
    type: 'select',
    options: ['In-ear', 'On-ear', 'Over-ear', 'True wireless', 'Bluetooth', 'Con cable', 'Altavoz portátil', 'Sistema de sonido']
  },

  // Cancelación de ruido
  'noise_cancellation': {
    id: 'noise_cancellation',
    name: 'Cancelación de Ruido',
    type: 'select',
    options: ['Activa (ANC)', 'Pasiva', 'Híbrida', 'No disponible']
  },

  // Resistencia al agua
  'water_resistance': {
    id: 'water_resistance',
    name: 'Resistencia al Agua',
    type: 'select',
    options: ['IPX4 (salpicaduras)', 'IPX5 (chorros)', 'IPX7 (inmersión)', 'IPX8 (sumergible)', 'No resistente']
  },

  // Tipo de gaming
  'gaming_platform': {
    id: 'gaming_platform',
    name: 'Plataforma de Gaming',
    type: 'select',
    options: ['PlayStation 5', 'Xbox Series X/S', 'Nintendo Switch', 'PC', 'Móvil', 'Retro', 'Multi-plataforma']
  },

  // Resolución de pantalla
  'screen_resolution': {
    id: 'screen_resolution',
    name: 'Resolución de Pantalla',
    type: 'select',
    options: ['HD (720p)', 'Full HD (1080p)', '2K (1440p)', '4K (Ultra HD)', '5K', '8K', 'Retina']
  },

  // ===================================================
  // METADATOS EXPANDIDOS PARA HOGAR
  // ===================================================

  // Habitación específica
  'home_room': {
    id: 'home_room',
    name: 'Habitación',
    type: 'select',
    options: ['Sala de estar', 'Dormitorio', 'Cocina', 'Comedor', 'Baño', 'Oficina', 'Jardín', 'Balcón', 'Entrada', 'Todas las habitaciones']
  },

  // Estilo decorativo
  'home_style': {
    id: 'home_style',
    name: 'Estilo Decorativo',
    type: 'tags',
    options: ['Moderno', 'Minimalista', 'Industrial', 'Bohemio', 'Escandinavo', 'Rústico', 'Clásico', 'Vintage', 'Contemporáneo', 'Mid-century']
  },

  // Tamaño de mueble
  'furniture_size': {
    id: 'furniture_size',
    name: 'Tamaño',
    type: 'select',
    options: ['Muy pequeño', 'Pequeño', 'Mediano', 'Grande', 'Extra grande', 'Personalizable']
  },

  // Tipo de mueble
  'furniture_type': {
    id: 'furniture_type',
    name: 'Tipo de Mueble',
    type: 'select',
    options: ['Sofá', 'Silla', 'Mesa', 'Cama', 'Estantería', 'Armario', 'Cómoda', 'Escritorio', 'Banco', 'Otomana', 'Aparador']
  },

  // Capacidad de asientos
  'seating_capacity': {
    id: 'seating_capacity',
    name: 'Capacidad de Asientos',
    type: 'select',
    options: ['1 persona', '2 personas', '3 personas', '4 personas', '5+ personas', 'No aplica']
  },

  // Características de muebles
  'furniture_features': {
    id: 'furniture_features',
    name: 'Características',
    type: 'tags',
    options: ['Reclinable', 'Convertible', 'Con almacenamiento', 'Plegable', 'Ajustable', 'Cojines removibles', 'Resistente a manchas', 'Ergonómico']
  },

  // Requiere ensamblaje
  'assembly_required': {
    id: 'assembly_required',
    name: 'Requiere Ensamblaje',
    type: 'select',
    options: ['No', 'Mínimo (menos de 30 min)', 'Sí (30-60 min)', 'Complejo (más de 60 min)', 'Instalación profesional']
  },

  // ===================================================
  // METADATOS EXPANDIDOS PARA SALUD Y BELLEZA
  // ===================================================

  // Tipo de producto de belleza
  'beauty_product_type': {
    id: 'beauty_product_type',
    name: 'Tipo de Producto',
    type: 'select',
    options: ['Limpiador', 'Hidratante', 'Sérum', 'Mascarilla', 'Protector solar', 'Maquillaje', 'Perfume', 'Champú', 'Acondicionador', 'Tratamiento']
  },

  // Tipo de piel
  'skin_type': {
    id: 'skin_type',
    name: 'Tipo de Piel',
    type: 'tags',
    options: ['Grasa', 'Seca', 'Mixta', 'Sensible', 'Normal', 'Madura', 'Con acné', 'Todas']
  },

  // Área de aplicación
  'application_area': {
    id: 'application_area',
    name: 'Área de Aplicación',
    type: 'tags',
    options: ['Rostro', 'Ojos', 'Labios', 'Cuerpo', 'Manos', 'Pies', 'Cabello', 'Cuero cabelludo', 'Uñas']
  },

  // Ingredientes destacados
  'key_ingredients': {
    id: 'key_ingredients',
    name: 'Ingredientes Destacados',
    type: 'tags',
    options: ['Ácido hialurónico', 'Vitamina C', 'Retinol', 'Niacinamida', 'Colágeno', 'Aloe vera', 'Aceite de argán', 'Ceramidas', 'Péptidos', 'Natural/Orgánico']
  },

  // Edad objetivo
  'target_age': {
    id: 'target_age',
    name: 'Edad Objetivo',
    type: 'select',
    options: ['Adolescente (13-19)', 'Joven adulto (20-29)', 'Adulto (30-39)', 'Maduro (40-49)', 'Senior (50+)', 'Todas las edades']
  },

  // ===================================================
  // METADATOS EXPANDIDOS PARA DEPORTES
  // ===================================================

  // Tipo de deporte
  'sport_type': {
    id: 'sport_type',
    name: 'Tipo de Deporte',
    type: 'tags',
    options: ['Running', 'Fitness', 'Yoga', 'Ciclismo', 'Natación', 'Fútbol', 'Básquetbol', 'Tenis', 'Golf', 'Boxeo', 'CrossFit', 'Escalada']
  },

  // Nivel de experiencia
  'experience_level': {
    id: 'experience_level',
    name: 'Nivel de Experiencia',
    type: 'select',
    options: ['Principiante', 'Intermedio', 'Avanzado', 'Profesional', 'Todos los niveles']
  },

  // Tipo de equipo deportivo
  'sports_equipment_type': {
    id: 'sports_equipment_type',
    name: 'Tipo de Equipo',
    type: 'select',
    options: ['Ropa deportiva', 'Calzado deportivo', 'Equipo de entrenamiento', 'Accesorios', 'Suplementos', 'Protección', 'Electrónicos fitness']
  },

  // Intensidad de actividad
  'activity_intensity': {
    id: 'activity_intensity',
    name: 'Intensidad de Actividad',
    type: 'select',
    options: ['Baja', 'Moderada', 'Alta', 'Muy alta', 'Variable']
  },

  // ===================================================
  // METADATOS EXPANDIDOS PARA ALIMENTOS
  // ===================================================

  // Tipo de alimento
  'food_type': {
    id: 'food_type',
    name: 'Tipo de Alimento',
    type: 'select',
    options: ['Fresco', 'Enlatado', 'Congelado', 'Deshidratado', 'Instantáneo', 'Gourmet', 'Orgánico', 'Vegano', 'Sin gluten']
  },

  // Categoría de alimento
  'food_category': {
    id: 'food_category',
    name: 'Categoría de Alimento',
    type: 'select',
    options: ['Carnes', 'Lácteos', 'Panadería', 'Frutas', 'Verduras', 'Granos', 'Condimentos', 'Snacks', 'Bebidas', 'Dulces']
  },

  // Dieta especial
  'dietary_restriction': {
    id: 'dietary_restriction',
    name: 'Restricción Dietética',
    type: 'tags',
    options: ['Vegano', 'Vegetariano', 'Sin gluten', 'Sin lactosa', 'Keto', 'Paleo', 'Sin azúcar', 'Bajo en sodio', 'Orgánico', 'Kosher', 'Halal']
  },

  // Fecha de caducidad
  'shelf_life': {
    id: 'shelf_life',
    name: 'Vida Útil',
    type: 'select',
    options: ['Menos de 1 semana', '1-2 semanas', '1-3 meses', '3-6 meses', '6-12 meses', 'Más de 1 año']
  },

  // ===================================================
  // METADATOS EXPANDIDOS PARA LIBROS Y EDUCACIÓN
  // ===================================================

  // Tipo de libro
  'book_type': {
    id: 'book_type',
    name: 'Tipo de Libro',
    type: 'select',
    options: ['Ficción', 'No ficción', 'Educativo', 'Infantil', 'Cómic', 'Manga', 'Biografía', 'Historia', 'Ciencia', 'Arte', 'Cocina', 'Autoayuda']
  },

  // Edad recomendada
  'recommended_age': {
    id: 'recommended_age',
    name: 'Edad Recomendada',
    type: 'select',
    options: ['0-2 años', '3-5 años', '6-8 años', '9-12 años', '13-17 años', '18+ años', 'Todas las edades']
  },

  // Idioma
  'language': {
    id: 'language',
    name: 'Idioma',
    type: 'select',
    options: ['Español', 'Inglés', 'Francés', 'Alemán', 'Italiano', 'Portugués', 'Chino', 'Japonés', 'Bilingüe', 'Multiidioma']
  },

  // Formato del libro
  'book_format': {
    id: 'book_format',
    name: 'Formato',
    type: 'select',
    options: ['Tapa dura', 'Tapa blanda', 'eBook', 'Audiolibro', 'Revista', 'Cuaderno', 'Agenda']
  },

  // ===================================================
  // METADATOS EXPANDIDOS PARA JUGUETES
  // ===================================================

  // Tipo de juguete
  'toy_type': {
    id: 'toy_type',
    name: 'Tipo de Juguete',
    type: 'select',
    options: ['Educativo', 'Construcción', 'Muñecas', 'Vehículos', 'Peluches', 'Electrónico', 'Arte y manualidades', 'Deportivo', 'Musical', 'Puzzle']
  },

  // Habilidades que desarrolla
  'skills_developed': {
    id: 'skills_developed',
    name: 'Habilidades que Desarrolla',
    type: 'tags',
    options: ['Motricidad fina', 'Motricidad gruesa', 'Creatividad', 'Lógica', 'Memoria', 'Coordinación', 'Socialización', 'Lenguaje', 'Matemáticas', 'Ciencias']
  },

  // Seguridad del juguete
  'toy_safety': {
    id: 'toy_safety',
    name: 'Características de Seguridad',
    type: 'tags',
    options: ['Sin piezas pequeñas', 'Materiales no tóxicos', 'Bordes redondeados', 'Certificado CE', 'Lavable', 'Resistente', 'Hipoalergénico']
  },

  // ===================================================
  // METADATOS EXPANDIDOS PARA VEHÍCULOS
  // ===================================================

  // Tipo de vehículo
  'vehicle_type': {
    id: 'vehicle_type',
    name: 'Tipo de Vehículo',
    type: 'select',
    options: ['Auto', 'Motocicleta', 'Bicicleta', 'Scooter', 'ATV', 'Camión', 'Van', 'SUV']
  },

  // Marca de vehículo
  'vehicle_brand': {
    id: 'vehicle_brand',
    name: 'Marca de Vehículo',
    type: 'text'
  },

  // Año del vehículo
  'vehicle_year': {
    id: 'vehicle_year',
    name: 'Año',
    type: 'select',
    options: ['2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015', 'Anterior a 2015', 'Universal']
  },

  // Tipo de repuesto
  'auto_part_type': {
    id: 'auto_part_type',
    name: 'Tipo de Repuesto',
    type: 'select',
    options: ['Motor', 'Transmisión', 'Frenos', 'Suspensión', 'Eléctrico', 'Carrocería', 'Interior', 'Llantas', 'Filtros', 'Aceites', 'Accesorios']
  },

  // ===================================================
  // METADATOS ESPECÍFICOS PARA SALUD Y BELLEZA
  // ===================================================

  // Tipo específico de cuidado de piel
  'skincare_product_type': {
    id: 'skincare_product_type',
    name: 'Tipo de Producto de Cuidado',
    type: 'select',
    options: ['Limpiador gel', 'Limpiador espuma', 'Agua micelar', 'Tónico', 'Exfoliante', 'Hidratante día', 'Hidratante noche', 'Sérum', 'Aceite facial', 'Mascarilla']
  },

  // Ingredientes activos específicos
  'active_ingredients': {
    id: 'active_ingredients',
    name: 'Ingredientes Activos',
    type: 'tags',
    options: ['Ácido salicílico', 'Ácido glicólico', 'Ácido láctico', 'Ácido mandélico', 'Vitamina E', 'Bakuchiol', 'Azelaic acid', 'Kojic acid', 'Arbutin', 'Alpha arbutin']
  },

  // Preocupaciones de la piel
  'skin_concerns': {
    id: 'skin_concerns',
    name: 'Preocupaciones de la Piel',
    type: 'tags',
    options: ['Acné', 'Manchas', 'Arrugas', 'Líneas de expresión', 'Poros dilatados', 'Opacidad', 'Sequedad', 'Grasa excesiva', 'Sensibilidad', 'Flacidez']
  },

  // Factor de protección solar
  'spf_level': {
    id: 'spf_level',
    name: 'Factor de Protección Solar',
    type: 'select',
    options: ['SPF 15', 'SPF 30', 'SPF 50', 'SPF 50+', 'SPF 60', 'SPF 100+']
  },

  // Tipo de maquillaje base
  'makeup_base_type': {
    id: 'makeup_base_type',
    name: 'Tipo de Base',
    type: 'select',
    options: ['Base líquida', 'Base en polvo', 'BB cream', 'CC cream', 'Cushion', 'Tinted moisturizer', 'Concealer', 'Corrector', 'Primer', 'Polvo suelto', 'Polvo compacto']
  },

  // Cobertura del maquillaje
  'makeup_coverage': {
    id: 'makeup_coverage',
    name: 'Cobertura',
    type: 'select',
    options: ['Ligera', 'Media', 'Completa', 'Buildable', 'Sheer']
  },

  // Acabado del maquillaje
  'makeup_finish': {
    id: 'makeup_finish',
    name: 'Acabado',
    type: 'select',
    options: ['Mate', 'Natural', 'Luminoso', 'Satinado', 'Dewy', 'Radiante']
  },

  // Tonos de piel
  'skin_tone': {
    id: 'skin_tone',
    name: 'Tono de Piel',
    type: 'tags',
    options: ['Muy claro', 'Claro', 'Medio claro', 'Medio', 'Medio oscuro', 'Oscuro', 'Muy oscuro', 'Undertone frío', 'Undertone cálido', 'Undertone neutro']
  },

  // Tipo de cabello
  'hair_type': {
    id: 'hair_type',
    name: 'Tipo de Cabello',
    type: 'tags',
    options: ['Graso', 'Seco', 'Mixto', 'Normal', 'Rizado', 'Liso', 'Ondulado', 'Teñido', 'Dañado', 'Fino', 'Grueso', 'Caspa']
  },

  // Longitud del cabello
  'hair_length': {
    id: 'hair_length',
    name: 'Longitud del Cabello',
    type: 'select',
    options: ['Corto', 'Medio', 'Largo', 'Todas las longitudes']
  },

  // Tratamientos capilares
  'hair_treatment_type': {
    id: 'hair_treatment_type',
    name: 'Tipo de Tratamiento',
    type: 'select',
    options: ['Hidratación', 'Reparación', 'Volumen', 'Anticaída', 'Crecimiento', 'Brillo', 'Control frizz', 'Protección color', 'Desenredante']
  },

  // Familia de fragancias
  'fragrance_family': {
    id: 'fragrance_family',
    name: 'Familia de Fragancia',
    type: 'select',
    options: ['Floral', 'Oriental', 'Amaderada', 'Fresca', 'Cítrica', 'Frutal', 'Gourmand', 'Especiada', 'Verde', 'Acuática']
  },

  // Intensidad de fragancia
  'fragrance_intensity': {
    id: 'fragrance_intensity',
    name: 'Intensidad',
    type: 'select',
    options: ['Ligera', 'Moderada', 'Intensa', 'Muy intensa']
  },

  // Duración de fragancia
  'fragrance_longevity': {
    id: 'fragrance_longevity',
    name: 'Duración',
    type: 'select',
    options: ['2-4 horas', '4-6 horas', '6-8 horas', '8+ horas', 'Todo el día']
  },

  // Tipo de suplemento
  'supplement_type': {
    id: 'supplement_type',
    name: 'Tipo de Suplemento',
    type: 'select',
    options: ['Cápsulas', 'Tabletas', 'Gummies', 'Polvo', 'Líquido', 'Sublingual', 'Masticables', 'Efervescente']
  },

  // Beneficios del suplemento
  'supplement_benefits': {
    id: 'supplement_benefits',
    name: 'Beneficios',
    type: 'tags',
    options: ['Energía', 'Inmunidad', 'Digestión', 'Articulaciones', 'Corazón', 'Cerebro', 'Piel', 'Cabello', 'Uñas', 'Huesos', 'Músculos', 'Sueño', 'Estrés']
  },

  // Momento de consumo
  'consumption_time': {
    id: 'consumption_time',
    name: 'Momento de Consumo',
    type: 'select',
    options: ['Con desayuno', 'Con almuerzo', 'Con cena', 'Entre comidas', 'Antes de dormir', 'Pre-entreno', 'Post-entreno', 'Cualquier momento']
  },

  // Certificaciones
  'certifications': {
    id: 'certifications',
    name: 'Certificaciones',
    type: 'tags',
    options: ['Vegano', 'Cruelty-free', 'Orgánico', 'Natural', 'Sin parabenos', 'Sin sulfatos', 'Sin gluten', 'FDA approved', 'Dermatológicamente testado']
  },

  // Tamaño de producto
  'product_size': {
    id: 'product_size',
    name: 'Tamaño del Producto',
    type: 'select',
    options: ['Mini (menos de 30ml)', 'Tamaño viaje (30-50ml)', 'Estándar (50-100ml)', 'Grande (100-200ml)', 'Tamaño familiar (200ml+)', 'Set/Kit']
  },

  // Herramientas de belleza
  'beauty_tool_type': {
    id: 'beauty_tool_type',
    name: 'Tipo de Herramienta',
    type: 'select',
    options: ['Brocha base', 'Brocha polvo', 'Brocha colorete', 'Brocha ojos', 'Esponja', 'Beauty blender', 'Pincel labios', 'Rizador pestañas', 'Set completo']
  },

  // Material de herramientas
  'tool_material': {
    id: 'tool_material',
    name: 'Material',
    type: 'tags',
    options: ['Pelo sintético', 'Pelo natural', 'Silicona', 'Esponja', 'Metal', 'Plástico', 'Bambú', 'Antimicrobiano']
  },

  // ===================================================
  // METADATOS ESPECÍFICOS PARA DEPORTES Y FITNESS
  // ===================================================

  // Tipo específico de equipo deportivo
  'sports_gear_type': {
    id: 'sports_gear_type',
    name: 'Tipo de Equipo Deportivo',
    type: 'select',
    options: ['Ropa deportiva', 'Calzado deportivo', 'Equipo de entrenamiento', 'Pesas y mancuernas', 'Máquinas de ejercicio', 'Accesorios fitness', 'Protección deportiva', 'Electrónicos fitness']
  },

  // Tipo de ropa deportiva específica
  'sports_clothing_type': {
    id: 'sports_clothing_type',
    name: 'Tipo de Ropa Deportiva',
    type: 'select',
    options: ['Camiseta deportiva', 'Top deportivo', 'Leggings', 'Shorts deportivos', 'Sudadera', 'Chaqueta deportiva', 'Sujetador deportivo', 'Ropa interior deportiva', 'Medias deportivas']
  },

  // Tipo de calzado deportivo
  'sports_footwear_type': {
    id: 'sports_footwear_type',
    name: 'Tipo de Calzado Deportivo',
    type: 'select',
    options: ['Zapatillas running', 'Zapatillas training', 'Zapatillas basketball', 'Zapatillas tenis', 'Zapatillas fútbol', 'Zapatillas casual', 'Botas de montaña', 'Sandalias deportivas']
  },

  // Tecnología en ropa deportiva
  'sports_tech_features': {
    id: 'sports_tech_features',
    name: 'Tecnología y Características',
    type: 'tags',
    options: ['Dri-FIT', 'Transpirable', 'Secado rápido', 'Anti-odor', 'Compresión', 'Reflectivos', 'UV protection', 'Antibacterial', 'Moisture-wicking', 'Stretch']
  },

  // Nivel de soporte (para sujetadores deportivos)
  'support_level': {
    id: 'support_level',
    name: 'Nivel de Soporte',
    type: 'select',
    options: ['Bajo', 'Medio', 'Alto', 'Máximo']
  },

  // Tipo de entrenamiento específico
  'training_type': {
    id: 'training_type',
    name: 'Tipo de Entrenamiento',
    type: 'tags',
    options: ['Cardio', 'Fuerza', 'HIIT', 'Functional', 'Crossfit', 'Powerlifting', 'Bodybuilding', 'Calistenia', 'Rehabilitación', 'Flexibilidad']
  },

  // Peso del equipo
  'equipment_weight': {
    id: 'equipment_weight',
    name: 'Peso del Equipo',
    type: 'select',
    options: ['Menos de 1kg', '1-5kg', '5-10kg', '10-20kg', '20-50kg', 'Más de 50kg', 'Ajustable']
  },

  // Espacio requerido
  'space_required': {
    id: 'space_required',
    name: 'Espacio Requerido',
    type: 'select',
    options: ['Mínimo (menos de 1m²)', 'Pequeño (1-2m²)', 'Mediano (2-4m²)', 'Grande (4-8m²)', 'Muy grande (8m²+)', 'Portátil']
  },

  // Superficie de uso
  'surface_type': {
    id: 'surface_type',
    name: 'Superficie de Uso',
    type: 'tags',
    options: ['Interior', 'Exterior', 'Césped', 'Asfalto', 'Tierra', 'Arena', 'Agua', 'Nieve', 'Hielo', 'Gimnasio']
  },

  // Tipo de deporte acuático
  'water_sport_type': {
    id: 'water_sport_type',
    name: 'Tipo de Deporte Acuático',
    type: 'select',
    options: ['Natación', 'Surf', 'Buceo', 'Snorkel', 'Kayak', 'Paddle board', 'Windsurf', 'Kitesurf', 'Waterpolo', 'Aqua fitness']
  },

  // Tipo de bicicleta
  'bike_type': {
    id: 'bike_type',
    name: 'Tipo de Bicicleta',
    type: 'select',
    options: ['Montaña', 'Ruta', 'Urbana', 'BMX', 'Eléctrica', 'Plegable', 'Híbrida', 'Gravel', 'Triatlón', 'Infantil']
  },

  // Talla de bicicleta
  'bike_size': {
    id: 'bike_size',
    name: 'Talla de Bicicleta',
    type: 'select',
    options: ['XS (13-14")', 'S (15-16")', 'M (17-18")', 'L (19-20")', 'XL (21-22")', 'XXL (23"+)', 'Infantil', 'Ajustable']
  },

  // Tipo de protección deportiva
  'protection_type': {
    id: 'protection_type',
    name: 'Tipo de Protección',
    type: 'select',
    options: ['Casco', 'Rodilleras', 'Coderas', 'Muñequeras', 'Protector bucal', 'Espinilleras', 'Chaleco protector', 'Guantes', 'Protector genital']
  },

  // Deporte de combate específico
  'combat_sport': {
    id: 'combat_sport',
    name: 'Deporte de Combate',
    type: 'select',
    options: ['Boxeo', 'Kickboxing', 'Muay Thai', 'MMA', 'Karate', 'Taekwondo', 'Judo', 'Jiu-jitsu', 'Wrestling', 'Esgrima']
  },

  // Tipo de suplemento deportivo
  'sports_supplement_type': {
    id: 'sports_supplement_type',
    name: 'Tipo de Suplemento Deportivo',
    type: 'select',
    options: ['Proteína', 'Pre-entreno', 'Post-entreno', 'BCAA', 'Creatina', 'Quemador de grasa', 'Ganador de peso', 'Vitaminas', 'Hidratación', 'Recovery']
  },

  // Sabor de suplementos
  'supplement_flavor': {
    id: 'supplement_flavor',
    name: 'Sabor',
    type: 'tags',
    options: ['Chocolate', 'Vainilla', 'Fresa', 'Plátano', 'Cookies & cream', 'Sin sabor', 'Frutas tropicales', 'Menta', 'Café', 'Natural']
  },

  // ===================================================
  // METADATOS ESPECÍFICOS PARA ALIMENTOS Y BEBIDAS
  // ===================================================

  // Tipo específico de alimento
  'food_product_type': {
    id: 'food_product_type',
    name: 'Tipo de Producto Alimentario',
    type: 'select',
    options: ['Carne fresca', 'Pollo', 'Pescado', 'Mariscos', 'Lácteos', 'Quesos', 'Frutas', 'Verduras', 'Granos', 'Pasta', 'Pan', 'Cereales', 'Condimentos', 'Salsas', 'Aceites']
  },

  // Origen del producto
  'food_origin': {
    id: 'food_origin',
    name: 'Origen',
    type: 'select',
    options: ['Local', 'Nacional', 'Importado', 'Orgánico local', 'Comercio justo', 'Artesanal', 'Industrial']
  },

  // Conservación
  'food_storage': {
    id: 'food_storage',
    name: 'Tipo de Conservación',
    type: 'select',
    options: ['Fresco/Refrigerado', 'Congelado', 'Temperatura ambiente', 'Enlatado', 'Deshidratado', 'Encurtido', 'Ahumado']
  },

  // Tamaño de porción
  'portion_size': {
    id: 'portion_size',
    name: 'Tamaño de Porción',
    type: 'select',
    options: ['Individual', 'Para 2 personas', 'Familiar (4-6 personas)', 'Familiar grande (6+ personas)', 'Bulk/Mayoreo']
  },

  // Tipo de bebida
  'beverage_type': {
    id: 'beverage_type',
    name: 'Tipo de Bebida',
    type: 'select',
    options: ['Agua', 'Jugos naturales', 'Refrescos', 'Bebidas energéticas', 'Café', 'Té', 'Bebidas alcohólicas', 'Smoothies', 'Bebidas deportivas', 'Kombucha']
  },

  // Contenido de alcohol
  'alcohol_content': {
    id: 'alcohol_content',
    name: 'Contenido de Alcohol',
    type: 'select',
    options: ['Sin alcohol', '0.5-5%', '5-12%', '12-20%', '20-40%', 'Más de 40%']
  },

  // Nivel de picante
  'spice_level': {
    id: 'spice_level',
    name: 'Nivel de Picante',
    type: 'select',
    options: ['Sin picante', 'Suave', 'Medio', 'Picante', 'Muy picante', 'Extremo']
  },

  // Preparación requerida
  'preparation_required': {
    id: 'preparation_required',
    name: 'Preparación Requerida',
    type: 'select',
    options: ['Listo para consumir', 'Calentar', 'Cocinar', 'Hervir', 'Hornear', 'Freír', 'Preparación compleja']
  },

  // ===================================================
  // METADATOS ESPECÍFICOS PARA LIBROS Y EDUCACIÓN
  // ===================================================

  // Género literario específico
  'literary_genre': {
    id: 'literary_genre',
    name: 'Género Literario',
    type: 'tags',
    options: ['Romance', 'Misterio', 'Thriller', 'Fantasía', 'Ciencia ficción', 'Drama', 'Comedia', 'Aventura', 'Horror', 'Histórico', 'Biografía', 'Ensayo']
  },

  // Nivel educativo
  'education_level': {
    id: 'education_level',
    name: 'Nivel Educativo',
    type: 'select',
    options: ['Preescolar', 'Primaria', 'Secundaria', 'Preparatoria', 'Universidad', 'Posgrado', 'Educación continua', 'Todos los niveles']
  },

  // Materia/Asignatura
  'subject_area': {
    id: 'subject_area',
    name: 'Materia/Asignatura',
    type: 'tags',
    options: ['Matemáticas', 'Ciencias', 'Historia', 'Geografía', 'Literatura', 'Idiomas', 'Arte', 'Música', 'Educación física', 'Filosofía', 'Psicología', 'Tecnología']
  },

  // Tipo de material educativo
  'educational_material_type': {
    id: 'educational_material_type',
    name: 'Tipo de Material Educativo',
    type: 'select',
    options: ['Libro de texto', 'Cuaderno de ejercicios', 'Guía del maestro', 'Material didáctico', 'Juegos educativos', 'Software educativo', 'Videos educativos']
  },

  // Número de páginas
  'page_count': {
    id: 'page_count',
    name: 'Número de Páginas',
    type: 'select',
    options: ['Menos de 50', '50-100', '100-200', '200-300', '300-500', 'Más de 500']
  },

  // Autor/Editorial
  'publisher': {
    id: 'publisher',
    name: 'Editorial',
    type: 'text'
  },

  // ===================================================
  // METADATOS ESPECÍFICOS PARA JUGUETES Y NIÑOS
  // ===================================================

  // Tipo específico de juguete
  'toy_category': {
    id: 'toy_category',
    name: 'Categoría de Juguete',
    type: 'select',
    options: ['Muñecas y accesorios', 'Figuras de acción', 'Vehículos y control remoto', 'Bloques y construcción', 'Peluches', 'Juegos de mesa', 'Puzzles', 'Arte y manualidades', 'Instrumentos musicales', 'Deportes y aire libre']
  },

  // Rango de edad específico
  'age_range': {
    id: 'age_range',
    name: 'Rango de Edad Específico',
    type: 'select',
    options: ['0-6 meses', '6-12 meses', '1-2 años', '2-3 años', '3-5 años', '5-8 años', '8-12 años', '12+ años', 'Adultos']
  },

  // Número de jugadores
  'player_count': {
    id: 'player_count',
    name: 'Número de Jugadores',
    type: 'select',
    options: ['1 jugador', '2 jugadores', '2-4 jugadores', '3-6 jugadores', '4-8 jugadores', '6+ jugadores', 'Multijugador']
  },

  // Duración del juego
  'game_duration': {
    id: 'game_duration',
    name: 'Duración del Juego',
    type: 'select',
    options: ['Menos de 15 min', '15-30 min', '30-60 min', '1-2 horas', 'Más de 2 horas', 'Variable']
  },

  // Complejidad del juego
  'game_complexity': {
    id: 'game_complexity',
    name: 'Complejidad',
    type: 'select',
    options: ['Muy fácil', 'Fácil', 'Intermedio', 'Difícil', 'Muy difícil']
  },

  // Tamaño del juguete
  'toy_size': {
    id: 'toy_size',
    name: 'Tamaño del Juguete',
    type: 'select',
    options: ['Mini (menos de 10cm)', 'Pequeño (10-20cm)', 'Mediano (20-40cm)', 'Grande (40-80cm)', 'Extra grande (80cm+)']
  },

  // Fuente de energía
  'power_source': {
    id: 'power_source',
    name: 'Fuente de Energía',
    type: 'select',
    options: ['Sin energía', 'Pilas AA', 'Pilas AAA', 'Batería recargable', 'USB', 'Energía solar', 'Manual']
  },

  // ===================================================
  // METADATOS ESPECÍFICOS PARA VEHÍCULOS Y REPUESTOS
  // ===================================================

  // Modelo específico del vehículo
  'vehicle_model': {
    id: 'vehicle_model',
    name: 'Modelo del Vehículo',
    type: 'text'
  },

  // Condición del vehículo/repuesto
  'vehicle_condition': {
    id: 'vehicle_condition',
    name: 'Condición',
    type: 'select',
    options: ['Nuevo', 'Usado - Excelente', 'Usado - Bueno', 'Usado - Regular', 'Para reparar', 'Para repuestos']
  },

  // Kilometraje (para vehículos usados)
  'mileage': {
    id: 'mileage',
    name: 'Kilometraje',
    type: 'select',
    options: ['0-10,000 km', '10,000-50,000 km', '50,000-100,000 km', '100,000-200,000 km', 'Más de 200,000 km', 'No aplica']
  },

  // Tipo de combustible
  'fuel_type': {
    id: 'fuel_type',
    name: 'Tipo de Combustible',
    type: 'select',
    options: ['Gasolina', 'Diésel', 'Híbrido', 'Eléctrico', 'Gas natural', 'No aplica']
  },

  // Transmisión
  'transmission': {
    id: 'transmission',
    name: 'Transmisión',
    type: 'select',
    options: ['Manual', 'Automática', 'CVT', 'Semi-automática', 'No aplica']
  },

  // Categoría de repuesto específica
  'part_category': {
    id: 'part_category',
    name: 'Categoría de Repuesto',
    type: 'select',
    options: ['Motor y transmisión', 'Frenos y suspensión', 'Sistema eléctrico', 'Carrocería y exterior', 'Interior y confort', 'Llantas y rines', 'Filtros y fluidos', 'Herramientas', 'Accesorios']
  },

  // Compatibilidad
  'compatibility': {
    id: 'compatibility',
    name: 'Compatibilidad',
    type: 'tags',
    options: ['Universal', 'Marca específica', 'Modelo específico', 'Año específico', 'Motor específico']
  }
}

// ===============================================
// 3. MAPEO DE CATEGORÍAS A METADATOS
// ===============================================

export const CATEGORY_METADATA_MAP: Record<string, string[]> = {
  // ===================================================
  // ROPA Y ACCESORIOS - METADATOS EXPANDIDOS
  // ===================================================
  'ropa-y-accesorios': ['color', 'gender', 'season', 'material', 'clothing_style', 'occasion'],
  'ropa-mujer': ['color', 'size_clothing', 'material', 'clothing_style', 'season', 'occasion', 'target_age'],
  'ropa-hombre': ['color', 'size_clothing', 'material', 'clothing_style', 'season', 'occasion', 'target_age'],
  'ropa-niños': ['color', 'size_clothing', 'material', 'gender', 'season', 'recommended_age'],
  'ropa-deportiva': ['color', 'size_clothing', 'material', 'gender', 'clothing_style', 'sport_type', 'activity_intensity'],
  'calzado': ['color', 'size_shoes', 'material', 'gender', 'clothing_style', 'season', 'sport_type'],
  'accesorios-moda': ['color', 'material', 'gender', 'occasion', 'season'],
  'joyeria': ['color', 'material', 'gender', 'occasion', 'target_age'],
  'bolsos-carteras': ['color', 'material', 'gender', 'occasion', 'season', 'furniture_size'],

  // ===================================================
  // MASCOTAS - METADATOS EXPANDIDOS
  // ===================================================
  'productos-mascotas': ['pet_type', 'pet_size', 'pet_age', 'color', 'material'],
  'alimento-mascotas': ['pet_type', 'pet_age', 'pet_size', 'pet_food_type', 'pet_protein_source', 'pet_special_diet'],
  'accesorios-perros': ['pet_size', 'color', 'material', 'pet_accessory_type', 'pet_collar_size', 'pet_safety_features'],
  'accesorios-gatos': ['pet_size', 'color', 'material', 'pet_accessory_type', 'pet_collar_size', 'pet_safety_features'],
  'juguetes-mascotas': ['pet_type', 'pet_size', 'color', 'pet_toy_material', 'pet_toy_type', 'pet_toy_durability'],
  'cuidado-higiene-mascotas': ['pet_type', 'pet_age', 'pet_grooming_type', 'pet_coat_type'],
  'casas-camas-mascotas': ['pet_type', 'pet_size', 'color', 'material', 'furniture_size'],
  'transportadores': ['pet_type', 'pet_size', 'material', 'pet_safety_features'],

  // ===================================================
  // TECNOLOGÍA - METADATOS EXPANDIDOS
  // ===================================================
  'tecnologia': ['tech_brand', 'color', 'connectivity', 'device_type', 'tech_condition', 'tech_warranty'],
  'celulares-tablets': ['tech_brand', 'color', 'connectivity', 'screen_size', 'storage_capacity', 'operating_system', 'ram_memory', 'camera_specs', 'battery_life', 'tech_condition', 'water_resistance'],
  'computadoras': ['tech_brand', 'color', 'connectivity', 'screen_size', 'storage_capacity', 'operating_system', 'processor', 'ram_memory', 'tech_condition', 'tech_warranty', 'screen_resolution'],
  'accesorios-tecnologia': ['tech_brand', 'color', 'connectivity', 'device_type', 'tech_condition', 'water_resistance'],
  'audio-video': ['tech_brand', 'color', 'connectivity', 'audio_type', 'noise_cancellation', 'battery_life', 'water_resistance', 'tech_condition'],
  'gaming': ['tech_brand', 'color', 'connectivity', 'gaming_platform', 'storage_capacity', 'processor', 'ram_memory', 'screen_resolution', 'tech_condition'],
  'smart-home': ['tech_brand', 'color', 'connectivity', 'device_type', 'tech_warranty'],

  // ===================================================
  // HOGAR Y DECORACIÓN - METADATOS EXPANDIDOS
  // ===================================================
  'hogar-decoracion': ['color', 'material', 'home_room', 'home_style', 'furniture_size'],
  'muebles': ['color', 'material', 'home_room', 'home_style', 'furniture_type', 'furniture_size', 'seating_capacity', 'furniture_features', 'assembly_required'],
  'decoracion': ['color', 'material', 'home_room', 'home_style', 'furniture_size'],
  'textiles-hogar': ['color', 'material', 'home_room', 'home_style', 'furniture_size'],
  'cocina-comedor': ['color', 'material', 'furniture_size', 'seating_capacity', 'assembly_required'],
  'baño': ['color', 'material', 'furniture_size'],
  'jardin-exterior': ['color', 'material', 'furniture_size', 'assembly_required'],
  'herramientas-mejoras': ['color', 'material', 'tech_warranty'],

  // ===================================================
  // SALUD Y BELLEZA - METADATOS EXPANDIDOS (SIMPLIFICADO)
  // ===================================================
  'salud-belleza': ['gender', 'beauty_product_type', 'skin_type', 'target_age', 'certifications'],
  
  // Subcategorías principales de salud y belleza (nivel 2 - FINALES)
  'cuidado-piel': ['gender', 'skin_type', 'skincare_product_type', 'application_area', 'key_ingredients', 'active_ingredients', 'skin_concerns', 'spf_level', 'target_age', 'certifications', 'product_size'],
  'maquillaje': ['color', 'gender', 'skin_type', 'skin_tone', 'makeup_base_type', 'makeup_coverage', 'makeup_finish', 'beauty_tool_type', 'tool_material', 'target_age', 'certifications', 'product_size'],
  'cuidado-cabello': ['gender', 'hair_type', 'hair_length', 'hair_treatment_type', 'key_ingredients', 'tool_material', 'color', 'certifications', 'product_size'],
  'fragancias': ['gender', 'fragrance_family', 'fragrance_intensity', 'fragrance_longevity', 'target_age', 'product_size'],
  'cuidado-personal': ['gender', 'application_area', 'skin_type', 'target_age', 'certifications', 'product_size'],
  'suplementos': ['gender', 'target_age', 'supplement_type', 'supplement_benefits', 'consumption_time', 'sport_type', 'certifications'],
  'bienestar-salud': ['gender', 'target_age', 'material', 'furniture_size', 'tech_warranty', 'certifications', 'product_size'],

  // ===================================================
  // DEPORTES Y FITNESS - METADATOS EXPANDIDOS (SIMPLIFICADO)
  // ===================================================
  'deportes-fitness': ['color', 'gender', 'sport_type', 'experience_level', 'sports_gear_type', 'activity_intensity'],
  
  // Subcategorías principales de deportes (nivel 2 - FINALES)
  'fitness-gym': ['color', 'gender', 'size_clothing', 'sports_gear_type', 'sports_clothing_type', 'training_type', 'experience_level', 'equipment_weight', 'space_required', 'sports_tech_features', 'support_level'],
  'running-atletismo': ['color', 'gender', 'size_clothing', 'size_shoes', 'sports_footwear_type', 'sports_clothing_type', 'sports_tech_features', 'surface_type', 'experience_level', 'activity_intensity'],
  'deportes-acuaticos': ['color', 'gender', 'size_clothing', 'water_sport_type', 'water_resistance', 'sports_tech_features', 'experience_level', 'surface_type'],
  'ciclismo': ['color', 'gender', 'size_clothing', 'bike_type', 'bike_size', 'sports_gear_type', 'protection_type', 'experience_level', 'surface_type'],
  'deportes-raqueta': ['color', 'gender', 'size_clothing', 'size_shoes', 'sport_type', 'sports_gear_type', 'experience_level', 'surface_type'],
  'deportes-equipo': ['color', 'gender', 'size_clothing', 'sport_type', 'sports_gear_type', 'experience_level', 'surface_type', 'protection_type'],
  'deportes-combate': ['color', 'gender', 'size_clothing', 'combat_sport', 'sports_gear_type', 'protection_type', 'experience_level', 'equipment_weight'],
  'yoga-pilates': ['color', 'gender', 'size_clothing', 'sports_clothing_type', 'sports_gear_type', 'experience_level', 'space_required', 'material'],
  'deportes-invierno': ['color', 'gender', 'size_clothing', 'sport_type', 'sports_gear_type', 'protection_type', 'sports_tech_features', 'experience_level'],
  'deportes-extremos': ['color', 'gender', 'size_clothing', 'sport_type', 'sports_gear_type', 'protection_type', 'experience_level', 'surface_type'],
  'golf': ['color', 'gender', 'size_clothing', 'sports_gear_type', 'experience_level', 'surface_type'],
  'escalada-montanismo': ['color', 'gender', 'size_clothing', 'sports_gear_type', 'protection_type', 'experience_level', 'surface_type', 'equipment_weight'],
  'suplementos-deportivos': ['gender', 'sports_supplement_type', 'supplement_flavor', 'supplement_benefits', 'consumption_time', 'sport_type', 'certifications'],
  'nutricion-deportiva': ['gender', 'food_type', 'supplement_benefits', 'consumption_time', 'sport_type', 'dietary_restriction', 'certifications'],

  // ===================================================
  // ALIMENTOS Y BEBIDAS - METADATOS EXPANDIDOS
  // ===================================================
  'alimentos-bebidas': ['food_type', 'food_category', 'dietary_restriction', 'shelf_life', 'food_origin'],
  'despensa': ['food_product_type', 'food_category', 'dietary_restriction', 'shelf_life', 'food_origin', 'food_storage', 'portion_size', 'spice_level', 'preparation_required'],
  'bebidas': ['beverage_type', 'food_type', 'dietary_restriction', 'shelf_life', 'alcohol_content', 'food_origin', 'portion_size'],
  'frescos': ['food_product_type', 'food_category', 'dietary_restriction', 'shelf_life', 'food_origin', 'food_storage', 'portion_size'],
  'gourmet': ['food_product_type', 'food_category', 'dietary_restriction', 'food_origin', 'spice_level', 'preparation_required'],
  'organicos': ['food_product_type', 'food_category', 'dietary_restriction', 'shelf_life', 'food_origin', 'food_storage', 'portion_size'],
  'snacks-dulces': ['food_type', 'dietary_restriction', 'shelf_life', 'recommended_age', 'portion_size', 'food_origin'],

  // ===================================================
  // LIBROS Y EDUCACIÓN - METADATOS EXPANDIDOS
  // ===================================================
  'libros-educacion': ['book_type', 'language', 'recommended_age', 'book_format', 'publisher'],
  'libros-literatura': ['book_type', 'literary_genre', 'language', 'target_age', 'book_format', 'page_count', 'publisher'],
  'educacion-infantil': ['book_type', 'language', 'recommended_age', 'skills_developed', 'book_format', 'educational_material_type', 'subject_area'],
  'material-escolar': ['color', 'recommended_age', 'material', 'educational_material_type', 'subject_area'],
  'cursos-online': ['language', 'target_age', 'experience_level', 'subject_area', 'education_level'],
  'arte-manualidades': ['color', 'material', 'recommended_age', 'skills_developed', 'educational_material_type'],

  // ===================================================
  // JUGUETES Y NIÑOS - METADATOS EXPANDIDOS
  // ===================================================
  'juguetes-niños': ['color', 'gender', 'toy_type', 'toy_category', 'recommended_age', 'age_range', 'skills_developed', 'toy_safety', 'toy_size'],
  'juguetes-bebes': ['color', 'toy_type', 'toy_category', 'recommended_age', 'age_range', 'skills_developed', 'toy_safety', 'material', 'toy_size'],
  'juguetes-niños-edad': ['color', 'gender', 'toy_type', 'toy_category', 'recommended_age', 'age_range', 'skills_developed', 'toy_safety', 'toy_size'],
  'juegos-mesa': ['recommended_age', 'age_range', 'player_count', 'game_duration', 'game_complexity', 'skills_developed', 'language', 'experience_level'],
  'muñecas-figuras': ['color', 'gender', 'recommended_age', 'age_range', 'material', 'toy_safety', 'toy_size'],
  'vehiculos-juguete': ['color', 'toy_type', 'recommended_age', 'age_range', 'material', 'toy_safety', 'toy_size', 'power_source'],
  'aire-libre-niños': ['color', 'recommended_age', 'age_range', 'material', 'toy_safety', 'assembly_required', 'toy_size'],

  // ===================================================
  // VEHÍCULOS Y REPUESTOS - METADATOS EXPANDIDOS
  // ===================================================
  'vehiculos-repuestos': ['color', 'vehicle_type', 'vehicle_brand', 'vehicle_model', 'vehicle_year', 'vehicle_condition'],
  'accesorios-auto': ['color', 'vehicle_type', 'vehicle_brand', 'vehicle_model', 'vehicle_year', 'part_category', 'compatibility', 'vehicle_condition'],
  'repuestos-auto': ['vehicle_type', 'vehicle_brand', 'vehicle_model', 'vehicle_year', 'auto_part_type', 'part_category', 'vehicle_condition', 'compatibility'],
  'motocicletas': ['color', 'vehicle_brand', 'vehicle_model', 'vehicle_year', 'fuel_type', 'transmission', 'mileage', 'vehicle_condition'],
  'herramientas-auto': ['color', 'material', 'auto_part_type', 'part_category', 'tech_warranty', 'compatibility']
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
