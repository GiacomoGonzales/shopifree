# 🚀 Recomendaciones de Caching para Single Locale URLs

## 📝 Resumen

Con la migración a single locale URLs, es importante revisar las estrategias de cache para asegurar que:
1. Los datos se invaliden correctamente cuando cambie `primaryLocale`
2. El sitemap.xml se regenere al cambiar la configuración
3. Los metadatos (canonical, lang, og:locale) se actualicen correctamente

## 🔧 Configuraciones Actuales

### Middleware Cache
- ✅ **Store Config Cache**: 5 minutos en `middleware.ts`
- ✅ **Custom Domain Cache**: 5 minutos en `middleware.ts`
- ⚠️  **Considerar**: TTL más corto (1-2 min) para desarrollo/testing

### Páginas Estáticas
Las páginas actualmente usan:
- **SSR dinámico** por defecto (no ISR)
- **Metadata** generada en tiempo real
- **Sitemap** generado dinámicamente

## 📋 Recomendaciones de Mejora

### 1. Cache por Configuración de Tienda

```typescript
// En app/[storeSubdomain]/layout.tsx - AÑADIR
export const revalidate = 300; // 5 minutos

// En app/[storeSubdomain]/page.tsx - AÑADIR
export const revalidate = 600; // 10 minutos para home

// En app/[storeSubdomain]/categoria/[categorySlug]/page.tsx - AÑADIR
export const revalidate = 300; // 5 minutos para categorías

// En app/[storeSubdomain]/producto/[productSlug]/page.tsx - AÑADIR
export const revalidate = 300; // 5 minutos para productos
```

### 2. Cache Invalidation por Cambios

Crear webhook/trigger para invalidar cache cuando:

```typescript
// scripts/invalidate-cache-on-config-change.js
async function invalidateStoreCache(storeId, changes) {
  if (changes.includes('primaryLocale')) {
    // Invalidar cache en Vercel
    await fetch(`https://api.vercel.com/v1/purge?token=${VERCEL_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tags: [`store:${storeId}`, `sitemap:${storeId}`]
      })
    });
  }
}
```

### 3. Sitemap Cache Inteligente

```typescript
// En app/sitemap.xml/route.ts - MEJORAR
export const revalidate = 3600; // 1 hora

// Añadir cache tags
export async function GET(request: Request) {
  const canonical = await getCanonicalHost(storeSubdomain);
  
  // Cache por configuración específica
  const cacheKey = `sitemap:${canonical.storeId}:${primaryLocale}`;
  
  // ... resto del código
}
```

### 4. Headers de Cache Optimizados

```typescript
// En middleware.ts - AÑADIR
function addCacheHeaders(response: NextResponse, cacheType: string) {
  if (cacheType === 'static') {
    response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=3600');
  } else if (cacheType === 'dynamic') {
    response.headers.set('Cache-Control', 'public, max-age=60, s-maxage=300');
  }
  return response;
}
```

### 5. Edge Cache por Región

```typescript
// next.config.js - CONSIDERAR
module.exports = {
  experimental: {
    edgeRuntime: 'nodejs', // Para middleware
  },
  headers: async () => [
    {
      source: '/sitemap.xml',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=3600, s-maxage=3600'
        }
      ]
    },
    {
      source: '/((?!api|_next|admin).*)',
      headers: [
        {
          key: 'Cache-Control', 
          value: 'public, max-age=60, s-maxage=300'
        }
      ]
    }
  ]
};
```

## ⚠️ Consideraciones Especiales

### Cache Busting al Cambiar Configuración
```typescript
// Función para invalidar cache específico de tienda
async function bustStoreCache(storeId: string, reason: string) {
  console.log(`🔄 Invalidando cache para ${storeId}: ${reason}`);
  
  // Invalidar en Vercel/CDN
  await fetch('/api/revalidate', {
    method: 'POST',
    body: JSON.stringify({ 
      tags: [`store:${storeId}`, `locale:${storeId}`] 
    })
  });
}
```

### Rollout Gradual con Cache
```typescript
// Durante el rollout, cache más corto
const getCacheTime = (storeId: string) => {
  const isInPilotGroup = PILOT_STORES.includes(storeId);
  return isInPilotGroup ? 60 : 300; // 1 min vs 5 min
};
```

## 🧪 Testing de Cache

### Scripts de Validación
```bash
# Verificar headers de cache
curl -I https://mitienda.shopifree.app/ | grep -i cache

# Verificar invalidación después de cambio
# 1. Cambiar primaryLocale en Firestore
# 2. Esperar TTL del cache (5 min)
# 3. Verificar que HTML lang cambió
curl -s https://mitienda.shopifree.app/ | grep -o '<html[^>]*lang="[^"]*"'
```

### Monitoreo Post-Deployment
```typescript
// Añadir logging en middleware
console.log(`🎯 Cache hit/miss for ${storeId}: ${cacheStatus}`);

// Métricas en layout
console.log(`⏱️ Metadata generation time: ${Date.now() - startTime}ms`);
```

## 📊 Métricas a Monitorear

Post-deployment, monitorear:
- **Cache Hit Rate**: % de requests que usan cache
- **TTFB (Time to First Byte)**: Latencia tras cambios de cache
- **Sitemap Generation Time**: Tiempo de generación dinâmica
- **404 Rate**: Asegurar que redirects 301 funcionan
- **GSC Indexing**: Velocidad de re-indexación con nuevas URLs

## 🚀 Implementación Gradual

1. **Fase 1**: Añadir revalidate a páginas principales (layout, home)
2. **Fase 2**: Optimizar sitemap caching con tags
3. **Fase 3**: Implementar cache invalidation por webhooks
4. **Fase 4**: Monitorear y ajustar TTLs según métricas

---

**Nota**: Estas son recomendaciones para optimizar el rendimiento. La implementación actual funciona correctamente sin estas mejoras, pero pueden reducir la latencia y mejorar la experiencia del usuario.
