#!/usr/bin/env node

/**
 * Script para probar el nuevo formato XML del sitemap y verificar marcas
 */

const https = require('https');
const http = require('http');

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

function analyzeSitemapXml(body, baseUrl) {
  const analysis = {
    isXml: false,
    total: 0,
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
    },
    xmlStructure: {
      hasXmlDeclaration: false,
      hasUrlset: false,
      hasValidStructure: false
    }
  };
  
  // Verificar estructura XML
  analysis.xmlStructure.hasXmlDeclaration = body.includes('<?xml version="1.0"');
  analysis.xmlStructure.hasUrlset = body.includes('<urlset');
  analysis.isXml = analysis.xmlStructure.hasXmlDeclaration && analysis.xmlStructure.hasUrlset;
  
  if (analysis.isXml) {
    // Extraer URLs del XML
    const urlMatches = body.match(/<loc>(.*?)<\/loc>/g) || [];
    analysis.total = urlMatches.length;
    
    urlMatches.forEach(match => {
      const url = match.replace(/<\/?loc>/g, '');
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
    
    analysis.xmlStructure.hasValidStructure = analysis.total > 0;
  } else {
    // Formato texto plano (legacy)
    const lines = body.split('\n').filter(line => line.trim());
    analysis.total = lines.length;
    
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
  }
  
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
    
    const isXmlContentType = (response.headers['content-type'] || '').includes('application/xml');
    log(`🔍 Content-Type correcto (XML): ${isXmlContentType ? 'SÍ' : 'NO'}`, isXmlContentType ? 'green' : 'red');
    
    if (response.statusCode !== 200) {
      log(`❌ Error: Status ${response.statusCode}`, 'red');
      return false;
    }
    
    // Analizar contenido del sitemap
    const analysis = analyzeSitemapXml(response.body, storeUrl);
    
    log(`\n📈 Análisis del Sitemap:`, 'bold');
    log(`   📄 Formato: ${analysis.isXml ? 'XML ✅' : 'Texto plano ❌'}`, analysis.isXml ? 'green' : 'red');
    log(`   📄 Total URLs: ${analysis.total}`, 'cyan');
    log(`   🏠 Página principal: ${analysis.home}`, 'green');
    log(`   📋 Páginas estáticas: ${analysis.static}`, 'green');
    log(`   📂 Categorías: ${analysis.categories}`, 'green');
    log(`   🎨 Colecciones: ${analysis.collections}`, analysis.collections > 0 ? 'green' : 'yellow');
    log(`   🏷️ Marcas: ${analysis.brands}`, analysis.brands > 0 ? 'green' : 'yellow');
    log(`   🛍️ Productos: ${analysis.products}`, 'green');
    log(`   ❓ Otras URLs: ${analysis.other}`, 'cyan');
    
    if (analysis.isXml) {
      log(`\n✨ Estructura XML:`, 'green');
      log(`   📄 Declaración XML: ${analysis.xmlStructure.hasXmlDeclaration ? '✅' : '❌'}`, analysis.xmlStructure.hasXmlDeclaration ? 'green' : 'red');
      log(`   🔗 Elemento urlset: ${analysis.xmlStructure.hasUrlset ? '✅' : '❌'}`, analysis.xmlStructure.hasUrlset ? 'green' : 'red');
      log(`   📋 Estructura válida: ${analysis.xmlStructure.hasValidStructure ? '✅' : '❌'}`, analysis.xmlStructure.hasValidStructure ? 'green' : 'red');
    }
    
    // Mostrar ejemplos de marcas
    if (analysis.brands > 0) {
      log(`\n🏷️ Marcas encontradas en sitemap:`, 'green');
      analysis.urls.brands.slice(0, 10).forEach(url => {
        log(`   ${storeUrl}${url}`, 'cyan');
      });
      if (analysis.brands > 10) {
        log(`   ... y ${analysis.brands - 10} más`, 'cyan');
      }
    } else {
      log(`\n⚠️ No se encontraron URLs de marcas en el sitemap`, 'yellow');
    }
    
    // Mostrar ejemplos de colecciones
    if (analysis.collections > 0) {
      log(`\n🎨 Colecciones encontradas en sitemap:`, 'green');
      analysis.urls.collections.slice(0, 5).forEach(url => {
        log(`   ${storeUrl}${url}`, 'cyan');
      });
      if (analysis.collections > 5) {
        log(`   ... y ${analysis.collections - 5} más`, 'cyan');
      }
    } else {
      log(`\n⚠️ No se encontraron URLs de colecciones en el sitemap`, 'yellow');
    }
    
    // Evaluación final
    const hasCorrectFormat = analysis.isXml && isXmlContentType;
    const hasNewFeatures = analysis.collections > 0 || analysis.brands > 0;
    
    if (hasCorrectFormat && hasNewFeatures) {
      log(`\n🎉 ¡PERFECTO! Sitemap en XML con colecciones y/o marcas`, 'green');
    } else if (hasCorrectFormat) {
      log(`\n✅ BUENO: Sitemap en XML pero sin colecciones/marcas`, 'yellow');
    } else if (hasNewFeatures) {
      log(`\n⚠️ PARCIAL: Tiene colecciones/marcas pero formato incorrecto`, 'yellow');
    } else {
      log(`\n❌ NECESITA MEJORAS: Sin XML ni nuevas funciones`, 'red');
    }
    
    return hasCorrectFormat && hasNewFeatures;
    
  } catch (error) {
    log(`❌ Error probando ${storeUrl}: ${error.message}`, 'red');
    return false;
  }
}

async function main() {
  log(`${colors.bold}🔍 Probador de Sitemap XML Mejorado${colors.reset}`, 'cyan');
  log(`${colors.bold}Verificando formato XML y páginas de marcas/colecciones${colors.reset}`, 'cyan');
  log(`${'='.repeat(70)}`, 'cyan');
  
  // Probar la tienda específica de la imagen
  const storeUrl = 'https://lunara-store.xyz';
  
  const success = await testStore(storeUrl);
  
  log(`\n${'='.repeat(70)}`, 'cyan');
  log(`${colors.bold}📊 Resumen Final${colors.reset}`, 'cyan');
  
  if (success) {
    log(`🎉 ¡El sitemap tiene formato XML correcto y incluye marcas/colecciones!`, 'green');
  } else {
    log(`⚠️ El sitemap necesita mejoras en formato XML o contenido de marcas`, 'yellow');
  }
  
  log(`\n💡 Cambios implementados:`, 'cyan');
  log(`   ✅ Content-Type cambiado a application/xml`, 'green');
  log(`   ✅ Estructura XML válida con <urlset>`, 'green');
  log(`   ✅ Eliminado "use client" de brands.ts`, 'green');
  log(`   ✅ Debugging mejorado para marcas`, 'green');
  log(`   ✅ Metadata XML (lastmod, changefreq, priority)`, 'green');
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().catch(error => {
    log(`❌ Error fatal: ${error.message}`, 'red');
    process.exit(1);
  });
}

module.exports = { testStore, analyzeSitemapXml };
