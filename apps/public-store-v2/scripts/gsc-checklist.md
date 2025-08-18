# 📋 CHECKLIST PRE-ENVÍO GSC

## ✅ VALIDACIONES OBLIGATORIAS

### 1. Sitemap Principal
```bash
curl -I https://lunara-store.xyz/sitemap.xml
# ✅ Esperado: HTTP/1.1 200 OK + Content-Type: application/xml
```

### 2. Contenido XML Válido
```bash
curl -s https://lunara-store.xyz/sitemap.xml | head -10
# ✅ Esperado: <?xml version="1.0" encoding="UTF-8"?>
# ✅ Esperado: <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
```

### 3. URLs en Sitemap
```bash
curl -s https://lunara-store.xyz/sitemap.xml | grep -c "<url>"
# ✅ Esperado: Número > 0 (tiene URLs)
```

### 4. Hreflang en Sitemap
```bash
curl -s https://lunara-store.xyz/sitemap.xml | grep "hreflang"
# ✅ Esperado: <xhtml:link rel="alternate" hreflang="es" href="..."/>
# ✅ Esperado: <xhtml:link rel="alternate" hreflang="en" href="..."/>
# ✅ Esperado: <xhtml:link rel="alternate" hreflang="x-default" href="..."/>
```

### 5. Redirects Anti-Duplicación
```bash
curl -I https://www.lunara-store.xyz/es/
# ✅ Esperado: HTTP/1.1 301 + Location: https://lunara-store.xyz/es/

curl -I http://lunara-store.xyz/es/
# ✅ Esperado: HTTP/1.1 301 + Location: https://lunara-store.xyz/es/
```

### 6. Canonical Correcto
```bash
curl -s https://lunara-store.xyz/es/ | grep canonical
# ✅ Esperado: <link rel="canonical" href="https://lunara-store.xyz/es/"/>
```

### 7. Hreflang en Páginas
```bash
curl -s https://lunara-store.xyz/es/ | grep hreflang
# ✅ Esperado: <link rel="alternate" hreflang="es" href="https://lunara-store.xyz/es"/>
# ✅ Esperado: <link rel="alternate" hreflang="en" href="https://lunara-store.xyz/en"/>
```

### 8. Robots.txt
```bash
curl -s https://lunara-store.xyz/robots.txt | grep Sitemap
# ✅ Esperado: Sitemap: https://lunara-store.xyz/sitemap.xml
```

### 9. Test Googlebot
```bash
curl -I -H "User-Agent: Googlebot" https://lunara-store.xyz/sitemap.xml
# ✅ Esperado: HTTP/1.1 200 OK (mismo resultado que sin User-Agent)
```

### 10. Noindex en Sitemap
```bash
curl -I https://lunara-store.xyz/sitemap.xml | grep -i "x-robots-tag"
# ✅ Esperado: X-Robots-Tag: noindex (para que GSC no indexe el sitemap)
```

---

## 🚨 RED FLAGS - DEBE SER 0

### ❌ URLs Duplicadas Indexables
```bash
# Estas deben dar 301 redirect, NO 200:
curl -I https://www.lunara-store.xyz/es/     # → 301
curl -I http://lunara-store.xyz/es/          # → 301  
curl -I https://lunara.shopifree.app/es/     # → 301
```

### ❌ Múltiples Sitemaps
```bash
# Estos NO deben existir (deben dar 404):
curl -I https://lunara-store.xyz/es/sitemap.xml     # → 404
curl -I https://lunara-store.xyz/en/sitemap.xml     # → 404
```

### ❌ Timeouts o Errores
```bash
# Debe responder rápido (< 5 segundos):
time curl -I https://lunara-store.xyz/sitemap.xml
```

---

## 📊 CRITERIOS DE ÉXITO FINAL

| Criterio | Estado | Resultado Esperado |
|----------|--------|--------------------|
| Sitemap 200 OK | ⬜ | HTTP/1.1 200 OK |
| Content-Type XML | ⬜ | application/xml; charset=utf-8 |
| URLs > 0 | ⬜ | Al menos 4 URLs (home es/en + categorías) |
| Hreflang presente | ⬜ | Etiquetas xhtml:link en cada URL |
| WWW → No-WWW | ⬜ | 301 Permanent Redirect |
| HTTP → HTTPS | ⬜ | 301 Permanent Redirect |
| Canonical correcto | ⬜ | Apunta a versión oficial |
| Robots.txt OK | ⬜ | Declara sitemap correcto |
| Googlebot acceso | ⬜ | Mismo resultado que navegador |
| Sin duplicados | ⬜ | Solo 1 versión indexable |

---

## 🎯 ENVÍO A GSC

### Paso 1: Ejecutar Validación
```bash
./scripts/validate-seo-final.sh
```

### Paso 2: Verificar Todos los ✅
- Todos los criterios deben estar en ✅
- 0 red flags detectadas

### Paso 3: URLs para GSC
```
Propiedad: https://lunara-store.xyz
Sitemap: https://lunara-store.xyz/sitemap.xml
```

### Paso 4: Enviar en GSC
1. Ir a Google Search Console
2. Agregar propiedad: `https://lunara-store.xyz`
3. Verificar propiedad (DNS recomendado)
4. Ir a Sitemaps
5. Enviar: `https://lunara-store.xyz/sitemap.xml`
6. Esperar resultado: "Enviado correctamente" ✅

---

## 🎉 RESULTADO ESPERADO

**Antes**: "No se ha podido obtener" ❌
**Después**: "Enviado correctamente" ✅

**Tiempo estimado para indexación**: 24-48 horas
**URLs esperadas indexadas**: Todas las del sitemap
