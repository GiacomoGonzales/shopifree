import { getFirebaseDb } from './firebase';

export interface DeliveryZone {
    id: string;
    name: string;
    type?: 'polygon' | 'circle'; // Tipo de zona
    coordinates: Array<{
        lat: number;
        lng: number;
    }>;
    // Para zonas circulares
    center?: { lat: number; lng: number };
    radius?: number;
    priceStandard?: number;
    priceExpress?: number;
    estimatedTime?: string;
    isActive?: boolean;
}

// Cache simple para evitar llamadas repetidas
const zonesCache: Record<string, { zones: DeliveryZone[]; timestamp: number }> = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Obtiene las zonas de entrega de una tienda desde Firestore
 */
export async function getStoreDeliveryZones(storeId: string): Promise<DeliveryZone[]> {
    console.log(`[delivery-zones] 🔄 Iniciando carga de zonas para storeId: ${storeId}`);

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
        console.log(`[delivery-zones] 🔍 Consultando Firestore: stores/${storeId}/deliveryZones`);
        const snapshot = await getDocs(deliveryZonesRef);
        console.log(`[delivery-zones] 📊 Documentos encontrados: ${snapshot.size}`);

        const zones: DeliveryZone[] = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            
            // Transformar coordenadas desde el formato de Firestore
            const coordinates = [];
            const coordsData = data.coordinates || data.coordenadas; // Soporte para ambos formatos
            const zoneType = data.tipo || data.type || 'polygon'; // Detectar tipo de zona

            let center = null;
            let radius = null;

            if (zoneType === 'circulo' || zoneType === 'circle') {
                // Zona circular: extraer center y radius
                if (coordsData && coordsData.center && coordsData.radius) {
                    center = {
                        lat: typeof coordsData.center.lat === 'number' ? coordsData.center.lat : parseFloat(coordsData.center.lat),
                        lng: typeof coordsData.center.lng === 'number' ? coordsData.center.lng : parseFloat(coordsData.center.lng)
                    };
                    radius = typeof coordsData.radius === 'number' ? coordsData.radius : parseFloat(coordsData.radius);
                }
            } else {
                // Zona poligonal: extraer array de coordenadas
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
            }

            // Soporte para formato alternativo de precios
            const priceStandard = data.priceStandard || data.precio || 0;
            // No calcular priceExpress automáticamente, dejar que lo haga la configuración del dashboard
            const priceExpress = data.priceExpress || data.precioExpress || 0;

            zones.push({
                id: doc.id,
                name: data.name || data.nombre || 'Zona sin nombre',
                type: zoneType === 'circulo' ? 'circle' : 'polygon',
                coordinates,
                center,
                radius,
                priceStandard,
                priceExpress,
                estimatedTime: data.estimatedTime || data.tiempoEstimado || 'Tiempo por calcular',
                isActive: data.isActive !== false // Default true
            });
        });

        const activeZones = zones.filter(zone => {
            if (!zone.isActive) return false;

            // Para círculos, verificar que tengan center y radius válidos
            if (zone.type === 'circle') {
                return zone.center && zone.radius && zone.radius > 0;
            }

            // Para polígonos, verificar que tengan al menos 3 coordenadas
            return zone.coordinates.length >= 3;
        });
        
        console.log(`[delivery-zones] ✅ Zonas cargadas para ${storeId}:`, {
            total: zones.length,
            activas: activeZones.length,
            zonas: activeZones.map(z => ({
                id: z.id,
                name: z.name,
                coordenadas: z.coordinates.length,
                precioStandard: z.priceStandard,
                precioExpress: z.priceExpress,
                tiempoEstimado: z.estimatedTime
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
 * Verifica si un punto está dentro de un círculo
 */
export function isPointInCircle(
    point: { lat: number; lng: number },
    center: { lat: number; lng: number },
    radius: number
): boolean {
    // Calcular distancia usando la fórmula de Haversine (más precisa para coordenadas geográficas)
    const R = 6371000; // Radio de la Tierra en metros
    const lat1Rad = point.lat * Math.PI / 180;
    const lat2Rad = center.lat * Math.PI / 180;
    const deltaLatRad = (center.lat - point.lat) * Math.PI / 180;
    const deltaLngRad = (center.lng - point.lng) * Math.PI / 180;

    const a = Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(deltaLngRad / 2) * Math.sin(deltaLngRad / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance <= radius;
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
        console.log(`🔍 [findDeliveryZoneForCoordinates] Verificando zona "${zone.name}" tipo: ${zone.type || 'polygon'}`);

        let isInside = false;

        if (zone.type === 'circle' && zone.center && zone.radius) {
            // Zona circular
            console.log(`🔍 [findDeliveryZoneForCoordinates] Verificando círculo con centro:`, zone.center, 'radio:', zone.radius);
            isInside = isPointInCircle(coordinates, zone.center, zone.radius);
        } else {
            // Zona poligonal (por defecto)
            console.log(`🔍 [findDeliveryZoneForCoordinates] Verificando polígono con ${zone.coordinates.length} puntos`);
            console.log(`🔍 [findDeliveryZoneForCoordinates] Coordenadas de zona:`, zone.coordinates);
            isInside = isPointInPolygon(coordinates, zone.coordinates);
        }

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
    shippingMethod: 'standard' | 'express' | 'pickup',
    expressConfig?: {
        enabled: boolean;
        priceMultiplier?: number;
        fixedSurcharge?: number;
    }
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

            // Obtener precio base (estándar)
            const basePrice = zone.priceStandard || 0;

            if (shippingMethod === 'express') {
                console.log('🚚 [calculateShippingCost] Calculando precio express...');

                // NOTA: Se eliminó la lógica de precio express por zona
                // Ahora siempre usa la configuración global del dashboard para consistency

                // Si no hay configuración express, no permitir express
                if (!expressConfig?.enabled) {
                    console.log('🚚 [calculateShippingCost] Express no habilitado, usando precio estándar');
                    return basePrice;
                }

                // Calcular precio express según configuración del dashboard
                console.log('🚚 [calculateShippingCost] Usando configuración del dashboard:', expressConfig);
                let expressPrice = basePrice;

                if (expressConfig.fixedSurcharge && expressConfig.fixedSurcharge > 0) {
                    // Usar recargo fijo
                    expressPrice = basePrice + expressConfig.fixedSurcharge;
                    console.log('🚚 [calculateShippingCost] Usando recargo fijo:', {
                        basePrice,
                        surcharge: expressConfig.fixedSurcharge,
                        expressPrice
                    });
                } else if (expressConfig.priceMultiplier && expressConfig.priceMultiplier > 0) {
                    // Usar multiplicador
                    expressPrice = basePrice * expressConfig.priceMultiplier;
                    console.log('🚚 [calculateShippingCost] Usando multiplicador:', {
                        basePrice,
                        multiplier: expressConfig.priceMultiplier,
                        expressPrice
                    });
                }

                return Math.round(expressPrice);
            } else if (shippingMethod === 'standard') {
                console.log('🚚 [calculateShippingCost] Usando precio estándar de zona:', basePrice);
                return basePrice;
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
    shippingMethod: 'standard' | 'express' | 'pickup' = 'standard',
    expressConfig?: {
        enabled: boolean;
        priceMultiplier?: number;
        fixedSurcharge?: number;
    }
) {
    return getStoreDeliveryZones(storeId).then(zones => {
        console.log('=== 🚚 DEBUG SHIPPING CALCULATION ===');
        console.log('Store ID:', storeId);
        console.log('Coordinates:', coordinates);
        console.log('Shipping Method:', shippingMethod);
        console.log('Zones loaded:', zones);
        
        const cost = calculateShippingCost(coordinates, zones, shippingMethod, expressConfig);
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
