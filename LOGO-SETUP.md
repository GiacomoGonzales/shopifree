# 🎨 Guía de Setup de Logo - Shopifree

¡Perfecto! He creado toda la estructura de carpetas para organizar el logo y assets de tu proyecto.

## 📁 Estructura creada:

```
Shopifree/
├── public/brand/                 # 🌟 Assets compartidos del proyecto
│   ├── README.md                 # Documentación completa
│   ├── logos/                    # Logos principales
│   ├── icons/                    # Iconos y favicons
│   ├── colors/                   # Paleta de colores
│   │   └── brand-colors.json     # ✅ Ya configurado
│   └── [AQUÍ TUS LOGOS] 📤
│
└── apps/dashboard/public/        # 📱 Assets específicos del dashboard
    ├── README.md                 # Guía del dashboard
    └── [AQUÍ TUS LOGOS] 📤
```

## 🎯 ¿Dónde poner tus archivos de logo?

### Opción 1: Solo para Dashboard
```
apps/dashboard/public/
├── logo.png              # ⬅️ SUBE TU LOGO AQUÍ
├── logo-white.png         # Para dark mode (opcional)
├── logo-icon.png          # Solo ícono
└── favicon.ico            # Para el navegador
```

### Opción 2: Para todo el proyecto (Recomendado)
```
public/brand/logos/
├── logo-primary.png       # ⬅️ SUBE TU LOGO AQUÍ
├── logo-white.png         # Para dark mode
├── logo-icon.png          # Solo ícono
└── logo-full.svg          # Versión vectorial
```

## 📐 Especificaciones recomendadas:

- **📏 Tamaño logo principal**: 240x80px (máximo)
- **🖼️ Formato**: PNG con fondo transparente
- **⚖️ Peso**: Menos de 50KB por archivo
- **🎨 Ícono**: 64x64px cuadrado

## 🚀 Próximos pasos:

1. **📤 Sube tu logo** a una de las carpetas indicadas
2. **📝 Avísame el nombre del archivo** (ej: "logo.png")
3. **⚡ Yo integraré automáticamente** el logo en:
   - ✅ Sidebar del dashboard
   - ✅ Header superior
   - ✅ Favicon del navegador
   - ✅ Responsivo para móvil

## 💡 Recomendación:

**Usa la Opción 2** (`public/brand/logos/`) si planeas usar el mismo logo en:
- Landing page
- Dashboard
- Tienda pública
- Admin panel

De esta forma tendrás todo centralizado y organizado.

---

**¿Ya tienes tu logo listo? ¡Súbelo y me avisas!** 🎉 