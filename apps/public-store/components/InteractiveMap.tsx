'use client'

import React, { useCallback, useState, useEffect } from 'react'
import { GoogleMap, Marker } from '@react-google-maps/api'
import { useGoogleMapsLoader } from '../lib/hooks/useGoogleMapsLoader'

const mapContainerStyle = {
  width: '100%',
  height: '300px'
}

const mapOptions: google.maps.MapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  styles: [
    {
      featureType: 'poi',
      elementType: 'labels',
      stylers: [{ visibility: 'off' }]
    }
  ]
}

interface InteractiveMapProps {
  lat: number
  lng: number
  onLocationChange: (lat: number, lng: number) => void
}

export default function InteractiveMap({ lat, lng, onLocationChange }: InteractiveMapProps) {
  const { isLoaded, loadError } = useGoogleMapsLoader()
  const [map, setMap] = useState<google.maps.Map | null>(null)

  const center = { lat, lng }

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  const onMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newLat = e.latLng.lat()
      const newLng = e.latLng.lng()
      onLocationChange(newLat, newLng)
    }
  }, [onLocationChange])

  // Centrar el mapa cuando cambien las coordenadas
  useEffect(() => {
    if (map && lat && lng) {
      const newCenter = { lat, lng }
      map.panTo(newCenter)
    }
  }, [map, lat, lng])

  if (loadError) {
    return (
      <div className="w-full h-[300px] bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
        <p className="text-gray-500 text-sm">Error al cargar el mapa</p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-[300px] bg-gray-100 border border-gray-300 rounded-lg flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
          <p className="text-gray-500 text-sm">Cargando mapa...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={16}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        <Marker
          position={center}
          draggable={true}
          onDragEnd={onMarkerDragEnd}
          icon={{
            url: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='%23dc2626'%3E%3Cpath d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'/%3E%3C/svg%3E",
            scaledSize: new window.google.maps.Size(32, 32),
            anchor: new window.google.maps.Point(16, 32)
          }}
        />
      </GoogleMap>
      <p className="text-xs text-gray-500 mt-2 text-center">
        Puedes mover el marcador para ajustar tu ubicación exacta
      </p>
    </div>
  )
} 