#!/bin/bash

# Script para demostrar el cambio de idioma en las tiendas
# Muestra cómo los textos de UI cambian según el idioma configurado

echo "🌐 Demo: Textos Dinámicos por Idioma de Tienda"
echo "=============================================="
echo ""

echo "🇪🇸 TIENDA EN ESPAÑOL (TiendaVerde):"
echo "URL: http://localhost:3004/ (usa tiendaverde por defecto)"
echo "Configuración: advanced.language = 'es'"
echo ""

echo "Verificando metadatos en español..."
echo "- HTML lang:"
curl -s http://localhost:3004/ | grep -o '<html[^>]*lang="[^"]*"' | head -1
echo ""

echo "- Canonical:"
curl -s http://localhost:3004/ | grep -o 'rel="canonical"[^>]*' | head -1
echo ""

echo "- Title:"
curl -s http://localhost:3004/ | grep -o '<title[^>]*>[^<]*</title>' | head -1
echo ""

echo "=============================================="
echo ""

echo "🇺🇸 TIENDA EN INGLÉS (simulando GreenShop):"
echo "Para probar: editar hosts file o usar subdomain tiendaenglish.localhost:3004"
echo "Configuración: advanced.language = 'en'"
echo ""

echo "💡 Cómo probar el cambio de idioma:"
echo "1. En el dashboard, cambiar 'Configuración Avanzada > Idioma de la tienda'"
echo "2. Los textos de UI cambian automáticamente:"
echo "   - Español: 'Categorías', 'Carrito de compras', 'Productos'"
echo "   - Inglés: 'Categories', 'Shopping Cart', 'Products'"
echo "3. Las URLs se mantienen limpias sin /es o /en"
echo ""

echo "✅ Implementación completada:"
echo "- 📦 URLs limpias: tiendaverde.shopifree.app (sin /es)"
echo "- 🌐 Textos dinámicos según idioma del dashboard"
echo "- 🔄 Redirects 301 para compatibilidad"
echo "- 🎯 SEO optimizado con canonical único"
echo ""

echo "🧪 Para testing en desarrollo:"
echo "- Español: http://localhost:3004/ (default)"
echo "- Inglés: http://tiendaenglish.localhost:3004/ (con hosts file)"
