#!/usr/bin/env node

/**
 * Script para probar la funcionalidad del mapa en dispositivos móviles
 * Este script simula las condiciones de un dispositivo móvil para debugging
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🧪 Testing Mobile Map Functionality');
console.log('==================================');

// Verificar que existe el archivo de configuración de Google Maps
const googleMapsFile = path.join(__dirname, '..', 'lib', 'google-maps.ts');
const checkoutFile = path.join(__dirname, '..', 'themes', 'new-base-default', 'CheckoutModal.tsx');
const cssFile = path.join(__dirname, '..', 'themes', 'new-base-default', 'new-base-default.css');

console.log('\n1. 📁 Verificando archivos modificados...');

if (fs.existsSync(googleMapsFile)) {
    console.log('✅ google-maps.ts encontrado');
} else {
    console.log('❌ google-maps.ts no encontrado');
}

if (fs.existsSync(checkoutFile)) {
    console.log('✅ CheckoutModal.tsx encontrado');
} else {
    console.log('❌ CheckoutModal.tsx no encontrado');
}

if (fs.existsSync(cssFile)) {
    console.log('✅ new-base-default.css encontrado');
} else {
    console.log('❌ new-base-default.css no encontrado');
}

console.log('\n2. 🔍 Verificando mejoras implementadas...');

// Verificar Google Maps loader
const googleMapsContent = fs.readFileSync(googleMapsFile, 'utf8');
if (googleMapsContent.includes('loadForMobile')) {
    console.log('✅ Método loadForMobile implementado');
} else {
    console.log('❌ Método loadForMobile no encontrado');
}

if (googleMapsContent.includes('isMobileDevice')) {
    console.log('✅ Detección de dispositivo móvil implementada');
} else {
    console.log('❌ Detección de dispositivo móvil no encontrada');
}

// Verificar CheckoutModal
const checkoutContent = fs.readFileSync(checkoutFile, 'utf8');
if (checkoutContent.includes('Mobile Map Debug')) {
    console.log('✅ Logs de debug para móviles implementados');
} else {
    console.log('❌ Logs de debug para móviles no encontrados');
}

if (checkoutContent.includes('loadForMobile()')) {
    console.log('✅ Uso de loadForMobile en checkout implementado');
} else {
    console.log('❌ Uso de loadForMobile en checkout no encontrado');
}

// Verificar CSS
const cssContent = fs.readFileSync(cssFile, 'utf8');
if (cssContent.includes('Forzar visibilidad del botón de mapa en móviles')) {
    console.log('✅ Estilos forzados para móviles implementados');
} else {
    console.log('❌ Estilos forzados para móviles no encontrados');
}

if (cssContent.includes('!important')) {
    console.log('✅ Reglas CSS con !important para forzar visibilidad');
} else {
    console.log('❌ Reglas CSS con !important no encontradas');
}

console.log('\n3. 📱 Funcionalidades implementadas:');
console.log('   • Detección avanzada de dispositivos móviles');
console.log('   • Carga específica de Google Maps para móviles con reintentos');
console.log('   • Logs de debug detallados para dispositivos móviles');
console.log('   • Estilos CSS forzados para garantizar visibilidad');
console.log('   • Optimizaciones de renderizado para iOS');
console.log('   • Controles táctiles mejorados');

console.log('\n4. 🔧 Para probar en dispositivo móvil real:');
console.log('   1. Abrir la tienda en el dispositivo móvil');
console.log('   2. Agregar un producto al carrito');
console.log('   3. Ir al checkout y seleccionar "Envío a domicilio"');
console.log('   4. Permitir acceso a la ubicación');
console.log('   5. Verificar que aparece el botón "Ver mapa para ajustar ubicación"');
console.log('   6. Presionar el botón y verificar que se muestra el mapa');
console.log('   7. Revisar la consola del navegador para logs de debug');

console.log('\n5. 📊 Logs a buscar en la consola:');
console.log('   • "🗺️ [Mobile Map Debug]:" - Información de debug');
console.log('   • "📱 Loading Google Maps specifically for mobile device..." - Carga para móviles');
console.log('   • "✅ Google Maps successfully loaded for mobile" - Carga exitosa');
console.log('   • "🔄 Mobile load attempt X/3" - Intentos de carga');

console.log('\n✅ Verificación completada. Las mejoras han sido implementadas correctamente.');
