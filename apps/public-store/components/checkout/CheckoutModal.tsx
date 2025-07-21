'use client'

import { useState, useEffect } from 'react'
import { useCart } from '../../lib/cart-context'
import { useStore } from '../../lib/store-context'
import { getCurrencySymbol } from '../../lib/store'
import { useShippingCalculator } from '../../lib/hooks/useShippingCalculator'

interface CustomerData {
  name: string
  phone: string
  email: string
  address: string
  reference: string
  paymentMethod: string
  notes: string
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
  
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    phone: '',
    email: '',
    address: '',
    reference: '',
    paymentMethod: 'whatsapp',
    notes: ''
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
        notes: ''
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
    setCustomerData(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Si está cambiando la dirección manualmente, indicar que no es autocompletado
    if (field === 'address') {
      shippingCalculator.onManualInput()
    }
  }

  const generateWhatsAppMessage = () => {
    const currencySymbol = getCurrencySymbol(store?.currency || 'USD')
    
    let message = `🛍️ *NUEVO PEDIDO - ${store?.storeName}*\n\n`
    
    // Datos del cliente
    message += `👤 *DATOS DEL CLIENTE:*\n`
    message += `• Nombre: ${customerData.name}\n`
    message += `• Teléfono: ${customerData.phone}\n`
    message += `• Email: ${customerData.email}\n`
    message += `• Dirección: ${customerData.address}\n`
    if (customerData.reference) {
      message += `• Referencia: ${customerData.reference}\n`
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
    if (shippingCalculator.isInDeliveryZone && shippingCalculator.shippingCost > 0) {
      message += `• Zona: ${shippingCalculator.zoneName}\n`
      message += `• Costo: ${currencySymbol} ${shippingCalculator.shippingCost.toFixed(2)}\n`
      if (shippingCalculator.estimatedTime) {
        message += `• Tiempo estimado: ${shippingCalculator.estimatedTime}\n`
      }
    } else {
      message += `• Costo: A coordinar\n`
    }
    message += `\n`
    
    // Total
    const finalTotal = cartState.totalPrice + (shippingCalculator.isInDeliveryZone ? shippingCalculator.shippingCost : 0)
    message += `💰 *TOTAL: ${currencySymbol} ${finalTotal.toFixed(2)}*\n`
    if (shippingCalculator.isInDeliveryZone && shippingCalculator.shippingCost > 0) {
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
    if (!customerData.name || !customerData.phone || !customerData.address) {
      alert('Por favor completa todos los campos obligatorios')
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

  const isFormValid = customerData.name && customerData.phone && customerData.address

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 transition-all duration-300 ease-out"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center md:p-4">
        <div className="bg-white md:rounded-lg shadow-2xl md:max-w-4xl w-full md:max-h-[90vh] h-full md:h-auto flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Icons.ShoppingBag />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Finalizar Compra</h2>
                <p className="text-sm text-gray-500">Completa tus datos para enviar tu pedido</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Icons.Close />
            </button>
          </div>

          {/* Contenido */}
          <div className="flex-1 overflow-y-auto md:max-h-[calc(90vh-120px)] h-full">
            <div className="flex flex-col lg:grid lg:grid-cols-2 h-full min-h-full">
              
              {/* Formulario */}
              <div className="p-4 md:p-6 lg:border-r border-gray-200 flex-1 lg:flex-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Icons.User />
                  <span>Datos del Cliente</span>
                </h3>

                <div className="space-y-4">
                  {/* Nombre */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre completo *
                    </label>
                    <input
                      type="text"
                      value={customerData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                      placeholder="Tu nombre completo"
                      required
                    />
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono *
                    </label>
                    <div className="flex">
                      <div className="flex items-center px-3 py-2 border border-gray-300 border-r-0 rounded-l-lg bg-gray-50">
                        <Icons.Phone />
                      </div>
                      <input
                        type="tel"
                        value={customerData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                        placeholder="+51 999 999 999"
                        required
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <div className="flex">
                      <div className="flex items-center px-3 py-2 border border-gray-300 border-r-0 rounded-l-lg bg-gray-50">
                        <Icons.Mail />
                      </div>
                      <input
                        type="email"
                        value={customerData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                        placeholder="tu@email.com"
                      />
                    </div>
                  </div>

                  {/* Dirección */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección *
                    </label>
                    <div className="relative">
                      <div className="flex">
                        <div className="flex items-center px-3 py-2 border border-gray-300 border-r-0 rounded-l-lg bg-gray-50">
                          <Icons.MapPin />
                        </div>
                        <input
                          ref={setAutocompleteRef}
                          type="text"
                          value={customerData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                          onBlur={shippingCalculator.onAddressBlur}
                          className="flex-1 px-3 py-2 pr-10 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                          placeholder={isGoogleMapsLoaded ? "Empieza a escribir tu dirección..." : "Av. Principal 123"}
                          required
                        />
                        {/* Indicador de carga de Google Maps */}
                        {!isGoogleMapsLoaded && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <svg className="w-4 h-4 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </div>
                        )}
                        {/* Indicador de Google Maps cargado */}
                        {isGoogleMapsLoaded && customerData.address && (
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      {/* Mensaje de ayuda */}
                      {isGoogleMapsLoaded && (
                        <p className="mt-1 text-xs text-gray-500">
                          ✓ Autocompletado de direcciones habilitado
                        </p>
                      )}
                    </div>
                  </div>



                  {/* Referencia */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Referencia
                    </label>
                    <input
                      type="text"
                      value={customerData.reference}
                      onChange={(e) => handleInputChange('reference', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                      placeholder="Frente al parque, casa blanca"
                    />
                  </div>

                  {/* Notas adicionales */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notas adicionales
                    </label>
                    <div className="flex">
                      <div className="flex items-start px-3 py-2 border border-gray-300 border-r-0 rounded-l-lg bg-gray-50">
                        <Icons.MessageSquare />
                      </div>
                      <textarea
                        value={customerData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        rows={3}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-gray-900 focus:border-gray-900 resize-none"
                        placeholder="Instrucciones especiales para la entrega..."
                      />
                    </div>
                  </div>

                  {/* Método de pago */}
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-base font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                      <Icons.CreditCard />
                      <span>Método de Pago</span>
                    </h4>
                    
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Icons.WhatsApp />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">Pago por WhatsApp</p>
                          <p className="text-sm text-gray-600">
                            Coordinaremos el método de pago contigo vía WhatsApp
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Resumen del pedido */}
              <div className="p-4 md:p-6 bg-gray-50 border-t lg:border-t-0 border-gray-200 flex-shrink-0 lg:flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen del Pedido</h3>

                {/* Productos */}
                <div className="space-y-3 mb-6">
                  {cartState.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 bg-white p-3 rounded-lg">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm truncate">{item.name}</h4>
                        <p className="text-xs text-gray-600">Cantidad: {item.quantity}</p>
                        {item.variant && (
                          <p className="text-xs text-gray-600">{item.variant.name}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 text-sm">
                          {getCurrencySymbol(store?.currency || 'USD')} {((item.variant?.price || item.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Totales */}
                <div className="bg-white rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Subtotal ({cartState.totalItems} productos)</span>
                    <span>{getCurrencySymbol(store?.currency || 'USD')} {cartState.totalPrice.toFixed(2)}</span>
                  </div>
                  
                  {/* Información de envío */}
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span className="flex items-center space-x-1">
                      <span>Envío</span>
                      {shippingCalculator.isCalculating && (
                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                    </span>
                    <span>
                      {shippingCalculator.isCalculating ? (
                        'Calculando...'
                      ) : shippingCalculator.isInDeliveryZone && shippingCalculator.shippingCost > 0 ? (
                        `${getCurrencySymbol(store?.currency || 'USD')} ${shippingCalculator.shippingCost.toFixed(2)}`
                      ) : (
                        'A coordinar'
                      )}
                    </span>
                  </div>
                  
                  {/* Mensaje de zona de entrega */}
                  {customerData.address && !shippingCalculator.isCalculating && (
                    <div className="text-xs">
                      {shippingCalculator.isInDeliveryZone ? (
                        <div className="text-green-600 flex items-center space-x-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span>
                            ✓ Zona: {shippingCalculator.zoneName}
                            {shippingCalculator.estimatedTime && ` • ${shippingCalculator.estimatedTime}`}
                          </span>
                        </div>
                      ) : shippingCalculator.error ? (
                        <div className="text-orange-600 flex items-center space-x-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          <span>{shippingCalculator.error}</span>
                        </div>
                      ) : customerData.address.length >= 5 ? (
                        <div className="text-gray-500 flex items-center space-x-1">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <span>Selecciona del autocompletado o termina de escribir tu dirección</span>
                        </div>
                      ) : null}
                    </div>
                  )}
                  
                  <div className="flex justify-between text-lg font-semibold text-gray-900 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span>
                      {getCurrencySymbol(store?.currency || 'USD')} {(cartState.totalPrice + (shippingCalculator.isInDeliveryZone ? shippingCalculator.shippingCost : 0)).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Botón de WhatsApp */}
                <div className="mt-4 pb-4 md:pb-0">
                  <button
                    onClick={handleWhatsAppCheckout}
                    disabled={isLoading || !isFormValid}
                    className="w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
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

                  <p className="text-xs text-gray-500 text-center mt-2">
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