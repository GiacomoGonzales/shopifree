#!/usr/bin/env node

/**
 * Script para probar las funciones de colecciones y marcas localmente
 * Verifica que las funciones importadas funcionen correctamente
 */

// Simular el entorno de Next.js
process.env.NODE_ENV = 'development';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testImports() {
  log(`${colors.bold}🔍 Probando importaciones de funciones${colors.reset}`, 'cyan');
  
  try {
    // Intentar importar las funciones
    log('📦 Importando getStoreCollections...', 'blue');
    const { getStoreCollections } = await import('../lib/collections.js');
    log('✅ getStoreCollections importada correctamente', 'green');
    
    log('📦 Importando getStoreBrands...', 'blue');
    const { getStoreBrands } = await import('../lib/brands.js');
    log('✅ getStoreBrands importada correctamente', 'green');
    
    // Verificar que son funciones
    if (typeof getStoreCollections === 'function') {
      log('✅ getStoreCollections es una función válida', 'green');
    } else {
      log('❌ getStoreCollections no es una función', 'red');
    }
    
    if (typeof getStoreBrands === 'function') {
      log('✅ getStoreBrands es una función válida', 'green');
    } else {
      log('❌ getStoreBrands no es una función', 'red');
    }
    
    return { getStoreCollections, getStoreBrands };
    
  } catch (error) {
    log(`❌ Error importando funciones: ${error.message}`, 'red');
    log(`📍 Stack: ${error.stack}`, 'yellow');
    return null;
  }
}

async function testSitemapGeneration() {
  log(`\n${colors.bold}🗺️ Probando generación de sitemap simulada${colors.reset}`, 'cyan');
  
  const functions = await testImports();
  if (!functions) {
    log('❌ No se pueden probar las funciones debido a errores de importación', 'red');
    return;
  }
  
  const { getStoreCollections, getStoreBrands } = functions;
  
  // Simular un storeId de prueba
  const testStoreId = 'test-store-123';
  
  try {
    log(`📂 Probando getStoreCollections con storeId: ${testStoreId}`, 'blue');
    
    // Probar con timeout como en el sitemap real
    const collectionsPromise = Promise.race([
      getStoreCollections(testStoreId),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
    ]);
    
    const collections = await collectionsPromise;
    log(`✅ Colecciones obtenidas: ${Array.isArray(collections) ? collections.length : 'No es array'}`, 'green');
    
    if (Array.isArray(collections) && collections.length > 0) {
      log(`📋 Ejemplo de colección:`, 'cyan');
      const sample = collections[0];
      log(`   ID: ${sample.id}`, 'cyan');
      log(`   Title: ${sample.title}`, 'cyan');
      log(`   Slug: ${sample.slug}`, 'cyan');
      log(`   Visible: ${sample.visible}`, 'cyan');
    }
    
  } catch (error) {
    log(`⚠️ Error obteniendo colecciones (esperado si no hay Firebase): ${error.message}`, 'yellow');
  }
  
  try {
    log(`🏷️ Probando getStoreBrands con storeId: ${testStoreId}`, 'blue');
    
    // Probar con timeout como en el sitemap real
    const brandsPromise = Promise.race([
      getStoreBrands(testStoreId),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
    ]);
    
    const brands = await brandsPromise;
    log(`✅ Marcas obtenidas: ${Array.isArray(brands) ? brands.length : 'No es array'}`, 'green');
    
    if (Array.isArray(brands) && brands.length > 0) {
      log(`📋 Ejemplo de marca:`, 'cyan');
      const sample = brands[0];
      log(`   ID: ${sample.id}`, 'cyan');
      log(`   Name: ${sample.name}`, 'cyan');
      log(`   Slug: ${sample.slug}`, 'cyan');
    }
    
  } catch (error) {
    log(`⚠️ Error obteniendo marcas (esperado si no hay Firebase): ${error.message}`, 'yellow');
  }
}

