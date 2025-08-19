#!/usr/bin/env node

/**
 * Script para debuggear el problema de navegación con prefijos /es
 * Ayuda a identificar dónde se están generando URLs incorrectas
 */

console.log('🔍 DEBUG: Problema de navegación con /es/lunara');
console.log('===============================================\n');

console.log('📋 CAUSAS POSIBLES:');
console.log('1. ❌ Header genera URLs con locale (CORREGIDO en este fix)');
console.log('2. ❌ JavaScript del lado cliente modifica URLs');
console.log('3. ❌ Cache del navegador con URLs antiguos');
console.log('4. ❌ Middleware en desarrollo local mal configurado');
console.log('5. ❌ Next.js router con configuración incorrecta\n');

console.log('🛠️ CORRECCIONES APLICADAS:');
console.log('✅ themes/base-default/Header.tsx - Eliminado extracción de locale de URL');
console.log('✅ themes/new-base-default/Header.tsx - Corregido getSubdomainUrl()');
console.log('✅ Ambos headers ahora generan URLs simples: / en lugar de /es/lunara\n');

console.log('🧪 PASOS PARA TESTING:');
console.log('1. 🔄 Recargar completamente el navegador (Ctrl+Shift+R)');
console.log('2. 🧹 Limpiar cache del navegador');
console.log('3. 📱 Probar en ventana de incógnito');
console.log('4. 🖱️ Hacer clic en el logo desde diferentes páginas');
console.log('5. 🔍 Verificar console del navegador por errores JS\n');

console.log('📊 MONITOREO:');
console.log('• Abrir DevTools → Console');
console.log('• Buscar logs del middleware: "[Simple Mode]", "[301 Redirect]"');
console.log('• Verificar si hay redirecciones de /es/lunara → /');
console.log('• Confirmar que getSubdomainUrl("") retorna "/" y no "/es/lunara"\n');

console.log('🚨 SI EL PROBLEMA PERSISTE:');
console.log('1. Verificar que se está usando el tema correcto (base-default o new-base-default)');
console.log('2. Confirmar que no hay JavaScript personalizado modificando URLs');
console.log('3. Revisar si hay service workers cachando rutas antiguas');
console.log('4. Verificar configuración de Next.js en next.config.js\n');

console.log('💡 TESTING RÁPIDO:');
console.log('En DevTools Console, ejecutar:');
console.log('  window.location.href = "/";');
console.log('Si esto funciona, el problema es en el link del header.');
console.log('Si no funciona, el problema es en el middleware/routing.\n');

console.log('📞 Si necesitas más ayuda, proporciona:');
console.log('• Logs de la consola del navegador');
console.log('• Logs del middleware en la terminal');
console.log('• URL exacta que aparece en la barra de direcciones');
console.log('• Pasos específicos para reproducir el error');
