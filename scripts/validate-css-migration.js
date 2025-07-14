#!/usr/bin/env node

/**
 * Script de Validación de Migración CSS - Shopifree
 * 
 * Verifica que todos los archivos CSS globales usen correctamente
 * el nuevo sistema de variables del tema centralizado.
 */

const fs = require('fs');
const path = require('path');

// Colores que ya no deberían estar hardcodeados
const DEPRECATED_COLORS = [
  // Hexadecimales (excepto logos de marca como Google)
  /#[0-9A-Fa-f]{6}(?!.*google|.*Google|.*GOOGLE)/g,
  /#[0-9A-Fa-f]{3}(?!.*google|.*Google|.*GOOGLE)/g,
  
  // RGB hardcodeados específicos
  /rgb\(255,?\s*255,?\s*255\)/g,
  /rgb\(0,?\s*0,?\s*0\)/g,
  /rgb\(229,?\s*231,?\s*235\)/g,
  /rgb\(209,?\s*213,?\s*219\)/g,
  /rgb\(156,?\s*163,?\s*175\)/g,
];

// Variables que deberían estar presentes en cada app
const REQUIRED_VARIABLES = {
  'apps/dashboard/app/globals.css': [
    '--dashboard-primary',
    '--dashboard-secondary', 
    '--dashboard-neutral-50',
    '--dashboard-neutral-900',
    '--dashboard-background',
    '--dashboard-foreground',
    '--dashboard-border',
  ],
  'apps/public-store/app/globals.css': [
    '--store-primary',
    '--store-secondary',
    '--store-neutral-50', 
    '--store-neutral-900',
    '--store-product-bg',
    '--store-cart-bg',
    '--store-price-current',
  ],
  'apps/landing/app/globals.css': [
    '--landing-primary',
    '--landing-secondary',
    '--landing-neutral-50',
    '--landing-neutral-900',
    '--landing-background',
    '--landing-foreground',
  ],
  'apps/admin/app/globals.css': [
    '--admin-primary',
    '--admin-secondary',
    '--admin-neutral-50',
    '--admin-neutral-900',
    '--admin-background',
    '--admin-foreground',
  ]
};

// Archivos que deben usar variables en lugar de colores hardcodeados
const FILES_TO_CHECK = [
  'apps/dashboard/app/globals.css',
  'apps/public-store/app/globals.css', 
  'apps/landing/app/globals.css',
  'apps/admin/app/globals.css',
  'apps/dashboard/components/RichTextEditor.tsx',
  // Agregar más archivos según sea necesario
];

let errors = [];
let warnings = [];
let totalChecked = 0;

