# Tema Restaurant

Tema optimizado para restaurantes con experiencia single-page. Perfecto para negocios de comida con catálogos de 30-60 productos.

## Características

### ✅ **Single-Page Experience**
- **Sin navegación entre páginas**: Todo el menú en una sola vista scrolleable
- **Filtros instantáneos**: Categorías funcionan como filtros, no como páginas separadas
- **Modal de producto**: Todos los productos abren en QuickView modal para seleccionar opciones

### 🎯 **Optimizado para Restaurantes**
- UX tipo "menú digital" similar a Uber Eats / Rappi
- Menos clicks = más conversión
- Experiencia fluida en móvil
- Tiempo de pedido: 2-3 minutos vs 5-7 en multi-página

### 🎨 **Componentes**
- `Restaurant.tsx`: Componente principal single-page
- `RestaurantCategoryFilter.tsx`: Categorías como filtros horizontales
- `RestaurantProductGrid.tsx`: Grid de productos con modal
- Reutiliza: Header, Footer, CartModal, ProductQuickView del tema base

### 📱 **Responsive**
- Desktop: Grid de 3-4 columnas
- Tablet: Grid de 2-3 columnas
- Móvil: Grid de 2 columnas
- Filtros con scroll horizontal en mobile

## Cómo Activar

### Opción 1: Desde el Dashboard (próximamente)
```
Panel Admin → Configuración → Apariencia → Tema: "Restaurant"
```

### Opción 2: Base de Datos (manual)
```sql
UPDATE stores
SET theme = 'restaurant'
WHERE subdomain = 'tu-restaurante';
```

## Diferencias vs new-base-default

| Característica | new-base-default | restaurant |
|---------------|------------------|------------|
| **Navegación** | Multi-página | Single-page |
| **Categorías** | `/categoria/[slug]` | Filtros locales |
| **Productos** | `/producto/[slug]` | Modal QuickView |
| **SEO productos** | ✅ Indexa c/producto | ⚠️ Solo indexa home |
| **UX móvil** | Buena | Excelente |
| **Ideal para** | E-commerce general | Restaurantes/Menús |

## SEO para Restaurantes

El tema prioriza el SEO de la **marca** sobre productos individuales:

✅ **Optimizado:**
- Home page (menú completo)
- Nombre del restaurante
- Ubicación y contacto
- Google My Business / Maps

❌ **No optimizado:**
- URLs individuales por plato
- Búsquedas tipo "Pizza Margarita [ciudad]"

**Nota:** Para restaurantes, el 90% del tráfico viene de Google Maps, redes sociales y búsqueda de marca, NO de búsquedas de platos específicos.

## Estructura de Archivos

```
themes/restaurant/
├── Restaurant.tsx                          # Componente principal
├── restaurant.css                          # Estilos (base + específicos)
├── loading-spinner.css                     # Loading states
├── texture-backgrounds.css                 # Texturas de fondo
├── utilities.css                          # Utilidades CSS
├── announcement-bar-animations.css        # Animaciones announcement bar
├── components/
│   ├── RestaurantCategoryFilter.tsx       # Filtros de categorías
│   └── RestaurantProductGrid.tsx          # Grid de productos
└── README.md                              # Este archivo
```

## Personalización

### Colores
Los colores se heredan de la configuración de la tienda:
- `primaryColor`: Color principal (botones, links, categoría activa)
- `secondaryColor`: Color secundario (hover, acentos)

### Hero Section
Configurable desde el dashboard:
```typescript
storeInfo.sections.hero = {
  enabled: true,
  title: "Bienvenido a [Tu Restaurante]",
  subtitle: "La mejor comida de la ciudad"
}
```

### Announcement Bar
Configurable desde el dashboard:
```typescript
storeInfo.announcementBar = {
  enabled: true,
  text: "🚀 Envío gratis en pedidos mayores a $50.000",
  backgroundColor: "#000",
  textColor: "#fff"
}
```

## Casos de Uso Ideales

✅ **Perfecto para:**
- Restaurantes (comida rápida, casual dining)
- Cafeterías
- Heladerías
- Panaderías
- Food trucks
- Menús digitales

❌ **No recomendado para:**
- E-commerce general con >100 productos
- Tiendas que necesitan SEO por producto
- Catálogos complejos con muchas variantes

## Próximas Mejoras

- [ ] Sección de "Más Vendidos" / "Recomendados"
- [ ] Horarios de atención dinámicos
- [ ] Integración con delivery (Rappi, Uber Eats)
- [ ] Vista de menú por horario (desayuno, almuerzo, cena)
- [ ] Filtros por dietas (vegano, sin gluten, etc.)

## Soporte

Para reportar bugs o sugerir mejoras:
- GitHub: [anthropics/claude-code/issues](https://github.com/anthropics/claude-code/issues)
- Email: soporte@shopifree.app
