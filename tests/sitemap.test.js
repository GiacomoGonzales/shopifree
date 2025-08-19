/**
 * Tests básicos para sitemap.xml generation
 * Uso: node tests/sitemap.test.js
 */

const https = require('https');
const { URL } = require('url');

/**
 * Test helper para hacer requests HTTP
 */
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'Test/1.0'
      }
    };

    const client = urlObj.protocol === 'https:' ? https : require('http');
    
    const req = client.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

/**
 * Extraer URLs del sitemap XML
 */
function extractUrlsFromSitemap(xmlContent) {
  const locMatches = xmlContent.match(/<loc>([^<]+)<\/loc>/g) || [];
  return locMatches.map(match => match.replace(/<\/?loc>/g, ''));
}

/**
 * Verificar que no hay prefijos de idioma en URLs
 */
function checkNoLocalePrefixes(urls) {
  const prefixPatterns = ['/es/', '/en/', '/pt/'];
  const urlsWithPrefix = urls.filter(url => 
    prefixPatterns.some(prefix => url.includes(prefix))
  );
  
  return {
    hasLocalePrefixes: urlsWithPrefix.length > 0,
    urlsWithPrefix
  };
}

/**
 * Tests de sitemap para single locale mode
 */
async function testSitemap(baseUrl) {
  console.log(`🗺️ Testeando sitemap para: ${baseUrl}`);
  
  try {
    // Test 1: Sitemap responde 200
    const sitemapUrl = `${baseUrl}/sitemap.xml`;
    const response = await makeRequest(sitemapUrl);
    
    console.log(`\n📄 Sitemap Response:`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Content-Type: ${response.headers['content-type']}`);
    console.log(`   Has X-Robots-Tag: ${response.headers['x-robots-tag'] ? 'YES' : 'NO'}`);
    
    if (response.status !== 200) {
      console.log(`❌ Sitemap no responde 200, got ${response.status}`);
      return false;
    }
    
    // Test 2: Extraer URLs del sitemap
    const urls = extractUrlsFromSitemap(response.body);
    console.log(`\n🔗 URLs encontradas: ${urls.length}`);
    
    if (urls.length === 0) {
      console.log(`❌ No se encontraron URLs en el sitemap`);
      return false;
    }
    
    // Mostrar primeras URLs como muestra
    console.log(`   Ejemplos:`);
    urls.slice(0, 5).forEach(url => console.log(`     - ${url}`));
    if (urls.length > 5) {
      console.log(`     ... y ${urls.length - 5} más`);
    }
    
    // Test 3: Verificar que no hay prefijos de idioma
    const prefixCheck = checkNoLocalePrefixes(urls);
    
    if (prefixCheck.hasLocalePrefixes) {
      console.log(`\n❌ FALLO: Sitemap contiene URLs con prefijos de idioma:`);
      prefixCheck.urlsWithPrefix.forEach(url => console.log(`     - ${url}`));
      return false;
    } else {
      console.log(`\n✅ ÉXITO: Sitemap no contiene prefijos de idioma`);
    }
    
    // Test 4: Verificar headers del sitemap
    if (response.headers['x-robots-tag'] && response.headers['x-robots-tag'].includes('noindex')) {
      console.log(`\n❌ FALLO: Sitemap tiene X-Robots-Tag: noindex`);
      return false;
    } else {
      console.log(`\n✅ ÉXITO: Sitemap sin X-Robots-Tag noindex`);
    }
    
    // Test 5: Verificar XML válido
    if (!response.body.includes('<?xml') || !response.body.includes('<urlset')) {
      console.log(`\n❌ FALLO: Sitemap no parece ser XML válido`);
      return false;
    } else {
      console.log(`\n✅ ÉXITO: Sitemap es XML válido`);
    }
    
    return true;
    
  } catch (error) {
    console.log(`\n❌ ERROR: ${error.message}`);
    return false;
  }
}

/**
 * Tests de robots.txt
 */
async function testRobots(baseUrl) {
  console.log(`\n🤖 Testeando robots.txt para: ${baseUrl}`);
  
  try {
    const robotsUrl = `${baseUrl}/robots.txt`;
    const response = await makeRequest(robotsUrl);
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Content-Type: ${response.headers['content-type']}`);
    
    if (response.status !== 200) {
      console.log(`❌ robots.txt no responde 200`);
      return false;
    }
    
    // Verificar que apunta al sitemap correcto
    if (response.body.includes(`Sitemap: ${baseUrl}/sitemap.xml`)) {
      console.log(`✅ robots.txt apunta al sitemap correcto`);
      return true;
    } else {
      console.log(`❌ robots.txt no apunta al sitemap correcto`);
      console.log(`   Contenido:\n${response.body}`);
      return false;
    }
    
  } catch (error) {
    console.log(`❌ ERROR en robots.txt: ${error.message}`);
    return false;
  }
}

/**
 * Ejecutar todos los tests
 */
async function runSitemapTests() {
  console.log('🧪 Ejecutando tests de sitemap y robots...\n');
  
  // URLs de prueba - ajustar según necesidad
  const testUrls = [
    'http://localhost:3004',  // Desarrollo local
    // 'https://mitienda.shopifree.app',  // Subdomain de prueba
    // 'https://tu-dominio.com'  // Custom domain de prueba
  ];
  
  let allPassed = true;
  
  for (const baseUrl of testUrls) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎯 TESTING: ${baseUrl}`);
    console.log(`${'='.repeat(60)}`);
    
    const sitemapPassed = await testSitemap(baseUrl);
    const robotsPassed = await testRobots(baseUrl);
    
    const urlPassed = sitemapPassed && robotsPassed;
    allPassed = allPassed && urlPassed;
    
    console.log(`\n📊 Resultado para ${baseUrl}: ${urlPassed ? '✅ PASSED' : '❌ FAILED'}`);
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🏁 RESULTADO FINAL: ${allPassed ? '✅ TODOS LOS TESTS PASARON' : '❌ ALGUNOS TESTS FALLARON'}`);
  console.log(`${'='.repeat(60)}`);
  
  return allPassed;
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runSitemapTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Error ejecutando tests:', error);
    process.exit(1);
  });
}

module.exports = {
  testSitemap,
  testRobots,
  runSitemapTests,
  extractUrlsFromSitemap,
  checkNoLocalePrefixes
};
