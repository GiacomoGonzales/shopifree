# 🚀 Guía Completa: Configurar Google Search Console para Shopifree

## ✅ **CORRECCIONES IMPLEMENTADAS**

### **1. 🔥 Problema Crítico Resuelto: Meta Robots `noindex`**

**ANTES:** 
```html
<meta name="robots" content="noindex"/>
```

**DESPUÉS:**
```html
<meta name="robots" content="index, follow"/>
```

**✅ SOLUCIÓN APLICADA:**
- Mejorada lógica de detección de versión canónica
- Permitir indexación en desarrollo local
- Solo aplicar `noindex` cuando específicamente esté configurado

### **2. 🔧 Mejoras en la Detección Canónica**

**Ahora considera canónica si:**
- Es exactamente el host canónico
- Es desarrollo local (`localhost` o `127.0.0.1`)
- Es el mismo dominio sin protocolo (para single locale URLs)

### **3. 🛠️ Scripts de Verificación SEO**

**Scripts creados:**
- `apps/public-store-v2/scripts/verify-seo-gsc.js` - Verificación completa
- `apps/public-store-v2/scripts/quick-seo-check.sh` - Verificación rápida local

---

## 📋 **PASOS PARA REGISTRAR EN GOOGLE SEARCH CONSOLE**

### **Paso 1: Preparar tu Tienda**

#### **1.1 Configurar SEO en Dashboard**
```
Dashboard > Configuración > SEO y Metadatos
```

**Configuración Básica:**
- **Título:** "Mi Tienda - Productos Increíbles"
- **Descripción:** "Descubre nuestra selección de productos de calidad premium..."
- **Palabras clave:** "productos, tienda online, compras"

**Configuración Avanzada:**
- **Robots:** `index, follow` ✅
- **URL Canónica:** Dejar vacío (se configura automáticamente)
- **Datos Estructurados:** Activado ✅

#### **1.2 Configurar Imagen Open Graph**
```
Dashboard > Configuración > SEO y Metadatos > Imagen Open Graph
```
- Subir imagen 1200x630px
- Formato: JPG/PNG
- Tamaño máximo: 2MB

#### **1.3 Configurar Favicon**
```
Dashboard > Configuración > Branding > Favicon
```
- Subir imagen 32x32px o 64x64px
- Formato: PNG/ICO

### **Paso 2: Registrar en Google Search Console**

#### **2.1 Acceder a Google Search Console**
1. Ir a: https://search.google.com/search-console/
2. Iniciar sesión con tu cuenta de Google
3. Hacer clic en "Agregar propiedad"

#### **2.2 Agregar tu Tienda como Propiedad**

**Opción A: Dominio Personalizado**
```
Tipo: URL Prefix
URL: https://tudominio.com
```

**Opción B: Subdominio Shopifree**
```
Tipo: URL Prefix
URL: https://tutienda.shopifree.app
```

#### **2.3 Verificar Propiedad con Meta Tag**

1. **Seleccionar método:** "Meta tag HTML"
2. **Copiar el token:** Copiar solo el token (sin la etiqueta completa)
   ```html
   <!-- Google te dará esto: -->
   <meta name="google-site-verification" content="ABC123DEF456..." />
   
   <!-- Solo copiar: -->
   ABC123DEF456...
   ```

3. **Agregar al Dashboard:**
   ```
   Dashboard > Configuración > Integraciones > Google Search Console
   Pegar: ABC123DEF456...
   Guardar
   ```

4. **Verificar en Google:** Hacer clic en "Verificar"

### **Paso 3: Configurar Sitemap**

#### **3.1 URLs de Sitemap Automáticas**

**Tu sitemap se genera automáticamente en:**
- `https://tutienda.shopifree.app/sitemap.xml` (subdominio)
- `https://tudominio.com/sitemap.xml` (dominio personalizado)

#### **3.2 Enviar Sitemap a Google**

1. **En Google Search Console**, ir a "Sitemaps"
2. **Agregar sitemap:** Escribir `sitemap.xml`
3. **Enviar**

**¡El sitemap incluye automáticamente:**
- Página principal
- Todas las categorías
- Todos los productos
- URLs limpias (con o sin prefijos de idioma según configuración)
- Hreflang para tiendas multi-idioma

### **Paso 4: Verificar Configuración**

#### **4.1 Ejecutar Verificación Local**
```bash
# En desarrollo
./apps/public-store-v2/scripts/quick-seo-check.sh

# En producción
node apps/public-store-v2/scripts/verify-seo-gsc.js
```

#### **4.2 Verificar Manualmente**

**✅ Checklist de Verificación:**

1. **Meta Robots:**
   ```bash
   curl -s https://tutienda.shopifree.app | grep robots
   # Debe mostrar: content="index, follow"
   ```

