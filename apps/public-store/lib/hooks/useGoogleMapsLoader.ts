'use client'

import { useJsApiLoader } from '@react-google-maps/api'
import { useEffect, useRef } from 'react'

const libraries: ('places' | 'geometry')[] = ['places', 'geometry']

// Función para suprimir warnings específicos de Google Maps
const suppressGoogleMapsWarnings = () => {
  const originalWarn = console.warn
  const originalLog = console.log
  
  console.warn = (...args) => {
    const message = args.join(' ')
    
    // Suprimir warnings específicos de Google Maps
    if (
      message.includes('google.maps.places.Autocomplete') ||
      message.includes('PlaceAutocompleteElement') ||
      message.includes('google.maps.Marker') ||
      message.includes('AdvancedMarkerElement') ||
      message.includes('loading=async') ||
      message.includes('Google Maps already loaded') ||
      message.includes('LoadScript has been reloaded') ||
      message.includes('libraries') ||
      message.includes('static class property')
    ) {
      return // No mostrar estos warnings
    }
    
    originalWarn.apply(console, args)
  }
  
  console.log = (...args) => {
    const message = args.join(' ')
    
    // Suprimir logs específicos de Google Maps
    if (
      message.includes('Google Maps JavaScript API') ||
      message.includes('places library') ||
      message.includes('geometry library')
    ) {
      return // No mostrar estos logs
    }
    
    originalLog.apply(console, args)
  }
  
  return () => {
    console.warn = originalWarn
    console.log = originalLog
  }
}

export function useGoogleMapsLoader() {
  const suppressRef = useRef<(() => void) | null>(null)
  
  // Activar supresión de warnings al cargar
  useEffect(() => {
    suppressRef.current = suppressGoogleMapsWarnings()
    
    return () => {
      if (suppressRef.current) {
        suppressRef.current()
      }
    }
  }, [])

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_MAPS_API_KEY || '',
    libraries,
    preventGoogleFontsLoading: true, // Evitar cargar fuentes adicionales
    version: "3.55", // Usar versión específica para evitar warnings
  })

  // Limpiar warnings después de cargar
  useEffect(() => {
    if (isLoaded && suppressRef.current) {
      // Mantener supresión activa por un poco más de tiempo
      const timer = setTimeout(() => {
        if (suppressRef.current) {
          suppressRef.current()
          suppressRef.current = null
        }
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [isLoaded])

  return { isLoaded, loadError }
} 