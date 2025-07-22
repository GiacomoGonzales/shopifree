import React, { useState, useEffect, useRef } from 'react'
import { useCart } from '../../lib/cart-context'
import { useStore } from '../../lib/store-context'
import { getCurrencySymbol } from '../../lib/store'
import { useShippingCalculator } from '../../lib/hooks/useShippingCalculator'
import InteractiveMap from '../../components/InteractiveMap'

interface CustomerData {
  name: string
  phone: string
  email: string
  address: string
  reference: string
  paymentMethod: string
  notes: string
  deliveryType: 'home_delivery' | 'store_pickup'
}

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
}

// Iconos elegantes para el checkout
const Icons = {
  Close: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  User: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  Phone: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
    </svg>
  ),
  Mail: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
    </svg>
  ),
  MapPin: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  ),
  MessageSquare: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
    </svg>
  ),
  CreditCard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
    </svg>
  ),
  WhatsApp: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.63z"/>
    </svg>
  ),
  Truck: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
    </svg>
  ),
  Store: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z" />
    </svg>
  ),
  Box: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
    </svg>
  ),
} 

export default function ElegantBoutiqueCheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { state: cartState, clearCart } = useCart()
  const { store } = useStore()
  const [isLoading, setIsLoading] = useState(false)
  const [autocompleteRef, setAutocompleteRef] = useState<HTMLInputElement | null>(null)
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false)
  const [addressCoordinates, setAddressCoordinates] = useState<{ lat: number; lng: number } | undefined>()
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  // Determinar tipo de entrega por defecto basado en opciones disponibles
  const getDefaultDeliveryType = () => {
    if (store?.advanced?.shipping?.modes?.localDelivery) return 'home_delivery'
    if (store?.advanced?.shipping?.modes?.storePickup) return 'store_pickup'
    return 'home_delivery'
  }
  
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    phone: '',
    email: '',
    address: '',
    reference: '',
    paymentMethod: 'whatsapp',
    notes: '',
    deliveryType: getDefaultDeliveryType()
  })

  // Hook para calcular envío automáticamente
  const shippingCalculator = useShippingCalculator({
    storeId: store?.id || '',
    address: customerData.address,
    coordinates: addressCoordinates
  })

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollbarWidth}px`
    } else {
      document.body.style.overflow = 'unset'
      document.body.style.paddingRight = '0px'
    }

    return () => {
      document.body.style.overflow = 'unset'
      document.body.style.paddingRight = '0px'
    }
  }, [isOpen])

  // Cerrar modal con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // Reset form cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setCustomerData({
        name: '',
        phone: '',
        email: '',
        address: '',
        reference: '',
        paymentMethod: 'whatsapp',
        notes: '',
        deliveryType: getDefaultDeliveryType()
      })
    }
  }, [isOpen])

  // Cargar Google Maps API cuando se abre el modal
  useEffect(() => {
    if (!isOpen) return

    const loadGoogleMapsScript = () => {
      // Verificar si el script ya está cargado
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsGoogleMapsLoaded(true)
        return
      }

      // Verificar si el script ya existe en el DOM
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        // Esperar a que se cargue
        const checkLoaded = setInterval(() => {
          if (window.google && window.google.maps && window.google.maps.places) {
            setIsGoogleMapsLoaded(true)
            clearInterval(checkLoaded)
          }
        }, 100)
        return
      }

      // Crear y añadir el script
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_MAPS_API_KEY || ''}&libraries=places&language=es`
      script.async = true
      script.defer = true
      
      script.onload = () => {
        setIsGoogleMapsLoaded(true)
      }
      
      script.onerror = () => {
        console.error('Error loading Google Maps API')
      }
      
      document.head.appendChild(script)
    }

    loadGoogleMapsScript()
  }, [isOpen])

  // Configurar el autocompletado cuando Google Maps esté cargado y el input esté disponible
  useEffect(() => {
    if (isGoogleMapsLoaded && autocompleteRef && isOpen) {
      try {
        const autocomplete = new window.google.maps.places.Autocomplete(autocompleteRef, {
          types: ['address'],
          componentRestrictions: { country: ['mx', 'ar', 'co', 'pe', 'cl', 've', 'ec', 'bo', 'py', 'uy', 'br', 'es', 'us'] },
          // Evitar el warning de PlaceAutocompleteElement
          strictBounds: false,
          fields: ['formatted_address', 'geometry', 'name']
        })

        const handlePlaceChanged = () => {
          try {
            const place = autocomplete.getPlace()
            
            if (place.geometry && place.geometry.location) {
              const address = place.formatted_address || place.name || ''
              const coordinates = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              }
              
              // Actualizar la dirección y coordenadas
              setCustomerData(prev => ({
                ...prev,
                address: address
              }))
              setAddressCoordinates(coordinates)
            }
          } catch (error) {
            console.warn('Error al procesar lugar seleccionado:', error)
          }
        }

        autocomplete.addListener('place_changed', handlePlaceChanged)

        return () => {
          try {
            // Limpiar listeners si es necesario
            if (window.google && window.google.maps && window.google.maps.event) {
              window.google.maps.event.clearInstanceListeners(autocomplete)
            }
          } catch (error) {
            console.warn('Error al limpiar listeners:', error)
          }
        }
      } catch (error) {
        console.warn('Error al configurar autocompletado:', error)
      }
    }
  }, [isGoogleMapsLoaded, autocompleteRef, isOpen])

  const handleInputChange = (field: keyof CustomerData, value: string) => {
    setCustomerData(prev => {
      const newData = {
        ...prev,
        [field]: value
      }

      // Si cambia a recojo en tienda, limpiar campos de dirección y referencia
      if (field === 'deliveryType' && value === 'store_pickup') {
        newData.address = ''
        newData.reference = ''
      }

      return newData
    })
    
    // Si está cambiando la dirección manualmente, indicar que no es autocompletado
    if (field === 'address') {
      shippingCalculator.onManualInput()
    }
  }

  // Función para manejar cambios de coordenadas desde el mapa
  const handleCoordinatesChange = (lat: number, lng: number) => {
    const coordinates = { lat, lng }
    setAddressCoordinates(coordinates)
    // Recalcular envío con las nuevas coordenadas
    if (shippingCalculator.calculateShipping && customerData.address) {
      shippingCalculator.calculateShipping(customerData.address, coordinates)
    }
  }

  // Función para usar geolocalización
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización')
      return
    }

    setIsGettingLocation(true)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          console.log('Got location:', { latitude, longitude })
          
          // Guardar coordenadas
          setAddressCoordinates({ lat: latitude, lng: longitude })
          
          // Convertir coordenadas a dirección usando Google Geocoder
          if (window.google && window.google.maps) {
            const geocoder = new google.maps.Geocoder()
            
            geocoder.geocode(
              { location: { lat: latitude, lng: longitude } },
              (results, status) => {
                if (status === 'OK' && results?.[0]) {
                  const address = results[0].formatted_address
                  console.log('Geocoded address:', address)
                  
                  // Actualizar campo de dirección
                  setCustomerData(prev => ({ ...prev, address }))
                  
                  // Marcar como autocompletado para cálculo inmediato
                  shippingCalculator.onManualInput() // Reset flag
                  // Trigger immediate calculation with the new coordinates
                  setTimeout(() => {
                    if (shippingCalculator.calculateShipping) {
                      shippingCalculator.calculateShipping(address, { lat: latitude, lng: longitude })
                    }
                  }, 100)
                } else {
                  console.error('Geocoding failed:', status)
                  alert('No pudimos obtener la dirección de tu ubicación. Por favor escribe tu dirección manualmente.')
                }
                setIsGettingLocation(false)
              }
            )
          } else {
            console.error('Google Maps not loaded')
            alert('Google Maps no está disponible. Por favor escribe tu dirección manualmente.')
            setIsGettingLocation(false)
          }
        } catch (error) {
          console.error('Error processing location:', error)
          alert('Error al procesar tu ubicación. Por favor escribe tu dirección manualmente.')
          setIsGettingLocation(false)
        }
      },
      (error) => {
        console.error('Geolocation error:', error)
        let message = 'No pudimos obtener tu ubicación. Por favor escribe tu dirección manualmente.'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Permiso de ubicación denegado. Por favor escribe tu dirección manualmente.'
            break
          case error.POSITION_UNAVAILABLE:
            message = 'Tu ubicación no está disponible. Por favor escribe tu dirección manualmente.'
            break
          case error.TIMEOUT:
            message = 'Tiempo de espera agotado. Por favor escribe tu dirección manualmente.'
            break
        }
        
        alert(message)
        setIsGettingLocation(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutos
      }
    )
  }

  const generateWhatsAppMessage = () => {
    const currencySymbol = getCurrencySymbol(store?.currency || 'USD')
    
    let message = `🛍️ *NUEVO PEDIDO - ${store?.storeName}*\n\n`
    
    // Datos del cliente
    message += `👤 *DATOS DEL CLIENTE:*\n`
    message += `• Nombre: ${customerData.name}\n`
    message += `• Teléfono: ${customerData.phone}\n`
    message += `• Email: ${customerData.email}\n`
    
    // Información de entrega
    if (customerData.deliveryType === 'store_pickup') {
      message += `• Tipo de entrega: 🏪 Recojo en tienda\n`
    } else {
      message += `• Tipo de entrega: 🚚 Envío a domicilio\n`
      message += `• Dirección: ${customerData.address}\n`
      if (customerData.reference) {
        message += `• Referencia: ${customerData.reference}\n`
      }
      if (addressCoordinates) {
        message += `• Coordenadas: ${addressCoordinates.lat.toFixed(6)}, ${addressCoordinates.lng.toFixed(6)}\n`
      }
    }
    message += `\n`
    
    // Productos del pedido
    message += `📦 *PRODUCTOS:*\n`
    cartState.items.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`
      message += `   • Cantidad: ${item.quantity}\n`
      message += `   • Precio unitario: ${currencySymbol} ${(item.variant?.price || item.price).toFixed(2)}\n`
      message += `   • Subtotal: ${currencySymbol} ${((item.variant?.price || item.price) * item.quantity).toFixed(2)}\n\n`
    })
    
    // Información de envío
    message += `🚚 *ENVÍO:*\n`
    if (customerData.deliveryType === 'store_pickup') {
      message += `• Modalidad: Recojo en tienda\n`
      message += `• Costo: ${currencySymbol} 0.00\n`
    } else {
      if (shippingCalculator.isInDeliveryZone && shippingCalculator.shippingCost > 0) {
        message += `• Zona: ${shippingCalculator.zoneName}\n`
        message += `• Costo: ${currencySymbol} ${shippingCalculator.shippingCost.toFixed(2)}\n`
        if (shippingCalculator.estimatedTime) {
          message += `• Tiempo estimado: ${shippingCalculator.estimatedTime}\n`
        }
      } else {
        message += `• Costo: A coordinar\n`
      }
    }
    message += `\n`
    
    // Total
    const shippingCost = customerData.deliveryType === 'store_pickup' ? 0 : 
      (shippingCalculator.isInDeliveryZone ? shippingCalculator.shippingCost : 0)
    const finalTotal = cartState.totalPrice + shippingCost
    
    message += `💰 *TOTAL: ${currencySymbol} ${finalTotal.toFixed(2)}*\n`
    if (customerData.deliveryType === 'store_pickup') {
      message += `   (Subtotal: ${currencySymbol} ${cartState.totalPrice.toFixed(2)} + Envío: ${currencySymbol} 0.00)\n`
    } else if (shippingCalculator.isInDeliveryZone && shippingCalculator.shippingCost > 0) {
      message += `   (Subtotal: ${currencySymbol} ${cartState.totalPrice.toFixed(2)} + Envío: ${currencySymbol} ${shippingCalculator.shippingCost.toFixed(2)})\n`
    }
    message += `\n`
    
    // Método de pago
    message += `💳 *MÉTODO DE PAGO:* Pago por WhatsApp\n\n`
    
    // Notas adicionales
    if (customerData.notes) {
      message += `📝 *NOTAS ADICIONALES:*\n${customerData.notes}\n\n`
    }
    
    message += `¡Gracias por tu compra! Te contactaremos pronto para coordinar la entrega 🚀`
    
    return encodeURIComponent(message)
  }

  const handleWhatsAppCheckout = () => {
    // Validar campos requeridos según el tipo de entrega
    if (!customerData.name || !customerData.phone) {
      alert('Por favor completa tu nombre y teléfono')
      return
    }
    
    // Validar dirección solo si es envío a domicilio
    if (customerData.deliveryType === 'home_delivery' && !customerData.address) {
      alert('Por favor ingresa tu dirección de entrega')
      return
    }

    setIsLoading(true)
    
    // Generar mensaje de WhatsApp
    const message = generateWhatsAppMessage()
    
    // Obtener número de WhatsApp de la tienda
    const phoneNumber = store?.phone?.replace(/\D/g, '') || ''
    
    // Crear URL de WhatsApp
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`
    
    // Abrir WhatsApp
    window.open(whatsappUrl, '_blank')
    
    // Limpiar carrito y cerrar modal
    setTimeout(() => {
      clearCart()
      setIsLoading(false)
      onClose()
    }, 1000)
  }

  const isFormValid = customerData.name && customerData.phone && (
    // Si es recojo en tienda, no requerimos dirección
    customerData.deliveryType === 'store_pickup' ||
    // Si es envío a domicilio, requerimos dirección
    (customerData.deliveryType === 'home_delivery' && customerData.address)
  ) 

  // Detectar si es móvil
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

  // Requerido para swipe: distancia mínima entre touchStart y touchEnd para considerar un swipe
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientY)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isTopSwipe = distance > minSwipeDistance
    const isBottomSwipe = distance < -minSwipeDistance
    
    // Si el scroll está al top y hay swipe hacia abajo, cerrar
    if (isBottomSwipe && modalRef.current?.scrollTop === 0) {
      onClose()
    }
  }

