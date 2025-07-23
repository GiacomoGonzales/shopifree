'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '../../lib/simple-auth-context'
import { getUserStore } from '../../lib/store'
import { 
  GoogleMap, 
  LoadScript, 
  DrawingManager, 
  Polygon, 
  Circle,
  InfoWindow
} from '@react-google-maps/api'
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  getFirestore 
} from 'firebase/firestore'
import { getFirebaseDb } from '../../lib/firebase'
import { googleMapsLoader } from '../../lib/google-maps'

interface DeliveryZone {
  id: string
  nombre: string
  tipo: 'poligono' | 'circulo'
  precio: number
  coordenadas: Array<{ lat: number; lng: number }> | { center: { lat: number; lng: number }; radius: number }
  estimatedTime?: string
  color?: string
}

interface ZoneModalData {
  nombre: string
  precio: number
  estimatedTime: string
  color: string
}

const libraries: ("drawing" | "places")[] = ["drawing", "places"]

// Colores predefinidos para las zonas
const ZONE_COLORS = [
  { name: 'Azul', value: '#2563eb' },
  { name: 'Verde', value: '#059669' },
  { name: 'Rojo', value: '#dc2626' },
  { name: 'Naranja', value: '#ea580c' },
  { name: 'Morado', value: '#7c3aed' },
  { name: 'Rosa', value: '#db2777' },
  { name: 'Amarillo', value: '#ca8a04' },
  { name: 'Cian', value: '#0891b2' }
]

const mapContainerStyle = {
  width: '100%',
  height: '400px'
}

const defaultCenter = {
  lat: -12.0464,
  lng: -77.0428 // Lima, Perú
}

const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: true,
  fullscreenControl: true
}

// Función para crear opciones de drawing manager con color dinámico
const getDrawingManagerOptions = (color: string) => ({
  drawingMode: null,
  drawingControl: true,
  drawingControlOptions: {
    position: 9, // google.maps.ControlPosition.TOP_CENTER
    drawingModes: [
      "polygon" as google.maps.drawing.OverlayType,
      "circle" as google.maps.drawing.OverlayType
    ]
  },
  polygonOptions: {
    fillColor: color,
    fillOpacity: 0.3,
    strokeColor: color,
    strokeOpacity: 0.8,
    strokeWeight: 2,
    clickable: true,
    editable: true,
    zIndex: 1
  },
  circleOptions: {
    fillColor: color,
    fillOpacity: 0.3,
    strokeColor: color,
    strokeOpacity: 0.8,
    strokeWeight: 2,
    clickable: true,
    editable: true,
    zIndex: 1
  }
})

interface DeliveryZoneMapProps {
  isVisible?: boolean
}

