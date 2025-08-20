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
            console.warn('[delivery-zones] Firebase no está disponible');
            return [];
        }

        console.log(`[delivery-zones] Obteniendo zonas desde Firestore para ${storeId}`);
        const { collection, getDocs } = await import('firebase/firestore');
        const deliveryZonesRef = collection(db, 'stores', storeId, 'deliveryZones');
        const snapshot = await getDocs(deliveryZonesRef);

        const zones: DeliveryZone[] = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            console.log(`[delivery-zones] Procesando zona: ${doc.id}`, data);
            
            // Transformar coordenadas desde el formato de Firestore
            const coordinates = [];
            if (data.coordinates && Array.isArray(data.coordinates)) {
                for (const coord of data.coordinates) {
                    if (coord.lat !== undefined && coord.lng !== undefined) {
                        coordinates.push({
                            lat: typeof coord.lat === 'number' ? coord.lat : parseFloat(coord.lat),
                            lng: typeof coord.lng === 'number' ? coord.lng : parseFloat(coord.lng)
                        });
                    }
                }
                console.log(`[delivery-zones] Zona "${data.name || data.nombre || doc.id}" tiene ${coordinates.length} coordenadas`);
            } else {
                console.warn(`[delivery-zones] Zona "${data.name || data.nombre || doc.id}" no tiene coordenadas válidas:`, data.coordinates);
            }

            // Soporte para formato alternativo de precios
            const priceStandard = data.priceStandard || data.precio || 0;
            const priceExpress = data.priceExpress || data.precioExpress || (data.precio ? data.precio * 1.5 : 0);

            console.log(`[delivery-zones] Precios para "${data.name || data.nombre}": estándar=${priceStandard}, express=${priceExpress}`);

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

        console.log(`[delivery-zones] Cargadas ${activeZones.length} zonas para tienda ${storeId}`);
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

    console.log(`[delivery-zones] Evaluando punto (${y}, ${x}) contra polígono de ${polygon.length} puntos`);

    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].lng;
        const yi = polygon[i].lat;
        const xj = polygon[j].lng;
        const yj = polygon[j].lat;

        if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
            inside = !inside;
        }
    }

    console.log(`[delivery-zones] Resultado: ${inside ? 'DENTRO' : 'FUERA'} del polígono`);
    return inside;
}

/**
 * Encuentra la zona de entrega que contiene las coordenadas dadas
 */
export function findDeliveryZoneForCoordinates(
    coordinates: { lat: number; lng: number },
    zones: DeliveryZone[]
): DeliveryZone | null {
    console.log(`[delivery-zones] Buscando zona para coordenadas: lat=${coordinates.lat}, lng=${coordinates.lng}`);
    console.log(`[delivery-zones] Evaluando ${zones.length} zonas disponibles`);
    
    for (const zone of zones) {
        console.log(`[delivery-zones] Evaluando zona "${zone.name}" con ${zone.coordinates.length} coordenadas`);
        const isInside = isPointInPolygon(coordinates, zone.coordinates);
        console.log(`[delivery-zones] ¿Está dentro de "${zone.name}"? ${isInside}`);
        
        if (isInside) {
            console.log(`[delivery-zones] ✅ Ubicación encontrada en zona: ${zone.name} (precio estándar: ${zone.priceStandard}, express: ${zone.priceExpress})`);
            return zone;
        }
    }

    console.log(`[delivery-zones] ❌ Ubicación fuera de todas las zonas de cobertura`);
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
    console.log(`[delivery-zones] Calculando costo de envío para método: ${shippingMethod}`);
    
    // Si es recojo en tienda, no hay costo
    if (shippingMethod === 'pickup') {
        console.log(`[delivery-zones] Recojo en tienda - costo: 0`);
        return 0;
    }

    // Si no hay coordenadas, no hay costo (hasta que se determine la zona)
    if (!coordinates) {
        console.log(`[delivery-zones] Sin coordenadas - sin costo hasta determinar zona`);
        return 0;
    }

    console.log(`[delivery-zones] Buscando zona para coordenadas: lat=${coordinates.lat}, lng=${coordinates.lng}`);

    // Buscar la zona que contiene las coordenadas
    const zone = findDeliveryZoneForCoordinates(coordinates, zones);
    
    if (zone) {
        console.log(`[delivery-zones] Zona encontrada: ${zone.name}`);
        // Usar precio de la zona
        if (shippingMethod === 'express' && zone.priceExpress !== undefined && zone.priceExpress > 0) {
            console.log(`[delivery-zones] Usando precio express de zona: ${zone.priceExpress}`);
            return zone.priceExpress;
        } else if (shippingMethod === 'standard' && zone.priceStandard !== undefined && zone.priceStandard > 0) {
            console.log(`[delivery-zones] Usando precio estándar de zona: ${zone.priceStandard}`);
            return zone.priceStandard;
        }
    }

    // Si no se encuentra zona o no tiene precio configurado, no cobrar
    console.log(`[delivery-zones] No se encontró zona válida con precio - sin costo de envío`);
    return 0;
}
