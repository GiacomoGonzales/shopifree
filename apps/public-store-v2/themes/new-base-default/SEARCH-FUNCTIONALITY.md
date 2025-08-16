# 🔍 Funcionalidad de Búsqueda - New Base Default Theme

## 📋 Descripción General

Implementación de búsqueda dinámica que adapta su comportamiento según el dispositivo:
- **Móvil**: Modal a pantalla completa
- **Desktop**: Dropdown elegante debajo del header

## 🔧 Componentes

### 1. `SearchComponent.tsx`
Componente principal que maneja toda la lógica de búsqueda:
- Búsqueda en tiempo real
- Detección automática de dispositivo móvil/desktop
- Manejo de estados (vacío, buscando, sin resultados)
- Navegación con teclado (Escape para cerrar)

### 2. `Header.tsx` (Actualizado)
Integración del botón de búsqueda que abre el componente:
- Botón con icono de lupa
- Estado de apertura/cierre
- Pasa productos y configuración al SearchComponent

### 3. `NewBaseDefault.tsx` (Actualizado)
Pasa la lista de productos al Header para la funcionalidad de búsqueda.

## 🎯 Funcionalidades

### ✅ Búsqueda Inteligente
- Busca en: nombre del producto, descripción, marca
- Límite de 12 resultados para rendimiento
- Filtrado en tiempo real mientras escribes

### ✅ Interfaz Adaptativa

#### **Móvil (≤768px):**
- Modal a pantalla completa
- Header pegajoso (sticky)
- Botón "Cancelar" para cerrar
- Optimizado para touch

#### **Desktop (>768px):**
- Dropdown elegante con sombra
- Backdrop semi-transparente
- Posicionado desde el header
- Animación suave (slideDown)

### ✅ Estados de UX

#### **Estado Inicial:**
- Icono de búsqueda grande
- Mensaje explicativo
- Placeholder útil

#### **Sin Resultados:**
- Mensaje claro
- Sugerencias para mejorar la búsqueda
- Mantiene la query visible

#### **Con Resultados:**
- Contador de resultados
- Grid de productos con imágenes
- Hover effects suaves

### ✅ Resultados Enriquecidos
- **Imagen del producto** (o placeholder si no hay)
- **Nombre** (con line-clamp para textos largos)
- **Marca** (si está disponible)
- **Precios** (actual + precio comparativo si hay oferta)
- **Enlaces directos** a páginas de producto

## 🎨 Estilos CSS

### Clases Principales:
- `.nbd-search-modal-overlay` - Modal móvil fullscreen
- `.nbd-search-dropdown` - Dropdown desktop
- `.nbd-search-header` - Área de input y controles
- `.nbd-search-results` - Grid de resultados
- `.nbd-search-result-item` - Cada producto individual

### Responsive Design:
```css
@media (min-width: 769px) {
    /* Estilos Desktop */
}

@media (max-width: 768px) {
    /* Estilos Mobile */
}
```

## 🔧 Configuración

### Props del SearchComponent:
```typescript
interface SearchComponentProps {
    products: PublicProduct[];      // Lista de productos para buscar
    isOpen: boolean;               // Estado de apertura
    onClose: () => void;           // Función para cerrar
    isCustomDomain?: boolean;      // Si está en dominio personalizado
    storeSubdomain?: string;       // Subdominio de la tienda
}
```

### Búsqueda:
- **Case insensitive** (no distingue mayúsculas/minúsculas)
- **Trim automático** (remueve espacios al inicio/final)
- **Debounce implícito** via React state

## 🚀 Funciones Avanzadas

### Navegación:
- **Escape**: Cierra la búsqueda
- **Auto-focus**: Input se enfoca automáticamente al abrir
- **URL Construction**: Maneja dominios personalizados vs subdominios

### Accesibilidad:
- Labels apropiados (`aria-label`)
- Focus management
- Keyboard navigation
- Screen reader friendly

### Performance:
- Búsqueda limitada a 12 resultados
- Imágenes con `loading="lazy"`
- Componente solo renderiza cuando `isOpen={true}`

## 🔍 Algoritmo de Búsqueda

```typescript
const searchResults = products.filter(product => 
    product.name.toLowerCase().includes(query) ||
    product.description?.toLowerCase().includes(query) ||
    product.brand?.toLowerCase().includes(query)
).slice(0, 12);
```

## 📱 Experiencia de Usuario

### Flujo Móvil:
1. User toca icono de lupa → Modal fullscreen
2. Auto-focus en input → Empieza a escribir
3. Resultados aparecen en tiempo real → Toca producto
4. Navega a página de producto → Modal se cierra

### Flujo Desktop:
1. User hace clic en lupa → Dropdown elegante
2. Backdrop aparece → Input se enfoca
3. Búsqueda en tiempo real → Hover en resultados
4. Click en producto → Navega y cierra dropdown

## 🎯 Casos de Uso Cubiertos

- ✅ Búsqueda rápida de productos específicos
- ✅ Navegación mobile-first optimizada
- ✅ Desktop experience elegante y no intrusiva
- ✅ Manejo de productos sin imagen
- ✅ Ofertas y precios comparativos
- ✅ Dominios personalizados vs plataforma
- ✅ Estados vacíos y de error bien diseñados

## 🔧 Mantenimiento

Para modificar la búsqueda:
1. **Algoritmo**: Editar filtro en `SearchComponent.tsx`
2. **Estilos**: Modificar sección `SEARCH FUNCTIONALITY` en CSS
3. **Límites**: Cambiar `.slice(0, 12)` por el número deseado
4. **Campos**: Agregar más campos al filtro de búsqueda
