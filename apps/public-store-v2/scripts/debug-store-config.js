#!/usr/bin/env node

/**
 * Script para debuggear configuración de single locale URLs de una tienda específica
 * Usa Firebase REST API para evitar dependencias de firebase-admin
 */

const fs = require('fs');
const path = require('path');

function loadEnvVars() {
  // Intentar cargar desde diferentes ubicaciones
  const envPaths = [
    path.join(__dirname, '..', '.env.local'),
    path.join(__dirname, '..', '..', '..', '.env.local'),
    path.join(process.cwd(), '.env.local')
  ];
  
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      console.log(`📄 Cargando variables de entorno desde: ${envPath}`);
      const envContent = fs.readFileSync(envPath, 'utf8');
      const lines = envContent.split('\n');
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').replace(/^["']|["']$/g, '');
            process.env[key] = value;
          }
        }
      }
      return true;
    }
  }
  
  return false;
}

async function debugStoreConfig(identifier) {
  console.log('🔍 DEBUGGEANDO CONFIGURACIÓN DE TIENDA');
  console.log('=====================================');
  console.log(`Buscando: ${identifier}`);
  console.log('');

  // Cargar variables de entorno
  loadEnvVars();

  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  
  if (!projectId || !apiKey) {
    console.error('❌ Variables de entorno no configuradas:');
    console.error('   NEXT_PUBLIC_FIREBASE_PROJECT_ID');
    console.error('   NEXT_PUBLIC_FIREBASE_API_KEY');
    console.error('');
    console.error('💡 Asegúrate de que existe un archivo .env.local con estas variables');
    return;
  }
  
  try {
    await debugWithRestApi(identifier, projectId, apiKey);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

async function debugWithRestApi(identifier, projectId, apiKey) {
  console.log('🌐 Usando Firebase REST API...');
  
  try {
    // Buscar todas las tiendas
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/stores?key=${apiKey}`);
    const data = await response.json();
    
    if (!data.documents) {
      console.log('❌ No se encontraron tiendas');
      return;
    }
    
    const isCustomDomain = !identifier.includes('.shopifree.app') && identifier.includes('.');
    let targetStore = null;
    
    for (const doc of data.documents) {
      const storeData = doc.fields;
      const storeId = doc.name.split('/').pop();
      const subdomain = storeData?.subdomain?.stringValue;
      
      if (isCustomDomain) {
        // Verificar dominio personalizado
        const domainResponse = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/stores/${storeId}/settings/domain?key=${apiKey}`);
        
        if (domainResponse.ok) {
          const domainData = await domainResponse.json();
          const customDomain = domainData?.fields?.customDomain?.stringValue;
          
          if (customDomain === identifier) {
            targetStore = { storeId, subdomain, doc, customDomain };
            break;
          }
        }
      } else {
        // Comparar subdomain
        const targetSubdomain = identifier.replace('.shopifree.app', '');
        if (subdomain === targetSubdomain) {
          targetStore = { storeId, subdomain, doc };
          break;
        }
      }
    }
    
    if (!targetStore) {
      console.log('❌ Tienda no encontrada');
      return;
    }
    
    console.log(`✅ Tienda encontrada: ${targetStore.subdomain} (${targetStore.storeId})`);
    
    // Obtener configuración SEO
    const seoResponse = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/stores/${targetStore.storeId}/settings/seo?key=${apiKey}`);
    
    console.log('');
    console.log('📋 CONFIGURACIÓN ACTUAL:');
    console.log('========================');
    
    if (seoResponse.ok) {
      const seoData = await seoResponse.json();
      const singleLocaleUrls = seoData?.fields?.singleLocaleUrls?.booleanValue;
      const primaryLocale = seoData?.fields?.primaryLocale?.stringValue;
      
      console.log(`Single Locale URLs: ${singleLocaleUrls ? '✅ ACTIVADO' : '❌ DESACTIVADO'}`);
      console.log(`Primary Locale: ${primaryLocale || 'es'}`);
      
      if (!singleLocaleUrls) {
        console.log('');
        console.log('🔧 SOLUCIÓN:');
        console.log('   La tienda necesita activar Single Locale URLs');
        console.log('   1. Dashboard > Configuración > General > Configuración Avanzada');
        console.log('   2. Activar "URLs de idioma único (Single Locale URLs)"');
      }
    } else {
      console.log('⚠️ No hay configuración SEO');
      console.log('   Single Locale URLs: ❌ DESACTIVADO (por defecto)');
    }
    
  } catch (error) {
    console.error('❌ Error con REST API:', error.message);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  const identifier = process.argv[2];
  
  if (!identifier) {
    console.log('❌ Uso: node debug-store-config.js <subdomain.shopifree.app|custom-domain.com>');
    console.log('');
    console.log('Ejemplos:');
    console.log('  node debug-store-config.js tiendaverde.shopifree.app');
    console.log('  node debug-store-config.js lunara-store.xyz');
    process.exit(1);
  }
  
  debugStoreConfig(identifier).catch(console.error);
}

module.exports = { debugStoreConfig };
