# Componente de Favoritos - Elegant Boutique

Este componente implementa la página de favoritos con el estilo específico del tema elegant-boutique.

## Características

### Diseño y Estilo
- **Tipografía elegante**: Usa las fuentes del tema (`--theme-font-heading`, `--theme-font-body`)
- **Colores temáticos**: Integrado completamente con la paleta de colores del tema
- **Espaciado específico**: Incluye espaciado desktop-only para compensar la navegación
- **Animaciones suaves**: Efectos de hover y transiciones elegantes

### Funcionalidades
- **Estado vacío elegante**: Diseño refinado cuando no hay favoritos
- **Grilla responsive**: Usa las clases de grilla específicas del tema (`grid-boutique-products`)
- **Botón "Agregar al carrito"**: Funcionalidad completa con estados de carga
- **Integración con carrito**: Abre automáticamente el carrito después de agregar
- **Soporte para videos**: Maneja productos con archivos multimedia
- **Ratings visuales**: Muestra calificaciones con estrellas cuando están disponibles

### Estados
- **Loading**: Skeleton loading con estilo del tema
- **Vacío**: Estado elegante con llamada a la acción
- **Con productos**: Grilla de productos con todas las funcionalidades

### Responsive
- **Desktop**: Espaciado adicional y layout optimizado
- **Mobile**: Adaptación completa a pantallas pequeñas

## Uso

El componente se importa automáticamente cuando el tema de la tienda es `elegant-boutique`. No requiere configuración adicional.

```tsx
// Importado automáticamente en FavoritesClientPage.tsx
<ThemeFavorites tienda={convertStoreToTienda(store)} />
```

## Estilos CSS

Los estilos específicos están definidos en `styles.css`:

```css
/* Espaciado específico para página de favoritos - solo desktop */
@media (min-width: 1024px) {
  .elegant-favoritos-spacing {
    margin-top: 4rem;
  }
}
``` 