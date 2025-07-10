# Tema Base Default - Shopifree

## Descripción

El tema **Base Default** es un diseño moderno y minimalista inspirado en el dashboard de Shopifree. Presenta un estilo limpio con colores neutrales, tipografía delgada y un enfoque en la experiencia del usuario.

## Características

### Diseño
- **Estilo minimalista**: Diseño limpio y sin distracciones
- **Colores neutrales**: Paleta de grises y blancos con acentos discretos
- **Tipografía delgada**: Fuentes ligeras que transmiten elegancia
- **Layout responsivo**: Adaptado para móviles, tablets y escritorio

### Header
- **Header fijo**: Se mantiene visible durante el scroll
- **Efecto glassmorphism**: Fondo semitransparente con blur
- **Navegación limpia**: Menú horizontal en desktop, drawer en móvil
- **Iconos modernos**: SVG icons con animaciones sutiles

### Componentes
- **Cards modernas**: Bordes suaves y sombras sutiles
- **Botones elegantes**: Transiciones suaves y estados hover
- **Grilla de productos**: Layout modular y adaptativo
- **Animaciones**: Efectos fade-in y slide-up

### Footer
- **Newsletter**: Sección de suscripción integrada
- **Enlaces organizados**: Navegación y información de contacto
- **Responsive**: Adapta columnas según el tamaño de pantalla

## Estructura de Archivos

```
themes/base-default/
├── Layout.tsx       # Componente principal del layout
├── Home.tsx         # Página de inicio
└── README.md        # Este archivo
```

## Colores y Estilos

### Variables CSS
El tema utiliza variables CSS definidas en `globals.css`:

```css
--background: 255 255 255;     /* Blanco puro */
--foreground: 23 23 23;        /* Negro suave */
--muted: 248 250 252;          /* Gris muy claro */
--primary: 23 23 23;           /* Negro suave como primario */
--border: 229 231 235;         /* Gris claro para bordes */
```

### Tipografía
- **Fuente**: System fonts (San Francisco, Segoe UI, Roboto)
- **Pesos disponibles**: 100-900 (hairline a black)
- **Estilo predeterminado**: Light (300) para texto normal

### Clases Utilitarias
- `.btn-primary`: Botón principal
- `.btn-secondary`: Botón secundario  
- `.btn-outline`: Botón con borde
- `.card`: Contenedor con estilo de tarjeta
- `.hover-lift`: Efecto de elevación en hover
- `.hover-scale`: Efecto de escala en hover

## Personalización

### Colores
Modifica las variables CSS en `globals.css` para cambiar la paleta de colores:

```css
:root {
  --primary: TU_COLOR_PRIMARIO;
  --background: TU_COLOR_DE_FONDO;
  /* ... más variables */
}
```

### Layout
El archivo `Layout.tsx` contiene:
- Header con navegación
- Contenido principal
- Footer con enlaces

### Componentes
- **Icons**: SVG inline para mejor rendimiento
- **Responsive**: Breakpoints estándar de Tailwind
- **Accessibility**: Elementos semánticos y navegación por teclado

## Tecnologías

- **Next.js 14**: Framework de React
- **Tailwind CSS**: Estilos utilitarios
- **TypeScript**: Tipado estático
- **CSS Variables**: Personalización dinámica

## Compatibilidad

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+
- ✅ Móviles (iOS Safari, Chrome Mobile)

## Instalación

El tema se incluye automáticamente con Shopifree. Para usarlo:

1. En el dashboard, ve a **Diseño de Tienda**
2. Selecciona **Base Default**
3. Guarda los cambios

## Desarrollo

Para modificar el tema:

1. Edita los archivos en `themes/base-default/`
2. Los cambios se reflejan automáticamente en desarrollo
3. Usa las clases de Tailwind definidas en `tailwind.config.js`

## Soporte

Si encuentras problemas o tienes sugerencias, consulta la documentación completa de Shopifree o contacta al equipo de soporte. 