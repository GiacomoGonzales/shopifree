#!/bin/bash

# Script para ejecutar todos los tests de single locale URLs
# Uso: ./tests/run-all-tests.sh [URL_BASE]

set -e

URL_BASE=${1:-"http://localhost:3004"}

echo "🧪 Suite completa de tests para Single Locale URLs"
echo "🎯 URL Base: $URL_BASE"
echo "================================================================="

# Test principal con el script de validación
echo "📋 Ejecutando validación principal..."
if ./scripts/check-single-locale.sh "$URL_BASE"; then
    echo "✅ check-single-locale.sh PASSED"
else
    echo "❌ check-single-locale.sh FAILED"
    exit 1
fi

echo "================================================================="
echo "🎉 TODOS LOS TESTS PASARON"
echo "✅ La implementación está lista para deployment"
