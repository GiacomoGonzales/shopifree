#!/bin/bash

# Script para build del public store con manejo de errores de permisos

echo "🚀 Building Public Store v2..."
echo "==============================="

cd apps/public-store-v2

# Intentar limpiar .next de forma segura
echo "🧹 Cleaning build directory..."
if [ -d ".next" ]; then
    # En Windows, a veces hay problemas de permisos
    npm run clean 2>/dev/null || rm -rf .next 2>/dev/null || echo "⚠️ No se pudo limpiar .next (normal en Windows)"
fi

echo ""
echo "🔍 Checking TypeScript..."
npx tsc --noEmit --project .
if [ $? -ne 0 ]; then
    echo "❌ TypeScript errors found. Please fix them first."
    exit 1
fi

echo "✅ TypeScript check passed"
echo ""
echo "📦 Building Next.js application..."

# Intentar build
npm run build
BUILD_EXIT_CODE=$?

if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✅ Build completed successfully!"
    echo "🚀 Ready for deployment"
else
    echo ""
    echo "❌ Build failed with exit code: $BUILD_EXIT_CODE"
    echo ""
    echo "🔍 Common solutions:"
    echo "1. Check for TypeScript errors above"
    echo "2. If permission error on Windows: Restart terminal as Administrator"
    echo "3. Try: npm run clean && npm run build"
    exit $BUILD_EXIT_CODE
fi
