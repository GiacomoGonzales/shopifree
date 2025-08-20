// Script para crear zona de entrega de ejemplo para testing
// Para usar en la consola del navegador

function createSampleDeliveryZone() {
    const storeId = 'J0YnmGq3CvnlogUbGBPp'; // ID de la tienda actual
    
    // Coordenadas que forman un polígono que incluye el área de Lima Centro
    // Esto incluirá las coordenadas del usuario: -12.075008, -77.021184
    const limaZone = {
        nombre: 'Lima Centro',
        precio: 8.5, // Precio en soles
        tipo: 'poligono',
        coordenadas: [
            { lat: -12.040000, lng: -77.050000 }, // Norte-Oeste
            { lat: -12.040000, lng: -76.990000 }, // Norte-Este  
            { lat: -12.120000, lng: -76.990000 }, // Sur-Este
            { lat: -12.120000, lng: -77.050000 }, // Sur-Oeste
            { lat: -12.040000, lng: -77.050000 }  // Cerrar polígono
        ],
        estimatedTime: '30-60 minutos'
    };

    console.log('🏪 Creando zona de entrega de ejemplo...');
    console.log('📍 Zona:', limaZone);
    console.log('🎯 Esta zona incluye las coordenadas del usuario: -12.075008, -77.021184');
    
    // Para implementar esto necesitarías acceso a Firebase
    // Por ahora, este es el formato correcto de datos
    console.log('💡 Para crear esta zona, ve al Dashboard > Configuración > Envío > Zonas Locales');
    console.log('📋 Y usa estas coordenadas en el mapa:', limaZone.coordenadas);
    
    return limaZone;
}

// Función para verificar si el punto del usuario está en la zona de ejemplo
function testUserLocationInSampleZone() {
    const userCoords = { lat: -12.075008, lng: -77.021184 };
    const sampleZone = createSampleDeliveryZone();
    
    console.log('🧪 Testing si las coordenadas del usuario están en la zona de ejemplo...');
    console.log('📍 Usuario:', userCoords);
    console.log('🗺️ Zona:', sampleZone.coordenadas);
    
    // Verificación manual simple
    const lat = userCoords.lat;
    const lng = userCoords.lng;
    
    const inZone = lat >= -12.120000 && lat <= -12.040000 && 
                   lng >= -77.050000 && lng <= -76.990000;
    
    console.log(`✅ Resultado: Usuario ${inZone ? 'ESTÁ DENTRO' : 'ESTÁ FUERA'} de la zona de ejemplo`);
    
    return inZone;
}

// Exportar funciones para uso en consola
window.createSampleDeliveryZone = createSampleDeliveryZone;
window.testUserLocationInSampleZone = testUserLocationInSampleZone;

console.log('🔧 Scripts cargados. Usa en consola:');
console.log('   createSampleDeliveryZone() - Ver zona de ejemplo');
console.log('   testUserLocationInSampleZone() - Probar ubicación del usuario');
