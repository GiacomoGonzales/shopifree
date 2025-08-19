#!/usr/bin/env node

/**
 * Script para probar los headers del sitemap.xml y robots.txt
 * Ejecutar: node scripts/test-sitemap-headers.js
 */

const https = require('https');
const http = require('http');

const DOMAIN = 'lunara-store.xyz';
const PATHS = ['/sitemap.xml', '/robots.txt'];

function makeRequest(protocol, hostname, path) {
  return new Promise((resolve, reject) => {
    const client = protocol === 'https:' ? https : http;
    
    const options = {
      hostname,
      port: protocol === 'https:' ? 443 : 80,
      path,
      method: 'GET',
      headers: {
        'User-Agent': 'Googlebot/2.1 (+http://www.google.com/bot.html)',
        'Accept': '*/*'
      }
    };

    const req = client.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data.substring(0, 500) // Solo primeros 500 chars
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.end();
  });
}

async function testEndpoints() {
  console.log(`🔍 Probando endpoints para ${DOMAIN}\n`);
  
  for (const path of PATHS) {
    console.log(`📋 Probando: ${path}`);
    console.log('─'.repeat(50));
    
    try {
      // Probar HTTPS primero
      const httpsResult = await makeRequest('https:', DOMAIN, path);
      
      console.log(`✅ HTTPS (${httpsResult.statusCode}):`);
      console.log(`   Content-Type: ${httpsResult.headers['content-type'] || 'NO DEFINIDO'}`);
      console.log(`   Cache-Control: ${httpsResult.headers['cache-control'] || 'NO DEFINIDO'}`);
      console.log(`   X-Robots-Tag: ${httpsResult.headers['x-robots-tag'] || 'NO DEFINIDO'}`);
      console.log(`   Content-Length: ${httpsResult.headers['content-length'] || 'NO DEFINIDO'}`);
      console.log(`   Server: ${httpsResult.headers['server'] || 'NO DEFINIDO'}`);
      
      if (path === '/sitemap.xml') {
        const isXML = httpsResult.headers['content-type']?.includes('application/xml');
        const hasUTF8 = httpsResult.headers['content-type']?.includes('charset=UTF-8');
        
        console.log(`   ✅ XML válido: ${isXML ? 'SÍ' : 'NO'}`);
        console.log(`   ✅ UTF-8: ${hasUTF8 ? 'SÍ' : 'NO'}`);
        
        if (!isXML || !hasUTF8) {
          console.log(`   ❌ PROBLEMA: Content-Type debe ser 'application/xml; charset=UTF-8'`);
        }
      }
      
      if (path === '/robots.txt') {
        const isText = httpsResult.headers['content-type']?.includes('text/plain');
        const hasUTF8 = httpsResult.headers['content-type']?.includes('charset=UTF-8');
        
        console.log(`   ✅ Text válido: ${isText ? 'SÍ' : 'NO'}`);
        console.log(`   ✅ UTF-8: ${hasUTF8 ? 'SÍ' : 'NO'}`);
        
        if (!isText || !hasUTF8) {
          console.log(`   ❌ PROBLEMA: Content-Type debe ser 'text/plain; charset=UTF-8'`);
        }
      }
      
      console.log(`   📄 Contenido (primeros 200 chars):`);
      console.log(`      ${httpsResult.data.substring(0, 200).replace(/\n/g, '\\n')}`);
      
    } catch (error) {
      console.log(`❌ Error HTTPS: ${error.message}`);
      
      // Intentar HTTP como fallback
      try {
        const httpResult = await makeRequest('http:', DOMAIN, path);
        console.log(`⚠️  HTTP (${httpResult.statusCode}):`);
        console.log(`   Content-Type: ${httpResult.headers['content-type'] || 'NO DEFINIDO'}`);
        console.log(`   Cache-Control: ${httpResult.headers['cache-control'] || 'NO DEFINIDO'}`);
      } catch (httpError) {
        console.log(`❌ Error HTTP también: ${httpError.message}`);
      }
    }
    
    console.log('\n');
  }
  
  console.log('🎯 Resumen de verificación:');
  console.log('─'.repeat(50));
  console.log('✅ Sitemap debe responder con:');
  console.log('   - Status: 200');
  console.log('   - Content-Type: application/xml; charset=UTF-8');
  console.log('   - Cache-Control: public, max-age=3600');
  console.log('   - X-Robots-Tag: index');
  console.log('');
  console.log('✅ Robots.txt debe responder con:');
  console.log('   - Status: 200');
  console.log('   - Content-Type: text/plain; charset=UTF-8');
  console.log('   - Cache-Control: public, max-age=3600');
  console.log('   - Contenido: User-agent: *, Allow: /, Sitemap: URL');
}

// Ejecutar pruebas
testEndpoints().catch(console.error);
