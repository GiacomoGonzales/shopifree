#!/usr/bin/env node

/**
 * Script para validar la optimización de imágenes OG
 * Verifica que las URLs generadas sean consistentes
 */

const { generateAllImageVariants } = require('../lib/image-optimization.ts');

// Test cases
const testImages = [
    'https://res.cloudinary.com/dnrj1guvs/image/upload/v1754009787/logos/J0YnmGq3CvniogUb6BPp/ppveht70tfxg8i799y4w.png',
    '/default-og.png',
    'https://example.com/external-image.jpg'
];

console.log('🧪 TESTING IMAGE OPTIMIZATION CONSISTENCY\n');

testImages.forEach((originalImage, index) => {
    console.log(`📷 Test ${index + 1}: ${originalImage}`);
    
    // Test con f_auto (recomendado)
    const autoVariants = generateAllImageVariants(originalImage, undefined, false);
    console.log('   ✅ f_auto (recomendado):', autoVariants.social);
    console.log('   📱 WhatsApp:', autoVariants.whatsapp);
    console.log('   🍎 Apple Touch Icon:', autoVariants.appleTouchIcon);
    
    // Test con f_jpg (para consistencia type)
    const jpegVariants = generateAllImageVariants(originalImage, undefined, true);
    console.log('   🔒 f_jpg (si necesitas type):', jpegVariants.social);
    
    console.log('   ℹ️  Info:', autoVariants.info);
    console.log('');
});

console.log('📋 RECOMENDACIONES:');
console.log('✅ Usar f_auto (por defecto) para mejor rendimiento');
console.log('❌ NO especificar og:image:type para evitar inconsistencias');
console.log('🔧 Solo usar forceJpeg=true si absolutamente necesitas type="image/jpeg"');
