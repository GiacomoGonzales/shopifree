#!/usr/bin/env node

/**
 * Script para configurar tienda local para testing
 * Uso: node scripts/setup-local-store.js
 */

console.log('🔧 Configurando tienda local para testing...');
console.log('');

// Mock de datos de TiendaVerde para testing local
const mockStoreData = {
  subdomain: 'tiendaverde',
  storeName: 'TiendaVerde',
  seo: {
    title: 'TiendaVerde - Productos Naturales',
    description: 'Los mejores productos naturales y orgánicos',
    language: 'es'
  },
  advanced: {
    singleLocaleUrls: true,
    language: 'es'
  }
};

console.log('📋 Configuración de tienda de prueba:');
console.log(`   Subdomain: ${mockStoreData.subdomain}`);
console.log(`   Nombre: ${mockStoreData.storeName}`);
console.log(`   Idioma: ${mockStoreData.advanced.language}`);
console.log(`   Single Locale URLs: ${mockStoreData.advanced.singleLocaleUrls}`);
console.log('');

console.log('🌐 Para acceder localmente:');
console.log('   URL: http://tiendaverde.localhost:3004/');
console.log('   O: http://localhost:3004/ (configurando host header)');
console.log('');

console.log('🧪 URLs de prueba:');
console.log('   Home: http://tiendaverde.localhost:3004/');
console.log('   Producto: http://tiendaverde.localhost:3004/producto/ejemplo-producto');
console.log('   Categoría: http://tiendaverde.localhost:3004/categoria/ejemplo-categoria');
console.log('   Sitemap: http://tiendaverde.localhost:3004/sitemap.xml');
console.log('');

console.log('🔄 Test de redirects:');
console.log('   http://tiendaverde.localhost:3004/es → debería redirigir a /');
console.log('   http://tiendaverde.localhost:3004/en → debería redirigir a /');
console.log('');

console.log('💡 Tips:');
console.log('   1. Asegúrate de que Next.js está ejecutándose: npm run dev');
console.log('   2. Si no funciona el subdomain, usar curl con header:');
console.log('      curl -H "Host: tiendaverde.localhost" http://localhost:3004/');
console.log('   3. Para Chrome, puedes editar hosts file o usar extensión');
console.log('');

console.log('✅ Configuración lista para testing!');
