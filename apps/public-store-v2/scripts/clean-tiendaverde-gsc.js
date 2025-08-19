#!/usr/bin/env node

/**
 * Script específico para limpiar el token GSC de TiendaVerde
 */

const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const admin = require('firebase-admin');

// Función para extraer token limpio
function extractCleanToken(input) {
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
  
  // Caso 3: Token directo (ya está bien)
  return trimmed.length > 0 ? trimmed : null;
}

async function main() {
  try {
    console.log('🔥 Iniciando limpieza específica para TiendaVerde...');
    
    // Inicializar Firebase (usar variables de entorno)
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'shopifree-52516';
    
    if (!admin.apps.length) {
      initializeApp({ projectId: projectId });
    }
    
    const db = getFirestore();
    
    // Buscar TiendaVerde específicamente
    console.log('🔍 Buscando tienda TiendaVerde...');
    
    const storesSnapshot = await db.collection('stores')
      .where('subdomain', '==', 'tiendaverde')
      .get();
    
    if (storesSnapshot.empty) {
      console.log('❌ No se encontró la tienda TiendaVerde');
      return;
    }
    
    const storeDoc = storesSnapshot.docs[0];
    const storeId = storeDoc.id;
    const storeData = storeDoc.data();
    
    console.log(`✅ Encontrada tienda: ${storeData.subdomain} (${storeId})`);
    
    // Obtener configuración SEO
    const seoDoc = await db.collection('stores').doc(storeId).collection('settings').doc('seo').get();
    
    if (!seoDoc.exists) {
      console.log('❌ No tiene configuración SEO');
      return;
    }
    
    const seoData = seoDoc.data();
    const currentGSC = seoData?.googleSearchConsole;
    
    if (!currentGSC) {
      console.log('❌ No tiene GSC configurado');
      return;
    }
    
    console.log(`🔍 Token actual: ${currentGSC.substring(0, 100)}...`);
    
    // Extraer token limpio
    const cleanToken = extractCleanToken(currentGSC);
    
    if (!cleanToken) {
      console.log('❌ No se pudo extraer token válido');
      return;
    }
    
    if (cleanToken === currentGSC) {
      console.log('✅ Token ya está limpio, no se necesita cambio');
      return;
    }
    
    console.log(`🔧 Token limpio extraído: ${cleanToken}`);
    
    // Actualizar con token limpio
    await seoDoc.ref.update({
      googleSearchConsole: cleanToken,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    
    console.log('✅ Token actualizado exitosamente en Firestore');
    console.log('🕐 Espera ~2-3 minutos para que se propague en producción');
    console.log('🧪 Luego prueba: curl -s https://tiendaverde.shopifree.app/es | grep "google-site-verification"');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().then(() => {
    console.log('\n🎉 Script completado');
    process.exit(0);
  }).catch((error) => {
    console.error('\n💥 Script falló:', error);
    process.exit(1);
  });
}
