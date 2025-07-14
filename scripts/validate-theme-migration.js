#!/usr/bin/env node

/**
 * Script de validación de migración de temas
 * Verifica que todos los colores hardcodeados han sido migrados al nuevo sistema
 */

const fs = require('fs');
const path = require('path');

// Colores que deberían haber sido migrados
const DEPRECATED_COLORS = [
  '#4F46E5', // Viejo primary
  '#06B6D4', // Viejo secondary
  '#3B82F6', // Azul hardcodeado
  '#1F2937', // Gris hardcodeado
  '#EF4444'  // Rojo hardcodeado
];

// Directorios a validar
const DIRS_TO_CHECK = [
  'apps/dashboard/components',
  'apps/dashboard/app',
  'apps/public-store/components',
  'apps/public-store/app',
  'apps/landing/app'
];

// Archivos que pueden contener colores hardcodeados legítimos
const ALLOWED_EXCEPTIONS = [
  'register/page.tsx', // Íconos de Google OAuth
  'login/page.tsx',    // Íconos de Google OAuth
  'RichTextEditor.tsx' // Editor con estilos específicos
];

console.log('🔍 Validando migración de temas...\n');

let hasErrors = false;
let totalFiles = 0;
let checkedFiles = 0;

/**
 * Busca colores hardcodeados en un archivo
 * @param {string} filePath - Ruta del archivo
 * @param {string} content - Contenido del archivo
 */
function checkFileForHardcodedColors(filePath, content) {
  const relativePath = path.relative(process.cwd(), filePath);
  
  // Saltar archivos excluidos
  if (ALLOWED_EXCEPTIONS.some(exception => relativePath.includes(exception))) {
    console.log(`⏭️  Saltando archivo excluido: ${relativePath}`);
    return;
  }

  const lines = content.split('\n');
  let fileHasIssues = false;

  DEPRECATED_COLORS.forEach(color => {
    lines.forEach((line, index) => {
      if (line.includes(color)) {
        if (!fileHasIssues) {
          console.log(`❌ ${relativePath}:`);
          fileHasIssues = true;
          hasErrors = true;
        }
        console.log(`   Línea ${index + 1}: ${line.trim()}`);
        console.log(`   🔄 Reemplazar ${color} con brandColors.* correspondiente\n`);
      }
    });
  });

  if (fileHasIssues) {
    console.log('');
  }
}

/**
 * Procesa un directorio recursivamente
 * @param {string} dir - Directorio a procesar
 */
function processDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`⚠️  Directorio no encontrado: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.match(/\.(ts|tsx|js|jsx)$/)) {
      totalFiles++;
      try {
        const content = fs.readFileSync(filePath, 'utf8');
        checkFileForHardcodedColors(filePath, content);
        checkedFiles++;
      } catch (error) {
        console.log(`❌ Error leyendo archivo ${filePath}: ${error.message}`);
        hasErrors = true;
      }
    }
  });
}

/**
 * Verifica que el paquete UI esté disponible
 */
function validateUIPackage() {
  console.log('📦 Verificando paquete @shopifree/ui...');
  
  try {
    const uiPackagePath = path.join('packages', 'ui', 'src', 'index.ts');
    if (!fs.existsSync(uiPackagePath)) {
      console.log('❌ Paquete UI no encontrado');
      return false;
    }

    const uiContent = fs.readFileSync(uiPackagePath, 'utf8');
    const requiredExports = ['brandColors', 'createTheme', 'getBrandColor'];
    
    const missingExports = requiredExports.filter(exp => !uiContent.includes(exp));
    
    if (missingExports.length > 0) {
      console.log(`❌ Exports faltantes en paquete UI: ${missingExports.join(', ')}`);
      return false;
    }

    console.log('✅ Paquete UI configurado correctamente\n');
    return true;
  } catch (error) {
    console.log(`❌ Error validando paquete UI: ${error.message}`);
    return false;
  }
}

/**
 * Verifica que las configuraciones de Tailwind estén actualizadas
 */
function validateTailwindConfigs() {
  console.log('🎨 Verificando configuraciones de Tailwind...');
  
  const tailwindConfigs = [
    'apps/dashboard/tailwind.config.js',
    'apps/public-store/tailwind.config.js',
    'apps/landing/tailwind.config.js'
  ];

  let allValid = true;

  tailwindConfigs.forEach(configPath => {
    if (!fs.existsSync(configPath)) {
      console.log(`❌ Configuración Tailwind no encontrada: ${configPath}`);
      allValid = false;
      return;
    }

    try {
      const content = fs.readFileSync(configPath, 'utf8');
      
      if (!content.includes("require('@shopifree/ui')")) {
        console.log(`❌ ${configPath} no importa @shopifree/ui`);
        allValid = false;
      } else if (!content.includes('brandColors')) {
        console.log(`❌ ${configPath} no usa brandColors`);
        allValid = false;
      } else {
        console.log(`✅ ${configPath} configurado correctamente`);
      }
    } catch (error) {
      console.log(`❌ Error leyendo ${configPath}: ${error.message}`);
      allValid = false;
    }
  });

  if (allValid) {
    console.log('✅ Todas las configuraciones Tailwind están actualizadas\n');
  }

  return allValid;
}

// Ejecutar validaciones
console.log('🚀 Iniciando validación de migración de temas\n');

// 1. Verificar paquete UI
if (!validateUIPackage()) {
  process.exit(1);
}

// 2. Verificar configuraciones Tailwind
if (!validateTailwindConfigs()) {
  hasErrors = true;
}

// 3. Buscar colores hardcodeados
console.log('🔍 Buscando colores hardcodeados...\n');

DIRS_TO_CHECK.forEach(dir => {
  console.log(`📁 Procesando directorio: ${dir}`);
  processDirectory(dir);
});

// Resultados finales
console.log('📊 Resumen de validación:');
console.log(`   📁 Archivos verificados: ${checkedFiles}/${totalFiles}`);

if (hasErrors) {
  console.log('\n❌ Migración INCOMPLETA');
  console.log('🔧 Acciones requeridas:');
  console.log('   1. Reemplazar colores hardcodeados encontrados');
  console.log('   2. Importar { brandColors } from "@shopifree/ui"');
  console.log('   3. Usar brandColors.primary, brandColors.secondary, etc.');
  console.log('\n📚 Consulta THEME-MIGRATION.md para más detalles');
  process.exit(1);
} else {
  console.log('\n✅ Migración COMPLETA');
  console.log('🎉 Todos los colores han sido migrados al nuevo sistema');
  console.log('💡 El sistema de temas está listo para usar');
  console.log('\n📖 Documentación disponible:');
  console.log('   • THEME-MIGRATION.md - Guía completa de migración');
  console.log('   • packages/ui/README.md - API del sistema de temas');
}

console.log('\n🏁 Validación completada'); 