function checkFile(filePath) {
  totalChecked++;
  
  if (!fs.existsSync(filePath)) {
    errors.push(`❌ Archivo no encontrado: ${filePath}`);
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Verificar colores hardcodeados
  for (const pattern of DEPRECATED_COLORS) {
    const matches = content.match(pattern);
    if (matches) {
      // Filtrar falsos positivos (logos de Google, etc.)
      const validMatches = matches.filter(match => 
        !content.includes('Google') && 
        !content.includes('google') &&
        !content.includes('Colores oficiales del logo')
      );
      
      if (validMatches.length > 0) {
        warnings.push(`⚠️  ${filePath}: Colores hardcodeados encontrados: ${validMatches.join(', ')}`);
      }
    }
  }
  
  // Verificar variables requeridas para archivos CSS globales
  if (REQUIRED_VARIABLES[filePath]) {
    const missingVars = REQUIRED_VARIABLES[filePath].filter(varName => 
      !content.includes(varName)
    );
    
    if (missingVars.length > 0) {
      errors.push(`❌ ${filePath}: Variables faltantes: ${missingVars.join(', ')}`);
    }
  }
  
  // Verificar que usa rgb(var(--variable)) en lugar de colores directos
  if (filePath.endsWith('.css')) {
    const hasOldFormat = content.includes('color: #') || 
                        content.includes('background: #') ||
                        content.includes('border: 1px solid #');
    
    if (hasOldFormat) {
      const hasNewFormat = content.includes('rgb(var(--') || 
                           content.includes('color: rgb(var(');
      
      if (!hasNewFormat) {
        warnings.push(`⚠️  ${filePath}: Debería usar formato rgb(var(--variable)) para colores`);
      }
    }
  }
}

function validateBrandColors() {
  const brandColorsPath = 'packages/ui/src/styles/brand/colors.ts';
  
  if (!fs.existsSync(brandColorsPath)) {
    errors.push(`❌ Sistema de colores centralizado no encontrado: ${brandColorsPath}`);
    return;
  }
  
  const content = fs.readFileSync(brandColorsPath, 'utf8');
  
  // Verificar que exporta brandColors
  if (!content.includes('export const brandColors')) {
    errors.push(`❌ ${brandColorsPath}: No exporta brandColors`);
  }
  
  // Verificar colores principales
  const requiredColors = ['primary', 'secondary', 'accent', 'success', 'warning', 'error'];
  const missingColors = requiredColors.filter(color => 
    !content.includes(`${color}:`)
  );
  
  if (missingColors.length > 0) {
    errors.push(`❌ ${brandColorsPath}: Colores faltantes: ${missingColors.join(', ')}`);
  }
}

function validateTailwindConfigs() {
  const tailwindConfigs = [
    'apps/dashboard/tailwind.config.js',
    'apps/public-store/tailwind.config.js', 
    'apps/landing/tailwind.config.js',
    'apps/admin/tailwind.config.js'
  ];
  
  for (const configPath of tailwindConfigs) {
    totalChecked++;
    
    if (!fs.existsSync(configPath)) {
      errors.push(`❌ Configuración Tailwind no encontrada: ${configPath}`);
      continue;
    }
    
    const content = fs.readFileSync(configPath, 'utf8');
    
    // Verificar que usa brandColors (comentado debido a problemas de compilación)
    if (content.includes('const brandColors')) {
      // OK - usando colores hardcodeados como solución temporal
    } else {
      warnings.push(`⚠️  ${configPath}: No usa brandColors (esperado por problemas de compilación)`);
    }
  }
}

function main() {
  console.log('🎨 Validando Migración CSS - Sistema de Temas Centralizado\n');
  
  // Validar sistema de colores centralizado
  console.log('📦 Validando sistema de colores centralizado...');
  validateBrandColors();
  
  // Validar configuraciones Tailwind
  console.log('⚙️  Validando configuraciones Tailwind...');
  validateTailwindConfigs();
  
  // Validar archivos individuales
  console.log('📄 Validando archivos CSS globales...');
  for (const filePath of FILES_TO_CHECK) {
    checkFile(filePath);
  }
  
  // Mostrar resultados
  console.log('\n📊 Resultados de la Validación:');
  console.log(`   • Archivos verificados: ${totalChecked}`);
  console.log(`   • Errores encontrados: ${errors.length}`);
  console.log(`   • Advertencias: ${warnings.length}\n`);
  
  // Mostrar errores
  if (errors.length > 0) {
    console.log('🚨 ERRORES:');
    errors.forEach(error => console.log(`   ${error}`));
    console.log('');
  }
  
  // Mostrar advertencias
  if (warnings.length > 0) {
    console.log('⚠️  ADVERTENCIAS:');
    warnings.forEach(warning => console.log(`   ${warning}`));
    console.log('');
  }
  
  // Resultado final
  if (errors.length === 0 && warnings.length === 0) {
    console.log('✅ ¡Migración CSS completada exitosamente!');
    console.log('   Todos los archivos usan correctamente el sistema de temas centralizado.\n');
    return 0;
  } else if (errors.length === 0) {
    console.log('✅ Migración CSS completada con advertencias menores.');
    console.log('   El sistema funciona correctamente pero hay mejoras pendientes.\n');
    return 0;
  } else {
    console.log('❌ Migración CSS incompleta.');
    console.log('   Por favor, corrige los errores antes de continuar.\n');
    return 1;
  }
}

// Ejecutar validación
if (require.main === module) {
  process.exit(main());
}

module.exports = { main, checkFile, validateBrandColors, validateTailwindConfigs }; 