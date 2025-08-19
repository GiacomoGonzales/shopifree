#!/bin/bash

# Script rápido para testear TiendaVerde en local
# Uso: ./test-local.sh

echo "🧪 Testing TiendaVerde en localhost:3004"
echo "========================================"

# Esperar a que el servidor esté listo
echo "⏳ Esperando a que el servidor esté listo..."
sleep 3

BASE_URL="http://localhost:3004"

echo ""
echo "🏠 Testing Home Page:"
echo "curl -H 'Host: tiendaverde.localhost' $BASE_URL/"
curl -H "Host: tiendaverde.localhost" -s -w "Status: %{http_code}\n" "$BASE_URL/" | head -10

echo ""
echo "🔄 Testing Redirect /es → /:"
echo "curl -H 'Host: tiendaverde.localhost' $BASE_URL/es"
curl -H "Host: tiendaverde.localhost" -I -s "$BASE_URL/es" | grep -E "(HTTP|Location)"

echo ""
echo "🗺️  Testing Sitemap:"
echo "curl -H 'Host: tiendaverde.localhost' $BASE_URL/sitemap.xml"
curl -H "Host: tiendaverde.localhost" -s -w "Status: %{http_code}\n" "$BASE_URL/sitemap.xml" | head -5

echo ""
echo "✅ Tests completados!"
echo ""
echo "💡 Para abrir en el navegador:"
echo "   1. Editar tu archivo hosts:"
echo "      127.0.0.1 tiendaverde.localhost"
echo "   2. O abrir: http://localhost:3004/ (usa host header automáticamente)"
echo "   3. O usar extensión de Chrome para subdominios locales"
