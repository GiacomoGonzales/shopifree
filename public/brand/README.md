# Shopifree Brand Assets

Esta carpeta contiene los recursos de marca compartidos para todo el proyecto Shopifree.

## 🎨 Estructura de archivos:

```
public/brand/
├── logos/
│   ├── logo-primary.png      # Logo principal
│   ├── logo-white.png        # Logo blanco
│   ├── logo-dark.png         # Logo oscuro
│   ├── logo-icon.png         # Solo ícono
│   └── logo-full.svg         # Versión vectorial completa
├── icons/
│   ├── favicon.ico           # 32x32px
│   ├── icon-192.png          # PWA icon
│   └── icon-512.png          # PWA icon grande
└── colors/
    └── brand-colors.json     # Paleta de colores oficial
```

## 📏 Especificaciones de logos:

### Logo Principal (`logo-primary.png`)
- **Tamaño**: 240x80px (3:1 ratio)
- **Formato**: PNG con fondo transparente
- **Uso**: Landing page, dashboard header

### Logo Blanco (`logo-white.png`)
- **Tamaño**: 240x80px
- **Formato**: PNG con fondo transparente
- **Uso**: Fondos oscuros, dark mode

### Logo Ícono (`logo-icon.png`)
- **Tamaño**: 64x64px (cuadrado)
- **Formato**: PNG con fondo transparente
- **Uso**: Favicon, app icons, botones pequeños

### Logo Vectorial (`logo-full.svg`)
- **Formato**: SVG optimizado
- **Uso**: Escalado infinito, impresión

## 🎨 Paleta de colores:

Los colores oficiales se definirán en `colors/brand-colors.json`:

```json
{
  "primary": "#4F46E5",
  "secondary": "#06B6D4", 
  "accent": "#F59E0B",
  "neutral": {
    "50": "#F9FAFB",
    "900": "#111827"
  }
}
```

## 📱 Apps que usan estos assets:

- **Dashboard**: `/apps/dashboard/`
- **Landing**: `/apps/landing/`
- **Public Store**: `/apps/public-store/`
- **Admin**: `/apps/admin/`

> Estos archivos se copiarán automáticamente a cada app cuando sea necesario. 