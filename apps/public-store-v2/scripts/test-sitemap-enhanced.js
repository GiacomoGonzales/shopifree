#!/usr/bin/env node

/**
 * Script para probar el sitemap mejorado con colecciones y marcas
 * Verifica que las nuevas URLs estén incluidas correctamente
 */

const https = require('https');
const http = require('http');

// Configuración de tiendas de prueba
const TEST_STORES = [
  'https://lunara-store.xyz',
  'https://tiendaverde.shopifree.app',
  'https://demo-store.shopifree.app'
];

// Colores para output
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

function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https:') ? https : http;
    
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SitemapTester/1.0)'
      },
      timeout: 10000
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

function analyzeSitemap(body, baseUrl) {
  const lines = body.split('\n').filter(line => line.trim());
  
  const analysis = {
    total: lines.length,
    home: 0,
    static: 0,
    categories: 0,
    collections: 0,
    brands: 0,
    products: 0,
    other: 0,
    urls: {
      collections: [],
      brands: [],
      categories: [],
      products: []
    }
  };
  
  lines.forEach(url => {
    if (!url.startsWith(baseUrl)) return;
    
    const path = url.replace(baseUrl, '');
    
    if (path === '/' || path === '') {
      analysis.home++;
    } else if (path === '/catalogo' || path === '/ofertas' || path === '/favoritos') {
      analysis.static++;
    } else if (path.startsWith('/categoria/')) {
      analysis.categories++;
      analysis.urls.categories.push(path);
    } else if (path.startsWith('/coleccion/')) {
      analysis.collections++;
      analysis.urls.collections.push(path);
    } else if (path.startsWith('/marca/')) {
      analysis.brands++;
      analysis.urls.brands.push(path);
    } else if (path.startsWith('/producto/')) {
      analysis.products++;
      analysis.urls.products.push(path);
    } else {
      analysis.other++;
    }
  });
  
  return analysis;
}

async function testStore(storeUrl) {
  log(`\n${colors.bold}🏪 Probando tienda: ${storeUrl}${colors.reset}`, 'cyan');
  
  try {
    const sitemapUrl = `${storeUrl}/sitemap.xml`;
    log(`📡 Solicitando: ${sitemapUrl}`, 'blue');
    
    const response = await makeRequest(sitemapUrl);
    
    // Verificar headers
    log(`📊 Status: ${response.statusCode}`, response.statusCode === 200 ? 'green' : 'red');
    log(`📋 Content-Type: ${response.headers['content-type'] || 'No especificado'}`, 'yellow');
    log(`⏱️ Cache-Control: ${response.headers['cache-control'] || 'No especificado'}`, 'yellow');
    
    if (response.statusCode !== 200) {
      log(`❌ Error: Status ${response.statusCode}`, 'red');
      return false;
    }
    
    // Analizar contenido del sitemap
    const analysis = analyzeSitemap(response.body, storeUrl);
    
    log(`\n📈 Análisis del Sitemap:`, 'bold');
    log(`   📄 Total URLs: ${analysis.total}`, 'cyan');
    log(`   🏠 Página principal: ${analysis.home}`, 'green');
    log(`   📋 Páginas estáticas: ${analysis.static}`, 'green');
    log(`   📂 Categorías: ${analysis.categories}`, 'green');
    log(`   🎨 Colecciones: ${analysis.collections}`, analysis.collections > 0 ? 'green' : 'yellow');
    log(`   🏷️ Marcas: ${analysis.brands}`, analysis.brands > 0 ? 'green' : 'yellow');
    log(`   🛍️ Productos: ${analysis.products}`, 'green');
    log(`   ❓ Otras URLs: ${analysis.other}`, 'cyan');
    
    // Mostrar ejemplos de nuevas URLs
    if (analysis.collections > 0) {
      log(`\n✨ Ejemplos de Colecciones encontradas:`, 'green');
      analysis.urls.collections.slice(0, 5).forEach(url => {
        log(`   ${storeUrl}${url}`, 'cyan');
      });
      if (analysis.collections > 5) {
        log(`   ... y ${analysis.collections - 5} más`, 'cyan');
      }
    } else {
      log(`\n⚠️ No se encontraron URLs de colecciones`, 'yellow');
    }
    
    if (analysis.brands > 0) {
      log(`\n✨ Ejemplos de Marcas encontradas:`, 'green');
      analysis.urls.brands.slice(0, 5).forEach(url => {
        log(`   ${storeUrl}${url}`, 'cyan');
      });
      if (analysis.brands > 5) {
        log(`   ... y ${analysis.brands - 5} más`, 'cyan');
      }
    } else {
      log(`\n⚠️ No se encontraron URLs de marcas`, 'yellow');
    }
    
    // Verificar mejoras implementadas
    const hasCollections = analysis.collections > 0;
    const hasBrands = analysis.brands > 0;
    
    if (hasCollections && hasBrands) {
      log(`\n🎉 ¡ÉXITO! El sitemap incluye tanto colecciones como marcas`, 'green');
    } else if (hasCollections || hasBrands) {
      log(`\n✅ PARCIAL: El sitemap incluye ${hasCollections ? 'colecciones' : 'marcas'}`, 'yellow');
    } else {
      log(`\n❌ El sitemap NO incluye colecciones ni marcas`, 'red');
    }
    
    return hasCollections || hasBrands;
    
  } catch (error) {
    log(`❌ Error probando ${storeUrl}: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  log(`${colors.bold}🔍 Probador de Sitemap Mejorado${colors.reset}`, 'cyan');
  log(`${colors.bold}Verificando inclusión de colecciones y marcas${colors.reset}`, 'cyan');
  log(`${'='.repeat(60)}`, 'cyan');
  
  let successCount = 0;
  
  for (const storeUrl of TEST_STORES) {
    const success = await testStore(storeUrl);
    if (success) successCount++;
  }
  
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`${colors.bold}📊 Resumen Final${colors.reset}`, 'cyan');
  log(`✅ Tiendas con mejoras: ${successCount}/${TEST_STORES.length}`, successCount > 0 ? 'green' : 'red');
  
  if (successCount === TEST_STORES.length) {
    log(`🎉 ¡Todas las tiendas tienen el sitemap mejorado!`, 'green');
  } else if (successCount > 0) {
    log(`⚠️ Algunas tiendas aún no tienen las mejoras implementadas`, 'yellow');
  } else {
    log(`❌ Ninguna tienda tiene las mejoras del sitemap`, 'red');
  }
  
  log(`\n💡 Nota: Las tiendas deben tener colecciones y/o marcas configuradas para aparecer en el sitemap`, 'cyan');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(error => {
    log(`❌ Error fatal: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { testStore, analyzeSitemap };
