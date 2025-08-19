# 🚀 Guía de Deployment - Single Locale URLs

## 📋 Resumen del PR3

**Estado**: ✅ COMPLETADO  
**Cambios principales**:
- ✅ Eliminado directorio `app/[locale]/` que causaba conflicto
- ✅ Simplificado `i18n.ts` para carga por `primaryLocale`
- ✅ Eliminadas importaciones obsoletas (`lib/locale-validation.ts`)
- ✅ Añadidos tests básicos para validación
- ✅ Documentación de caching y mejores prácticas

## 🎯 Plan de Rollout Gradual

### Fase 1: Deployment Silencioso (Sin Flag)
```bash
# 1. Deploy del código sin activar feature flags
git add .
git commit -m "feat: PR3 - Single locale URLs cleanup and testing"
git push origin main

# Vercel deployará automáticamente
# Todas las tiendas siguen comportamiento legacy (URLs con /es, /en)
```

### Fase 2: Piloto con TiendaVerde
```bash
# 2. Activar flag solo para TiendaVerde
node scripts/setup-test-store.js tienda-verde es

# 3. Validar con script automático
./scripts/check-single-locale.sh https://tiendaverde.shopifree.app

# 4. Monitoreo manual:
# - Verificar GSC no muestra errores 404
# - Verificar que sitemap.xml se actualiza
# - Verificar redirects 301 funcionan
```

### Fase 3: Rollout por Lotes
```bash
# Lote 1: 5-10 tiendas pequeñas
node scripts/setup-test-store.js tienda-1 es
node scripts/setup-test-store.js tienda-2 en
# ... continuar

# Lote 2: Tiendas medianas (después de 24h sin issues)
# Lote 3: Tiendas grandes y críticas (después de 48h)
```

### Fase 4: Migración Completa
```bash
# Una vez validado con todos los lotes:
# Activar flag para todas las tiendas restantes
# Eliminar código legacy en próximo PR
```

## 🛠️ Scripts de Deployment

### Script de Activación Individual
```bash
# Activar single locale para una tienda específica
./scripts/enable-single-locale.sh [storeId] [primaryLocale]

# Ejemplo:
./scripts/enable-single-locale.sh mi-tienda es
```

### Script de Activación por Lotes
```bash
# Activar para múltiples tiendas
./scripts/enable-batch-single-locale.sh stores-list.txt

# stores-list.txt formato:
# tienda-1,es
# tienda-2,en
# tienda-3,pt
```

### Script de Rollback
```bash
# Desactivar en caso de problemas
./scripts/rollback-single-locale.sh [storeId]
```

## 📊 Monitoreo y Validación

### Checklist por Tienda Migrada
- [ ] ✅ Home (`/`) responde 200
- [ ] ✅ Redirects 301: `/es` → `/`, `/en` → `/`
- [ ] ✅ HTML lang correcto: `<html lang="xx">`
- [ ] ✅ Canonical sin prefijo: `<link rel="canonical" href="https://host/">`
- [ ] ✅ Sitemap sin prefijos: URLs directas sin `/es/`, `/en/`
- [ ] ✅ GSC verification presente en home
- [ ] ✅ Links internos generan URLs sin prefijo
- [ ] ✅ OG metadata localizada correctamente

### Scripts Automáticos de Validación
```bash
# Validación completa de una tienda
./tests/run-all-tests.sh https://mitienda.shopifree.app

# Validación rápida solo de criterios críticos
./scripts/check-single-locale.sh https://mitienda.shopifree.app
```

### Alertas y Monitoreo
```bash
# Setup de alertas (configurar según tu stack)
# - Monitor 404 rate increase
# - Monitor sitemap errors in GSC
# - Monitor TTFB changes
# - Monitor cache hit rates
```

## 🔧 Troubleshooting Común

### Problema: Redirects no funcionan
```bash
# Verificar middleware cache
# Borrar cache en Vercel si es necesario
curl -X PURGE https://mitienda.shopifree.app/_next/static/

# Verificar logs del middleware
console.log logs en Vercel Functions
```

### Problema: Sitemap aún tiene prefijos
```bash
# El sitemap cache puede tardar hasta 1 hora
# Para forzar regeneración:
curl -X POST https://mitienda.shopifree.app/api/revalidate?path=/sitemap.xml
```

### Problema: GSC reporta URLs no encontradas
```bash
# Normal durante la transición
# 1. Submitir nueva sitemap.xml en GSC
# 2. Solicitar re-crawl de home y categorías principales
# 3. Los 301s mantendrán el PageRank
```

### Problema: Meta tags incorrectos
```bash
# Verificar que storeConfig se está cargando
# Revisar cache del middleware (TTL 5 min)
# Verificar Firestore permissions
```

## 📈 Métricas de Éxito

### Inmediatas (0-24h)
- ✅ 0% de errores 500 en páginas migradas
- ✅ 301 redirects funcionando en >95% de requests
- ✅ Sitemap actualizado sin prefijos
- ✅ HTML lang attributes correctos

### Corto Plazo (1-7 días)
- ✅ Indexación de nuevas URLs en GSC
- ✅ Mantenimiento de posiciones en SERP
- ✅ Tiempo de carga similar o mejor
- ✅ User engagement metrics estables

### Largo Plazo (1-4 semanas)
- ✅ Eliminación de URLs antiguas del índice
- ✅ Consolidación de PageRank en nuevas URLs
- ✅ Mejora en experiencia de usuario (menos redirects)
- ✅ Preparación para futuro multi-idioma con hreflang

## 🔄 Plan de Rollback

En caso de problemas críticos:

```bash
# 1. Rollback inmediato via feature flag
node scripts/setup-test-store.js [storeId] es --disable-single-locale

# 2. Verificar que tienda vuelve a comportamiento legacy
./scripts/check-legacy-behavior.sh https://mitienda.shopifree.app

# 3. Analizar logs y corregir problemas

# 4. Re-aplicar fix y volver a migrar
```

## ✅ Estado Actual

**LISTO PARA DEPLOYMENT** 🚀

1. ✅ Código completo y testeado
2. ✅ Scripts de validación funcionando
3. ✅ Plan de rollout definido
4. ✅ Documentación completa
5. ✅ Monitoreo y alertas planificadas

**Próximos pasos:**
1. Deploy del código a producción
2. Comenzar piloto con TiendaVerde
3. Rollout gradual según plan

---

**Contacto para issues**: Reportar en canal de dev o crear issue en GitHub
