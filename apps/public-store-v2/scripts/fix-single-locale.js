#!/usr/bin/env node

/**
 * Script para diagnosticar y corregir problemas de Single Locale URLs
 */

const fs = require('fs');
const path = require('path');

function loadEnvVars() {
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

async function findStoreByIdentifier(identifier, projectId, apiKey) {
  const response = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/stores?key=${apiKey}`);
  const data = await response.json();
  
  if (!data.documents) {
    throw new Error('No se encontraron tiendas');
  }
  
  const isCustomDomain = !identifier.includes('.shopifree.app') && identifier.includes('.');
  
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
          return { storeId, subdomain, doc, customDomain };
        }
      }
    } else {
      // Comparar subdomain
      const targetSubdomain = identifier.replace('.shopifree.app', '');
      if (subdomain === targetSubdomain) {
        return { storeId, subdomain, doc };
      }
    }
  }
  
  throw new Error('Tienda no encontrada');
}

async function getStoreConfiguration(storeId, projectId, apiKey) {
  // Obtener datos básicos de la tienda
  const storeResponse = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/stores/${storeId}?key=${apiKey}`);
  const storeData = storeResponse.ok ? await storeResponse.json() : null;
  
  // Obtener configuración SEO
  const seoResponse = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/stores/${storeId}/settings/seo?key=${apiKey}`);
  const seoData = seoResponse.ok ? await seoResponse.json() : null;
  
  // Obtener configuración avanzada
  const advancedResponse = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/stores/${storeId}/settings/advanced?key=${apiKey}`);
  const advancedData = advancedResponse.ok ? await advancedResponse.json() : null;
  
  return {
    store: storeData?.fields,
    seo: seoData?.fields,
    advanced: advancedData?.fields
  };
}

async function enableSingleLocaleUrls(storeId, primaryLocale, projectId, apiKey) {
  console.log(`🔧 Activando Single Locale URLs para tienda ${storeId}...`);
  
  const advancedConfig = {
    fields: {
      language: {
        stringValue: primaryLocale
      },
      singleLocaleUrls: {
        booleanValue: true
      },
      updatedAt: {
        timestampValue: new Date().toISOString()
      }
    }
  };
  
  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/stores/${storeId}/settings/advanced?key=${apiKey}`,
    {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(advancedConfig)
    }
  );
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Error al actualizar configuración: ${error}`);
  }
  
  console.log('✅ Single Locale URLs activado correctamente');
  return true;
}

