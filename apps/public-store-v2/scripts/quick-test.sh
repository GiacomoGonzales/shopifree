#!/bin/bash

# Script rápido para probar headers del sitemap y robots.txt
# Ejecutar: bash scripts/quick-test.sh

DOMAIN="lunara-store.xyz"

echo "🔍 Probando headers para $DOMAIN"
echo "=================================="

echo ""
echo "📋 Sitemap XML:"
echo "---------------"
curl -s -I "https://$DOMAIN/sitemap.xml" | grep -E "(HTTP|Content-Type|Cache-Control|X-Robots-Tag)"

echo ""
echo "🤖 Robots.txt:"
echo "--------------"
curl -s -I "https://$DOMAIN/robots.txt" | grep -E "(HTTP|Content-Type|Cache-Control)"

echo ""
echo "📄 Contenido del sitemap (primeras líneas):"
echo "-------------------------------------------"
curl -s "https://$DOMAIN/sitemap.xml" | head -5

echo ""
echo "📄 Contenido del robots.txt:"
echo "----------------------------"
curl -s "https://$DOMAIN/robots.txt"
