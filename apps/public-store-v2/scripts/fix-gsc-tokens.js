#!/usr/bin/env node

/**
 * Script para corregir tokens GSC que se guardaron como HTML completo
 * Extrae solo el token de verificación de las etiquetas HTML
 */

const admin = require('firebase-admin');
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Función para extraer token de diferentes formatos
function extractGoogleVerificationToken(input) {
  if (!input || typeof input !== 'string') {
    return null;
  }

  const trimmed = input.trim();
  
  // Caso 1: Etiqueta HTML completa
  if (trimmed.includes('<meta') && trimmed.includes('content=')) {
    const match = trimmed.match(/content=["']([^"']+)["']/);
    if (match) {
      return match[1];
    }
  }
  
  // Caso 2: Formato "google-site-verification=TOKEN"
  if (trimmed.startsWith('google-site-verification=')) {
    const token = trimmed.replace('google-site-verification=', '');
    return token.length > 0 ? token : null;
  }
  
  // Caso 3: Archivo HTML "googleTOKEN.html"
  if (trimmed.includes('.html')) {
    const token = trimmed.replace(/^google/, '').replace(/\.html$/, '');
    return token.length > 0 ? token : null;
  }
  
  // Caso 4: Token directo (ya está bien)
  return trimmed.length > 0 ? trimmed : null;
}

async function main() {
  try {
    // Inicializar Firebase Admin
    console.log('🔥 Inicializando Firebase Admin...');
    
    if (!admin.apps.length) {
      // Usar variables de entorno o archivo de credenciales
      const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
      const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
      
      if (serviceAccountPath) {
        const serviceAccount = require(serviceAccountPath);
        initializeApp({
          credential: cert(serviceAccount),
          projectId: projectId
        });
      } else if (projectId) {
        // Usar Application Default Credentials (si está en Cloud)
        initializeApp({ projectId: projectId });
      } else {
        throw new Error('No se encontraron credenciales de Firebase');
      }
    }
    
    const db = getFirestore();
    
    console.log('📚 Obteniendo todas las tiendas...');
    
    // Obtener todas las tiendas
    const storesSnapshot = await db.collection('stores').get();
    
    let totalStores = 0;
    let storesWithGSC = 0;
    let storesFixed = 0;
    
    console.log(`📊 Encontradas ${storesSnapshot.size} tiendas`);
    
    // Procesar cada tienda
    for (const storeDoc of storesSnapshot.docs) {
      totalStores++;
      const storeId = storeDoc.id;
      const storeData = storeDoc.data();
      
      console.log(`\n🏪 Procesando tienda: ${storeData.subdomain} (${storeId})`);
      
      try {
        // Obtener configuración SEO
        const seoDoc = await db.collection('stores').doc(storeId).collection('settings').doc('seo').get();
        
        if (!seoDoc.exists) {
          console.log('   ⏭️  No tiene configuración SEO');
          continue;
        }
        
        const seoData = seoDoc.data();
        const currentGSC = seoData?.googleSearchConsole;
        
        if (!currentGSC) {
          console.log('   ⏭️  No tiene GSC configurado');
          continue;
        }
        
        storesWithGSC++;
        console.log(`   🔍 GSC actual: ${currentGSC.substring(0, 50)}...`);
        
        // Extraer token limpio
        const cleanToken = extractGoogleVerificationToken(currentGSC);
        
        if (!cleanToken) {
          console.log('   ❌ No se pudo extraer token válido');
          continue;
        }
        
        // Si ya está limpio, no hacer nada
        if (cleanToken === currentGSC) {
          console.log('   ✅ Token ya está limpio');
          continue;
        }
        
        // Actualizar con token limpio
        await seoDoc.ref.update({
          googleSearchConsole: cleanToken,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        storesFixed++;
        console.log(`   🔧 Token corregido: ${cleanToken}`);
        
      } catch (error) {
        console.log(`   ❌ Error procesando tienda ${storeId}:`, error.message);
      }
    }
    
    console.log('\n📊 RESUMEN FINAL:');
    console.log(`   Total tiendas: ${totalStores}`);
    console.log(`   Con GSC configurado: ${storesWithGSC}`);
    console.log(`   Tokens corregidos: ${storesFixed}`);
    console.log('\n✅ Migración completada');
    
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main().then(() => {
    console.log('🎉 Script finalizado exitosamente');
    process.exit(0);
  }).catch((error) => {
    console.error('💥 Script falló:', error);
    process.exit(1);
  });
}

module.exports = { extractGoogleVerificationToken };
