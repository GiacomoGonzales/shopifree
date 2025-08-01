'use client'

import React, { useCallback, useState } from 'react'
import { GoogleMap, Marker } from '@react-google-maps/api'
import { useGoogleMapsLoader } from '../../lib/hooks/useGoogleMapsLoader'
import { Tienda } from '../../lib/types'
import LogoSpinner from './components/LogoSpinner'

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
  tienda: Tienda
}

export default function StoreLocationMap({ address, lat, lng, storeName, tienda }: StoreLocationMapProps) {
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
          className="w-full h-[200px] rounded-lg overflow-hidden flex items-center justify-center relative cursor-pointer bg-neutral-50 border border-neutral-200 hover:bg-neutral-100 transition-colors duration-200"
          onClick={handleMapClick}
        >
          <div className="text-center">
            <div className="text-4xl mb-2">🗺️</div>
            <p className="text-sm font-medium text-neutral-900">
              Ver en Google Maps
            </p>
            <p className="text-xs text-neutral-500 mt-1">
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
        <div className="w-full h-[200px] rounded-lg overflow-hidden flex items-center justify-center bg-neutral-50 border border-neutral-200">
          <LogoSpinner tienda={tienda} size="sm" message="Cargando mapa..." />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full mb-4">
      <div 
        className="w-full h-[200px] rounded-lg overflow-hidden cursor-pointer relative border border-neutral-200 hover:border-neutral-300 transition-colors duration-200"
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
        <div className="absolute top-2 right-2 bg-white bg-opacity-95 px-2 py-1 rounded text-xs font-medium shadow-sm border border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-colors duration-200">
          Clic para abrir en Google Maps
        </div>
      </div>
    </div>
  )
}