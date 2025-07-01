# 📁 Estructura de Carpetas en Cloudinary - Shopifree

## 📋 Resumen

A partir de ahora, todas las imágenes en Cloudinary se organizan automáticamente por **tipo de contenido** y **tienda**, evitando conflictos entre diferentes tiendas y manteniendo un orden claro.

## 🗂️ Nueva Estructura

```
cloudinary_root/
├── logos/
│   ├── {storeId1}/
│   │   ├── logo_1.jpg
│   │   └── logo_2.png
│   └── {storeId2}/
│       └── logo_1.jpg
├── store_photos/
│   ├── {storeId1}/
│   │   └── storefront.jpg
│   └── {storeId2}/
│       └── storefront.jpg
├── categories/
│   ├── {storeId1}/
│   │   ├── categoria_1.jpg
│   │   └── categoria_2.jpg
│   └── {storeId2}/
│       └── categoria_1.jpg
├── brands/
│   ├── {storeId1}/
│   │   ├── nike.jpg
│   │   └── adidas.jpg
│   └── {storeId2}/
│       └── samsung.jpg
├── products/
│   ├── {storeId1}/
│   │   ├── producto_1.jpg
│   │   └── producto_2.jpg
│   └── {storeId2}/
│       └── producto_1.jpg
└── banners/
    ├── {storeId1}/
    │   ├── banner_home.jpg
    │   └── banner_promo.jpg
    └── {storeId2}/
        └── banner_home.jpg
```

## 🎯 Beneficios

1. **Separación por Tienda**: Cada tienda tiene sus propias carpetas, evitando conflictos
2. **Organización Clara**: Fácil navegación por tipo de contenido
3. **Escalabilidad**: Fácil agregar nuevos tipos de carpetas
4. **Mantenimiento**: Simplifica la limpieza y gestión de imágenes

## 🔧 Implementación Técnica

### Tipos de Carpeta Soportados

```typescript
type FolderType = 
  | 'logos'           // Logos de tiendas
  | 'store_photos'    // Fotos de locales físicos
  | 'categories'      // Imágenes de categorías
  | 'brands'          // Imágenes de marcas
  | 'products'        // Imágenes de productos
  | 'banners'         // Banners promocionales
```

### Cómo se Usa

```typescript
// Ejemplo de subida de imagen de marca
await uploadImageToCloudinary(file, {
  folder: 'brands',
  storeId: 'abc123'  // Se guardará en brands/abc123/
})

// Ejemplo de subida de logo
await uploadImageToCloudinary(file, {
  folder: 'logos',
  storeId: 'abc123'  // Se guardará en logos/abc123/
})
```

## 🔄 Migración de Imágenes Existentes

### Imágenes Anteriores
Las imágenes subidas antes de esta actualización pueden estar en:
- `categories/` (sin storeId)
- `brands/` (sin storeId) 
- `logos/` (sin storeId)
- `store_photos/` (sin storeId)

### Proceso de Migración Manual
Si necesitas mover imágenes existentes a la nueva estructura:

1. **Desde el Dashboard de Cloudinary**:
   - Ve a Media Library
   - Selecciona las imágenes a mover
   - Usa la función "Move" para reorganizarlas

2. **Ejemplo de nueva ubicación**:
   ```
   Antes: brands/nike_logo.jpg
   Después: brands/{storeId}/nike_logo.jpg
   ```

## ⚡ Impacto Automático

### A partir de ahora:
- ✅ **Todas** las subidas nuevas usarán la estructura `{folder}/{storeId}/`
- ✅ Las **marcas** ahora se organizarán por tienda
- ✅ Los **logos** y **store_photos** ahora se organizarán por tienda
- ✅ **Nuevos tipos** (products, banners) están listos para usar

### Retrocompatibilidad:
- ✅ Las imágenes existentes siguen funcionando
- ✅ Las URLs existentes no se rompen
- ✅ Migración manual opcional

## 🚀 Próximos Pasos

1. **Productos**: Cuando se implemente la gestión de productos, las imágenes irán a `products/{storeId}/`
2. **Banners**: Para futuras funcionalidades promocionales
3. **Optimización**: Considerar transformaciones automáticas por carpeta 