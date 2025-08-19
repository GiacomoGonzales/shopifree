#!/usr/bin/env node

/**
 * Script para probar el sitemap.xml generado
 * Verifica que el sitemap se genere correctamente para diferentes dominios
 */

const testUrls = [
  'https://lunara-store.xyz/sitemap.xml',
  'https://tiendaverde.shopifree.app/sitemap.xml',
  'https://tiendaenglish.shopifree.app/sitemap.xml'
];

async function testSitemap(url) {
  console.log(`\n🧪 Probando sitemap: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Shopifree-SitemapTester/1.0'
      }
    });
    
    console.log(`   Status: ${response.status}`);
    console.log(`   Content-Type: ${response.headers.get('content-type')}`);
    console.log(`   Cache-Control: ${response.headers.get('cache-control')}`);
    
    if (!response.ok) {
      console.log(`   ❌ Error: ${response.statusText}`);
      return false;
    }
    
    const xmlContent = await response.text();
    
    // Verificar que sea XML válido
    if (!xmlContent.includes('<?xml version="1.0"')) {
      console.log('   ❌ No es XML válido');
      return false;
    }
    
    if (!xmlContent.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">')) {
      console.log('   ❌ Falta namespace del sitemap');
      return false;
    }
    
    // Contar URLs
    const urlCount = (xmlContent.match(/<url>/g) || []).length;
    console.log(`   📊 URLs encontradas: ${urlCount}`);
    
    // Verificar que incluya la homepage
    if (!xmlContent.includes('<loc>')) {
      console.log('   ❌ No contiene URLs válidas');
      return false;
    }
    
    console.log('   ✅ Sitemap válido');
    
    // Mostrar algunas URLs para verificación
    const urlMatches = xmlContent.match(/<loc>(.*?)<\/loc>/g);
    if (urlMatches && urlMatches.length > 0) {
      console.log('   📋 Primeras URLs:');
      urlMatches.slice(0, 5).forEach(match => {
        const url = match.replace('<loc>', '').replace('</loc>', '');
        console.log(`      - ${url}`);
      });
      
      if (urlMatches.length > 5) {
        console.log(`      ... y ${urlMatches.length - 5} más`);
      }
    }
    
    return true;
    
  } catch (error) {
    console.log(`   ❌ Error de conexión: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🗺️ Iniciando pruebas de sitemap...\n');
  
  let successCount = 0;
  let totalCount = testUrls.length;
  
  for (const url of testUrls) {
    const success = await testSitemap(url);
    if (success) successCount++;
    
    // Pausa pequeña entre requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log(`\n📊 Resumen: ${successCount}/${totalCount} sitemaps funcionando correctamente`);
  
  if (successCount === totalCount) {
    console.log('🎉 ¡Todos los sitemaps están funcionando!');
    console.log('\n📋 Próximos pasos para GSC:');
    console.log('   1. Ve a Google Search Console');
    console.log('   2. Selecciona tu propiedad');
    console.log('   3. Ve a Sitemaps > Agregar un sitemap nuevo');
    console.log('   4. Añade simplemente: sitemap.xml');
    console.log('   5. No incluyas la URL completa, solo "sitemap.xml"');
  } else {
    console.log('⚠️ Algunos sitemaps tienen problemas. Revisa los logs arriba.');
  }
}

// Ejecutar solo si es el script principal
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testSitemap };