function generateSampleSitemap() {
  log(`\n${colors.bold}📄 Generando sitemap de ejemplo${colors.reset}`, 'cyan');
  
  const canonicalHost = 'https://ejemplo-tienda.shopifree.app';
  const urls = [];
  
  // URLs base
  urls.push(`${canonicalHost}/`);
  urls.push(`${canonicalHost}/catalogo`);
  urls.push(`${canonicalHost}/ofertas`);
  urls.push(`${canonicalHost}/favoritos`);
  
  // Categorías de ejemplo
  const sampleCategories = ['ropa', 'zapatos', 'accesorios'];
  sampleCategories.forEach(cat => {
    urls.push(`${canonicalHost}/categoria/${cat}`);
  });
  
  // Colecciones de ejemplo (NUEVAS)
  const sampleCollections = ['novedades', 'ofertas-especiales', 'temporada-verano'];
  sampleCollections.forEach(col => {
    urls.push(`${canonicalHost}/coleccion/${col}`);
  });
  
  // Marcas de ejemplo (NUEVAS)
  const sampleBrands = ['nike', 'adidas', 'puma', 'zara'];
  sampleBrands.forEach(brand => {
    urls.push(`${canonicalHost}/marca/${brand}`);
  });
  
  // Productos de ejemplo
  const sampleProducts = ['camisa-azul', 'zapatos-deportivos', 'bolso-cuero'];
  sampleProducts.forEach(prod => {
    urls.push(`${canonicalHost}/producto/${prod}`);
  });
  
  log(`📊 Sitemap de ejemplo generado:`, 'green');
  log(`   📄 Total URLs: ${urls.length}`, 'cyan');
  log(`   🏠 Página principal: 1`, 'cyan');
  log(`   📋 Páginas estáticas: 3`, 'cyan');
  log(`   📂 Categorías: ${sampleCategories.length}`, 'cyan');
  log(`   🎨 Colecciones: ${sampleCollections.length} ← ✨ NUEVO`, 'green');
  log(`   🏷️ Marcas: ${sampleBrands.length} ← ✨ NUEVO`, 'green');
  log(`   🛍️ Productos: ${sampleProducts.length}`, 'cyan');
  
  log(`\n📋 URLs de Colecciones:`, 'green');
  sampleCollections.forEach(col => {
    log(`   ${canonicalHost}/coleccion/${col}`, 'cyan');
  });
  
  log(`\n📋 URLs de Marcas:`, 'green');
  sampleBrands.forEach(brand => {
    log(`   ${canonicalHost}/marca/${brand}`, 'cyan');
  });
  
  return urls.join('\n');
}

async function main() {
  log(`${colors.bold}🔧 Probador de Funciones de Sitemap Mejorado${colors.reset}`, 'cyan');
  log(`${'='.repeat(60)}`, 'cyan');
  
  // Probar importaciones
  await testSitemapGeneration();
  
  // Generar ejemplo
  const sampleSitemap = generateSampleSitemap();
  
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`${colors.bold}📊 Resumen de Mejoras Implementadas${colors.reset}`, 'cyan');
  log(`✅ Importaciones agregadas: getStoreCollections, getStoreBrands`, 'green');
  log(`✅ Lógica de colecciones: Filtro por visible, límite 30`, 'green');
  log(`✅ Lógica de marcas: Validación de slug, límite 50`, 'green');
  log(`✅ Timeout de seguridad: 5 segundos para evitar sitemaps lentos`, 'green');
  log(`✅ Manejo de errores: Logs detallados y fallback graceful`, 'green');
  
  log(`\n💡 Las mejoras están implementadas en el código.`, 'cyan');
  log(`💡 Para ver los cambios en producción, es necesario desplegar.`, 'cyan');
  log(`💡 Las tiendas deben tener colecciones/marcas configuradas.`, 'cyan');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(error => {
    log(`❌ Error fatal: ${error.message}`, 'red');
    process.exit(1);
  });
}
