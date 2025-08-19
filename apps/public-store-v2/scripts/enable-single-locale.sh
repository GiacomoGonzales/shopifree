#!/bin/bash

# Script para activar single locale URLs en una tienda específica
# Uso: ./scripts/enable-single-locale.sh [storeId] [primaryLocale]

set -e

STORE_ID=$1
PRIMARY_LOCALE=${2:-"es"}

if [ -z "$STORE_ID" ]; then
    echo "❌ Error: storeId es requerido"
    echo "📖 Uso: ./scripts/enable-single-locale.sh [storeId] [primaryLocale]"
    echo "📖 Ejemplo: ./scripts/enable-single-locale.sh mi-tienda es"
    exit 1
fi

echo "🚀 Activando Single Locale URLs para tienda: $STORE_ID"
echo "🌍 Primary Locale: $PRIMARY_LOCALE"
echo "================================================================="

# Activar con el script de Node.js
if node scripts/setup-test-store.js "$STORE_ID" "$PRIMARY_LOCALE"; then
    echo ""
    echo "✅ Single Locale URLs activado correctamente"
    echo ""
    echo "🧪 Para validar la configuración:"
    echo "   1. Esperar ~5 minutos (cache del middleware)"
    echo "   2. Ejecutar: ./scripts/check-single-locale.sh https://[subdomain].shopifree.app"
    echo ""
    echo "📊 Monitorear:"
    echo "   - GSC para nuevas URLs sin prefijo"
    echo "   - Logs en Vercel para errors 404/500"
    echo "   - Performance metrics"
    echo ""
    echo "🔄 Para rollback:"
    echo "   ./scripts/rollback-single-locale.sh $STORE_ID"
else
    echo ""
    echo "❌ Error activando Single Locale URLs"
    echo "Verificar:"
    echo "   - Firebase credentials configuradas"
    echo "   - Store ID existe en Firestore"
    echo "   - Permissions de escritura"
    exit 1
fi
