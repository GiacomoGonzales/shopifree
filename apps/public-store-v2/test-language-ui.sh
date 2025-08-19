#!/bin/bash

# Script para probar textos de UI dinámicos según idioma de Firestore

echo "🌐 Probando Conexión con Firestore para TiendaVerde"
echo "================================================="
echo ""

echo "🔍 1. Verificando idioma detectado..."
LANG_HTML=$(curl -s http://localhost:3004/ | grep -o '<html[^>]*lang="[^"]*"')
echo "HTML lang detectado: $LANG_HTML"
echo ""

echo "🔍 2. Verificando configuración desde Firestore..."
echo "Store ID usado (debe ser real, no mock):"
curl -s http://localhost:3004/ 2>&1 | grep -o "Found real store.*" || echo "No se encontró log de Firestore real"
echo ""

echo "🎯 3. Verificando textos de UI dinámicos..."
echo ""

echo "🔹 Buscador (placeholder):"
SEARCH_HTML=$(curl -s http://localhost:3004/ | tr -d '\n' | grep -o 'placeholder="[^"]*"' | head -1)
echo "  $SEARCH_HTML"
echo "  ✅ Español: placeholder=\"Buscar productos...\""
echo "  ✅ Inglés: placeholder=\"Search products...\""
echo ""

echo "🔹 Categorías (título de sección):"
CATEGORIES_HTML=$(curl -s http://localhost:3004/ | tr -d '\n' | grep -o 'class="nbd-section-title"[^>]*>[^<]*' | head -1)
echo "  $CATEGORIES_HTML"
echo "  ✅ Español: >Categorías"
echo "  ✅ Inglés: >Categories"
echo ""

echo "🔹 Botones de acción:"
EXPLORE_BTN=$(curl -s http://localhost:3004/ | tr -d '\n' | grep -o '<span>[^<]*productos[^<]*</span>' | head -1)
echo "  $EXPLORE_BTN"
echo "  ✅ Español: <span>Explorar productos</span>"
echo "  ✅ Inglés: <span>Explore products</span>"
echo ""

echo "💡 Para cambiar idioma:"
echo "1. Ve al Dashboard de Shopifree"
echo "2. Configuración > Configuración Avanzada"
echo "3. Cambia el idioma de 'Español' a 'Inglés'"
echo "4. Los textos de UI cambiarán automáticamente"
echo "5. Las URLs seguirán siendo limpias (sin /es o /en)"
echo ""

echo "🧪 Modo actual:"
if echo "$LANG_HTML" | grep -q 'lang="en"'; then
    echo "  🇺🇸 INGLÉS - UI texts in English"
elif echo "$LANG_HTML" | grep -q 'lang="es"'; then
    echo "  🇪🇸 ESPAÑOL - Textos de UI en español"
else
    echo "  ❓ DESCONOCIDO - $LANG_HTML"
fi
