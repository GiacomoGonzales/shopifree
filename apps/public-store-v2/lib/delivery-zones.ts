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
    for (const zone of zones) {
        const isInside = isPointInPolygon(coordinates, zone.coordinates);
        if (isInside) {
            return zone;
        }
    }
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
    // Si es recojo en tienda, no hay costo
    if (shippingMethod === 'pickup') {
        return 0;
    }

    // Si no hay coordenadas, no hay costo
    if (!coordinates) {
        return 0;
    }

    // Si hay zonas configuradas, buscar la zona que contiene las coordenadas
    if (zones.length > 0) {
        const zone = findDeliveryZoneForCoordinates(coordinates, zones);
        
        if (zone) {
            // Usar precio de la zona
            if (shippingMethod === 'express' && zone.priceExpress !== undefined && zone.priceExpress > 0) {
                return zone.priceExpress;
            } else if (shippingMethod === 'standard' && zone.priceStandard !== undefined && zone.priceStandard > 0) {
                return zone.priceStandard;
            }
        }
    }

    // FALLBACK: Usar precio base para Lima (coordenadas válidas de Perú)
    const isInLima = coordinates.lat >= -12.5 && coordinates.lat <= -11.5 && 
                     coordinates.lng >= -77.5 && coordinates.lng <= -76.5;
    
    if (isInLima) {
        return shippingMethod === 'express' ? 15 : 8;
    } else {
        return shippingMethod === 'express' ? 25 : 15;
    }
}
