#!/bin/bash

# Script de validación para URLs sin prefijo de idioma (single locale mode)
# Uso: ./scripts/check-single-locale.sh https://tienda-ejemplo.shopifree.app

if [ $# -eq 0 ]; then
    echo "Uso: $0 <STORE_URL>"
    echo "Ejemplo: $0 https://tiendaverde.shopifree.app"
    exit 1
fi

STORE="$1"

# Remover trailing slash si existe
STORE="${STORE%/}"

echo "🧪 Validando single locale URLs para: $STORE"
echo "======================================================="

# Test 1: / debe responder 200
echo "1️⃣  Verificando que / responde 200..."
HTTP_STATUS=$(curl -s -I "$STORE/" | awk 'BEGIN{IGNORECASE=1} /^HTTP/{print $2}')
CONTENT_TYPE=$(curl -s -I "$STORE/" | awk 'BEGIN{IGNORECASE=1} /^content-type:/{print $2; exit}')

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Home responde 200 OK"
    echo "   Content-Type: $CONTENT_TYPE"
else
    echo "❌ Home responde: $HTTP_STATUS (esperado: 200)"
fi

echo ""

# Test 2: /es debe redirigir 301 a /
echo "2️⃣  Verificando redirección 301 desde /es..."
REDIRECT_STATUS=$(curl -s -I "$STORE/es" | awk 'BEGIN{IGNORECASE=1} /^HTTP/{print $2}')
REDIRECT_LOCATION=$(curl -s -I "$STORE/es" | awk 'BEGIN{IGNORECASE=1} /^location:/{gsub(/\r/, "", $2); print $2}')

if [ "$REDIRECT_STATUS" = "301" ]; then
    echo "✅ /es redirige con 301"
    echo "   Location: $REDIRECT_LOCATION"
    
    # Verificar que la redirección va a /
    if [[ "$REDIRECT_LOCATION" == "$STORE/" ]]; then
        echo "✅ Redirección correcta hacia /"
    else
        echo "❌ Redirección incorrecta. Esperado: $STORE/, Actual: $REDIRECT_LOCATION"
    fi
else
    echo "❌ /es responde: $REDIRECT_STATUS (esperado: 301)"
    echo "   Location: $REDIRECT_LOCATION"
fi

echo ""

# Test 3: Canonical sin prefijo
echo "3️⃣  Verificando canonical URL sin prefijo..."
CANONICAL=$(curl -s -L "$STORE/" | tr -d '\n' | grep -o -i '<link[^>]*rel="canonical"[^>]*>')

if [ -n "$CANONICAL" ]; then
    echo "✅ Tag canonical encontrado:"
    echo "   $CANONICAL"
    
    # Verificar que no contiene /es/ o /en/
    if echo "$CANONICAL" | grep -Ei '/(es|en|pt)/' > /dev/null; then
        echo "❌ Canonical contiene prefijo de idioma"
    else
        echo "✅ Canonical sin prefijo de idioma"
    fi
else
    echo "❌ No se encontró tag canonical"
fi

echo ""

# Test 4: HTML lang y verificación GSC
echo "4️⃣  Verificando atributo lang y verificación GSC..."
HTML_LANG=$(curl -s -L "$STORE/" | tr -d '\n' | grep -o -i '<html[^>]*lang="[^"]*"')
GSC_META=$(curl -s -L "$STORE/" | tr -d '\n' | grep -o -i '<meta[^>]*google-site-verification[^>]*>')

if [ -n "$HTML_LANG" ]; then
    echo "✅ Atributo HTML lang encontrado:"
    echo "   $HTML_LANG"
else
    echo "❌ No se encontró atributo HTML lang"
fi

if [ -n "$GSC_META" ]; then
    echo "✅ Meta Google Search Console encontrado:"
    echo "   $GSC_META"
else
    echo "⚠️  No se encontró meta de verificación GSC (puede estar configurado solo para canonical)"
fi

echo ""

# Test 5: Sitemap sin prefijos /es|/en|/pt
echo "5️⃣  Verificando sitemap sin prefijos de idioma..."
SITEMAP_PREFIXES=$(curl -s "$STORE/sitemap.xml" | grep -Eo '<loc>[^<]+' | grep -Ei '/(es|en|pt)/')

if [ -z "$SITEMAP_PREFIXES" ]; then
    echo "✅ Sitemap sin prefijos de idioma"
else
    echo "❌ Sitemap contiene URLs con prefijos:"
    echo "$SITEMAP_PREFIXES" | head -3
    echo "   ... (mostrando primeras 3 líneas)"
fi

echo ""

# Test 6: Headers del sitemap (sin noindex)
echo "6️⃣  Verificando headers del sitemap..."
SITEMAP_STATUS=$(curl -s -I "$STORE/sitemap.xml" | awk 'BEGIN{IGNORECASE=1} /^HTTP/{print $2}')
SITEMAP_ROBOTS=$(curl -s -I "$STORE/sitemap.xml" | awk 'BEGIN{IGNORECASE=1} /^x-robots-tag:/{print}')
SITEMAP_CONTENT_TYPE=$(curl -s -I "$STORE/sitemap.xml" | awk 'BEGIN{IGNORECASE=1} /^content-type:/{print $2}')

echo "Status: $SITEMAP_STATUS"
echo "Content-Type: $SITEMAP_CONTENT_TYPE"

if [ -n "$SITEMAP_ROBOTS" ]; then
    echo "❌ X-Robots-Tag encontrado: $SITEMAP_ROBOTS"
else
    echo "✅ Sin X-Robots-Tag noindex"
fi

echo ""

# Test 7: robots.txt
echo "7️⃣  Verificando robots.txt..."
ROBOTS_STATUS=$(curl -s -I "$STORE/robots.txt" | awk 'BEGIN{IGNORECASE=1} /^HTTP/{print $2}')
ROBOTS_CONTENT_TYPE=$(curl -s -I "$STORE/robots.txt" | awk 'BEGIN{IGNORECASE=1} /^content-type:/{print $2}')

echo "Status: $ROBOTS_STATUS"
echo "Content-Type: $ROBOTS_CONTENT_TYPE"

# Verificar contenido del robots.txt
ROBOTS_SITEMAP=$(curl -s "$STORE/robots.txt" | grep -i "sitemap:")

if [ -n "$ROBOTS_SITEMAP" ]; then
    echo "✅ Sitemap declarado en robots.txt:"
    echo "   $ROBOTS_SITEMAP"
else
    echo "❌ No se encontró declaración de sitemap en robots.txt"
fi

echo ""
echo "======================================================="
echo "🏁 Validación completada para: $STORE"

# Test adicional: Verificar que rutas internas funcionan
echo ""
echo "8️⃣  Verificando rutas internas sin prefijo..."

# Test /categoria (si existe)
CATEGORIA_STATUS=$(curl -s -I "$STORE/categoria" -w "%{http_code}" -o /dev/null)
if [ "$CATEGORIA_STATUS" = "200" ] || [ "$CATEGORIA_STATUS" = "404" ]; then
    echo "✅ /categoria responde: $CATEGORIA_STATUS"
else
    echo "⚠️  /categoria responde: $CATEGORIA_STATUS"
fi

# Test /producto (si existe)
PRODUCTO_STATUS=$(curl -s -I "$STORE/producto" -w "%{http_code}" -o /dev/null)
if [ "$PRODUCTO_STATUS" = "200" ] || [ "$PRODUCTO_STATUS" = "404" ]; then
    echo "✅ /producto responde: $PRODUCTO_STATUS"
else
    echo "⚠️  /producto responde: $PRODUCTO_STATUS"
fi

echo ""
echo "🎯 Nota: Para activar single locale URLs, configurar en Firestore:"
echo "   stores/{storeId}/advanced/singleLocaleUrls = true"
echo "   stores/{storeId}/advanced/language = 'es'|'en'|'pt'"