export default function DeliveryZoneMap({ isVisible = true }: DeliveryZoneMapProps) {
  const { user } = useAuth()
  const t = useTranslations('settings.advanced.shipping.localDelivery')
  
  const [storeId, setStoreId] = useState<string>('')
  const [zones, setZones] = useState<DeliveryZone[]>([])
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentShape, setCurrentShape] = useState<google.maps.Polygon | google.maps.Circle | null>(null)
  const [modalData, setModalData] = useState<ZoneModalData>({
    nombre: '',
    precio: 0,
    estimatedTime: '',
    color: '#2563eb'
  })
  const [selectedZone, setSelectedZone] = useState<DeliveryZone | null>(null)
  const [infoWindowOpen, setInfoWindowOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [userReady, setUserReady] = useState(false)
  const [loadingStuck, setLoadingStuck] = useState(false)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Efecto para detectar cuando el mapa se queda atascado en loading
  useEffect(() => {
    // Si el componente está visible y Google Maps ya está cargado pero isLoaded es false
    if (isVisible && window.google?.maps && !isLoaded) {
      // Iniciar temporizador
      loadingTimeoutRef.current = setTimeout(() => {
        console.log('Map loading appears to be stuck, offering reload...')
        setLoadingStuck(true)
      }, 5000) // Esperar 5 segundos antes de considerar que está atascado
    }

    // Limpiar temporizador cuando el componente se desmonta o el mapa se carga
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
  }, [isVisible, isLoaded])

  // Función para recargar la página
  const reloadPage = () => {
    window.location.reload()
  }

  // Obtener el ID de la tienda
  useEffect(() => {
    const getStoreId = async () => {
      if (!user?.uid) {
        console.log('No user available, skipping store load')
        return
      }
      
      try {
        console.log('Getting store for user:', user.uid)
        const store = await getUserStore(user.uid)
        console.log('Store result:', store)
        
        if (store?.id) {
          console.log('Store ID found:', store.id)
          setStoreId(store.id)
          setError(null) // Limpiar cualquier error previo
          setUserReady(true)
        } else {
          console.warn('No store found for user')
          setError('No se encontró una tienda asociada a tu cuenta')
          setUserReady(true)
        }
      } catch (error) {
        console.error('Error getting store:', error)
        setError('Error al cargar la información de la tienda')
        setUserReady(true)
      }
    }

    getStoreId()
  }, [user?.uid])

  // Estado para controlar si ya se cargaron las zonas una vez
  const [zonesLoaded, setZonesLoaded] = useState(false)
  
  // Función para forzar recarga de zonas
  const forceReloadZones = () => {
    setZonesLoaded(false)
  }

  // Cargar zonas existentes
  useEffect(() => {
    const loadZones = async () => {
      if (!storeId || !user?.uid) {
        console.log('No storeId or user available, skipping zones load', { 
          storeId, 
          userId: user?.uid
        })
        return
      }

      // Solo cargar si no se han cargado antes o si el componente está visible
      if (!zonesLoaded && isVisible) {
        try {
        setLoading(true)
        setError(null) // Limpiar error anterior
        console.log('Loading delivery zones for store:', storeId)
        
        const db = getFirebaseDb()
        if (!db) {
          console.warn('Firebase db not available')
          // No establecer error, solo limpiar las zonas
          setZones([])
          return
        }

        const zonesSnapshot = await getDocs(
          collection(db, 'stores', storeId, 'deliveryZones')
        )

        console.log('Zones snapshot size:', zonesSnapshot.size)

        const zonesData: DeliveryZone[] = []
        zonesSnapshot.forEach(doc => {
          const docData = doc.data()
          console.log('Zone document:', doc.id, docData)
          zonesData.push({
            id: doc.id,
            ...docData
          } as DeliveryZone)
        })

        console.log('Loaded zones:', zonesData)
        setZones(zonesData)
        setZonesLoaded(true) // Marcar que las zonas ya se cargaron
        
        // Si no hay error hasta aquí, limpiar cualquier error previo
        setError(null)
      } catch (error) {
        console.error('Error loading zones:', error)
        // Solo mostrar error si realmente hay un problema crítico
        if (error instanceof Error && error.message.includes('permission-denied')) {
          setError('No tienes permisos para acceder a las zonas de entrega')
        } else if (error instanceof Error && error.message.includes('not-found')) {
          setError('No se encontró la configuración de la tienda')
        } else {
          console.warn('Non-critical error loading zones:', error)
          // No mostrar error para errores menores, solo logear
          setZones([]) // Establecer array vacío en lugar de error
        }
      } finally {
        setLoading(false)
      }
      } // Cerrar el if (!zonesLoaded && isVisible)
    }

    loadZones()
  }, [storeId, isVisible, user?.uid, zonesLoaded])

  const onLoad = useCallback(() => {
    console.log('Map loaded successfully')
    setIsLoaded(true)
    setLoadingStuck(false)
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
    }
  }, [])

  const onShapeComplete = useCallback((shape: google.maps.Polygon | google.maps.Circle) => {
    // Eliminar cualquier forma anterior
    if (currentShape) {
      currentShape.setMap(null)
    }
    
    setCurrentShape(shape)
    setIsModalOpen(true)
  }, [currentShape])

  const saveZone = async () => {
    if (!currentShape || !storeId) {
      console.error('Missing currentShape or storeId:', { currentShape: !!currentShape, storeId })
      alert('Error: No se puede guardar la zona. Faltan datos necesarios.')
      return
    }

    console.log('Saving zone...', { storeId, modalData })

    try {
      const db = getFirebaseDb()
      if (!db) {
        console.error('Firebase db not available')
        alert('Error: Base de datos no disponible')
        return
      }

      let zoneData: any = {
        nombre: modalData.nombre.trim(),
        precio: Number(modalData.precio),
        color: modalData.color,
        createdAt: new Date().toISOString(),
        ...(modalData.estimatedTime.trim() && { estimatedTime: modalData.estimatedTime.trim() })
      }

      if (currentShape instanceof google.maps.Polygon) {
        console.log('Saving polygon zone')
        // Polígono
        const path = currentShape.getPath()
        const coordinates: Array<{ lat: number; lng: number }> = []
        
        for (let i = 0; i < path.getLength(); i++) {
          const point = path.getAt(i)
          coordinates.push({
            lat: point.lat(),
            lng: point.lng()
          })
        }

        zoneData.tipo = 'poligono'
        zoneData.coordenadas = coordinates
        
        console.log('Polygon coordinates:', coordinates)
      } else if (currentShape instanceof google.maps.Circle) {
        console.log('Saving circle zone')
        // Círculo
        const center = currentShape.getCenter()
        const radius = currentShape.getRadius()

        if (!center) {
          console.error('Circle center is null')
          alert('Error: No se pudo obtener el centro del círculo')
          return
        }

        zoneData.tipo = 'circulo'
        zoneData.coordenadas = {
          center: {
            lat: center.lat(),
            lng: center.lng()
          },
          radius: radius
        }
        
        console.log('Circle data:', { center: { lat: center.lat(), lng: center.lng() }, radius })
      } else {
        console.error('Unknown shape type:', currentShape)
        alert('Error: Tipo de forma no reconocido')
        return
      }

      console.log('Final zoneData to save:', zoneData)

      // Guardar en Firestore
      console.log('Saving to Firestore path:', `stores/${storeId}/deliveryZones`)
      const docRef = await addDoc(
        collection(db, 'stores', storeId, 'deliveryZones'),
        zoneData
      )

      console.log('Zone saved with ID:', docRef.id)

      // Agregar a la lista local
      const newZone = {
        id: docRef.id,
        ...zoneData
      } as DeliveryZone
      
      console.log('Adding zone to local state:', newZone)
      setZones(prev => [...prev, newZone])

      // Limpiar modal
      setIsModalOpen(false)
      setModalData({ nombre: '', precio: 0, estimatedTime: '', color: '#2563eb' })
      setCurrentShape(null)
      
      console.log('Zone saved successfully')
    } catch (error) {
      console.error('Error saving zone:', error)
      
      // Mostrar error más específico
      if (error instanceof Error) {
        if (error.message.includes('permission-denied')) {
          alert('Error: No tienes permisos para guardar zonas de entrega')
        } else if (error.message.includes('not-found')) {
          alert('Error: No se encontró la tienda')
        } else {
          alert(`Error al guardar la zona: ${error.message}`)
        }
      } else {
        alert('Error desconocido al guardar la zona')
      }
      
      setError('Error al guardar la zona')
    }
  }

  const deleteZone = async (zoneId: string) => {
    if (!storeId) return

    try {
      const db = getFirebaseDb()
      if (!db) return

      await deleteDoc(doc(db, 'stores', storeId, 'deliveryZones', zoneId))
      setZones(prev => prev.filter(zone => zone.id !== zoneId))
      setSelectedZone(null)
      setInfoWindowOpen(false)
    } catch (error) {
      console.error('Error deleting zone:', error)
      setError('Error al eliminar la zona')
    }
  }

  const cancelModal = () => {
    if (currentShape) {
      currentShape.setMap(null)
    }
    setCurrentShape(null)
    setIsModalOpen(false)
    setModalData({ nombre: '', precio: 0, estimatedTime: '', color: '#2563eb' })
  }

  const onZoneClick = (zone: DeliveryZone) => {
    setSelectedZone(zone)
    setInfoWindowOpen(true)
  }

  const getZoneCenter = (zone: DeliveryZone) => {
    if (zone.tipo === 'circulo') {
      const coords = zone.coordenadas as { center: { lat: number; lng: number }; radius: number }
      return coords.center
    } else {
      const coords = zone.coordenadas as Array<{ lat: number; lng: number }>
      // Calcular centro del polígono
      const bounds = new google.maps.LatLngBounds()
      coords.forEach(coord => bounds.extend(coord))
      const center = bounds.getCenter()
      return { lat: center.lat(), lng: center.lng() }
    }
  }

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Configuración de Google Maps requerida
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Para usar el mapa de zonas de entrega, necesitas configurar una clave API de Google Maps.</p>
              <p className="mt-2">
                <strong>Pasos:</strong>
              </p>
              <ol className="list-decimal list-inside mt-1 space-y-1">
                <li>Ve a <a href="https://console.cloud.google.com/" target="_blank" className="underline">Google Cloud Console</a></li>
                <li>Habilita Maps JavaScript API y Places API</li>
                <li>Crea una clave API</li>
                <li>Agrega <code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_clave</code> a tu archivo .env.local</li>
                <li>Reinicia el servidor de desarrollo</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && error.includes('Base de datos no disponible')) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-red-800">Error de conexión</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-red-800 underline hover:text-red-900"
            >
              Recargar página
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Mensaje cuando el mapa se queda atascado */}
      {loadingStuck && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-yellow-800">El mapa parece estar atascado</h3>
              <p className="mt-1 text-sm text-yellow-700">
                Google Maps ya está cargado pero el mapa no se muestra correctamente.
              </p>
              <div className="mt-3">
                <button
                  onClick={reloadPage}
                  className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  Recargar página
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mostrar error menor sin bloquear el mapa */}
      {error && !error.includes('Base de datos no disponible') && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-orange-800">Advertencia</h3>
              <p className="mt-1 text-sm text-orange-700">{error}</p>
              <p className="mt-1 text-sm text-orange-600">El mapa sigue funcionando normalmente para crear nuevas zonas.</p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-orange-400 hover:text-orange-500"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Instrucciones */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-800">
              Cómo usar el mapa de zonas
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc space-y-1 ml-4">
                <li>Usa las herramientas de dibujo para crear polígonos o círculos</li>
                <li>Cada zona debe tener un nombre y precio de delivery</li>
                <li>Solo puedes dibujar una zona a la vez</li>
                <li>Haz clic en una zona existente para ver sus detalles o eliminarla</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Mapa y zonas configuradas en layout horizontal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mapa */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg border border-gray-200 overflow-hidden">
            <LoadScript
              googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
              libraries={libraries}
              onLoad={onLoad}
            >
              {isLoaded && (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={defaultCenter}
                  zoom={12}
                  options={mapOptions}
                >
                  <DrawingManager
                    onPolygonComplete={onShapeComplete}
                    onCircleComplete={onShapeComplete}
                    options={getDrawingManagerOptions(modalData.color)}
                  />

                                     {/* Renderizar zonas existentes */}
                   {zones.map(zone => {
                     const zoneColor = zone.color || '#059669' // Color por defecto si no tiene color
                     if (zone.tipo === 'poligono') {
                       const coords = zone.coordenadas as Array<{ lat: number; lng: number }>
                       return (
                         <Polygon
                           key={zone.id}
                           paths={coords}
                           options={{
                             fillColor: zoneColor,
                             fillOpacity: 0.3,
                             strokeColor: zoneColor,
                             strokeOpacity: 0.8,
                             strokeWeight: 2,
                             clickable: true
                           }}
                           onClick={() => onZoneClick(zone)}
                         />
                       )
                     } else {
                       const coords = zone.coordenadas as { center: { lat: number; lng: number }; radius: number }
                       return (
                         <Circle
                           key={zone.id}
                           center={coords.center}
                           radius={coords.radius}
                           options={{
                             fillColor: zoneColor,
                             fillOpacity: 0.3,
                             strokeColor: zoneColor,
                             strokeOpacity: 0.8,
                             strokeWeight: 2,
                             clickable: true
                           }}
                           onClick={() => onZoneClick(zone)}
                         />
                       )
                     }
                   })}

                  {/* InfoWindow para zona seleccionada */}
                  {selectedZone && infoWindowOpen && (
                    <InfoWindow
                      position={getZoneCenter(selectedZone)}
                      onCloseClick={() => setInfoWindowOpen(false)}
                    >
                      <div className="p-2">
                        <h4 className="font-semibold text-gray-900">{selectedZone.nombre}</h4>
                        <p className="text-sm text-gray-600">Precio: S/ {selectedZone.precio}</p>
                        {selectedZone.estimatedTime && (
                          <p className="text-sm text-gray-600">Tiempo: {selectedZone.estimatedTime}</p>
                        )}
                        <button
                          onClick={() => deleteZone(selectedZone.id)}
                          className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                        >
                          Eliminar zona
                        </button>
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              )}
            </LoadScript>
          </div>
        </div>

        {/* Lista de zonas */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg border border-gray-200 h-full">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Zonas configuradas</h3>
              <button
                onClick={() => {
                  if (storeId && user?.uid) {
                    forceReloadZones() // Forzar recarga de zonas
                  }
                }}
                className="text-sm text-gray-600 hover:text-gray-800 flex items-center space-x-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Actualizar</span>
              </button>
            </div>
          
            {zones.length > 0 ? (
              <div className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
                                 {zones.map(zone => (
                   <div key={zone.id} className="px-4 py-3">
                     <div className="mb-2">
                       <div className="flex items-center space-x-2 mb-1">
                         <div 
                           className="w-4 h-4 rounded border border-gray-300"
                           style={{ backgroundColor: zone.color || '#059669' }}
                         ></div>
                         <h4 className="font-medium text-gray-900">{zone.nombre}</h4>
                       </div>
                       <p className="text-sm text-gray-600">
                         Tipo: {zone.tipo === 'poligono' ? 'Polígono' : 'Círculo'}
                       </p>
                       <p className="text-sm text-gray-600">
                         Precio: S/ {zone.precio}
                       </p>
                       {zone.estimatedTime && (
                         <p className="text-sm text-gray-600">
                           Tiempo: {zone.estimatedTime}
                         </p>
                       )}
                     </div>
                     <button
                       onClick={() => deleteZone(zone.id)}
                       className="text-red-600 hover:text-red-800 text-sm font-medium"
                     >
                       Eliminar
                     </button>
                   </div>
                 ))}
              </div>
            ) : (
              <div className="px-4 py-8 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No hay zonas configuradas</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Usa las herramientas de dibujo en el mapa para crear tu primera zona de entrega.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para crear zona */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Configurar zona de entrega
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la zona
                  </label>
                  <input
                    type="text"
                    value={modalData.nombre}
                    onChange={(e) => setModalData(prev => ({ ...prev, nombre: e.target.value }))}
                    placeholder="Ej: Centro de Lima"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio de delivery (S/)
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    value={modalData.precio}
                    onChange={(e) => setModalData(prev => ({ ...prev, precio: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tiempo estimado (opcional)
                  </label>
                  <input
                    type="text"
                    value={modalData.estimatedTime}
                    onChange={(e) => setModalData(prev => ({ ...prev, estimatedTime: e.target.value }))}
                    placeholder="Ej: 30-60 minutos"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-gray-500 focus:border-gray-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Color de la zona
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {ZONE_COLORS.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setModalData(prev => ({ ...prev, color: color.value }))}
                        className={`h-10 w-full rounded-md border-2 transition-all duration-200 ${
                          modalData.color === color.value 
                            ? 'border-gray-900 shadow-lg scale-105' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      >
                        {modalData.color === color.value && (
                          <svg className="h-5 w-5 text-white mx-auto" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={saveZone}
                  disabled={!modalData.nombre.trim() || modalData.precio <= 0 || isNaN(Number(modalData.precio))}
                  className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Guardar zona
                </button>
                <button
                  onClick={cancelModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {(!userReady || loading) && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">
            {!userReady ? 'Cargando información de la tienda...' : 'Cargando zonas...'}
          </p>
        </div>
      )}
    </div>
  )
} 