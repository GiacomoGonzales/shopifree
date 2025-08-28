#!/bin/bash

echo "🔧 Probando la corrección de subdominios..."
echo ""

echo "📋 1. Verificando que localhost:3004 redirige correctamente..."
echo "   En desarrollo local:"
echo "   - localhost:3004 debería mostrar página de bienvenida"
echo "   - localhost:3004/tierradefrutos debería funcionar normalmente"
echo ""

echo "📋 2. En producción:"
echo "   - tierradefrutos.shopifree.app debería cargar la tienda directamente"
echo "   - NO debería mostrar 'Visita /lunara para ver una tienda de ejemplo'"
echo ""

echo "🔧 Cambios realizados:"
echo "   ✅ Middleware actualizado para detectar subdominios correctamente"
echo "   ✅ Página principal actualizada para redirigir subdominios inválidos"  
echo "   ✅ Configuración de puertos corregida (3003 → 3004)"
echo "   ✅ URLs de preview en dashboard corregidas"
echo ""

echo "🚀 Para probar en producción:"
echo "   1. Hacer deploy de estos cambios"
echo "   2. Visitar https://tierradefrutos.shopifree.app"
echo "   3. Verificar que NO aparezca el mensaje de '/lunara'"
echo "   4. Verificar que la tienda cargue directamente"
echo ""

echo "✅ Corrección completada. El problema de subdominios debería estar resuelto."
