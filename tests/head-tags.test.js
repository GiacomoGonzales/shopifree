/**
 * Tests para head tags y metadatos SEO
 * Uso: node tests/head-tags.test.js <URL>
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
        'User-Agent': 'Mozilla/5.0 (compatible; Test/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
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
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    req.end();
  });
}

/**
 * Extraer metadatos del HTML
 */
function extractMetadata(html) {
  const metadata = {};
  
  // HTML lang
  const langMatch = html.match(/<html[^>]+lang=["']([^"']+)["']/i);
  metadata.htmlLang = langMatch ? langMatch[1] : null;
  
  // Canonical
  const canonicalMatch = html.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i);
  metadata.canonical = canonicalMatch ? canonicalMatch[1] : null;
  
  // Title
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  metadata.title = titleMatch ? titleMatch[1].trim() : null;
  
  // Meta description
  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]*content=["']([^"']+)["']/i);
  metadata.description = descMatch ? descMatch[1] : null;
  
  // Open Graph locale
  const ogLocaleMatch = html.match(/<meta[^>]+property=["']og:locale["'][^>]*content=["']([^"']+)["']/i);
  metadata.ogLocale = ogLocaleMatch ? ogLocaleMatch[1] : null;
  
  // Open Graph URL
  const ogUrlMatch = html.match(/<meta[^>]+property=["']og:url["'][^>]*content=["']([^"']+)["']/i);
  metadata.ogUrl = ogUrlMatch ? ogUrlMatch[1] : null;
  
  // Google Site Verification
  const gscMatch = html.match(/<meta[^>]+name=["']google-site-verification["'][^>]*content=["']([^"']+)["']/i);
  metadata.googleVerification = gscMatch ? gscMatch[1] : null;
  
  // Hreflang tags
  const hreflangMatches = html.match(/<link[^>]+rel=["']alternate["'][^>]*hreflang=["']([^"']+)["'][^>]*href=["']([^"']+)["']/gi) || [];
  metadata.hreflang = hreflangMatches.map(match => {
    const langMatch = match.match(/hreflang=["']([^"']+)["']/i);
    const hrefMatch = match.match(/href=["']([^"']+)["']/i);
    return {
      lang: langMatch ? langMatch[1] : null,
      href: hrefMatch ? hrefMatch[1] : null
    };
  });
  
  return metadata;
}

/**
 * Validar metadatos para single locale mode
 */
function validateSingleLocaleMetadata(metadata, expectedUrl) {
  const issues = [];
  const baseUrl = new URL(expectedUrl).origin;
  
  // 1. HTML lang debe estar presente
  if (!metadata.htmlLang) {
    issues.push('❌ HTML lang attribute missing');
  } else if (!['es', 'en', 'pt'].includes(metadata.htmlLang)) {
    issues.push(`❌ HTML lang invalid: ${metadata.htmlLang}`);
  } else {
    console.log(`✅ HTML lang: ${metadata.htmlLang}`);
  }
  
  // 2. Canonical debe estar sin prefijo de idioma
  if (!metadata.canonical) {
    issues.push('❌ Canonical URL missing');
  } else if (metadata.canonical.match(/\/(es|en|pt)\//)) {
    issues.push(`❌ Canonical has locale prefix: ${metadata.canonical}`);
  } else {
    console.log(`✅ Canonical URL (sin prefijo): ${metadata.canonical}`);
  }
  
  // 3. OG locale debe coincidir con HTML lang
  if (metadata.ogLocale) {
    const expectedOgLocale = {
      'es': 'es_ES',
      'en': 'en_US', 
      'pt': 'pt_BR'
    }[metadata.htmlLang];
    
    if (metadata.ogLocale !== expectedOgLocale) {
      issues.push(`❌ OG locale mismatch: expected ${expectedOgLocale}, got ${metadata.ogLocale}`);
    } else {
      console.log(`✅ OG locale correcto: ${metadata.ogLocale}`);
    }
  }
  
  // 4. OG URL debe estar sin prefijo
  if (metadata.ogUrl && metadata.ogUrl.match(/\/(es|en|pt)\//)) {
    issues.push(`❌ OG URL has locale prefix: ${metadata.ogUrl}`);
  } else if (metadata.ogUrl) {
    console.log(`✅ OG URL (sin prefijo): ${metadata.ogUrl}`);
  }
  
  // 5. En single locale mode, NO debe haber hreflang
  if (metadata.hreflang.length > 0) {
    issues.push(`❌ Hreflang tags present in single locale mode (${metadata.hreflang.length} tags)`);
    metadata.hreflang.forEach(tag => {
      console.log(`   - ${tag.lang}: ${tag.href}`);
    });
  } else {
    console.log(`✅ Sin hreflang tags (correcto para single locale)`);
  }
  
  // 6. Google verification (opcional pero deseable)
  if (metadata.googleVerification) {
    console.log(`✅ Google verification presente: ${metadata.googleVerification.substring(0, 20)}...`);
  } else {
    console.log(`⚠️  Google verification no presente (opcional)`);
  }
  
  return issues;
}

/**
 * Test completo de head tags
 */
async function testHeadTags(url) {
  console.log(`📊 Testeando head tags para: ${url}`);
  
  try {
    const response = await makeRequest(url);
    
    console.log(`\n📄 Response:`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Content-Type: ${response.headers['content-type']}`);
    
    if (response.status !== 200) {
      console.log(`❌ Página no responde 200, got ${response.status}`);
      return false;
    }
    
    // Extraer metadatos
    const metadata = extractMetadata(response.body);
    
    console.log(`\n🔍 Metadatos extraídos:`);
    console.log(`   Title: ${metadata.title || 'MISSING'}`);
    console.log(`   Description: ${metadata.description ? metadata.description.substring(0, 100) + '...' : 'MISSING'}`);
    
    // Validar para single locale mode
    const issues = validateSingleLocaleMetadata(metadata, url);
    
    if (issues.length > 0) {
      console.log(`\n❌ PROBLEMAS ENCONTRADOS:`);
      issues.forEach(issue => console.log(`   ${issue}`));
      return false;
    } else {
      console.log(`\n✅ TODOS LOS METADATOS CORRECTOS`);
      return true;
    }
    
  } catch (error) {
    console.log(`\n❌ ERROR: ${error.message}`);
    return false;
  }
}

/**
 * Test de redirecciones de compatibilidad
 */
async function testCompatibilityRedirects(baseUrl) {
  console.log(`\n🔄 Testeando redirects de compatibilidad para: ${baseUrl}`);
  
  const testPaths = ['/es', '/en', '/es/categoria/test', '/en/producto/test'];
  let allPassed = true;
  
  for (const path of testPaths) {
    try {
      const fullUrl = `${baseUrl}${path}`;
      console.log(`\n   Testing: ${path}`);
      
      const response = await makeRequest(fullUrl);
      
      if (response.status === 301 || response.status === 302) {
        const location = response.headers.location;
        console.log(`   ✅ Redirect ${response.status}: ${path} → ${location}`);
        
        // Verificar que redirige sin prefijo
        if (location && location.match(/\/(es|en|pt)\//)) {
          console.log(`   ❌ Redirect aún contiene prefijo de idioma`);
          allPassed = false;
        }
      } else {
        console.log(`   ❌ Expected redirect, got ${response.status}`);
        allPassed = false;
      }
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

/**
 * Ejecutar todos los tests de head tags
 */
async function runHeadTagsTests() {
  console.log('🧪 Ejecutando tests de head tags y SEO...\n');
  
  // URL de prueba desde argumentos o default
  const testUrl = process.argv[2] || 'http://localhost:3004';
  
  console.log(`${'='.repeat(60)}`);
  console.log(`🎯 TESTING: ${testUrl}`);
  console.log(`${'='.repeat(60)}`);
  
  // Test 1: Head tags de la página principal
  const headTagsPassed = await testHeadTags(testUrl);
  
  // Test 2: Redirects de compatibilidad  
  const redirectsPassed = await testCompatibilityRedirects(testUrl);
  
  const allPassed = headTagsPassed && redirectsPassed;
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🏁 RESULTADO: ${allPassed ? '✅ TODOS LOS TESTS PASARON' : '❌ ALGUNOS TESTS FALLARON'}`);
  console.log(`${'='.repeat(60)}`);
  
  return allPassed;
}

// Ejecutar si se llama directamente
if (require.main === module) {
  runHeadTagsTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Error ejecutando tests:', error);
    process.exit(1);
  });
}

module.exports = {
  testHeadTags,
  testCompatibilityRedirects,
  runHeadTagsTests,
  extractMetadata,
  validateSingleLocaleMetadata
};
