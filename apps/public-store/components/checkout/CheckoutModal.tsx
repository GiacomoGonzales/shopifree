'use client'

import { useState, useEffect } from 'react'
import { useCart } from '../../lib/cart-context'
import { useStore } from '../../lib/store-context'
import { getCurrencySymbol } from '../../lib/store'
import { useShippingCalculator } from '../../lib/hooks/useShippingCalculator'
import InteractiveMap from '../InteractiveMap'

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

const Icons = {
  Close: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  ),
  WhatsApp: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.63z"/>
    </svg>
  ),
  CreditCard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  User: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Phone: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  Mail: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 16m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  MapPin: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25s-7.5-4.108-7.5-11.25a7.5 7.5 0 1115 0z" />
    </svg>
  ),
  MessageSquare: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  ShoppingBag: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  )
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { state: cartState, clearCart } = useCart()
  const { store } = useStore()
  const [currentStep, setCurrentStep] = useState<'form' | 'summary'>('form')
  const [isLoading, setIsLoading] = useState(false)
  const [autocompleteRef, setAutocompleteRef] = useState<HTMLInputElement | null>(null)
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false)
  const [addressCoordinates, setAddressCoordinates] = useState<{ lat: number; lng: number } | undefined>()
  const [isGettingLocation, setIsGettingLocation] = useState(false)
  
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
      setCurrentStep('form')
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
      const autocomplete = new window.google.maps.places.Autocomplete(autocompleteRef, {
        types: ['address'],
        componentRestrictions: { country: ['mx', 'ar', 'co', 'pe', 'cl', 've', 'ec', 'bo', 'py', 'uy', 'br', 'es', 'us'] }
      })

      autocomplete.addListener('place_changed', () => {
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
      })

      return () => {
        // Limpiar listeners si es necesario
        if (window.google && window.google.maps && window.google.maps.event) {
          window.google.maps.event.clearInstanceListeners(autocomplete)
        }
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
      message += `• Costo: Gratis\n`
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
      message += `   (Subtotal: ${currencySymbol} ${cartState.totalPrice.toFixed(2)} + Envío: Gratis)\n`
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
    
    // Limpiar carrito y cerrar modal después de un breve delay
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

  if (!isOpen) return null

  return (
    <>
      {/* Overlay con estilo boutique */}
      <div 
        className="fixed inset-0 backdrop-blur-sm z-50 transition-all duration-300 ease-out"
        style={{ 
          backgroundColor: `rgba(var(--theme-neutral-dark), 0.75)`,
          backdropFilter: 'blur(4px)'
        }}
        onClick={onClose}
      />
      
      {/* Modal con estilos elegant boutique */}
      <div className="fixed inset-0 z-50 flex items-center justify-center md:p-4">
        <div 
          className="md:rounded-sm shadow-2xl md:max-w-4xl w-full md:max-h-[90vh] h-full md:h-auto flex flex-col overflow-hidden"
          style={{
            backgroundColor: `rgb(var(--theme-neutral-light))`,
            boxShadow: `var(--theme-shadow-lg)`,
            border: `1px solid rgb(var(--theme-primary) / 0.1)`
          }}
        >
          
          {/* Header con estilo boutique */}
          <div 
            className="flex items-center justify-between p-6"
            style={{
              borderBottom: `1px solid rgb(var(--theme-primary) / 0.1)`,
              backgroundColor: `rgb(var(--theme-secondary))`
            }}
          >
            <div className="flex items-center space-x-3">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, rgb(var(--theme-secondary)) 0%, rgb(var(--theme-accent) / 0.1) 100%)`,
                  color: `rgb(var(--theme-accent))`
                }}
              >
                <Icons.ShoppingBag />
              </div>
              <div>
                <h2 
                  className="text-lg font-semibold"
                  style={{
                    color: `rgb(var(--theme-neutral-dark))`,
                    fontFamily: `var(--theme-font-heading)`
                  }}
                >
                  Finalizar Compra
                </h2>
                <p 
                  className="text-sm"
                  style={{
                    color: `rgb(var(--theme-neutral-medium))`,
                    fontFamily: `var(--theme-font-body)`
                  }}
                >
                  Completa tus datos para enviar tu pedido
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full transition-colors"
              style={{
                color: `rgb(var(--theme-neutral-medium))`,
                transition: `var(--theme-transition)`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `rgb(var(--theme-primary) / 0.1)`
                e.currentTarget.style.color = `rgb(var(--theme-accent))`
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = `rgb(var(--theme-neutral-medium))`
              }}
            >
              <Icons.Close />
            </button>
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-y-auto md:max-h-[calc(90vh-120px)] h-full">
            <div className="flex flex-col lg:grid lg:grid-cols-2 h-full min-h-full">
              
              {/* Formulario con estilos boutique */}
              <div 
                className="p-4 md:p-6 lg:border-r flex-1 lg:flex-none"
                style={{
                  borderColor: `rgb(var(--theme-primary) / 0.1)`,
                  backgroundColor: `rgb(var(--theme-neutral-light))`
                }}
              >
                <h3 
                  className="text-lg font-semibold mb-4 flex items-center space-x-2"
                  style={{
                    color: `rgb(var(--theme-neutral-dark))`,
                    fontFamily: `var(--theme-font-heading)`
                  }}
                >
                  <Icons.User />
                  <span>Datos del Cliente</span>
                </h3>

                <div className="space-y-4">
                  {/* Nombre */}
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{
                        color: `rgb(var(--theme-neutral-dark))`,
                        fontFamily: `var(--theme-font-body)`,
                        fontWeight: '500'
                      }}
                    >
                      Nombre completo *
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
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{
                        color: `rgb(var(--theme-neutral-dark))`,
                        fontFamily: `var(--theme-font-body)`,
                        fontWeight: '500'
                      }}
                    >
                      Teléfono *
                    </label>
                    <div className="flex">
                      <div 
                        className="flex items-center px-3 py-2 border border-r-0 rounded-l-sm"
                        style={{
                          borderColor: `rgb(var(--theme-primary) / 0.2)`,
                          backgroundColor: `rgb(var(--theme-secondary))`,
                          color: `rgb(var(--theme-neutral-medium))`
                        }}
                      >
                        <Icons.Phone />
                      </div>
                      <input
                        type="tel"
                        value={customerData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-r-sm focus:outline-none transition-all duration-300"
                        style={{
                          borderColor: `rgb(var(--theme-primary) / 0.2)`,
                          backgroundColor: `rgb(var(--theme-neutral-light))`,
                          color: `rgb(var(--theme-neutral-dark))`,
                          fontFamily: `var(--theme-font-body)`
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = `rgb(var(--theme-accent))`
                          e.target.style.boxShadow = `0 0 0 3px rgb(var(--theme-accent) / 0.1)`
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = `rgb(var(--theme-primary) / 0.2)`
                          e.target.style.boxShadow = 'none'
                        }}
                        placeholder="+51 999 999 999"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{
                        color: `rgb(var(--theme-neutral-dark))`,
                        fontFamily: `var(--theme-font-body)`,
                        fontWeight: '500'
                      }}
                    >
                      Email
                    </label>
                    <div className="flex">
                      <div 
                        className="flex items-center px-3 py-2 border border-r-0 rounded-l-sm"
                        style={{
                          borderColor: `rgb(var(--theme-primary) / 0.2)`,
                          backgroundColor: `rgb(var(--theme-secondary))`,
                          color: `rgb(var(--theme-neutral-medium))`
                        }}
                      >
                        <Icons.Mail />
                      </div>
                      <input
                        type="email"
                        value={customerData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="flex-1 px-3 py-2 border rounded-r-sm focus:outline-none transition-all duration-300"
                        style={{
                          borderColor: `rgb(var(--theme-primary) / 0.2)`,
                          backgroundColor: `rgb(var(--theme-neutral-light))`,
                          color: `rgb(var(--theme-neutral-dark))`,
                          fontFamily: `var(--theme-font-body)`
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = `rgb(var(--theme-accent))`
                          e.target.style.boxShadow = `0 0 0 3px rgb(var(--theme-accent) / 0.1)`
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = `rgb(var(--theme-primary) / 0.2)`
                          e.target.style.boxShadow = 'none'
                        }}
                        placeholder="tu@email.com"
                      />
                    </div>
                  </div>

                  {/* Datos de Entrega */}
                  <div 
                    className="pt-4 border-t"
                    style={{ borderColor: `rgb(var(--theme-primary) / 0.1)` }}
                  >
                    <h4 
                      className="text-base font-semibold mb-3 flex items-center space-x-2"
                      style={{
                        color: `rgb(var(--theme-neutral-dark))`,
                        fontFamily: `var(--theme-font-heading)`
                      }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                      </svg>
                      <span>Datos de Entrega</span>
                    </h4>
                    
                    <div className="space-y-3">
                      {/* Opción: Envío a domicilio */}
                      {store?.advanced?.shipping?.modes?.localDelivery && (
                        <label 
                          className="flex items-center space-x-3 p-3 border rounded-sm cursor-pointer transition-colors"
                          style={{
                            borderColor: `rgb(var(--theme-primary) / 0.2)`,
                            backgroundColor: customerData.deliveryType === 'home_delivery' 
                              ? `rgb(var(--theme-accent) / 0.1)` 
                              : `rgb(var(--theme-neutral-light))`,
                            transition: `var(--theme-transition)`
                          }}
                          onMouseEnter={(e) => {
                            if (customerData.deliveryType !== 'home_delivery') {
                              e.currentTarget.style.backgroundColor = `rgb(var(--theme-secondary))`
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (customerData.deliveryType !== 'home_delivery') {
                              e.currentTarget.style.backgroundColor = `rgb(var(--theme-neutral-light))`
                            }
                          }}
                        >
                          <input
                            type="radio"
                            name="deliveryType"
                            value="home_delivery"
                            checked={customerData.deliveryType === 'home_delivery'}
                            onChange={(e) => handleInputChange('deliveryType', e.target.value)}
                            className="mt-0.5"
                            style={{
                              accentColor: `rgb(var(--theme-accent))`
                            }}
                          />
                          <div className="flex items-center space-x-2">
                            <svg 
                              className="w-5 h-5"
                              style={{ color: `rgb(var(--theme-neutral-medium))` }}
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3a4 4 0 118 0v4m-4 4a3 3 0 100 6 3 3 0 000-6z" />
                            </svg>
                            <div>
                              <span 
                                className="font-medium"
                                style={{
                                  color: `rgb(var(--theme-neutral-dark))`,
                                  fontFamily: `var(--theme-font-body)`
                                }}
                              >
                                Envío a domicilio
                              </span>
                              <p 
                                className="text-sm"
                                style={{ 
                                  color: `rgb(var(--theme-neutral-medium))`,
                                  fontFamily: `var(--theme-font-body)`
                                }}
                              >
                                Recibirás tu pedido en la dirección que indiques
                              </p>
                            </div>
                          </div>
                        </label>
                      )}

                      {/* Opción: Recojo en tienda */}
                      {store?.advanced?.shipping?.modes?.storePickup && (
                        <label 
                          className="flex items-center space-x-3 p-3 border rounded-sm cursor-pointer transition-colors"
                          style={{
                            borderColor: `rgb(var(--theme-primary) / 0.2)`,
                            backgroundColor: customerData.deliveryType === 'store_pickup' 
                              ? `rgb(var(--theme-accent) / 0.1)` 
                              : `rgb(var(--theme-neutral-light))`,
                            transition: `var(--theme-transition)`
                          }}
                          onMouseEnter={(e) => {
                            if (customerData.deliveryType !== 'store_pickup') {
                              e.currentTarget.style.backgroundColor = `rgb(var(--theme-secondary))`
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (customerData.deliveryType !== 'store_pickup') {
                              e.currentTarget.style.backgroundColor = `rgb(var(--theme-neutral-light))`
                            }
                          }}
                        >
                          <input
                            type="radio"
                            name="deliveryType"
                            value="store_pickup"
                            checked={customerData.deliveryType === 'store_pickup'}
                            onChange={(e) => handleInputChange('deliveryType', e.target.value)}
                            className="mt-0.5"
                            style={{
                              accentColor: `rgb(var(--theme-accent))`
                            }}
                          />
                          <div className="flex items-center space-x-2">
                            <svg 
                              className="w-5 h-5"
                              style={{ color: `rgb(var(--theme-neutral-medium))` }}
                              fill="none" 
                              stroke="currentColor" 
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h4a1 1 0 011 1v5m-6 0V9a1 1 0 011-1h4a1 1 0 011 1v10" />
                            </svg>
                            <div>
                              <span 
                                className="font-medium"
                                style={{
                                  color: `rgb(var(--theme-neutral-dark))`,
                                  fontFamily: `var(--theme-font-body)`
                                }}
                              >
                                Recojo en tienda
                              </span>
                              <p 
                                className="text-sm"
                                style={{ 
                                  color: `rgb(var(--theme-neutral-medium))`,
                                  fontFamily: `var(--theme-font-body)`
                                }}
                              >
                                Retira tu pedido directamente en nuestro local
                              </p>
                            </div>
                          </div>
                        </label>
                      )}
                    </div>
                  </div>

                  {/* Dirección - Solo mostrar si es envío a domicilio */}
                  {customerData.deliveryType === 'home_delivery' && (
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{
                        color: `rgb(var(--theme-neutral-dark))`,
                        fontFamily: `var(--theme-font-body)`,
                        fontWeight: '500'
                      }}
                    >
                      Dirección *
                    </label>
                    <div className="relative">
                      <div className="flex">
                        <div 
                          className="flex items-center px-3 py-2 border border-r-0 rounded-l-sm"
                          style={{
                            borderColor: `rgb(var(--theme-primary) / 0.2)`,
                            backgroundColor: `rgb(var(--theme-secondary))`,
                            color: `rgb(var(--theme-neutral-medium))`
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
                          className="w-full px-3 py-2 pr-10 border rounded-r-sm focus:outline-none transition-all duration-300"
                          style={{
                            borderColor: `rgb(var(--theme-primary) / 0.2)`,
                            backgroundColor: `rgb(var(--theme-neutral-light))`,
                            color: `rgb(var(--theme-neutral-dark))`,
                            fontFamily: `var(--theme-font-body)`
                          }}
                          onFocus={(e) => {
                            e.target.style.borderColor = `rgb(var(--theme-accent))`
                            e.target.style.boxShadow = `0 0 0 3px rgb(var(--theme-accent) / 0.1)`
                          }}
                          onBlur={(e) => {
                            e.target.style.borderColor = `rgb(var(--theme-primary) / 0.2)`
                            e.target.style.boxShadow = 'none'
                            shippingCalculator.onAddressBlur()
                          }}
                          placeholder={isGoogleMapsLoaded ? "Empieza a escribir tu dirección..." : "Av. Principal 123"}
                          required
                        />
                          
                          {/* Botón de geolocalización */}
                          {isGoogleMapsLoaded && (
                            <button
                              type="button"
                              onClick={handleUseMyLocation}
                              disabled={isGettingLocation}
                              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-colors"
                              style={{
                                color: `rgb(var(--theme-neutral-medium))`,
                                transition: `var(--theme-transition)`
                              }}
                              onMouseEnter={(e) => {
                                if (!isGettingLocation) {
                                  e.currentTarget.style.backgroundColor = `rgb(var(--theme-primary) / 0.1)`
                                  e.currentTarget.style.color = `rgb(var(--theme-accent))`
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!isGettingLocation) {
                                  e.currentTarget.style.backgroundColor = 'transparent'
                                  e.currentTarget.style.color = `rgb(var(--theme-neutral-medium))`
                                }
                              }}
                              title="Usar mi ubicación actual"
                            >
                              {isGettingLocation ? (
                                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                              )}
                            </button>
                          )}
                          </div>
                      </div>

                      {/* Mensaje de ayuda */}
                      {isGoogleMapsLoaded && (
                        <p 
                          className="mt-1 text-xs"
                          style={{ 
                            color: `rgb(var(--theme-neutral-medium))`,
                            fontFamily: `var(--theme-font-body)`
                          }}
                        >
                          ✓ Autocompletado de direcciones habilitado
                        </p>
                      )}
                    </div>
                    
                    {/* Mapa Interactivo */}
                    {addressCoordinates && (
                      <InteractiveMap
                        lat={addressCoordinates.lat}
                        lng={addressCoordinates.lng}
                        onLocationChange={handleCoordinatesChange}
                      />
                    )}
                  </div>
                  )}

                  {/* Referencia - Solo mostrar si es envío a domicilio */}
                  {customerData.deliveryType === 'home_delivery' && (
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{
                        color: `rgb(var(--theme-neutral-dark))`,
                        fontFamily: `var(--theme-font-body)`,
                        fontWeight: '500'
                      }}
                    >
                      Referencia
                    </label>
                    <input
                      type="text"
                      value={customerData.reference}
                      onChange={(e) => handleInputChange('reference', e.target.value)}
                      className="input-boutique"
                      placeholder="Frente al parque, casa blanca"
                    />
                  </div>
                  )}

                  {/* Notas adicionales */}
                  <div>
                    <label 
                      className="block text-sm font-medium mb-2"
                      style={{
                        color: `rgb(var(--theme-neutral-dark))`,
                        fontFamily: `var(--theme-font-body)`,
                        fontWeight: '500'
                      }}
                    >
                      Notas adicionales
                    </label>
                    <div className="flex">
                      <div 
                        className="flex items-start px-3 py-2 border border-r-0 rounded-l-sm"
                        style={{
                          borderColor: `rgb(var(--theme-primary) / 0.2)`,
                          backgroundColor: `rgb(var(--theme-secondary))`,
                          color: `rgb(var(--theme-neutral-medium))`
                        }}
                      >
                        <Icons.MessageSquare />
                      </div>
                      <textarea
                        value={customerData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        rows={3}
                        className="flex-1 px-3 py-2 border rounded-r-sm focus:outline-none resize-none transition-all duration-300"
                        style={{
                          borderColor: `rgb(var(--theme-primary) / 0.2)`,
                          backgroundColor: `rgb(var(--theme-neutral-light))`,
                          color: `rgb(var(--theme-neutral-dark))`,
                          fontFamily: `var(--theme-font-body)`
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = `rgb(var(--theme-accent))`
                          e.target.style.boxShadow = `0 0 0 3px rgb(var(--theme-accent) / 0.1)`
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = `rgb(var(--theme-primary) / 0.2)`
                          e.target.style.boxShadow = 'none'
                        }}
                        placeholder="Instrucciones especiales para la entrega..."
                      />
                    </div>
                  </div>

                  {/* Método de pago */}
                  <div 
                    className="pt-4 border-t"
                    style={{ borderColor: `rgb(var(--theme-primary) / 0.1)` }}
                  >
                    <h4 
                      className="text-base font-semibold mb-3 flex items-center space-x-2"
                      style={{
                        color: `rgb(var(--theme-neutral-dark))`,
                        fontFamily: `var(--theme-font-heading)`
                      }}
                    >
                      <Icons.CreditCard />
                      <span>Método de Pago</span>
                    </h4>
                    
                    <div 
                      className="rounded-sm p-4 border"
                      style={{
                        backgroundColor: `rgb(var(--theme-secondary))`,
                        borderColor: `rgb(var(--theme-primary) / 0.2)`
                      }}
                    >
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center"
                          style={{
                            backgroundColor: `rgb(var(--theme-success) / 0.1)`,
                            color: `rgb(var(--theme-success))`
                          }}
                        >
                          <Icons.WhatsApp />
                        </div>
                        <div>
                          <p 
                            className="font-medium"
                            style={{
                              color: `rgb(var(--theme-neutral-dark))`,
                              fontFamily: `var(--theme-font-body)`
                            }}
                          >
                            Pago por WhatsApp
                          </p>
                          <p 
                            className="text-sm"
                            style={{
                              color: `rgb(var(--theme-neutral-medium))`,
                              fontFamily: `var(--theme-font-body)`
                            }}
                          >
                            Coordinaremos el método de pago contigo vía WhatsApp
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resumen del pedido con estilos boutique */}
              <div 
                className="p-4 md:p-6 border-t lg:border-t-0 flex-shrink-0 lg:flex-1"
                style={{
                  backgroundColor: `rgb(var(--theme-secondary))`,
                  borderColor: `rgb(var(--theme-primary) / 0.1)`
                }}
              >
                <h3 
                  className="text-lg font-semibold mb-4"
                  style={{
                    color: `rgb(var(--theme-neutral-dark))`,
                    fontFamily: `var(--theme-font-heading)`
                  }}
                >
                  Resumen del Pedido
                </h3>

                {/* Productos */}
                <div className="space-y-3 mb-6">
                  {cartState.items.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-center space-x-3 p-3 rounded-sm"
                      style={{
                        backgroundColor: `rgb(var(--theme-neutral-light))`,
                        border: `1px solid rgb(var(--theme-primary) / 0.1)`,
                        boxShadow: `var(--theme-shadow-sm)`
                      }}
                    >
                      <div 
                        className="w-12 h-12 rounded-sm overflow-hidden flex-shrink-0 relative"
                        style={{ backgroundColor: `rgb(var(--theme-secondary))` }}
                      >
                        <img
                          src={item.image.includes('.mp4') || item.image.includes('.webm') || item.image.includes('.mov') 
                            ? item.image.replace(/\.(mp4|webm|mov)$/, '.jpg') // Cloudinary auto-generates thumbnails
                            : item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            // Fallback si no existe el thumbnail
                            const target = e.target as HTMLImageElement;
                            if (target.src.includes('.jpg') && item.image.includes('.mp4')) {
                              target.src = item.image.replace('.mp4', '.png'); // Try PNG thumbnail
                            } else if (target.src.includes('.png') && item.image.includes('.mp4')) {
                              target.src = '/api/placeholder/48/48'; // Final fallback
                            }
                          }}
                        />
                        {/* Indicador de video */}
                        {(item.image.includes('.mp4') || item.image.includes('.webm') || item.image.includes('.mov')) && (
                          <div 
                            className="absolute bottom-1 right-1 w-4 h-4 rounded-full flex items-center justify-center"
                            style={{
                              backgroundColor: `rgba(var(--theme-neutral-dark), 0.8)`,
                              color: `rgb(var(--theme-neutral-light))`
                            }}
                          >
                            <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 
                          className="font-medium text-sm truncate"
                          style={{
                            color: `rgb(var(--theme-neutral-dark))`,
                            fontFamily: `var(--theme-font-body)`
                          }}
                        >
                          {item.name}
                        </h4>
                        <p 
                          className="text-xs"
                          style={{ 
                            color: `rgb(var(--theme-neutral-medium))`,
                            fontFamily: `var(--theme-font-body)`
                          }}
                        >
                          Cantidad: {item.quantity}
                        </p>
                        {item.variant && (
                          <p 
                            className="text-xs"
                            style={{ 
                              color: `rgb(var(--theme-neutral-medium))`,
                              fontFamily: `var(--theme-font-body)`
                            }}
                          >
                            {item.variant.name}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p 
                          className="font-medium text-sm"
                          style={{
                            color: `rgb(var(--theme-neutral-dark))`,
                            fontFamily: `var(--theme-font-body)`
                          }}
                        >
                          {getCurrencySymbol(store?.currency || 'USD')} {((item.variant?.price || item.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totales */}
                <div 
                  className="rounded-sm p-4 space-y-2"
                  style={{
                    backgroundColor: `rgb(var(--theme-neutral-light))`,
                    border: `1px solid rgb(var(--theme-primary) / 0.1)`,
                    boxShadow: `var(--theme-shadow-sm)`
                  }}
                >
                  <div 
                    className="flex justify-between text-sm"
                    style={{
                      color: `rgb(var(--theme-neutral-medium))`,
                      fontFamily: `var(--theme-font-body)`
                    }}
                  >
                    <span>Subtotal ({cartState.totalItems} productos)</span>
                    <span>{getCurrencySymbol(store?.currency || 'USD')} {cartState.totalPrice.toFixed(2)}</span>
                  </div>
                  
                  {/* Información de envío */}
                  <div 
                    className="flex justify-between text-sm"
                    style={{
                      color: `rgb(var(--theme-neutral-medium))`,
                      fontFamily: `var(--theme-font-body)`
                    }}
                  >
                    <span className="flex items-center space-x-1">
                      <span>Envío</span>
                      {customerData.deliveryType === 'home_delivery' && shippingCalculator.isCalculating && (
                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                    </span>
                    <span>
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
                  
                  {/* Mensaje de zona de entrega - Solo para envío a domicilio */}
                  {customerData.deliveryType === 'home_delivery' && customerData.address && !shippingCalculator.isCalculating && (
                    <div className="text-xs">
                      {shippingCalculator.isInDeliveryZone ? (
                        <div 
                          className="flex items-center space-x-1"
                          style={{ color: `rgb(var(--theme-success))` }}
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>
                            ✓ Zona: {shippingCalculator.zoneName}
                            {shippingCalculator.estimatedTime && ` • ${shippingCalculator.estimatedTime}`}
                          </span>
                        </div>
                      ) : shippingCalculator.error ? (
                        <div 
                          className="flex items-center space-x-1"
                          style={{ color: `rgb(var(--theme-accent))` }}
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <span>Estás fuera de la zona de cobertura, pero aún así puedes continuar con el pedido y coordinar la entrega vía WhatsApp</span>
                        </div>
                      ) : customerData.address.length >= 5 ? (
                        <div 
                          className="flex items-center space-x-1"
                          style={{ color: `rgb(var(--theme-neutral-medium))` }}
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <span>Selecciona del autocompletado o termina de escribir tu dirección</span>
                        </div>
                      ) : null}
                    </div>
                  )}
                  
                  <div 
                    className="flex justify-between text-lg font-semibold pt-2 border-t"
                    style={{
                      color: `rgb(var(--theme-neutral-dark))`,
                      fontFamily: `var(--theme-font-heading)`,
                      borderColor: `rgb(var(--theme-primary) / 0.2)`
                    }}
                  >
                    <span>Total</span>
                    <span>
                      {getCurrencySymbol(store?.currency || 'USD')} {(cartState.totalPrice + (customerData.deliveryType === 'store_pickup' ? 0 : (shippingCalculator.isInDeliveryZone ? shippingCalculator.shippingCost : 0))).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Botón de WhatsApp con estilo boutique */}
                <div className="mt-4 pb-4 md:pb-0">
                  <button
                    onClick={handleWhatsAppCheckout}
                    disabled={isLoading || !isFormValid}
                    className="btn-boutique-primary w-full py-3 rounded-sm font-medium transition-all duration-300 flex items-center justify-center space-x-2"
                    style={{
                      backgroundColor: isLoading || !isFormValid 
                        ? `rgb(var(--theme-neutral-medium))` 
                        : `rgb(var(--theme-success))`,
                      color: `rgb(var(--theme-neutral-light))`,
                      fontFamily: `var(--theme-font-body)`,
                      letterSpacing: '0.025em',
                      boxShadow: `var(--theme-shadow-sm)`,
                      cursor: isLoading || !isFormValid ? 'not-allowed' : 'pointer',
                      opacity: isLoading || !isFormValid ? 0.6 : 1
                    }}
                    onMouseEnter={(e) => {
                      if (!isLoading && isFormValid) {
                        e.currentTarget.style.backgroundColor = `rgb(var(--theme-success) / 0.9)`
                        e.currentTarget.style.transform = 'translateY(-1px)'
                        e.currentTarget.style.boxShadow = `var(--theme-shadow-md)`
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isLoading && isFormValid) {
                        e.currentTarget.style.backgroundColor = `rgb(var(--theme-success))`
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = `var(--theme-shadow-sm)`
                      }
                    }}
                  >
                    {isLoading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Icons.WhatsApp />
                        <span>Enviar Pedido por WhatsApp</span>
                      </>
                    )}
                  </button>

                  <p 
                    className="text-xs text-center mt-2"
                    style={{ 
                      color: `rgb(var(--theme-neutral-medium))`,
                      fontFamily: `var(--theme-font-body)`
                    }}
                  >
                    Al hacer clic, se abrirá WhatsApp con tu pedido listo para enviar
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 