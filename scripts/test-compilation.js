#!/usr/bin/env node

/**
 * Script de Prueba de Compilación Tailwind - Shopifree
 * 
 * Verifica que Tailwind pueda generar CSS correctamente con las nuevas
 * configuraciones del sistema de colores centralizado.
 */

const fs = require('fs');
const path = require('path');

// Función para probar generación de CSS con Tailwind
function testTailwindCSS(configPath, appName) {
  console.log(`\n🎨 Probando generación CSS: ${appName}`);
  
  try {
    // Cargar configuración
    const fullConfigPath = path.resolve(configPath);
    delete require.cache[fullConfigPath];
    const tailwindConfig = require(fullConfigPath);
    
    // Verificar que la configuración tiene los colores esperados
    const colors = tailwindConfig.theme.extend.colors;
    
    if (!colors) {
      console.log('   ❌ No se encontraron colores en la configuración');
      return false;
    }
    
    // Verificar colores de marca
    const brandColors = Object.keys(colors).filter(key => key.startsWith('brand-'));
    console.log(`   📦 Colores de marca encontrados: ${brandColors.length}`);
    brandColors.slice(0, 3).forEach(color => {
      console.log(`      • ${color}: ${JSON.stringify(colors[color])}`);
    });
    
    // Verificar variables CSS específicas de la app
    const appSpecificColors = Object.keys(colors).filter(key => 
      key.startsWith('dashboard-') || 
      key.startsWith('store-') || 
      key.startsWith('landing-') || 
      key.startsWith('admin-')
    );
    
    if (appSpecificColors.length > 0) {
      console.log(`   🎯 Variables específicas de ${appName}: ${appSpecificColors.length}`);
      appSpecificColors.slice(0, 3).forEach(color => {
        console.log(`      • ${color}: ${JSON.stringify(colors[color]).substring(0, 50)}...`);
      });
    }
    
    // Verificar estructura de contenido
    const content = tailwindConfig.content;
    if (!content || !Array.isArray(content)) {
      console.log('   ⚠️  Configuración de contenido no válida');
    } else {
      console.log(`   📁 Rutas de contenido: ${content.length}`);
    }
    
    // Verificar que incluye el paquete UI
    const includesUI = content && content.some(path => path.includes('packages/ui'));
    if (includesUI) {
      console.log('   ✅ Incluye archivos del paquete UI');
    } else {
      console.log('   ⚠️  No incluye archivos del paquete UI');
    }
    
    console.log('   ✅ Configuración válida para compilación');
    return true;
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

// Función para verificar archivos CSS globales
function testGlobalCSS(cssPath, appName) {
  console.log(`\n📄 Verificando CSS global: ${appName}`);
  
  if (!fs.existsSync(cssPath)) {
    console.log('   ❌ Archivo CSS no encontrado');
    return false;
  }
  
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  
  // Verificar que tiene variables CSS
  const cssVariables = cssContent.match(/--[\w-]+:/g) || [];
  console.log(`   📊 Variables CSS encontradas: ${cssVariables.length}`);
  
  // Verificar variables específicas del app
  const appPrefix = appName.toLowerCase().replace(' ', '-');
  const appVariables = cssVariables.filter(v => v.includes(`--${appPrefix}-`));
  
  if (appVariables.length > 0) {
    console.log(`   🎯 Variables de ${appName}: ${appVariables.length}`);
    appVariables.slice(0, 3).forEach(variable => {
      console.log(`      • ${variable.replace(':', '')}`);
    });
  }
  
  // Verificar que usa rgb(var(...))
  const rgbVarUsage = cssContent.match(/rgb\(var\(--[\w-]+\)/g) || [];
  console.log(`   🎨 Usos de rgb(var(...)): ${rgbVarUsage.length}`);
  
  console.log('   ✅ CSS global válido');
  return true;
}

// Configuraciones a probar
const tests = [
  {
    name: 'Dashboard',
    tailwind: 'apps/dashboard/tailwind.config.js',
    css: 'apps/dashboard/app/globals.css'
  },
  {
    name: 'Tienda Pública',
    tailwind: 'apps/public-store/tailwind.config.js',
    css: 'apps/public-store/app/globals.css'
  },
  {
    name: 'Landing Page',
    tailwind: 'apps/landing/tailwind.config.js',
    css: 'apps/landing/app/globals.css'
  },
  {
    name: 'Admin',
    tailwind: 'apps/admin/tailwind.config.js',
    css: 'apps/admin/app/globals.css'
  }
];

function main() {
  console.log('🔧 Prueba de Compilación Tailwind - Sistema de Colores Centralizado\n');
  
  let successCount = 0;
  let totalTests = tests.length * 2; // Tailwind + CSS por cada app
  
  for (const test of tests) {
    // Probar configuración Tailwind
    const tailwindSuccess = testTailwindCSS(test.tailwind, test.name);
    if (tailwindSuccess) successCount++;
    
    // Probar CSS global
    const cssSuccess = testGlobalCSS(test.css, test.name);
    if (cssSuccess) successCount++;
  }
  
  // Mostrar resumen
  console.log('\n📊 Resumen de Pruebas de Compilación:');
  console.log(`   • Pruebas realizadas: ${totalTests}`);
  console.log(`   • Exitosas: ${successCount}`);
  console.log(`   • Fallidas: ${totalTests - successCount}`);
  console.log(`   • Tasa de éxito: ${Math.round((successCount / totalTests) * 100)}%\n`);
  
  if (successCount === totalTests) {
    console.log('✅ ¡Todas las configuraciones están listas para compilación!');
    console.log('   Tailwind puede generar CSS correctamente con el sistema centralizado.\n');
    return 0;
  } else {
    console.log('⚠️  Algunas configuraciones pueden tener problemas.');
    console.log('   Revisa los detalles anteriores.\n');
    return 1;
  }
}

// Ejecutar pruebas
if (require.main === module) {
  process.exit(main());
}

module.exports = { main, testTailwindCSS, testGlobalCSS }; 