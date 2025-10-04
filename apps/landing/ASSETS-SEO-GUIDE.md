# Guía de Assets para SEO y PWA - Shopifree Landing

Esta guía explica cómo crear los assets necesarios para completar la optimización SEO y PWA de la landing page.

## 📋 Assets Requeridos

### 1. Iconos PWA

Necesitas crear los siguientes iconos basados en el logo de Shopifree:

#### **icon-192.png** (192×192px)
- **Uso:** Icon principal para PWA en dispositivos Android
- **Formato:** PNG con fondo transparente o de color #4F46E5 (theme color)
- **Área segura:** Mantén el logo dentro de un círculo de 144px de diámetro centrado

#### **icon-512.png** (512×512px)
- **Uso:** Icon de alta resolución para splash screens
- **Formato:** PNG con fondo transparente o de color #4F46E5
- **Área segura:** Mantén el logo dentro de un círculo de 384px de diámetro centrado

#### **apple-touch-icon.png** (180×180px)
- **Uso:** Icon para dispositivos iOS cuando se agrega a pantalla de inicio
- **Formato:** PNG con esquinas cuadradas (iOS las redondea automáticamente)
- **Fondo:** Preferiblemente blanco o color de marca

#### **icon-96.png** (96×96px)
- **Uso:** Icon para shortcuts en manifest.json
- **Formato:** PNG con fondo transparente o de color

### 2. Open Graph Image

#### **og-image.png** (1200×630px)
- **Uso:** Imagen para compartir en redes sociales (Facebook, Twitter, LinkedIn)
- **Formato:** PNG o JPG
- **Diseño recomendado:**
  ```
  ┌─────────────────────────────────┐
  │                                 │
  │         LOGO SHOPIFREE          │
  │                                 │
  │   Crea tu Tienda Online Gratis  │
  │     Sin comisiones por venta    │
  │                                 │
  │         shopifree.app           │
  │                                 │
  └─────────────────────────────────┘
  ```
- **Área segura:** Deja 120px de padding en los bordes
- **Texto:** Grande y legible (mínimo 48px para títulos)
- **Colores:** Usa la paleta de marca (#4F46E5, #10B981)

### 3. Screenshots para PWA (Opcional pero recomendado)

#### **screenshot-1.png** (1280×720px)
- **Uso:** Screenshot desktop para PWA install prompt
- **Contenido:** Captura de la homepage en desktop

#### **screenshot-2.png** (750×1334px)
- **Uso:** Screenshot mobile para PWA install prompt
- **Contenido:** Captura de la homepage en móvil

---

## 🛠️ Herramientas Recomendadas

### Opción 1: Diseño Manual
- **Figma** o **Adobe Photoshop**
- Usa el logo existente en `/public/logo-primary.png`
- Exporta en los tamaños especificados

### Opción 2: Generadores Online

#### Para Iconos PWA:
- [RealFaviconGenerator](https://realfavicongenerator.net/)
  - Sube el logo
  - Configura opciones para iOS, Android, Windows
  - Descarga el paquete completo

- [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator)
  - Sube logo de alta resolución (512×512 mínimo)
  - Genera todos los tamaños automáticamente

#### Para Open Graph Image:
- [Canva](https://www.canva.com/) (plantillas gratuitas)
- [OG Image Generator](https://og-playground.vercel.app/)
- [Social Image Generator](https://www.bannerbear.com/tools/social-media-image-generator/)

### Opción 3: Script Automatizado (Avanzado)

Si tienes Node.js y Sharp instalado:

```bash
npm install sharp
```

Crear script `generate-icons.js`:

```javascript
const sharp = require('sharp');
const fs = require('fs');

const sizes = [96, 192, 512, 180];
const inputFile = 'logo-source.png'; // Tu logo en alta resolución

sizes.forEach(size => {
  const outputName = size === 180 ? 'apple-touch-icon' : `icon-${size}`;

  sharp(inputFile)
    .resize(size, size, {
      fit: 'contain',
      background: { r: 79, g: 70, b: 229, alpha: 1 } // #4F46E5
    })
    .toFile(`public/${outputName}.png`)
    .then(() => console.log(`✓ ${outputName}.png creado`))
    .catch(err => console.error(err));
});
```

Ejecutar:
```bash
node generate-icons.js
```

---

## 📍 Ubicación de los Assets

Todos los assets deben ir en la carpeta `public/`:

```
apps/landing/public/
├── icon-96.png
├── icon-192.png
├── icon-512.png
├── apple-touch-icon.png
├── og-image.png
├── screenshot-1.png (opcional)
└── screenshot-2.png (opcional)
```

---

## ✅ Validación

Una vez creados los assets, valida que funcionan:

### 1. PWA Icons
- Chrome DevTools → Application → Manifest
- Verifica que todos los iconos se carguen correctamente

### 2. Open Graph
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

### 3. Apple Touch Icon
- Safari en iOS → Compartir → Agregar a pantalla de inicio
- Verifica que el icon se vea bien

---

## 🎨 Especificaciones de Diseño

### Colores de Marca
```css
--primary: #4F46E5 (Indigo)
--secondary: #06B6D4 (Cyan)
--accent: #F59E0B (Amber)
--success: #10B981 (Emerald)
```

### Tipografía
- Font: Inter (ya está cargada)
- Peso: 300-700

### Logo
- Archivo actual: `/public/logo-primary.png`
- Si necesitas vector: solicita el SVG original

---

## 📊 Checklist Final

- [ ] icon-96.png creado y ubicado en /public/
- [ ] icon-192.png creado y ubicado en /public/
- [ ] icon-512.png creado y ubicado en /public/
- [ ] apple-touch-icon.png creado y ubicado en /public/
- [ ] og-image.png creado y ubicado en /public/
- [ ] Validar manifest.json en Chrome DevTools
- [ ] Probar OG image en Facebook Debugger
- [ ] Verificar build de Next.js sin errores

---

## 🚀 Próximos Pasos Después de Crear Assets

1. **Actualizar Google Search Console**
   - Ir a [Google Search Console](https://search.google.com/search-console)
   - Agregar propiedad para shopifree.app
   - Copiar código de verificación
   - Reemplazar en `apps/landing/app/[locale]/layout.tsx` línea 89

2. **Configurar Google Analytics 4**
   - Crear cuenta en [Google Analytics](https://analytics.google.com)
   - Obtener Measurement ID (G-XXXXXXXXXX)
   - Agregar script de tracking al layout

3. **Configurar Meta Pixel (Opcional)**
   - Crear pixel en [Facebook Business](https://business.facebook.com)
   - Agregar código de pixel al layout

---

## 💡 Tips Adicionales

- **Consistencia:** Usa el mismo logo en todos los tamaños
- **Optimización:** Comprime las imágenes con [TinyPNG](https://tinypng.com/)
- **Testing:** Prueba en diferentes dispositivos antes de deploy
- **Actualización:** Si cambias el logo, actualiza todos los iconos

---

## 📞 Soporte

Si necesitas ayuda con el diseño o generación de assets:
1. Usa las herramientas online recomendadas
2. Consulta con el equipo de diseño
3. Revisa la documentación de [PWA Builder](https://www.pwabuilder.com/documentation)
