import { useState, useEffect, useCallback, useRef } from 'react'
import { checkDeliveryLocation, geocodeAddress, LocationResult } from '../delivery-zones'

interface UseShippingCalculatorProps {
  storeId: string
  address?: string
  coordinates?: { lat: number; lng: number }
}

interface ShippingCalculatorState {
  isCalculating: boolean
  shippingCost: number
  isInDeliveryZone: boolean
  zoneName?: string
  estimatedTime?: string
  error?: string
  lastCheckedAddress?: string
}

export function useShippingCalculator({ storeId, address, coordinates }: UseShippingCalculatorProps) {
  const [state, setState] = useState<ShippingCalculatorState>({
    isCalculating: false,
    shippingCost: 0,
    isInDeliveryZone: false
  })
  
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isAutocompletedRef = useRef(false)

  const calculateShipping = useCallback(async (inputAddress?: string, inputCoords?: { lat: number; lng: number }) => {
    const addressToUse = inputAddress || address
    const coordsToUse = inputCoords || coordinates

    // Si no hay dirección ni coordenadas, limpiar estado
    if (!addressToUse && !coordsToUse) {
      setState(prev => ({
        ...prev,
        shippingCost: 0,
        isInDeliveryZone: false,
        zoneName: undefined,
        estimatedTime: undefined,
        error: undefined,
        lastCheckedAddress: undefined
      }))
      return
    }

    // Evitar recalcular si es la misma dirección
    if (addressToUse && addressToUse === state.lastCheckedAddress) {
      return
    }

    if (!storeId) {
      console.warn('Store ID not available for shipping calculation')
      return
    }

    setState(prev => ({ ...prev, isCalculating: true, error: undefined }))

    try {
      let finalCoords = coordsToUse

      // Si no tenemos coordenadas pero sí dirección, geocodificar
      if (!finalCoords && addressToUse) {
        console.log('Geocoding address:', addressToUse)
        const geocodedCoords = await geocodeAddress(addressToUse)
        finalCoords = geocodedCoords || undefined
        
        if (!finalCoords) {
          setState(prev => ({
            ...prev,
            isCalculating: false,
            error: 'No se pudo encontrar la ubicación de la dirección proporcionada',
            shippingCost: 0,
            isInDeliveryZone: false
          }))
          return
        }
      }

      if (!finalCoords) {
        setState(prev => ({
          ...prev,
          isCalculating: false,
          error: 'Coordenadas no disponibles',
          shippingCost: 0,
          isInDeliveryZone: false
        }))
        return
      }

      console.log('Checking delivery for coordinates:', finalCoords)
      
      // Verificar ubicación contra zonas de entrega
      const result: LocationResult = await checkDeliveryLocation(
        finalCoords.lat,
        finalCoords.lng,
        storeId
      )

      console.log('Delivery check result:', result)

             // Determinar mensaje de error más contextual
       let errorMessage: string | undefined
       if (!result.inDeliveryZone) {
        if (isAutocompletedRef.current) {
          errorMessage = 'Esta dirección está fuera de nuestras zonas de entrega'
        } else {
          errorMessage = 'No encontramos esta dirección en nuestras zonas de cobertura'
        }
       }

       setState(prev => ({
        ...prev,
        isCalculating: false,
        shippingCost: result.shippingCost,
        isInDeliveryZone: result.inDeliveryZone,
        zoneName: result.zone?.nombre,
        estimatedTime: result.estimatedTime,
        error: errorMessage,
        lastCheckedAddress: addressToUse
      }))

    } catch (error) {
      console.error('Error calculating shipping:', error)
      setState(prev => ({
        ...prev,
        isCalculating: false,
        error: 'Error al calcular el costo de envío',
        shippingCost: 0,
        isInDeliveryZone: false
      }))
    }
  }, [storeId, address, coordinates, state.lastCheckedAddress])

  // Solo calcular cuando se tienen coordenadas (autocompletado)
  useEffect(() => {
    // Si tenemos coordenadas (significa que se seleccionó del autocompletado), calcular inmediatamente
    if (coordinates) {
      isAutocompletedRef.current = true
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
      calculateShipping()
      return
    }
    
    // Si no hay dirección, limpiar estado
    if (!address) {
      isAutocompletedRef.current = false
      setState(prev => ({
        ...prev,
        shippingCost: 0,
        isInDeliveryZone: false,
        zoneName: undefined,
        estimatedTime: undefined,
        error: undefined,
        lastCheckedAddress: undefined,
        isCalculating: false
      }))
    }
    
    // Cleanup del timer al desmontar
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [coordinates, address, storeId, calculateShipping])

  // Función manual para recalcular
  const recalculate = useCallback(() => {
    setState(prev => ({ ...prev, lastCheckedAddress: undefined }))
    calculateShipping()
  }, [calculateShipping])

  // Función para indicar que el usuario está escribiendo manualmente
  const onManualInput = useCallback(() => {
    isAutocompletedRef.current = false
  }, [])

  // Función para manejar cuando se pierde el foco del campo (onBlur)
  const onAddressBlur = useCallback(() => {
    // Solo calcular si hay dirección, no es autocompletado y tiene longitud suficiente
    if (address && !isAutocompletedRef.current && address.length >= 10) {
      calculateShipping()
    }
  }, [address, calculateShipping])

  return {
    ...state,
    calculateShipping,
    recalculate,
    onManualInput,
    onAddressBlur
  }
} 