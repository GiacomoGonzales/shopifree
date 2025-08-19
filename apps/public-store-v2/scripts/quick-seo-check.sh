#!/bin/bash

# Script rápido para verificar SEO en desarrollo local

echo "🔍 VERIFICACIÓN SEO RÁPIDA - DESARROLLO LOCAL"
echo "============================================="

# URL base para desarrollo
BASE_URL="http://localhost:3004"
STORE_NAME="tiendaverde"

echo ""
echo "🏠 Verificando página principal: $BASE_URL/$STORE_NAME"

# Verificar que la página carga
if curl -s -f "$BASE_URL/$STORE_NAME" > /dev/null; then
    echo "✅ Página accesible"
    
    # Verificar robots
    ROBOTS=$(curl -s "$BASE_URL/$STORE_NAME" | grep -o '<meta name="robots" content="[^"]*"' | head -1)
    if [[ $ROBOTS == *"noindex"* ]]; then
        echo "❌ PROBLEMA: Meta robots contiene noindex"
        echo "   $ROBOTS"
        echo "🔧 SOLUCIÓN: Verificar isCanonicalVersion en layout.tsx"
    else
        echo "✅ Meta robots permite indexación"
        echo "   $ROBOTS"
    fi
    
    # Verificar título
    TITLE=$(curl -s "$BASE_URL/$STORE_NAME" | grep -o '<title>[^<]*</title>' | head -1)
    if [[ $TITLE == *"Shopifree Public Store"* ]]; then
        echo "⚠️ ADVERTENCIA: Título genérico detectado"
        echo "   $TITLE"
        echo "🔧 SOLUCIÓN: Configurar SEO en Dashboard"
    else
        echo "✅ Título personalizado"
        echo "   $TITLE"
    fi
    
    # Verificar que no sea 404
    if curl -s "$BASE_URL/$STORE_NAME" | grep -q "Página no encontrada"; then
        echo "❌ PROBLEMA CRÍTICO: Página muestra error 404"
        echo "🔧 SOLUCIÓN: Verificar configuración de routing"
    else
        echo "✅ Página carga contenido correcto"
    fi
    
else
    echo "❌ ERROR: No se puede acceder a la página"
    echo "🔧 SOLUCIÓN: Asegurar que el servidor esté corriendo en $BASE_URL"
fi

echo ""
echo "🗺️ Verificando sitemap: $BASE_URL/sitemap.xml"
if curl -s -f "$BASE_URL/sitemap.xml" > /dev/null; then
    echo "✅ Sitemap accesible"
    URL_COUNT=$(curl -s "$BASE_URL/sitemap.xml" | grep -c "<loc>")
    echo "   URLs en sitemap: $URL_COUNT"
else
    echo "❌ Sitemap no accesible"
fi

echo ""
echo "🤖 Verificando robots.txt: $BASE_URL/robots.txt"
if curl -s -f "$BASE_URL/robots.txt" > /dev/null; then
    echo "✅ Robots.txt accesible"
    if curl -s "$BASE_URL/robots.txt" | grep -q "Sitemap:"; then
        echo "✅ Robots.txt declara sitemap"
    else
        echo "⚠️ Robots.txt no declara sitemap"
    fi
else
    echo "❌ Robots.txt no accesible"
fi

echo ""
echo "📋 RESUMEN:"
echo "=========="
echo "Si todo muestra ✅, tu tienda está lista para Google Search Console"
echo "Si hay ❌ o ⚠️, revisa las soluciones sugeridas arriba"

echo ""
echo "🚀 SIGUIENTE PASO:"
echo "=================="
echo "1. Corregir cualquier problema mostrado arriba"
echo "2. Desplegar en producción (tu-tienda.shopifree.app)"
echo "3. Ejecutar: node apps/public-store-v2/scripts/verify-seo-gsc.js"
echo "4. Registrar en Google Search Console"
