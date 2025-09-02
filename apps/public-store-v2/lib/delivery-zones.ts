import { getFirebaseDb } from './firebase';

export interface DeliveryZone {
    id: string;
    name: string;
    coordinates: Array<{
        lat: number;
        lng: number;
    }>;
    priceStandard?: number;
    priceExpress?: number;
    isActive?: boolean;
}

// Cache simple para evitar llamadas repetidas
const zonesCache: Record<string, { zones: DeliveryZone[]; timestamp: number }> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Obtiene las zonas de entrega de una tienda desde Firestore
 */
export async function getStoreDeliveryZones(storeId: string): Promise<DeliveryZone[]> {
    // Verificar cache
    const cached = zonesCache[storeId];
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log(`[delivery-zones] Usando zonas en cache para ${storeId}`);
        return cached.zones;
    }

    try {
        const db = getFirebaseDb();
        if (!db) {
            console.error('[delivery-zones] ❌ Firebase no está disponible - verificar variables de entorno');
            return [];
        }

        const { collection, getDocs } = await import('firebase/firestore');
        const deliveryZonesRef = collection(db, 'stores', storeId, 'deliveryZones');
        const snapshot = await getDocs(deliveryZonesRef);

        const zones: DeliveryZone[] = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            
            // Transformar coordenadas desde el formato de Firestore (soporte para 'coordenadas' y 'coordinates')
            const coordinates = [];
            const coordsData = data.coordinates || data.coordenadas; // Soporte para ambos formatos
            
            if (coordsData && Array.isArray(coordsData)) {
                for (const coord of coordsData) {
                    if (coord.lat !== undefined && coord.lng !== undefined) {
                        coordinates.push({
                            lat: typeof coord.lat === 'number' ? coord.lat : parseFloat(coord.lat),
                            lng: typeof coord.lng === 'number' ? coord.lng : parseFloat(coord.lng)
                        });
                    }
                }
            }

            // Soporte para formato alternativo de precios
            const priceStandard = data.priceStandard || data.precio || 0;
            const priceExpress = data.priceExpress || data.precioExpress || (data.precio ? data.precio * 1.5 : 0);

            zones.push({
                id: doc.id,
                name: data.name || data.nombre || 'Zona sin nombre',
                coordinates,
                priceStandard,
                priceExpress,
                isActive: data.isActive !== false // Default true
            });
        });

        const activeZones = zones.filter(zone => zone.isActive && zone.coordinates.length > 0);
        
        console.log(`[delivery-zones] ✅ Zonas cargadas para ${storeId}:`, {
            total: zones.length,
            activas: activeZones.length,
            zonas: activeZones.map(z => ({
                id: z.id,
                name: z.name,
                coordenadas: z.coordinates.length,
                precioStandard: z.priceStandard,
                precioExpress: z.priceExpress
            }))
        });
        
        // Guardar en cache
        zonesCache[storeId] = {
            zones: activeZones,
            timestamp: Date.now()
        };

        return activeZones;

    } catch (error) {
        console.error('[delivery-zones] Error al obtener zonas de entrega:', error);
        return [];
    }
}

/**
 * Verifica si un punto está dentro de un polígono usando el algoritmo Ray Casting
 */
export function isPointInPolygon(
    point: { lat: number; lng: number },
    polygon: Array<{ lat: number; lng: number }>
): boolean {
    if (polygon.length < 3) {
        console.log(`[delivery-zones] Polígono inválido: solo ${polygon.length} puntos`);
        return false;
    }

    const x = point.lng;
    const y = point.lat;
    let inside = false;



    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].lng;
        const yi = polygon[i].lat;
        const xj = polygon[j].lng;
        const yj = polygon[j].lat;

        if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
            inside = !inside;
        }
    }

    return inside;
}

/**
 * Encuentra la zona de entrega que contiene las coordenadas dadas
 */
