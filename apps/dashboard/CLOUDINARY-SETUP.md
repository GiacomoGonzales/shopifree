# 🌤️ Configuración de Cloudinary para Subida de Imágenes

Este documento explica cómo configurar Cloudinary para la subida de imágenes del logo y foto de la tienda en el dashboard.

## 📋 Requisitos Previos

1. **Cuenta de Cloudinary**: Crear una cuenta gratuita en [cloudinary.com](https://cloudinary.com)
2. **Variables de entorno**: Configurar las variables necesarias en tu proyecto

## 🔧 Configuración Paso a Paso

### 1. Obtener Credenciales de Cloudinary

1. Inicia sesión en tu cuenta de Cloudinary
2. Ve al **Dashboard** principal
3. Encontrarás tu **Cloud Name** en la parte superior
4. En la sección **API Keys**, copia tu **API Key** y **API Secret**

### 2. Crear Upload Preset

1. Ve a **Settings** > **Upload**
2. Scroll hasta **Upload presets**
3. Haz click en **Add upload preset**
4. Configura:
   - **Preset name**: `shopifree_images` (o el nombre que prefieras)
   - **Signing mode**: **Unsigned** (permite subidas desde el frontend)
   - **Folder**: Opcional - puedes dejarlo vacío ya que se maneja desde el código
   - **Transformation**: Opcional - puedes agregar transformaciones automáticas
   - **Auto-format**: Activado (optimiza automáticamente el formato)
   - **Quality**: Auto (optimiza automáticamente la calidad)

### 3. Variables de Entorno

Agrega estas variables a tu archivo `.env.local`:

```env
# Cloudinary - Variables públicas (frontend)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=tu_cloud_name_aqui
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=shopifree_images

# Cloudinary - Variables privadas (backend) - REQUERIDAS para eliminación
CLOUDINARY_API_KEY=tu_api_key_aqui
CLOUDINARY_API_SECRET=tu_api_secret_aqui
```

## 📁 Estructura de Carpetas en Cloudinary

Las imágenes se organizan automáticamente en carpetas por tipo y tienda:

- **`logos/{storeId}/`**: Para los logos de las tiendas
- **`store_photos/{storeId}/`**: Para las fotos de los locales físicos
- **`categories/{storeId}/`**: Para las imágenes de categorías
- **`brands/{storeId}/`**: Para las imágenes de marcas
- **`products/{storeId}/`**: Para las imágenes de productos
- **`banners/{storeId}/`**: Para banners y imágenes promocionales

Cada tienda tiene su propio subdirectorio dentro de cada tipo de carpeta, identificado por su `storeId`, evitando conflictos entre diferentes tiendas.

## 🗑️ Eliminación Automática de Imágenes Anteriores

El sistema elimina automáticamente las imágenes anteriores cuando se suben nuevas:

- **Al subir nuevo logo**: Elimina el logo anterior de Cloudinary
- **Al subir nueva foto del local**: Elimina la foto anterior de Cloudinary
- **Al hacer click en "Eliminar"**: Elimina la imagen de Cloudinary inmediatamente

Esto evita acumular imágenes no utilizadas y mantiene limpio tu almacenamiento en Cloudinary.

## ✅ Funcionalidades Implementadas

### ✨ Validaciones
- **Formatos permitidos**: JPG, JPEG, PNG, WebP
- **Tamaño máximo**: 5MB por imagen
- **Optimización automática**: Compresión y formato automático via Cloudinary

### 🎨 Interfaz de Usuario
- **Drag & Drop**: Área de arrastre y suelta
- **Vista previa**: Muestra la imagen subida instantáneamente
- **Estados de carga**: Spinner animado durante la subida
- **Manejo de errores**: Mensajes claros en español
- **Botones de acción**: Cambiar y eliminar imagen
- **Responsive**: Se adapta a móvil y desktop

### 🔒 Guardado en Firestore
Las URLs y public_ids de Cloudinary se guardan en Firestore:
- **`logoUrl`**: URL del logo de la tienda
- **`logoPublicId`**: Public ID para eliminar el logo de Cloudinary
- **`storefrontImageUrl`**: URL de la imagen del local (solo si tiene ubicación física)
- **`storefrontImagePublicId`**: Public ID para eliminar la foto del local de Cloudinary

## 🚀 Uso en la Aplicación

### Para el Logo
1. Ve a **Configuración** > **Básica** > **Branding**
2. En la sección "Logo de la tienda"
3. Arrastra una imagen o haz click para seleccionar
4. La imagen se sube automáticamente a Cloudinary
5. Se guarda la URL en Firestore

### Para la Foto del Local
1. **Activa primero** "¿Tiene local físico?" en la sección de ubicación
2. Aparecerá el campo de "Foto del local" en Branding
3. Sigue el mismo proceso que para el logo

## 🔧 Troubleshooting

### Error: "Cloudinary cloud name no configurado"
- Verifica que `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` esté en `.env.local`
- Reinicia el servidor de desarrollo después de agregar variables

### Error: "Cloudinary upload preset no configurado"
- Verifica que `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` esté en `.env.local`
- Asegúrate de que el preset exista en tu cuenta de Cloudinary

### Error de CORS
- Verifica que el upload preset sea **Unsigned**
- Los presets signed requieren autenticación adicional

### Imágenes no se cargan
- Verifica que las URLs en Firestore sean válidas
- Revisa la consola del navegador para errores de red

## 📈 Próximas Mejoras

- **Eliminación desde servidor**: Implementar endpoint para eliminar imágenes de Cloudinary
- **Transformaciones avanzadas**: Redimensionado automático según uso
- **Múltiples imágenes**: Galería de productos
- **Watermarks**: Marca de agua automática

## 🌟 Beneficios de Cloudinary

1. **CDN Global**: Carga rápida desde cualquier ubicación
2. **Optimización automática**: Mejor rendimiento web
3. **Transformaciones on-the-fly**: Redimensionar sin perder calidad
4. **99.9% uptime**: Alta disponibilidad
5. **Plan gratuito generoso**: 25GB de almacenamiento y 25GB de ancho de banda mensual 