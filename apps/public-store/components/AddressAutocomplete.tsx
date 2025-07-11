import React, { useRef, useEffect, useState } from 'react'

interface AddressAutocompleteProps {
  value: string
  onChange: (address: string, coordinates?: { lat: number; lng: number }) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

declare global {
  interface Window {
    google: any
    initMap: () => void
  }
}

export default function AddressAutocomplete({
  value,
  onChange,
  disabled = false,
  placeholder = "Ingresa tu dirección",
  className = ""
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const autocompleteRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasCoordinates, setHasCoordinates] = useState(false)

  const API_KEY = process.env.NEXT_PUBLIC_MAPS_API_KEY

  useEffect(() => {
    if (!API_KEY || disabled) return

    const loadGoogleMapsScript = () => {
      if (window.google) {
        initializeAutocomplete()
        return
      }

      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&callback=initMap`
      script.async = true
      script.defer = true

      window.initMap = () => {
        initializeAutocomplete()
      }

      document.head.appendChild(script)
    }

    const initializeAutocomplete = () => {
      if (!inputRef.current) return

      // Configurar autocompletado con países latinoamericanos
      const options = {
        types: ['address'],
        componentRestrictions: {
          country: ['mx', 'ar', 'co', 'pe', 'cl', 've', 'ec', 'bo', 'py', 'uy', 'br', 'es', 'us']
        }
      }

      autocompleteRef.current = new window.google.maps.places.Autocomplete(
        inputRef.current,
        options
      )

      // Listener para cuando se selecciona una dirección
      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current.getPlace()
        
        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat()
          const lng = place.geometry.location.lng()
          const address = place.formatted_address || place.name || ''
          
          setHasCoordinates(true)
          onChange(address, { lat, lng })
        } else {
          // Si no hay geometría, solo usar el texto ingresado
          onChange(value)
        }
      })
    }

    loadGoogleMapsScript()

    return () => {
      if (autocompleteRef.current) {
        window.google?.maps?.event?.clearInstanceListeners(autocompleteRef.current)
      }
    }
  }, [API_KEY, disabled])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setHasCoordinates(false)
    onChange(newValue)
  }

  // Si no hay API key, renderizar como input normal
  if (!API_KEY) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
        rows={3}
        className={className}
      />
    )
  }

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        disabled={disabled}
        placeholder={placeholder}
        className={`${className} pr-10`}
      />
      
      {/* Indicador de estado */}
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
        {isLoading && (
          <div className="w-4 h-4 border-2 border-neutral-300 border-t-neutral-600 rounded-full animate-spin"></div>
        )}
        {hasCoordinates && !isLoading && (
          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Texto de ayuda */}
      {!disabled && (
        <p className="text-xs text-neutral-500 mt-1">
          {hasCoordinates 
            ? "✓ Dirección con coordenadas guardada" 
            : "Escribe para buscar direcciones exactas"
          }
        </p>
      )}
    </div>
  )
} 