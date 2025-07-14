# Tema Elegant Boutique - Shopifree

## Descripción

El tema **Elegant Boutique** es un diseño sofisticado y elegante inspirado en boutiques de lujo y tiendas premium. Presenta un estilo refinado con colores neutros cálidos, tipografía serif elegante y un enfoque en la experiencia premium del cliente.

## Características

### Diseño
- **Estilo boutique premium**: Diseño sofisticado con detalles elegantes
- **Colores neutros cálidos**: Paleta de taupes, cremas y acentos dorados
- **Tipografía serif**: Fuentes elegantes que transmiten lujo y sofisticación
- **Layout espacioso**: Mayor padding y espaciado para sensación premium
- **Responsive premium**: Adaptado para todas las pantallas manteniendo elegancia

### Header
- **Header alto y espacioso**: Mayor altura para impacto visual
- **Logo centrado**: Posicionamiento central para mayor prominencia
- **Navegación elegante**: Menú con separadores decorativos
- **Búsqueda prominente**: Barra de búsqueda más visible y elegante
- **Efectos sutiles**: Transiciones suaves y refinadas

### Componentes
- **Cards premium**: Bordes sutiles, sombras elegantes y mayor padding
- **Botones refinados**: Diseño minimalista con toques dorados
- **Grilla espaciosa**: Layout con más espacio entre productos
- **Animaciones sutiles**: Efectos hover elegantes y transiciones suaves
- **Separadores decorativos**: Elementos visuales entre secciones

### Footer
- **Layout amplio**: Columnas con más espacio y respiración
- **Newsletter elegante**: Diseño premium para suscripción
- **Enlaces organizados**: Navegación clara y sofisticada
- **Información de contacto**: Presentación elegante de datos de contacto

## Estructura de Archivos

```
themes/elegant-boutique/
├── Layout.tsx       # Componente principal del layout
├── Home.tsx         # Página de inicio
├── Product.tsx      # Página de producto (opcional)
├── styles.css       # Estilos específicos del tema
└── README.md        # Este archivo
```

## Colores y Estilos

### Variables CSS
El tema utiliza variables CSS específicas definidas en `styles.css`:

```css
--theme-primary: 139 125 107;      /* Warm taupe */
--theme-secondary: 245 243 239;    /* Warm cream */
--theme-accent: 184 134 11;        /* Elegant gold */
--theme-neutral-dark: 78 70 65;    /* Dark brown */
--theme-neutral-light: 250 248 246; /* Off white */
```

### Tipografía
- **Fuente principal**: Playfair Display (serif) para títulos
- **Fuente secundaria**: Inter (sans-serif) para texto
- **Pesos disponibles**: 300-700 (light a bold)
- **Estilo predeterminado**: Regular (400) para texto, Medium (500) para títulos

### Espaciado
- **Secciones**: Padding aumentado (5rem vs 3rem)
- **Cards**: Mayor padding interno (2rem vs 1.5rem)
- **Elementos**: Más espacio entre componentes
- **Grilla**: Gap aumentado entre productos

### Clases Utilitarias
- `.btn-boutique-primary`: Botón principal elegante
- `.btn-boutique-secondary`: Botón secundario refinado
- `.btn-boutique-outline`: Botón con borde dorado
- `.card-boutique`: Contenedor con estilo premium
- `.separator-elegant`: Separador decorativo
- `.text-serif`: Aplicar tipografía serif
- `.hover-elegant`: Efecto hover sofisticado

## Paleta de Colores

### Primarios
- **Taupe cálido** (#8B7D6B): Color principal elegante
- **Crema cálida** (#F5F3EF): Fondo suave y cálido
- **Dorado elegante** (#B8860B): Acentos premium

### Neutros
- **Marrón oscuro** (#4E4641): Texto principal
- **Gris cálido** (#A39B95): Texto secundario
- **Blanco roto** (#FAF8F6): Fondos alternos

### Estados
- **Éxito**: Verde oliva (#6B8E23)
- **Advertencia**: Ámbar (#D2691E)
- **Error**: Rojo ladrillo (#A0522D)

## Personalización

### Colores
Modifica las variables CSS en `styles.css` para cambiar la paleta:

```css
:root {
  --theme-primary: TU_COLOR_PRIMARIO;
  --theme-secondary: TU_COLOR_SECUNDARIO;
  --theme-accent: TU_COLOR_ACENTO;
}
```

### Tipografía
Cambiar las fuentes editando las variables:

```css
:root {
  --theme-font-heading: 'Tu Fuente Serif', serif;
  --theme-font-body: 'Tu Fuente Sans', sans-serif;
}
```

### Espaciado
Ajustar el espaciado del tema:

```css
:root {
  --theme-section-padding: TU_PADDING;
  --theme-card-padding: TU_PADDING_CARD;
}
```

## Target Audience

Este tema es ideal para:
- **Tiendas de moda premium**
- **Boutiques de joyería**
- **Cosméticos y belleza**
- **Artículos de lujo**
- **Productos artesanales premium**
- **Marcas que buscan transmitir sofisticación**

## Tecnologías

- **Next.js 14**: Framework de React
- **Tailwind CSS**: Estilos utilitarios con customización
- **TypeScript**: Tipado estático
- **CSS Variables**: Personalización dinámica del tema
- **Custom CSS**: Estilos específicos del tema

## Compatibilidad

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Móviles (iOS Safari, Chrome Mobile)
- ✅ Tablets (iPad, Android tablets)

## Instalación

El tema se incluye automáticamente con Shopifree. Para usarlo:

1. En el dashboard, ve a **Diseño de Tienda**
2. Selecciona **Elegant Boutique**
3. Guarda los cambios
4. Los cambios se aplicarán inmediatamente a tu tienda

## Desarrollo

Para modificar el tema:

1. Edita los archivos en `themes/elegant-boutique/`
2. Los cambios se reflejan automáticamente en desarrollo
3. Usa las variables CSS definidas para mantener consistencia
4. Sigue las guías de estilo del tema para nuevos componentes

## Características Únicas

### vs Base Default
- **Espaciado**: 40% más espacio entre elementos
- **Tipografía**: Fuentes serif para mayor elegancia
- **Colores**: Paleta cálida vs neutra fría
- **Layout**: Logo centrado vs izquierda
- **Botones**: Diseño más refinado con acentos dorados

### Elementos Distintivos
- Separadores decorativos entre secciones
- Badges de productos con estilo premium
- Efectos hover más sutiles y elegantes
- Mayor énfasis en imágenes de productos
- Navegación con mayor jerarquía visual

## Soporte

Si encuentras problemas o tienes sugerencias para el tema Elegant Boutique, consulta la documentación completa de Shopifree o contacta al equipo de soporte. 