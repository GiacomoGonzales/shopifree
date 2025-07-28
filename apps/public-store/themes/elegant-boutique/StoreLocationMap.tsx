'use client'

import React, { useCallback, useState } from 'react'
import { GoogleMap, Marker } from '@react-google-maps/api'
import { useGoogleMapsLoader } from '../../lib/hooks/useGoogleMapsLoader'

const mapContainerStyle = {
  width: '100%',
  height: '200px'
}

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: true,
  gestureHandling: 'cooperative',
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    },
    {
      featureType: 'transit',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
}

interface StoreLocationMapProps {
  address: string
  lat?: number
  lng?: number
  storeName?: string
}

export default function StoreLocationMap({ address, lat, lng, storeName }: StoreLocationMapProps) {
  const { isLoaded, loadError } = useGoogleMapsLoader()
  const [map, setMap] = useState<google.maps.Map | null>(null)

  // Coordenadas por defecto si no se proporcionan (Lima, Perú)
  const defaultLat = lat || -12.0464
  const defaultLng = lng || -77.0428

  const center = { lat: defaultLat, lng: defaultLng }

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
    // Ajustar zoom para mostrar bien la ubicación
    map.setZoom(15)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  const handleMapClick = () => {
    // Abrir en Google Maps cuando se haga clic en el mapa
    const query = lat && lng 
      ? `${lat},${lng}` 
      : encodeURIComponent(address)
    
    window.open(
      `https://www.google.com/maps/search/?api=1&query=${query}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  if (loadError) {
    return (
      <div className="w-full mb-4">
        <div 
          className="w-full h-[200px] rounded-lg overflow-hidden flex items-center justify-center relative cursor-pointer"
          style={{ 
            backgroundColor: 'rgb(var(--theme-primary) / 0.05)',
            border: '1px solid rgb(var(--theme-primary) / 0.1)'
          }}
          onClick={handleMapClick}
        >
          <div className="text-center">
            <div className="text-4xl mb-2">🗺️</div>
            <p 
              className="text-sm text-sans font-medium"
              style={{ color: 'rgb(var(--theme-neutral-dark))' }}
            >
              Ver en Google Maps
            </p>
            <p 
              className="text-xs text-sans mt-1"
              style={{ color: 'rgb(var(--theme-neutral-medium))' }}
            >
              Error al cargar el mapa
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="w-full mb-4">
        <div 
          className="w-full h-[200px] rounded-lg overflow-hidden flex items-center justify-center"
          style={{ 
            backgroundColor: 'rgb(var(--theme-primary) / 0.05)',
            border: '1px solid rgb(var(--theme-primary) / 0.1)'
          }}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-current border-t-transparent mx-auto mb-2" 
                 style={{ color: 'rgb(var(--theme-primary))' }}></div>
            <p 
              className="text-sm text-sans"
              style={{ color: 'rgb(var(--theme-neutral-medium))' }}
            >
              Cargando mapa...
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full mb-4">
      <div 
        className="w-full h-[200px] rounded-lg overflow-hidden cursor-pointer relative"
        style={{ 
          border: '1px solid rgb(var(--theme-primary) / 0.1)'
        }}
        onClick={handleMapClick}
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={15}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={mapOptions}
        >
          <Marker
            position={center}
            title={storeName || 'Nuestra tienda'}
          />
        </GoogleMap>
        
        {/* Overlay para indicar que es clickeable */}
        <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded text-xs font-medium shadow-sm"
             style={{ color: 'rgb(var(--theme-primary))' }}>
          Clic para abrir en Google Maps
        </div>
      </div>
    </div>
  )
} 