if (!isOpen) return null

return (
  <div className={`fixed inset-0 z-[9999] ${isMobile ? 'flex flex-col' : 'overflow-y-auto'}`}>
    {/* Overlay - Solo visible en desktop */}
    {!isMobile && (
      <div 
        className="fixed inset-0 transition-opacity duration-300"
        style={{ 
          backgroundColor: 'rgba(var(--theme-neutral-dark), 0.75)',
          opacity: isOpen ? '1' : '0'
        }}
        onClick={onClose}
      />
    )}

    {/* Modal */}
    <div 
      className={`${
        isMobile 
          ? 'flex flex-col flex-1 transition-transform duration-300 ease-out' 
          : 'flex min-h-full items-center justify-center p-4'
      }`}
      style={{
        transform: isMobile && !isOpen ? 'translateY(100%)' : 'translateY(0)'
      }}
      onTouchStart={isMobile ? onTouchStart : undefined}
      onTouchMove={isMobile ? onTouchMove : undefined}
      onTouchEnd={isMobile ? onTouchEnd : undefined}
    >
      <div 
        ref={modalRef}
        className={`relative w-full ${isMobile ? 'flex flex-col h-full' : 'max-w-3xl rounded-sm'}`}
        style={{ 
          backgroundColor: 'rgb(var(--theme-neutral-light))',
          boxShadow: isMobile ? 'none' : 'var(--theme-shadow-lg)'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4 md:p-6 flex-shrink-0" style={{ borderColor: 'rgb(var(--theme-primary) / 0.1)' }}>
          {isMobile ? (
            <>
              <button
                onClick={onClose}
                className="p-2 hover-elegant"
                style={{ color: 'rgb(var(--theme-neutral-medium))' }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18" />
                </svg>
              </button>
              <h2 className="text-lg font-medium text-serif" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                Finalizar Pedido
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover-elegant"
                style={{ color: 'rgb(var(--theme-neutral-medium))' }}
              >
                <Icons.Close />
              </button>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-medium text-serif" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                Finalizar Pedido
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover-elegant"
                style={{ color: 'rgb(var(--theme-neutral-medium))' }}
              >
                <Icons.Close />
              </button>
            </>
          )}
        </div>

        {/* Content */}
        <div className={`${isMobile ? 'flex-1 overflow-y-auto' : ''}`}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4 md:p-6">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Datos del Cliente */}
              <div>
                <h3 className="text-lg font-medium mb-4 text-serif flex items-center space-x-2" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                  <Icons.User />
                  <span>Datos del Cliente</span>
                </h3>
                <div className="space-y-4">
                  {/* Nombre */}
                  <div>
                    <label className="block mb-1 text-sm font-medium text-sans" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      value={customerData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="input-boutique"
                      placeholder="Tu nombre completo"
                      required
                    />
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className="block mb-1 text-sm font-medium text-sans" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                      Teléfono
                    </label>
                    <div className="flex">
                      <div 
                        className="flex items-center justify-center px-3 border border-r-0 rounded-l-sm"
                        style={{ 
                          borderColor: 'rgb(var(--theme-primary) / 0.2)',
                          backgroundColor: 'rgb(var(--theme-secondary))',
                          color: 'rgb(var(--theme-neutral-medium))'
                        }}
                      >
                        <Icons.Phone />
                      </div>
                      <input
                        type="tel"
                        value={customerData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-r-sm focus:outline-none focus:ring-1"
                        style={{ 
                          borderColor: 'rgb(var(--theme-primary) / 0.2)',
                          backgroundColor: 'rgb(var(--theme-neutral-light))',
                          color: 'rgb(var(--theme-neutral-dark))',
                          '--tw-ring-color': 'rgb(var(--theme-accent))',
                          '--tw-ring-opacity': '0.2'
                        }}
                        placeholder="+51 999 999 999"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block mb-1 text-sm font-medium text-sans" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                      Email
                    </label>
                    <div className="flex">
                      <div 
                        className="flex items-center justify-center px-3 border border-r-0 rounded-l-sm"
                        style={{ 
                          borderColor: 'rgb(var(--theme-primary) / 0.2)',
                          backgroundColor: 'rgb(var(--theme-secondary))',
                          color: 'rgb(var(--theme-neutral-medium))'
                        }}
                      >
                        <Icons.Mail />
                      </div>
                      <input
                        type="email"
                        value={customerData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-r-sm focus:outline-none focus:ring-1"
                        style={{ 
                          borderColor: 'rgb(var(--theme-primary) / 0.2)',
                          backgroundColor: 'rgb(var(--theme-neutral-light))',
                          color: 'rgb(var(--theme-neutral-dark))',
                          '--tw-ring-color': 'rgb(var(--theme-accent))',
                          '--tw-ring-opacity': '0.2'
                        }}
                        placeholder="tu@email.com"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Datos de Entrega */}
              <div>
                <h3 className="text-lg font-medium mb-4 text-serif flex items-center space-x-2" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                  <Icons.Truck />
                  <span>Datos de Entrega</span>
                </h3>

                {/* Opciones de entrega */}
                <div className="space-y-3 mb-4">
                  {/* Envío a domicilio */}
                  {store?.advanced?.shipping?.modes?.localDelivery && (
                    <label className="flex items-center space-x-3 p-4 border rounded-sm cursor-pointer transition-all duration-300 hover-elegant"
                      style={{ 
                        borderColor: customerData.deliveryType === 'home_delivery' 
                          ? 'rgb(var(--theme-accent))' 
                          : 'rgb(var(--theme-primary) / 0.2)',
                        backgroundColor: customerData.deliveryType === 'home_delivery'
                          ? 'rgb(var(--theme-accent) / 0.1)'
                          : 'transparent'
                      }}
                    >
                      <input
                        type="radio"
                        name="deliveryType"
                        value="home_delivery"
                        checked={customerData.deliveryType === 'home_delivery'}
                        onChange={(e) => handleInputChange('deliveryType', e.target.value)}
                        className="mt-0.5"
                      />
                      <div className="flex items-center space-x-3">
                        <Icons.Truck />
                        <div>
                          <span className="font-medium text-sans" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                            Envío a domicilio
                          </span>
                          <p className="text-sm text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                            Recibirás tu pedido en la dirección que indiques
                          </p>
                        </div>
                      </div>
                    </label>
                  )}

                  {/* Recojo en tienda */}
                  {store?.advanced?.shipping?.modes?.storePickup && (
                    <label className="flex items-center space-x-3 p-4 border rounded-sm cursor-pointer transition-all duration-300 hover-elegant"
                      style={{ 
                        borderColor: customerData.deliveryType === 'store_pickup' 
                          ? 'rgb(var(--theme-accent))' 
                          : 'rgb(var(--theme-primary) / 0.2)',
                        backgroundColor: customerData.deliveryType === 'store_pickup'
                          ? 'rgb(var(--theme-accent) / 0.1)'
                          : 'transparent'
                      }}
                    >
                      <input
                        type="radio"
                        name="deliveryType"
                        value="store_pickup"
                        checked={customerData.deliveryType === 'store_pickup'}
                        onChange={(e) => handleInputChange('deliveryType', e.target.value)}
                        className="mt-0.5"
                      />
                      <div className="flex items-center space-x-3">
                        <Icons.Store />
                        <div>
                          <span className="font-medium text-sans" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                            Recojo en tienda
                          </span>
                          <p className="text-sm text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                            Retira tu pedido directamente en nuestro local
                          </p>
                        </div>
                      </div>
                    </label>
                  )}
                </div>

                {/* Campos de dirección - Solo mostrar si es envío a domicilio */}
                {customerData.deliveryType === 'home_delivery' && (
                  <div className="space-y-4">
                    {/* Dirección */}
                    <div>
                      <label className="block mb-1 text-sm font-medium text-sans" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                        Dirección de entrega
                      </label>
                      <div className="flex">
                        <div 
                          className="flex items-center justify-center px-3 border border-r-0 rounded-l-sm"
                          style={{ 
                            borderColor: 'rgb(var(--theme-primary) / 0.2)',
                            backgroundColor: 'rgb(var(--theme-secondary))',
                            color: 'rgb(var(--theme-neutral-medium))'
                          }}
                        >
                          <Icons.MapPin />
                        </div>
                        <div className="relative flex-1">
                          <input
                            ref={setAutocompleteRef}
                            type="text"
                            value={customerData.address}
                            onChange={(e) => handleInputChange('address', e.target.value)}
                            onBlur={shippingCalculator.onAddressBlur}
                            className="w-full px-3 py-2 pr-10 border rounded-r-sm focus:outline-none focus:ring-1"
                            style={{ 
                              borderColor: 'rgb(var(--theme-primary) / 0.2)',
                              backgroundColor: 'rgb(var(--theme-neutral-light))',
                              color: 'rgb(var(--theme-neutral-dark))',
                              '--tw-ring-color': 'rgb(var(--theme-accent))',
                              '--tw-ring-opacity': '0.2'
                            }}
                            placeholder={isGoogleMapsLoaded ? "Empieza a escribir tu dirección..." : "Av. Principal 123"}
                            required
                          />
                          {isGoogleMapsLoaded && (
                            <button
                              type="button"
                              onClick={handleUseMyLocation}
                              disabled={isGettingLocation}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover-elegant rounded-full"
                              style={{ color: 'rgb(var(--theme-neutral-medium))' }}
                              title="Usar mi ubicación actual"
                            >
                              {isGettingLocation ? (
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Mapa Interactivo */}
                    {addressCoordinates && customerData.address && (
                      <InteractiveMap
                        lat={addressCoordinates.lat}
                        lng={addressCoordinates.lng}
                        onLocationChange={handleCoordinatesChange}
                      />
                    )}

                    {/* Referencia */}
                    <div>
                      <label className="block mb-1 text-sm font-medium text-sans" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                        Referencia (opcional)
                      </label>
                      <textarea
                        value={customerData.reference}
                        onChange={(e) => handleInputChange('reference', e.target.value)}
                        className="input-boutique"
                        rows={2}
                        placeholder="Ej: Casa azul, frente al parque"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Notas adicionales */}
              <div>
                <h3 className="text-lg font-medium mb-4 text-serif flex items-center space-x-2" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                  <Icons.MessageSquare />
                  <span>Notas adicionales</span>
                </h3>
                <textarea
                  value={customerData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  className="input-boutique"
                  rows={3}
                  placeholder="¿Alguna indicación especial para tu pedido?"
                />
              </div>
            </div>

            {/* Resumen */}
            <div>
              <div 
                className="rounded-sm border p-6"
                style={{ 
                  backgroundColor: 'rgb(var(--theme-secondary))',
                  borderColor: 'rgb(var(--theme-primary) / 0.1)'
                }}
              >
                <h3 className="text-lg font-medium mb-4 text-serif flex items-center space-x-2" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                  <Icons.Box />
                  <span>Resumen del Pedido</span>
                </h3>

                {/* Lista de productos */}
                <div className="space-y-4 mb-6">
                  {cartState.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <div 
                        className="w-16 h-16 rounded-sm overflow-hidden"
                        style={{ backgroundColor: 'rgb(var(--theme-neutral-light))' }}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sans" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                          {item.name}
                        </h4>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                            Cantidad: {item.quantity}
                          </span>
                          <span className="font-medium text-serif" style={{ color: 'rgb(var(--theme-accent))' }}>
                            {getCurrencySymbol(store?.currency || 'USD')} {((item.variant?.price || item.price) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal y envío */}
                <div 
                  className="space-y-2 py-4 border-t border-b mb-4"
                  style={{ borderColor: 'rgb(var(--theme-primary) / 0.1)' }}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                      Subtotal ({cartState.totalItems} productos)
                    </span>
                    <span className="font-medium text-serif" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                      {getCurrencySymbol(store?.currency || 'USD')} {cartState.totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                      Envío
                    </span>
                    <span className="font-medium text-serif" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                      {customerData.deliveryType === 'store_pickup' ? (
                        `${getCurrencySymbol(store?.currency || 'USD')} 0.00`
                      ) : shippingCalculator.isCalculating ? (
                        'Calculando...'
                      ) : shippingCalculator.isInDeliveryZone && shippingCalculator.shippingCost > 0 ? (
                        `${getCurrencySymbol(store?.currency || 'USD')} ${shippingCalculator.shippingCost.toFixed(2)}`
                      ) : (
                        'A coordinar'
                      )}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-medium text-serif" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                    Total
                  </span>
                  <span className="text-xl font-medium text-serif" style={{ color: 'rgb(var(--theme-accent))' }}>
                    {getCurrencySymbol(store?.currency || 'USD')} {(
                      cartState.totalPrice + 
                      (customerData.deliveryType === 'store_pickup' ? 0 : 
                        (shippingCalculator.isInDeliveryZone ? shippingCalculator.shippingCost : 0)
                      )
                    ).toFixed(2)}
                  </span>
                </div>

                {/* Botón de WhatsApp */}
                <button
                  onClick={handleWhatsAppCheckout}
                  disabled={!isFormValid || isLoading}
                  className="w-full btn-boutique-primary flex items-center justify-center space-x-2"
                  style={{
                    opacity: (!isFormValid || isLoading) ? '0.5' : '1',
                    cursor: (!isFormValid || isLoading) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <Icons.WhatsApp />
                      <span>Enviar Pedido por WhatsApp</span>
                    </>
                  )}
                </button>

                {/* Mensaje informativo */}
                <p className="mt-4 text-sm text-center text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                  Al hacer clic, se abrirá WhatsApp con tu pedido listo para enviar
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer para móvil */}
        {isMobile && (
          <div className="border-t p-4 flex-shrink-0" style={{ borderColor: 'rgb(var(--theme-primary) / 0.1)' }}>
            <button
              onClick={handleWhatsAppCheckout}
              disabled={!isFormValid || isLoading}
              className="w-full btn-boutique-primary flex items-center justify-center space-x-2"
              style={{
                opacity: (!isFormValid || isLoading) ? '0.5' : '1',
                cursor: (!isFormValid || isLoading) ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <Icons.WhatsApp />
                  <span>Enviar Pedido por WhatsApp</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
)
} 