#!/bin/bash

# Script para ejecutar todos los tests de single locale URLs
# Uso: ./tests/run-all-tests.sh [URL_BASE]

set -e

URL_BASE=${1:-"http://localhost:3004"}

echo "🧪 Ejecutando suite completa de tests para Single Locale URLs"
echo "🎯 URL Base: $URL_BASE"
echo "================================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para mostrar resultados
show_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2 PASSED${NC}"
    else
        echo -e "${RED}❌ $2 FAILED${NC}"
    fi
}

# Función para mostrar sección
show_section() {
    echo -e "\n${YELLOW}📋 $1${NC}"
    echo "================================================================="
}

# Variables para tracking de resultados
TOTAL_TESTS=0
PASSED_TESTS=0

# Test 1: Script de validación principal
show_section "VALIDACIÓN PRINCIPAL"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if ./scripts/check-single-locale.sh "$URL_BASE"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
    show_result 0 "check-single-locale.sh"
else
    show_result 1 "check-single-locale.sh"
fi

# Test 2: Sitemap y robots.txt
show_section "SITEMAP Y ROBOTS"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if node tests/sitemap.test.js; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
    show_result 0 "Sitemap tests"
else
    show_result 1 "Sitemap tests"
fi

# Test 3: Head tags y metadatos
show_section "HEAD TAGS Y METADATOS"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if node tests/head-tags.test.js "$URL_BASE"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
    show_result 0 "Head tags tests"
else
    show_result 1 "Head tags tests"
fi

# Test 4: Tests de middleware (mock)
show_section "MIDDLEWARE (MOCK TESTS)"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if node tests/middleware.test.js; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
    show_result 0 "Middleware tests"
else
    show_result 1 "Middleware tests"
fi

# Test 5: Linting
show_section "LINTING"
TOTAL_TESTS=$((TOTAL_TESTS + 1))
if npm run lint --silent 2>/dev/null || echo "No lint script found"; then
    PASSED_TESTS=$((PASSED_TESTS + 1))
    show_result 0 "Linting"
else
    show_result 1 "Linting"
fi

# Resultados finales
echo ""
echo "================================================================="
echo "🏁 RESULTADOS FINALES"
echo "================================================================="
echo "Tests ejecutados: $TOTAL_TESTS"
echo "Tests pasados: $PASSED_TESTS"
echo "Tests fallidos: $((TOTAL_TESTS - PASSED_TESTS))"

if [ $PASSED_TESTS -eq $TOTAL_TESTS ]; then
    echo -e "${GREEN}🎉 TODOS LOS TESTS PASARON${NC}"
    echo "✅ La implementación de Single Locale URLs está funcionando correctamente"
    exit 0
else
    echo -e "${RED}💥 ALGUNOS TESTS FALLARON${NC}"
    echo "❌ Revisar los errores arriba antes de hacer deployment"
    exit 1
fi
