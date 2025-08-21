/**
 * Script de debug para diagnosticar problemas de mapa en blanco en móviles
 * Ejecutar en la consola del navegador móvil después de abrir el mapa
 */

console.log('🔧 [MAP DEBUG] Starting mobile map diagnosis...');

// Función para diagnosticar el estado del mapa
function diagnoseMobileMap() {
    const mapContainer = document.querySelector('.nbd-map');
    
    if (!mapContainer) {
        console.log('❌ [MAP DEBUG] Map container not found');
        return;
    }
    
    console.log('✅ [MAP DEBUG] Map container found');
    console.log('📊 [MAP DEBUG] Container dimensions:', {
        width: mapContainer.offsetWidth,
        height: mapContainer.offsetHeight,
        display: getComputedStyle(mapContainer).display,
        visibility: getComputedStyle(mapContainer).visibility,
        opacity: getComputedStyle(mapContainer).opacity
    });
    
    // Verificar elementos internos de Google Maps
    const gmStyle = mapContainer.querySelector('.gm-style');
    const canvas = mapContainer.querySelector('canvas');
    const images = mapContainer.querySelectorAll('img');
    
    console.log('🔍 [MAP DEBUG] Internal elements:', {
        'gm-style found': !!gmStyle,
        'canvas found': !!canvas,
        'images count': images.length,
        'canvas dimensions': canvas ? {
            width: canvas.width,
            height: canvas.height,
            offsetWidth: canvas.offsetWidth,
            offsetHeight: canvas.offsetHeight
        } : 'No canvas'
    });
    
    // Verificar si hay errores de red
    const mapImages = Array.from(images).filter(img => 
        img.src.includes('maps.googleapis.com') || 
        img.src.includes('maps.gstatic.com')
    );
    
    console.log('🌐 [MAP DEBUG] Map tiles:', {
        'tile images count': mapImages.length,
        'sample urls': mapImages.slice(0, 3).map(img => img.src),
        'loading errors': mapImages.filter(img => img.complete && img.naturalWidth === 0).length
    });
    
    // Información del dispositivo
    console.log('📱 [MAP DEBUG] Device info:', {
        userAgent: navigator.userAgent,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        devicePixelRatio: window.devicePixelRatio,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        connection: navigator.connection ? {
            effectiveType: navigator.connection.effectiveType,
            downlink: navigator.connection.downlink
        } : 'Not available'
    });
    
    // Verificar estado de Google Maps
    if (window.google && window.google.maps) {
        console.log('✅ [MAP DEBUG] Google Maps API loaded');
        
        // Intentar forzar refresh del mapa
        const maps = document.querySelectorAll('.nbd-map');
        maps.forEach((mapEl, index) => {
            console.log(`🔄 [MAP DEBUG] Attempting to refresh map ${index + 1}`);
            try {
                // Trigger resize event
                window.google.maps.event.trigger(mapEl.googleMap, 'resize');
            } catch (e) {
                console.log(`⚠️ [MAP DEBUG] Could not trigger resize for map ${index + 1}:`, e.message);
            }
        });
    } else {
        console.log('❌ [MAP DEBUG] Google Maps API not available');
    }
}

// Función para forzar recarga del mapa
function forceMapReload() {
    console.log('🔄 [MAP DEBUG] Forcing map reload...');
    
    const mapContainer = document.querySelector('.nbd-map');
    if (mapContainer) {
        // Limpiar contenido
        mapContainer.innerHTML = '';
        
        // Forzar re-render
        mapContainer.style.display = 'none';
        setTimeout(() => {
            mapContainer.style.display = 'block';
            console.log('🔄 [MAP DEBUG] Map container reset. Try clicking the map button again.');
        }, 100);
    }
}

// Función para verificar restricciones de API
function checkAPIRestrictions() {
    console.log('🔑 [MAP DEBUG] Checking API key restrictions...');
    
    // Crear una imagen de prueba para verificar si las tiles se cargan
    const testImg = new Image();
    testImg.onload = () => {
        console.log('✅ [MAP DEBUG] Google Maps tiles are accessible');
    };
    testImg.onerror = () => {
        console.log('❌ [MAP DEBUG] Google Maps tiles are blocked (possible API key restriction)');
    };
    
    // URL de prueba para tiles de Google Maps
    testImg.src = 'https://mt1.google.com/vt/lyrs=m&x=0&y=0&z=1';
}

// Ejecutar diagnóstico
diagnoseMobileMap();
checkAPIRestrictions();

// Exponer funciones para uso manual
window.debugMobileMap = {
    diagnose: diagnoseMobileMap,
    forceReload: forceMapReload,
    checkAPI: checkAPIRestrictions
};

console.log('🔧 [MAP DEBUG] Diagnosis complete. Available functions:');
console.log('  - debugMobileMap.diagnose() - Run full diagnosis');
console.log('  - debugMobileMap.forceReload() - Force map reload');
console.log('  - debugMobileMap.checkAPI() - Check API restrictions');