2. **Google Verification:**
   ```bash
   curl -s https://tutienda.shopifree.app | grep google-site-verification
   # Debe mostrar tu token
   ```

3. **Sitemap XML:**
   ```bash
   curl -I https://tutienda.shopifree.app/sitemap.xml
   # Debe mostrar: 200 OK y Content-Type: application/xml
   ```

4. **Robots.txt:**
   ```bash
   curl -s https://tutienda.shopifree.app/robots.txt
   # Debe incluir: Sitemap: https://tutienda.shopifree.app/sitemap.xml
   ```

5. **No es 404:**
   ```bash
   curl -s https://tutienda.shopifree.app | grep "Página no encontrada"
   # No debe mostrar nada (sin resultados = ✅)
   ```

---

## 🚨 **PROBLEMAS COMUNES Y SOLUCIONES**

### **Problema 1: Página muestra "Página no encontrada"**

**Causa:** Configuración incorrecta de routing o subdomain no existe

**Soluciones:**
1. Verificar que el subdomain existe en Firebase
2. Verificar configuración en `canonical-resolver.ts`
3. Ejecutar: `node scripts/fix-gsc-tokens.js` si hay problemas de datos

### **Problema 2: Meta robots sigue siendo `noindex`**

**Causa:** Lógica de `isCanonicalVersion` no detecta correctamente

**Soluciones:**
1. Verificar logs del servidor:
   ```javascript
   console.log('🔍 [Layout] Store resuelto:', { 
     isCanonicalVersion,
     currentHost,
     canonicalHost,
     finalRobots 
   });
   ```

2. Si es dominio personalizado, verificar que esté configurado como "connected" en Firebase

### **Problema 3: Google Search Console no puede verificar**

**Posibles causas:**
1. Token mal copiado (con espacios o caracteres extra)
2. Token no guardado correctamente en Firebase
3. Página no accesible para Googlebot

**Soluciones:**
1. Volver a copiar el token limpio
2. Verificar que se guarde en `stores/{storeId}/settings/seo`
3. Probar acceso con User-Agent Googlebot:
   ```bash
   curl -H "User-Agent: Googlebot" https://tutienda.shopifree.app
   ```

### **Problema 4: Sitemap vacío o sin URLs**

**Causas:**
- No hay productos/categorías publicados
- Problemas de permisos de Firebase
- Error en generación de sitemap

**Soluciones:**
1. Verificar que hay productos/categorías en el Dashboard
2. Revisar logs de `sitemap.xml/route.ts`
3. Verificar configuración de Firebase Rules

---

## 📈 **SEGUIMIENTO Y MONITOREO**

### **Después del Registro:**

1. **Esperar indexación:** Google puede tardar 1-7 días en indexar
2. **Monitorear cobertura:** Ver "Cobertura" en Google Search Console
3. **Verificar URLs:** Usar "Inspección de URLs" para páginas específicas
4. **Revisar errores:** Verificar sección "Errores" regularmente

### **Métricas Importantes:**

- **Páginas indexadas:** Debe aumentar gradualmente
- **Errores 404:** Deben ser mínimos
- **Sitemap procesado:** Estado "Correcto"
- **Velocidad de páginas:** Core Web Vitals

---

## 🎯 **OPTIMIZACIONES ADICIONALES**

### **SEO Avanzado:**
1. Configurar **Google Analytics GA4**
2. Agregar **Meta Pixel** (Facebook)
3. Configurar **TikTok Pixel**
4. Habilitar **Datos Estructurados** (Schema.org)

### **Rendimiento:**
1. Optimizar imágenes (Cloudinary automático)
2. Configurar **CDN** para dominio personalizado
3. Monitorear **Core Web Vitals**

### **Contenido:**
1. Agregar descripciones ricas a productos
2. Crear páginas de contenido (Blog/Nosotros)
3. Optimizar títulos y descripciones por categoría

---

## 📞 **SOPORTE**

Si tienes problemas:

1. **Verificar logs:** Revisar consola del navegador y servidor
2. **Ejecutar scripts:** Usar scripts de verificación incluidos
3. **Documentar error:** Copiar mensajes de error exactos
4. **Probar en incognito:** Verificar que no sea problema de caché

**Scripts útiles:**
```bash
# Verificación completa
node apps/public-store-v2/scripts/verify-seo-gsc.js

# Verificación rápida local
./apps/public-store-v2/scripts/quick-seo-check.sh

# Limpiar tokens GSC corruptos
node scripts/fix-gsc-tokens.js
```

---

✅ **Tu tienda ahora está optimizada para Google Search Console con todas las correcciones aplicadas**
