# PR1: Single Locale URLs - Infraestructura y Compatibilidad

## 🎯 Objetivo
Habilitar URLs sin prefijo de idioma para tiendas que activen la feature flag `singleLocaleUrls`, sin mover los archivos de páginas. Servir contenido en `/` vía rewrite interno al árbol existente `/{primaryLocale}/...`, y aplicar 301 desde `/{locale}/...` → `/...`.

## 📁 Archivos Modificados

### 1. `apps/public-store-v2/lib/store.ts`
**Nuevas funciones añadidas:**
- ✅ `getPrimaryLocale(storeData)`: Extrae idioma primario de `advanced.language` o `seo.language`
- ✅ `hasSingleLocaleUrls(storeData)`: Verifica si flag `advanced.singleLocaleUrls` está activa
- ✅ `getStoreLocaleConfig(storeId)`: Función async para obtener configuración completa
- ✅ Tipo `ValidLocale = 'es' | 'en' | 'pt'`

### 2. `apps/public-store-v2/middleware.ts`
**Lógica completamente refactorizada:**
- ✅ Cache de configuración de tienda: `storeConfigCache`
- ✅ Función `getStoreConfigCached()`: Obtiene primaryLocale y singleLocaleUrls de Firestore
- ✅ **NUEVA LÓGICA Single Locale URLs**:
  - Rewrite interno: `/(.*) → /{primaryLocale}/{storeSubdomain}/(.*)` 
  - Redirect 301: `/{locale}/(.*) → /(.*)` para es|en|pt
- ✅ **LÓGICA LEGACY**: Mantiene comportamiento actual para tiendas sin flag
- ✅ Excluye `/dashboard`, `/api`, `/_next`, archivos estáticos

### 3. `apps/public-store-v2/app/[locale]/[storeSubdomain]/layout.tsx`
**generateMetadata actualizado:**
- ✅ Obtiene configuración `singleLocaleUrls` y `primaryLocale` 
- ✅ **Canonical URL**: Sin prefijo cuando `singleLocaleUrls = true`
- ✅ **hreflang**: Solo se genera si `singleLocaleUrls = false`
- ✅ **og:locale**: Usa `effectiveLocale` basado en configuración
- ✅ **HTML lang**: `<html lang="{primaryLocale}">` en SSR
- ✅ **GSC verification**: Mantiene funcionalidad existente

### 4. `apps/public-store-v2/app/sitemap.xml/route.ts`
**Generación condicional de sitemap:**
- ✅ `generateSingleLocaleSitemap()`: URLs sin prefijo (ej: `/categoria/vestidos`)
- ✅ `generateMultiLocaleSitemap()`: URLs con prefijo y hreflang (comportamiento actual)
- ✅ Detección automática según flag `singleLocaleUrls`
- ✅ Sin X-Robots-Tag noindex

### 5. `apps/public-store-v2/app/robots.txt/route.ts`
**Mejoras menores:**
- ✅ `Content-Type: text/plain; charset=utf-8`
- ✅ Mantiene funcionalidad existente (apunta a sitemap.xml)

### 6. `scripts/check-single-locale.sh` (NUEVO)
**Script de validación automática:**
- ✅ Verifica que `/` responde 200
- ✅ Verifica que `/es` redirige 301 → `/`
- ✅ Canonical sin prefijo de idioma
- ✅ `<html lang>` correcto y GSC verification
- ✅ Sitemap sin prefijos `/es|/en|/pt`
- ✅ Headers correctos (sin X-Robots-Tag noindex)
- ✅ robots.txt accesible

## 🚀 Cómo Activar la Feature Flag

### Opción 1: Dashboard (Recomendado)
```typescript
// En el dashboard, añadir toggle en configuración avanzada
// Actualizar: stores/{storeId}/advanced/singleLocaleUrls = true
// Verificar: stores/{storeId}/advanced/language = 'es'|'en'|'pt'
```

### Opción 2: Firestore Directo
```javascript
// En Firebase Console → Firestore → stores/{storeId}
{
  "advanced": {
    "singleLocaleUrls": true,
    "language": "es"  // o 'en', 'pt'
  }
}
```

### Opción 3: Script de migración
```javascript
// scripts/enable-single-locale.js
const admin = require('firebase-admin');

async function enableSingleLocale(storeId, primaryLocale = 'es') {
  await admin.firestore()
    .collection('stores')
    .doc(storeId)
    .update({
      'advanced.singleLocaleUrls': true,
      'advanced.language': primaryLocale
    });
  
  console.log(`✅ Single locale habilitado para ${storeId} con idioma ${primaryLocale}`);
}
```

## 🧪 Validación

### Ejecutar script de validación:
```bash
./scripts/check-single-locale.sh https://tienda-ejemplo.shopifree.app
```

### Checks manuales adicionales:
1. **Home sin prefijo**: `curl -I https://tienda.com/` → 200 OK
2. **Redirección compat**: `curl -I https://tienda.com/es` → 301 → `/`
3. **Canonical correcto**: View source → `<link rel="canonical" href="https://tienda.com/">`
4. **HTML lang**: View source → `<html lang="es">`
5. **Sitemap limpio**: `curl https://tienda.com/sitemap.xml` → Sin `/es/` o `/en/`

## ⚡ Criterios de Aceptación PR1

- [x] **Funcionalidad**: `/` responde 200 y muestra contenido correcto
- [x] **Redirección**: `/{locale}` devuelve 301 → `/` (sin bucles infinitos)
- [x] **SSR**: `<html lang>` = primaryLocale configurado en tienda
- [x] **SEO**: Canonical sin prefijo cuando singleLocaleUrls = true
- [x] **Sitemap**: URLs sin prefijo cuando flag activa, con prefijo cuando flag inactiva
- [x] **Headers**: Sin X-Robots-Tag noindex en sitemap.xml
- [x] **Compatibilidad**: No afecta `/api`, `/_next`, `/dashboard`
- [x] **Rollback**: Tiendas sin flag mantienen comportamiento actual

## 🔄 Siguiente Paso (PR2)
Mover estructura de archivos de `app/[locale]/[storeSubdomain]/*` → `app/[storeSubdomain]/*` y actualizar helpers de construcción de URLs en los temas.

---

**Desarrollado siguiendo las especificaciones del objetivo PR1** ✅
