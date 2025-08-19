#!/usr/bin/env node

/**
 * Script de verificación SEO para Google Search Console
 * Verifica que todos los elementos estén correctos antes del registro en GSC
 */

const { exec } = require('child_process');
const util = require('util');
const execAsync = util.promisify(exec);

// URLs de ejemplo para testing
const TEST_STORES = [
  'tiendaverde.shopifree.app',
  'localhost:3004/tiendaverde'  // Para desarrollo local
];

/**
 * Función para hacer request HTTP y obtener headers
 */
async function makeRequest(url) {
  try {
    const { stdout } = await execAsync(`curl -s -I "${url}"`);
    return stdout;
  } catch (error) {
    console.error(`Error requesting ${url}:`, error.message);
    return null;
  }
}

/**
 * Función para obtener contenido HTML
 */
async function getContent(url) {
  try {
    const { stdout } = await execAsync(`curl -s "${url}"`);
    return stdout;
  } catch (error) {
    console.error(`Error getting content from ${url}:`, error.message);
    return null;
  }
}

/**
 * Verificar meta robots en una página
 */
function checkRobots(html) {
  const robotsMatch = html.match(/<meta\s+name=["']robots["']\s+content=["']([^"']+)["']/i);
  if (robotsMatch) {
    return robotsMatch[1];
  }
  return 'No robots meta found';
}

/**
 * Verificar Google Search Console verification
 */
function checkGoogleVerification(html) {
  const gscMatch = html.match(/<meta\s+name=["']google-site-verification["']\s+content=["']([^"']+)["']/i);
  if (gscMatch) {
    return gscMatch[1];
  }
  return 'No GSC verification found';
}

/**
 * Verificar canonical URL
 */
function checkCanonical(html) {
  const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  if (canonicalMatch) {
    return canonicalMatch[1];
  }
  return 'No canonical URL found';
}

/**
 * Verificar título y descripción
 */
function checkTitleAndDescription(html) {
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  
  return {
    title: titleMatch ? titleMatch[1] : 'No title found',
    description: descMatch ? descMatch[1] : 'No description found'
  };
}

/**
 * Verificar una tienda específica
 */
async function verifyStore(storeUrl) {
  console.log(`\n🔍 VERIFICANDO: ${storeUrl}`);
  console.log('='.repeat(50));
  
  const isLocalhost = storeUrl.includes('localhost');
  const baseUrl = isLocalhost ? `http://${storeUrl}` : `https://${storeUrl}`;
  
  // 1. Verificar página principal
  console.log('\n📋 1. PÁGINA PRINCIPAL');
  const homeHtml = await getContent(baseUrl);
  if (homeHtml) {
    const robots = checkRobots(homeHtml);
    const gsc = checkGoogleVerification(homeHtml);
    const canonical = checkCanonical(homeHtml);
    const { title, description } = checkTitleAndDescription(homeHtml);
    
    console.log(`   Robots: ${robots}`);
    console.log(`   GSC Token: ${gsc}`);
    console.log(`   Canonical: ${canonical}`);
    console.log(`   Título: ${title}`);
    console.log(`   Descripción: ${description}`);
    
    // Verificar si tiene noindex
    if (robots.includes('noindex')) {
      console.log(`   ❌ PROBLEMA: Página tiene noindex - Google no la indexará`);
    } else {
      console.log(`   ✅ OK: Página permite indexación`);
    }
    
    // Verificar título genérico
    if (title.includes('Shopifree Public Store')) {
      console.log(`   ⚠️ ADVERTENCIA: Título genérico detectado`);
    }
  } else {
    console.log('   ❌ No se pudo obtener contenido de la página principal');
  }
  
  // 2. Verificar sitemap.xml
  console.log('\n🗺️ 2. SITEMAP.XML');
  const sitemapHeaders = await makeRequest(`${baseUrl}/sitemap.xml`);
  if (sitemapHeaders) {
    const isXml = sitemapHeaders.includes('Content-Type: application/xml');
    const status = sitemapHeaders.includes('200 OK') ? '200 OK' : 'Error';
    console.log(`   Status: ${status}`);
    console.log(`   Content-Type: ${isXml ? 'application/xml ✅' : 'Incorrecto ❌'}`);
    
    // Verificar contenido del sitemap
    const sitemapContent = await getContent(`${baseUrl}/sitemap.xml`);
    if (sitemapContent) {
      const urlCount = (sitemapContent.match(/<loc>/g) || []).length;
      console.log(`   URLs en sitemap: ${urlCount}`);
      
      if (urlCount === 0) {
        console.log(`   ⚠️ ADVERTENCIA: Sitemap sin URLs`);
      }
    }
  } else {
    console.log('   ❌ Sitemap no accesible');
  }
  
  // 3. Verificar robots.txt
  console.log('\n🤖 3. ROBOTS.TXT');
  const robotsContent = await getContent(`${baseUrl}/robots.txt`);
  if (robotsContent) {
    const hasSitemap = robotsContent.includes('Sitemap:');
    const allowsAll = robotsContent.includes('Allow: /');
    console.log(`   Permite indexación: ${allowsAll ? 'Sí ✅' : 'No ❌'}`);
    console.log(`   Declara sitemap: ${hasSitemap ? 'Sí ✅' : 'No ❌'}`);
    
    if (hasSitemap) {
      const sitemapMatch = robotsContent.match(/Sitemap:\s*(.+)/);
      if (sitemapMatch) {
        console.log(`   URL del sitemap: ${sitemapMatch[1].trim()}`);
      }
    }
  } else {
    console.log('   ❌ Robots.txt no accesible');
  }
  
  // 4. Verificar que no sea 404
  console.log('\n🏠 4. VERIFICACIÓN 404');
  if (homeHtml && homeHtml.includes('Página no encontrada')) {
    console.log('   ❌ PROBLEMA CRÍTICO: La página muestra error 404');
    console.log('   🔧 SOLUCIÓN: Verificar configuración de routing y subdomain');
  } else {
    console.log('   ✅ OK: Página carga correctamente');
  }
}

/**
 * Función principal
 */
async function main() {
  console.log('🚀 VERIFICACIÓN SEO PARA GOOGLE SEARCH CONSOLE');
  console.log('='.repeat(60));
  console.log('Este script verifica que tu tienda esté lista para GSC');
  
  for (const store of TEST_STORES) {
    await verifyStore(store);
  }
  
  console.log('\n📋 RESUMEN Y SIGUIENTES PASOS:');
  console.log('='.repeat(40));
  console.log('1. ✅ Si robots no tiene noindex: Registrar en Google Search Console');
  console.log('2. ⚠️ Si robots tiene noindex: Revisar configuración canonical en Dashboard');
  console.log('3. 🔧 Si aparece 404: Verificar que la tienda existe y está configurada');
  console.log('4. 📝 Si título es genérico: Configurar SEO en Dashboard > Configuración');
  console.log('5. 🔍 Si no hay GSC token: Añadir en Dashboard > Integraciones > Google Search Console');
  
  console.log('\n🌐 PARA REGISTRAR EN GOOGLE SEARCH CONSOLE:');
  console.log('   1. Ir a https://search.google.com/search-console/');
  console.log('   2. Agregar propiedad con tu URL exacta');
  console.log('   3. Usar método "Meta tag HTML"');
  console.log('   4. Copiar el token al Dashboard de Shopifree');
  console.log('   5. Verificar y enviar sitemap');
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { verifyStore, checkRobots, checkGoogleVerification };