export function findDeliveryZoneForCoordinates(
    coordinates: { lat: number; lng: number },
    zones: DeliveryZone[]
): DeliveryZone | null {
    console.log('🔍 [findDeliveryZoneForCoordinates] Buscando zona para:', coordinates);
    
    for (const zone of zones) {
        console.log(`🔍 [findDeliveryZoneForCoordinates] Verificando zona "${zone.name}" con ${zone.coordinates.length} puntos`);
        console.log(`🔍 [findDeliveryZoneForCoordinates] Coordenadas de zona:`, zone.coordinates);
        
        const isInside = isPointInPolygon(coordinates, zone.coordinates);
        console.log(`🔍 [findDeliveryZoneForCoordinates] ¿Está dentro de "${zone.name}"?`, isInside ? '✅ SÍ' : '❌ NO');
        
        if (isInside) {
            console.log(`🔍 [findDeliveryZoneForCoordinates] ✅ ENCONTRADA: Zona "${zone.name}"`);
            return zone;
        }
    }
    
    console.log('🔍 [findDeliveryZoneForCoordinates] ❌ No se encontró ninguna zona que contenga las coordenadas');
    return null;
}

/**
 * Calcula el costo de envío basado en las coordenadas y método de envío
 */
export function calculateShippingCost(
    coordinates: { lat: number; lng: number } | null,
    zones: DeliveryZone[],
    shippingMethod: 'standard' | 'express' | 'pickup'
): number {
    console.log('🚚 [calculateShippingCost] Iniciando cálculo:', {
        coordinates,
        zonesCount: zones.length,
        shippingMethod
    });

    // Si es recojo en tienda, no hay costo
    if (shippingMethod === 'pickup') {
        console.log('🚚 [calculateShippingCost] Método pickup - costo: 0');
        return 0;
    }

    // Si no hay coordenadas, no hay costo
    if (!coordinates) {
        console.log('🚚 [calculateShippingCost] Sin coordenadas - costo: 0');
        return 0;
    }

    // Si hay zonas configuradas, buscar la zona que contiene las coordenadas
    if (zones.length > 0) {
        console.log('🚚 [calculateShippingCost] Buscando zona para coordenadas:', coordinates);
        console.log('🚚 [calculateShippingCost] Zonas disponibles:', zones.map(z => ({
            id: z.id,
            name: z.name,
            priceStandard: z.priceStandard,
            priceExpress: z.priceExpress,
            coordinatesCount: z.coordinates.length
        })));

        const zone = findDeliveryZoneForCoordinates(coordinates, zones);
        
        if (zone) {
            console.log('🚚 [calculateShippingCost] ✅ Zona encontrada:', zone.name);
            // Usar precio de la zona
            if (shippingMethod === 'express' && zone.priceExpress !== undefined && zone.priceExpress > 0) {
                console.log('🚚 [calculateShippingCost] Usando precio express de zona:', zone.priceExpress);
                return zone.priceExpress;
            } else if (shippingMethod === 'standard' && zone.priceStandard !== undefined && zone.priceStandard > 0) {
                console.log('🚚 [calculateShippingCost] Usando precio estándar de zona:', zone.priceStandard);
                return zone.priceStandard;
            } else {
                console.log('🚚 [calculateShippingCost] ⚠️ Zona encontrada pero sin precio válido');
                return 0;
            }
        } else {
            console.log('🚚 [calculateShippingCost] ❌ Coordenadas fuera de zonas configuradas - costo: 0');
            return 0;
        }
    }

    // Si no hay zonas configuradas, costo es 0 (tienda sin configurar)
    console.log('🚚 [calculateShippingCost] ❌ No hay zonas configuradas - costo: 0');
    return 0;
}

/**
 * Función de debugging para probar el cálculo de envío desde la consola del navegador
 */
export function debugShippingCalculation(
    storeId: string,
    coordinates: { lat: number; lng: number },
    shippingMethod: 'standard' | 'express' | 'pickup' = 'standard'
) {
    return getStoreDeliveryZones(storeId).then(zones => {
        console.log('=== 🚚 DEBUG SHIPPING CALCULATION ===');
        console.log('Store ID:', storeId);
        console.log('Coordinates:', coordinates);
        console.log('Shipping Method:', shippingMethod);
        console.log('Zones loaded:', zones);
        
        const cost = calculateShippingCost(coordinates, zones, shippingMethod);
        const zone = findDeliveryZoneForCoordinates(coordinates, zones);
        
        console.log('=== 📊 RESULT ===');
        console.log('Shipping Cost:', cost);
        console.log('Zone Found:', zone ? zone.name : 'NONE');
        console.log('===================');
        
        return { cost, zone, zones };
    });
}

// Hacer la función disponible globalmente para debugging
if (typeof window !== 'undefined') {
    (window as any).debugShippingCalculation = debugShippingCalculation;
}