async function main() {
  const identifier = process.argv[2];
  const action = process.argv[3]; // 'fix' para aplicar la corrección
  
  if (!identifier) {
    console.log('❌ Uso: node fix-single-locale.js <store-identifier> [fix]');
    console.log('');
    console.log('Ejemplos:');
    console.log('  node fix-single-locale.js lunara-store.xyz        # Solo diagnosticar');
    console.log('  node fix-single-locale.js lunara-store.xyz fix    # Diagnosticar y corregir');
    process.exit(1);
  }
  
  console.log('🔍 DIAGNÓSTICO Y CORRECCIÓN DE SINGLE LOCALE URLs');
  console.log('================================================');
  console.log(`Analizando: ${identifier}`);
  console.log('');
  
  // Cargar variables de entorno
  loadEnvVars();
  
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  
  if (!projectId || !apiKey) {
    console.error('❌ Variables de entorno no configuradas');
    return;
  }
  
  try {
    // Encontrar la tienda
    const store = await findStoreByIdentifier(identifier, projectId, apiKey);
    console.log(`✅ Tienda encontrada: ${store.subdomain} (${store.storeId})`);
    
    // Obtener configuración completa
    const config = await getStoreConfiguration(store.storeId, projectId, apiKey);
    
    // Analizar configuración actual
    const storeLanguage = config.store?.language?.stringValue;
    const storePrimaryLocale = config.store?.primaryLocale?.stringValue;
    const seoLanguage = config.seo?.language?.stringValue;
    const advancedLanguage = config.advanced?.language?.stringValue;
    const singleLocaleUrls = config.advanced?.singleLocaleUrls?.booleanValue || false;
    
    // Determinar idioma efectivo (misma lógica que el middleware)
    const effectiveLanguage = advancedLanguage || seoLanguage || storePrimaryLocale || storeLanguage || 'es';
    const finalLocale = ['es', 'en', 'pt'].includes(effectiveLanguage) ? effectiveLanguage : 'es';
    
    console.log('');
    console.log('📋 CONFIGURACIÓN ACTUAL:');
    console.log('========================');
    console.log(`Store Language: ${storeLanguage || 'No configurado'}`);
    console.log(`Store Primary Locale: ${storePrimaryLocale || 'No configurado'}`);
    console.log(`SEO Language: ${seoLanguage || 'No configurado'}`);
    console.log(`Advanced Language: ${advancedLanguage || 'No configurado'}`);
    console.log(`Idioma efectivo: ${finalLocale}`);
    console.log(`Single Locale URLs: ${singleLocaleUrls ? '✅ ACTIVADO' : '❌ DESACTIVADO'}`);
    
    console.log('');
    console.log('🎯 COMPORTAMIENTO ACTUAL:');
    console.log('=========================');
    
    if (singleLocaleUrls) {
      console.log('✅ MODO SINGLE LOCALE URLS');
      console.log('   URLs sin prefijo: /, /categoria, /producto');
      console.log('   /es/categoria → redirige a /categoria');
    } else if (finalLocale !== 'es') {
      console.log('🎯 MODO ADAPTATIVO AUTOMÁTICO');
      console.log('   URLs sin prefijo por ser idioma no-español');
      console.log('   /, /categoria, /producto funcionan directamente');
    } else {
      console.log('📚 MODO MULTI-IDIOMA (PROBLEMÁTICO)');
      console.log('   URLs con prefijo obligatorio: /es/categoria, /es/producto');
      console.log('   / → redirige a /es (causa el problema que vemos)');
    }
    
    // Diagnóstico del problema
    console.log('');
    console.log('🩺 DIAGNÓSTICO:');
    console.log('===============');
    
    const hasRedirectProblem = finalLocale === 'es' && !singleLocaleUrls;
    
    if (hasRedirectProblem) {
      console.log('❌ PROBLEMA CONFIRMADO: Tienda redirige a /es');
      console.log('   Causa: Idioma español + Single Locale URLs desactivado');
      console.log('   Efecto: / → redirige a /es en lugar de mostrar contenido');
      
      if (action === 'fix') {
        console.log('');
        console.log('🔧 APLICANDO CORRECCIÓN...');
        console.log('==========================');
        
        // Preguntar qué solución aplicar
        console.log('Opciones de corrección:');
        console.log('1. Activar Single Locale URLs (mantener español)');
        console.log('2. Cambiar idioma a inglés (modo adaptativo automático)');
        console.log('');
        console.log('Aplicando OPCIÓN 1: Activar Single Locale URLs...');
        
        await enableSingleLocaleUrls(store.storeId, finalLocale, projectId, apiKey);
        
        console.log('');
        console.log('✅ CORRECCIÓN APLICADA');
        console.log('======================');
        console.log('Changes realizados:');
        console.log('- Single Locale URLs: ✅ ACTIVADO');
        console.log('- Primary Language: confirmado como', finalLocale);
        console.log('');
        console.log('🧪 VERIFICAR RESULTADO:');
        console.log(`1. Visitar: https://${identifier}`);
        console.log(`2. Verificar que NO redirige a /es`);
        console.log(`3. Verificar que /es/categoria redirige a /categoria`);
        console.log('');
        console.log('⏱️ Los cambios pueden tardar 1-2 minutos en propagarse');
        
      } else {
        console.log('');
        console.log('🔧 SOLUCIONES DISPONIBLES:');
        console.log('==========================');
        console.log('OPCIÓN 1 - Activar Single Locale URLs (RECOMENDADO):');
        console.log(`   node fix-single-locale.js ${identifier} fix`);
        console.log('');
        console.log('OPCIÓN 2 - Cambiar idioma en Dashboard:');
        console.log('   1. Dashboard > Configuración > General');
        console.log('   2. Cambiar idioma principal a "English"');
        console.log('   3. Se activará automáticamente el modo adaptativo');
        console.log('');
        console.log('OPCIÓN 3 - Manual en Dashboard:');
        console.log('   1. Dashboard > Configuración > General > Configuración Avanzada');
        console.log('   2. Activar "URLs de idioma único (Single Locale URLs)"');
      }
      
    } else {
      console.log('✅ CONFIGURACIÓN CORRECTA');
      console.log('   La tienda debería funcionar sin problemas de redirección');
      
      if (singleLocaleUrls) {
        console.log('   Modo: Single Locale URLs activado');
      } else {
        console.log('   Modo: Adaptativo automático por idioma no-español');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };
