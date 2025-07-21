import { getFirestore, collection, getDocs } from 'firebase/firestore'
import { getFirebaseDb } from './firebase'

export interface DeliveryZone {
  id: string
  nombre: string
  tipo: 'poligono' | 'circulo'
  precio: number
  coordenadas: Array<{ lat: number; lng: number }> | { center: { lat: number; lng: number }; radius: number }
  estimatedTime?: string
}

export interface LocationResult {
  inDeliveryZone: boolean
  zone?: DeliveryZone
  shippingCost: number
  estimatedTime?: string
}

// Función para calcular la distancia entre dos puntos usando la fórmula de Haversine
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371 // Radio de la Tierra en kilómetros
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c * 1000 // Convertir a metros
}

// Función para verificar si un punto está dentro de un polígono (Ray Casting Algorithm)
function isPointInPolygon(lat: number, lng: number, polygon: Array<{ lat: number; lng: number }>): boolean {
  let inside = false
  const x = lng
  const y = lat
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng
    const yi = polygon[i].lat
    const xj = polygon[j].lng
    const yj = polygon[j].lat
    
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside
    }
  }
  
  return inside
}

// Función para verificar si un punto está dentro de un círculo
function isPointInCircle(lat: number, lng: number, center: { lat: number; lng: number }, radius: number): boolean {
  const distance = calculateDistance(lat, lng, center.lat, center.lng)
  return distance <= radius
}

// Cargar zonas de entrega desde Firestore
export async function getDeliveryZones(storeId: string): Promise<DeliveryZone[]> {
  try {
    const db = getFirebaseDb()
    if (!db) {
      console.warn('Firebase db not available')
      return []
    }

    const zonesSnapshot = await getDocs(
      collection(db, 'stores', storeId, 'deliveryZones')
    )

    const zones: DeliveryZone[] = []
    zonesSnapshot.forEach(doc => {
      const data = doc.data()
      zones.push({
        id: doc.id,
        ...data
      } as DeliveryZone)
    })

    return zones
  } catch (error) {
    console.error('Error loading delivery zones:', error)
    return []
  }
}

// Función principal para verificar ubicación y calcular costo de envío
export async function checkDeliveryLocation(
  lat: number, 
  lng: number, 
  storeId: string
): Promise<LocationResult> {
  try {
    console.log('Checking delivery location:', { lat, lng, storeId })
    
    const zones = await getDeliveryZones(storeId)
    console.log('Available zones:', zones)
    
    // Verificar cada zona
    for (const zone of zones) {
      let isInZone = false
      
      if (zone.tipo === 'poligono') {
        const coords = zone.coordenadas as Array<{ lat: number; lng: number }>
        isInZone = isPointInPolygon(lat, lng, coords)
        console.log(`Checking polygon zone ${zone.nombre}:`, isInZone)
      } else if (zone.tipo === 'circulo') {
        const coords = zone.coordenadas as { center: { lat: number; lng: number }; radius: number }
        isInZone = isPointInCircle(lat, lng, coords.center, coords.radius)
        console.log(`Checking circle zone ${zone.nombre}:`, isInZone)
      }
      
      if (isInZone) {
        console.log(`Location is in zone: ${zone.nombre}, cost: ${zone.precio}`)
        return {
          inDeliveryZone: true,
          zone,
          shippingCost: zone.precio,
          estimatedTime: zone.estimatedTime
        }
      }
    }
    
    console.log('Location is not in any delivery zone')
    return {
      inDeliveryZone: false,
      shippingCost: 0
    }
  } catch (error) {
    console.error('Error checking delivery location:', error)
    return {
      inDeliveryZone: false,
      shippingCost: 0
    }
  }
}

// Función para obtener coordenadas desde una dirección usando geocoding
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      console.warn('Google Maps API key not available for geocoding')
      return null
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`
    )
    
    const data = await response.json()
    
    if (data.status === 'OK' && data.results.length > 0) {
      const location = data.results[0].geometry.location
      return {
        lat: location.lat,
        lng: location.lng
      }
    }
    
    console.warn('Geocoding failed:', data.status)
    return null
  } catch (error) {
    console.error('Error geocoding address:', error)
    return null
  }
} 