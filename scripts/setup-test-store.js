#!/usr/bin/env node

/**
 * Script para configurar una tienda de prueba con single locale URLs
 * Uso: node scripts/setup-test-store.js [storeId] [primaryLocale]
 */

const admin = require('firebase-admin');

// Configurar Firebase Admin (usa las mismas env vars que la app)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

async function setupTestStore(storeId, primaryLocale = 'es') {
  try {
    console.log(`🔧 Configurando tienda de prueba: ${storeId}`);
    
    // Obtener datos actuales de la tienda
    const storeRef = db.collection('stores').doc(storeId);
    const storeDoc = await storeRef.get();
    
    if (!storeDoc.exists) {
      console.error(`❌ Tienda ${storeId} no existe`);
      return;
    }
    
    const currentData = storeDoc.data();
    console.log(`📊 Tienda actual: ${currentData.storeName || storeId}`);
    console.log(`📊 Subdomain: ${currentData.subdomain || 'No definido'}`);
    
    // Actualizar configuración para single locale
    await storeRef.update({
      'advanced.singleLocaleUrls': true,
      'advanced.language': primaryLocale
    });
    
    console.log(`✅ Feature flag activada:`);
    console.log(`   - singleLocaleUrls: true`);
    console.log(`   - primaryLocale: ${primaryLocale}`);
    
    // Mostrar URLs de prueba
    const subdomain = currentData.subdomain;
    if (subdomain) {
      console.log(`\n🧪 URLs para probar:`);
      console.log(`   - Home: http://localhost:3004/`);
      console.log(`   - Con subdomain: http://${subdomain}.localhost:3004/`);
      console.log(`   - Test 301: http://${subdomain}.localhost:3004/es`);
      console.log(`   - Sitemap: http://${subdomain}.localhost:3004/sitemap.xml`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function listStores() {
  try {
    console.log('📋 Tiendas disponibles:');
    const storesSnapshot = await db.collection('stores').limit(10).get();
    
    storesSnapshot.forEach(doc => {
      const data = doc.data();
      const singleLocaleUrls = data?.advanced?.singleLocaleUrls || false;
      const language = data?.advanced?.language || 'es';
      
      console.log(`   ${doc.id}: ${data.storeName || 'Sin nombre'}`);
      console.log(`      subdomain: ${data.subdomain || 'N/A'}`);
      console.log(`      singleLocaleUrls: ${singleLocaleUrls}`);
      console.log(`      language: ${language}`);
      console.log('');
    });
  } catch (error) {
    console.error('❌ Error listando tiendas:', error);
  }
}

// Argumentos de línea de comandos
const [,, storeId, primaryLocale] = process.argv;

if (!storeId) {
  console.log('📖 Uso: node scripts/setup-test-store.js [storeId] [primaryLocale]');
  console.log('📖 Ejemplo: node scripts/setup-test-store.js mi-tienda-id es');
  console.log('📖 Para listar tiendas: node scripts/setup-test-store.js --list');
  process.exit(1);
}

if (storeId === '--list') {
  listStores();
} else {
  setupTestStore(storeId, primaryLocale);
}
