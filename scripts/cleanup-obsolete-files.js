#!/usr/bin/env node

/**
 * Script de Limpieza de Archivos Obsoletos - Shopifree
 * 
 * Elimina archivos y carpetas obsoletas después de la migración
 * al sistema de temas centralizado.
 */

const fs = require('fs');
const path = require('path');

// Archivos y carpetas a eliminar
const obsoleteItems = [
  'public/brand/icons/favicon.png', // Movido a cada app individual
  'public/brand/icons/',            // Carpeta vacía después de mover favicon
  'public/brand/colors/',           // Carpeta vacía después de migrar colores
  'public/brand/',                  // Carpeta raíz obsoleta
];

// Archivos de documentación que referencian rutas obsoletas
const docsToUpdate = [
  'FAVICON-INTEGRATION.md',
  'LOGO-SETUP.md'
];

function removeObsoleteItem(itemPath) {
  console.log(`\n🗑️  Procesando: ${itemPath}`);
  
  try {
    const fullPath = path.resolve(itemPath);
    
    if (!fs.existsSync(fullPath)) {
      console.log('   ✅ Ya eliminado o no existe');
      return true;
    }
    
    const stats = fs.statSync(fullPath);
    
    if (stats.isDirectory()) {
      // Verificar si está vacío
      const contents = fs.readdirSync(fullPath);
      if (contents.length === 0) {
        fs.rmdirSync(fullPath);
        console.log('   ✅ Carpeta vacía eliminada');
        return true;
      } else {
        console.log(`   ⚠️  Carpeta no vacía, contiene: ${contents.join(', ')}`);
        return false;
      }
    } else {
      // Es un archivo
      fs.unlinkSync(fullPath);
      console.log('   ✅ Archivo eliminado');
      return true;
    }
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return false;
  }
}

function updateDocumentation() {
  console.log('\n📝 Actualizando documentación...');
  
  for (const docFile of docsToUpdate) {
    if (!fs.existsSync(docFile)) {
      console.log(`   ⚠️  ${docFile} no encontrado`);
      continue;
    }
    
    try {
      let content = fs.readFileSync(docFile, 'utf8');
      let updated = false;
      
      // Reemplazar referencias obsoletas
      const obsoleteReferences = [
        { old: '/brand/icons/favicon.png', new: '/favicon.ico (por app)' },
        { old: 'public/brand/icons/', new: 'apps/*/public/ (distribuido)' },
        { old: 'public/brand/colors/', new: 'packages/ui/src/styles/brand/ (centralizado)' }
      ];
      
      for (const ref of obsoleteReferences) {
        if (content.includes(ref.old)) {
          content = content.replace(new RegExp(ref.old, 'g'), `${ref.old} (OBSOLETO → ${ref.new})`);
          updated = true;
        }
      }
      
      if (updated) {
        // Agregar nota de migración al inicio
        const migrationNote = `> **⚠️ NOTA DE MIGRACIÓN**: Este documento contiene referencias a rutas obsoletas.  
> El sistema ha sido migrado al sistema de temas centralizado. Ver \`THEME-MIGRATION.md\` para detalles.

`;
        
        if (!content.startsWith('> **⚠️ NOTA DE MIGRACIÓN**')) {
          content = migrationNote + content;
        }
        
        fs.writeFileSync(docFile, content);
        console.log(`   ✅ ${docFile} actualizado con notas de migración`);
      } else {
        console.log(`   ✅ ${docFile} no requiere actualizaciones`);
      }
    } catch (error) {
      console.log(`   ❌ Error actualizando ${docFile}: ${error.message}`);
    }
  }
}

function main() {
  console.log('🧹 Limpieza de Archivos Obsoletos - Sistema de Temas Centralizado\n');
  
  let totalProcessed = 0;
  let totalRemoved = 0;
  
  // Procesar elementos en orden (archivos primero, luego carpetas)
  const sortedItems = obsoleteItems.sort((a, b) => {
    // Archivos primero (contienen extensión), luego carpetas
    const aHasExt = path.extname(a) !== '';
    const bHasExt = path.extname(b) !== '';
    
    if (aHasExt && !bHasExt) return -1;
    if (!aHasExt && bHasExt) return 1;
    return 0;
  });
  
  for (const item of sortedItems) {
    totalProcessed++;
    const success = removeObsoleteItem(item);
    if (success) totalRemoved++;
  }
  
  // Actualizar documentación
  updateDocumentation();
  
  // Resumen
  console.log('\n📊 Resumen de Limpieza:');
  console.log(`   • Elementos procesados: ${totalProcessed}`);
  console.log(`   • Elementos eliminados: ${totalRemoved}`);
  console.log(`   • Documentación actualizada: ${docsToUpdate.length} archivos`);
  
  if (totalRemoved === totalProcessed) {
    console.log('\n✅ ¡Limpieza completada exitosamente!');
    console.log('   Todos los archivos obsoletos han sido eliminados.');
    console.log('   El sistema de temas centralizado está completamente migrado.\n');
    return 0;
  } else {
    console.log('\n⚠️  Limpieza parcialmente completada.');
    console.log('   Algunos elementos requieren eliminación manual.');
    console.log('   Ver detalles arriba.\n');
    return 1;
  }
}

function showManualSteps() {
  console.log('📋 Pasos Manuales Pendientes:\n');
  console.log('1. **Eliminar favicon central** (archivo binario):');
  console.log('   rm public/brand/icons/favicon.png\n');
  console.log('2. **Eliminar carpetas vacías**:');
  console.log('   rmdir public/brand/icons/');
  console.log('   rmdir public/brand/colors/');
  console.log('   rmdir public/brand/\n');
  console.log('3. **Verificar aplicaciones**:');
  console.log('   - Admin usa: /favicon.ico');
  console.log('   - Public-store usa: /brand/icons/favicon.png (local)');
  console.log('   - Dashboard usa: /favicon.svg (existente)\n');
}

// Ejecutar limpieza
if (require.main === module) {
  const result = main();
  if (result !== 0) {
    showManualSteps();
  }
  process.exit(result);
}

module.exports = { main, removeObsoleteItem, updateDocumentation }; 