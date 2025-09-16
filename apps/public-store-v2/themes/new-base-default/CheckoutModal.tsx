'use client';

import { useState, useEffect, useRef } from 'react';
import { useCart, CartItem } from '../../lib/cart-context';
import { createOrder, generateWhatsAppMessageWithId, OrderData } from '../../lib/orders';
import { formatPrice } from '../../lib/currency';
import { toCloudinarySquare } from '../../lib/images';
import { useStoreLanguage } from '../../lib/store-language-context';
import { StoreBasicInfo, getStoreShippingConfig, StoreShippingConfig, StorePickupLocation, getStoreCheckoutConfig, StoreAdvancedConfig } from '../../lib/store';
import { googleMapsLoader } from '../../lib/google-maps';
import { 
    getStoreDeliveryZones, 
    calculateShippingCost, 
    DeliveryZone,
    findDeliveryZoneForCoordinates 
} from '../../lib/delivery-zones';
import { validateCartStock, logStockValidation } from '../../lib/stock-validation';
import { getStoreStockConfig, logStockConfig, shouldValidateStock, shouldShowWarnings } from '../../lib/stock-config';
import { StockValidationResult } from '../../lib/stock-types';
import StockWarningModal from './StockWarningModal';
import { orderDataToPreference, createPreference, validateMercadoPagoConfig, getInitPoint } from '../../lib/mercadopago';
import { validateCoupon, applyCouponDiscount, CouponValidationResult } from '../../lib/coupons';

// Definición de métodos de pago con imágenes
const paymentMethodsConfig = {
    'efectivo': {
        id: 'cash',
        name: 'Pago en efectivo',
        description: 'Efectivo contra entrega',
        imageUrl: '/paymentimages/efectivo.png'
    },
    'tarjeta': {
        id: 'card',
        name: 'Tarjeta al repartidor',
        description: 'POS móvil para tarjetas',
        imageUrl: '/paymentimages/tarjeta.png'
    },
    'yape': {
        id: 'transfer',
        name: 'Yape',
        description: 'Transferencia móvil Yape',
        imageUrl: '/paymentimages/yape.png'
    },
    'mercadopago': {
        id: 'mercadopago',
        name: 'Pago Online con MercadoPago',
        description: 'Paga seguro con tarjetas, Yape, PagoEfectivo y más',
        imageUrl: '/paymentimages/mercadopago.png'
    }
};

// Icono SVG de fallback para transferencia bancaria
const BankIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M5 6.99H19V9H21V6C21 4.9 20.1 4 19 4H5C3.9 4 3 4.9 3 6V9H5V6.99ZM5 13V16H8V13H5ZM11 13V16H14V13H11ZM17 13V16H19V13H17ZM2 18V20H22V18H2Z" fill="currentColor"/>
    </svg>
);

// Método de pago por defecto (transferencia bancaria) para compatibilidad
const defaultPaymentMethod = {
    id: 'transfer',
    name: 'Transferencia bancaria',
    description: 'Datos por WhatsApp',
    imageUrl: null // Usará el icono SVG como fallback
};

interface CheckoutData {
    email: string;
    fullName: string; // Campo de nombre completo
    phone: string;
    address: string;
    city: string;
    zipCode: string;
    shippingMethod: 'standard' | 'express' | 'pickup';
    paymentMethod: 'cash' | 'transfer' | 'card' | 'mercadopago';
    notes: string;
    // Nuevos campos para manejo avanzado de direcciones
    addressText: string; // Lo que escribió el usuario
    lat: number | null; // Latitud del pin final
    lng: number | null; // Longitud del pin final
    addressNormalized: string; // Dirección sugerida/normalizada
    // Campos de cupón de descuento
    couponCode: string; // Código del cupón ingresado
    appliedCoupon: {
        id: string;
        code: string;
        discount: number; // Monto real del descuento
        type: 'percentage' | 'fixed_amount' | 'free_shipping'; // Tipo de descuento
    } | null;
}

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    storeInfo?: StoreBasicInfo | null;
    storeId?: string;
    onShowConfirmation?: (orderData: OrderData) => void;
}

export default function CheckoutModal({ isOpen, onClose, onSuccess, storeInfo, storeId, onShowConfirmation }: CheckoutModalProps) {
    

    const { state, clearCart } = useCart();
    const { t } = useStoreLanguage();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [shippingConfig, setShippingConfig] = useState<StoreShippingConfig | null>(null);
    const [checkoutConfig, setCheckoutConfig] = useState<StoreAdvancedConfig | null>(null);
    const [selectedLocation, setSelectedLocation] = useState<StorePickupLocation | null>(null);
    const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
    const autocompleteRef = useRef<HTMLInputElement>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [marker, setMarker] = useState<google.maps.Marker | null>(null);
    // Removed showMap state - map shows automatically when there are coordinates
    const [gettingLocation, setGettingLocation] = useState(false);
    const [userCoordinates, setUserCoordinates] = useState<{lat: number; lng: number} | null>(null);
    const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
    const [loadingZones, setLoadingZones] = useState(false);
    const [shippingCost, setShippingCost] = useState(0);
    const [suggestedAddress, setSuggestedAddress] = useState<string>('');
    const [isOutsideCoverage, setIsOutsideCoverage] = useState(false);
    const [showAddressSuggestion, setShowAddressSuggestion] = useState(false);
    
    // Estado para modal de advertencia de stock (NO CONECTADO AÚN)
    const [showStockWarning, setShowStockWarning] = useState(false);
    const [stockWarningItems, setStockWarningItems] = useState<StockValidationResult[]>([]);
    
    // Estado para validación de cupones
    const [validatingCoupon, setValidatingCoupon] = useState(false);
    const [couponError, setCouponError] = useState<string>('');
    
    // Estado del formulario de checkout
    const [formData, setFormData] = useState<CheckoutData>({
        email: '',
        fullName: '',
        phone: '',
        address: '',
        city: '',
        zipCode: '',
        shippingMethod: 'standard',
        paymentMethod: 'cash',
        notes: '',
        // Nuevos campos para manejo avanzado de direcciones
        addressText: '',
        lat: null,
        lng: null,
        addressNormalized: '',
        // Campos de cupón de descuento
        couponCode: '',
        appliedCoupon: null
    });
    
    // Detectar si es dispositivo móvil
    const isMobile = () => {
        if (typeof window === 'undefined') return false;
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
               window.innerWidth <= 768;
    };

    // Función para formatear nombres de días
    const formatDayName = (day: string) => {
        const dayNames: Record<string, string> = {
            'monday': 'Lunes',
            'tuesday': 'Martes', 
            'wednesday': 'Miércoles',
            'thursday': 'Jueves',
            'friday': 'Viernes',
            'saturday': 'Sábado',
            'sunday': 'Domingo'
        };
        return dayNames[day] || day;
    };

    // Función para formatear hora (de 24h a 12h si es necesario)
    const formatTime = (time: string) => {
        return time; // Por ahora mantener formato 24h
    };

    // Obtener moneda de la tienda
    const currency = storeInfo?.currency || 'PEN';
    
    // Función para obtener métodos de pago disponibles basados en la configuración
    const getAvailablePaymentMethods = () => {
        const methods = [];
        
        // Si está habilitado el pago contra entrega, agregar métodos configurados
        if (checkoutConfig?.payments?.acceptCashOnDelivery && checkoutConfig?.payments?.cashOnDeliveryMethods) {
            checkoutConfig.payments.cashOnDeliveryMethods.forEach(methodId => {
                if (paymentMethodsConfig[methodId as keyof typeof paymentMethodsConfig]) {
                    methods.push(paymentMethodsConfig[methodId as keyof typeof paymentMethodsConfig]);
                }
            });
        }
        
        // Si MercadoPago está configurado y los pagos online están habilitados, agregarlo
        if (checkoutConfig?.payments?.mercadopago?.enabled && 
            checkoutConfig?.payments?.acceptOnlinePayment &&
            paymentMethodsConfig['mercadopago']) {
            methods.push(paymentMethodsConfig['mercadopago']);
        }
        
        // Si no hay métodos configurados o como fallback, agregar transferencia bancaria
        if (methods.length === 0) {
            methods.push(defaultPaymentMethod);
        }
        
        return methods;
    };
    
    // Calcular costos usando zonas de entrega
    const subtotal = state.totalPrice;
    const shipping = formData.shippingMethod === 'pickup' ? 0 : shippingCost;
    
    // Calcular descuento del cupón usando la función especializada
    const discountCalculation = formData.appliedCoupon && storeId
        ? applyCouponDiscount(subtotal, shipping, {
            id: formData.appliedCoupon.id,
            type: formData.appliedCoupon.type,
            value: formData.appliedCoupon.discount,
            code: formData.appliedCoupon.code
        } as any)
        : { newSubtotal: subtotal, newShipping: shipping, discountAmount: 0 };
    
    const discount = discountCalculation.discountAmount;
    
    // Si está fuera de cobertura, no incluir shipping en el total (se coordina aparte)
    const total = isOutsideCoverage 
        ? discountCalculation.newSubtotal 
        : discountCalculation.newSubtotal + discountCalculation.newShipping;

    // Función para validar cupón
    const handleValidateCoupon = async () => {
        if (!formData.couponCode.trim() || !storeId) return;

        setValidatingCoupon(true);
        setCouponError('');

        try {
            const result = await validateCoupon(storeId, formData.couponCode, subtotal);
            
            if (result.valid && result.coupon && result.discount) {
                // Aplicar cupón válido
                setFormData(prev => ({
                    ...prev,
                    appliedCoupon: {
                        id: result.coupon!.id,
                        code: result.coupon!.code,
                        discount: result.discount!.amount,
                        type: result.discount!.type
                    }
                }));
                setCouponError('');
            } else {
                // Cupón inválido
                setFormData(prev => ({
                    ...prev,
                    appliedCoupon: null
                }));
                setCouponError(result.error || 'Cupón no válido');
            }
        } catch (error) {
            console.error('Error validating coupon:', error);
            setCouponError('Error al validar cupón');
        }

        setValidatingCoupon(false);
    };

    // Función para remover cupón
    const handleRemoveCoupon = () => {
        setFormData(prev => ({
            ...prev,
            couponCode: '',
            appliedCoupon: null
        }));
        setCouponError('');
    };

    // Cargar configuración de envío y checkout cuando se abre el modal
    useEffect(() => {
        if (isOpen && storeId) {
            console.log('🚚 [CheckoutModal] Loading configs for store:', storeId);
            
            // Cargar configuración de envío
            getStoreShippingConfig(storeId).then(config => {
                console.log('🚚 [CheckoutModal] Raw shipping config:', config);
                setShippingConfig(config);
                console.log('🚚 [CheckoutModal] Store pickup enabled?', config?.storePickup?.enabled);
                
                // Auto-seleccionar primera sucursal por defecto
                const locations = config?.storePickup?.locations || [];
                if (locations.length > 0) {
                    setSelectedLocation(locations[0]);
                    console.log('🚚 [CheckoutModal] Auto-selected first location:', locations[0].name);
                }
            });
            
            // Cargar configuración de checkout
            getStoreCheckoutConfig(storeId).then(config => {
                console.log('💳 [CheckoutModal] Checkout config:', config);
                setCheckoutConfig(config);
                
                // Auto-seleccionar primer método de pago disponible si no hay ninguno seleccionado
                setTimeout(() => {
                    if (!formData.paymentMethod || formData.paymentMethod === 'cash') {
                        const availableMethods = config?.payments?.acceptCashOnDelivery && config?.payments?.cashOnDeliveryMethods?.length 
                            ? config.payments.cashOnDeliveryMethods 
                            : ['transfer'];
                        
                        let firstMethodId = 'transfer'; // fallback
                        if (availableMethods.length > 0) {
                            const firstConfigMethod = availableMethods[0];
                            firstMethodId = paymentMethodsConfig[firstConfigMethod as keyof typeof paymentMethodsConfig]?.id || 'transfer';
                        }
                        
                        setFormData(prev => ({ ...prev, paymentMethod: firstMethodId as any }));
                        console.log('💳 [CheckoutModal] Auto-selected payment method:', firstMethodId);
                    }
                }, 100);
            });
        }
    }, [isOpen, storeId]);

    // Si pickup está deshabilitado y el usuario lo tenía seleccionado, cambiar a standard
    useEffect(() => {
        if (shippingConfig && formData.shippingMethod === 'pickup' && !shippingConfig.storePickup?.enabled) {
            console.log('🚚 [CheckoutModal] Pickup disabled, switching to standard shipping');
            setFormData(prev => ({ ...prev, shippingMethod: 'standard' }));
        }
    }, [shippingConfig, formData.shippingMethod]);

    // Si express está deshabilitado y el usuario lo tenía seleccionado, cambiar a standard
    useEffect(() => {
        if (shippingConfig && formData.shippingMethod === 'express' && !shippingConfig.localDelivery?.express?.enabled) {
            console.log('🚚 [CheckoutModal] Express disabled, switching to standard shipping');
            setFormData(prev => ({ ...prev, shippingMethod: 'standard' }));
        }
    }, [shippingConfig, formData.shippingMethod]);

    // Cuando el usuario selecciona pickup, auto-seleccionar primera sucursal si no hay ninguna seleccionada
    useEffect(() => {
        if (formData.shippingMethod === 'pickup' && shippingConfig?.storePickup?.locations && !selectedLocation) {
            const locations = shippingConfig.storePickup.locations;
            if (locations.length > 0) {
                setSelectedLocation(locations[0]);
                console.log('🚚 [CheckoutModal] Auto-selected first location on pickup selection:', locations[0].name);
            }
        }
    }, [formData.shippingMethod, shippingConfig, selectedLocation]);

    // Calcular y actualizar costo de envío
    useEffect(() => {
        if (formData.shippingMethod === 'pickup') {
            setShippingCost(0);
            return;
        }

        // Calcular costo si hay coordenadas (con o sin zonas configuradas)
        if (userCoordinates) {
            // Obtener configuración de express
            const expressConfig = shippingConfig?.localDelivery?.express ? {
                enabled: shippingConfig.localDelivery.express.enabled,
                priceMultiplier: shippingConfig.localDelivery.express.priceMultiplier,
                fixedSurcharge: shippingConfig.localDelivery.express.fixedSurcharge
            } : undefined;

            const calculatedShipping = calculateShippingCost(
                userCoordinates,
                deliveryZones,
                formData.shippingMethod,
                expressConfig
            );
            setShippingCost(calculatedShipping);
            
            // Verificar si está fuera de cobertura cuando hay zonas configuradas
            if (deliveryZones.length > 0) {
                const zone = findDeliveryZoneForCoordinates(userCoordinates, deliveryZones);
                const outsideCoverage = !zone;
                setIsOutsideCoverage(outsideCoverage);
                
                const isWhatsAppCheckout = checkoutConfig?.checkout?.method === 'whatsapp';
                console.log('🔍 [Coverage Check]', {
                    coordinates: userCoordinates,
                    zonesCount: deliveryZones.length,
                    foundZone: zone ? zone.name : 'NINGUNA',
                    isOutsideCoverage: outsideCoverage,
                    checkoutMethod: checkoutConfig?.checkout?.method,
                    canContinueIfOutside: isWhatsAppCheckout,
                    noCoverageMessage: shippingConfig?.localDelivery?.noCoverageMessage
                });
            } else {
                setIsOutsideCoverage(false); // Si no hay zonas, no hay restricción
                console.log('🔍 [Coverage Check] No hay zonas configuradas, permitiendo entrega');
            }
        } else {
            setShippingCost(0);
            setIsOutsideCoverage(false);
        }
    }, [userCoordinates, deliveryZones, formData.shippingMethod, shippingConfig]);

    // Reset al abrir/cerrar
    useEffect(() => {
        if (isOpen) {
            setCurrentStep(1);
            setIsSubmitting(false);
            // Scroll to top al abrir el modal en móviles
            setTimeout(() => scrollToTopOnMobile(), 200);
        } else {
            // Limpiar estados al cerrar
            setMap(null);
            setMarker(null);
            setUserCoordinates(null);
            setShippingCost(0);
        }
    }, [isOpen]);

    // Cargar zonas de entrega cuando se abre el modal
    useEffect(() => {
        if (isOpen && storeId && deliveryZones.length === 0 && !loadingZones) {
            setLoadingZones(true);
            getStoreDeliveryZones(storeId)
                .then((zones) => {
                    setDeliveryZones(zones);
                })
                .catch((error) => {
                    console.error('[CheckoutModal] Error cargando zonas de entrega:', error);
                })
                .finally(() => {
                    setLoadingZones(false);
                });
        }
    }, [isOpen, storeId]);

    // Cargar Google Maps API usando el loader centralizado - Mejorado para móviles
    useEffect(() => {
        if (isOpen && currentStep === 2 && formData.shippingMethod !== 'pickup') {
            // Verificar si hay API key configurada
            const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
            if (!apiKey) {
                setIsGoogleMapsLoaded(false);
                return;
            }
            
            const isMobileDevice = typeof window !== 'undefined' && window.innerWidth <= 768;
            
            // Usar método específico para móviles
            const loadMaps = isMobileDevice ? 
                googleMapsLoader.loadForMobile() : 
                googleMapsLoader.load();
                
            loadMaps
                .then(() => {
                    console.log('✅ Google Maps loaded successfully', { isMobileDevice });
                    setIsGoogleMapsLoaded(true);
                })
                .catch((error: Error) => {
                    console.error('❌ Failed to load Google Maps:', error);
                    setIsGoogleMapsLoaded(false);
                    
                    // Intento adicional para móviles
                    if (isMobileDevice) {
                        console.log('🔄 Retrying Google Maps load for mobile...');
                        setTimeout(() => {
                            googleMapsLoader.load().then(() => {
                                console.log('✅ Google Maps loaded on retry');
                                setIsGoogleMapsLoaded(true);
                            }).catch(retryError => {
                                console.error('❌ Retry also failed:', retryError);
                            });
                        }, 2000);
                    }
                });
        }
    }, [isOpen, currentStep, formData.shippingMethod]);

    // Cleanup del mapa al cerrar el modal o cambiar de método de envío
    useEffect(() => {
        if (!isOpen || formData.shippingMethod === 'pickup') {
            setMap(null);
            setMarker(null);
            setUserCoordinates(null);
        }
    }, [isOpen, formData.shippingMethod]);

    // Configurar autocompletado cuando Google Maps esté cargado (igual que en dashboard)
    useEffect(() => {
        if (isGoogleMapsLoaded && autocompleteRef.current && formData.shippingMethod !== 'pickup') {
            const autocomplete = new window.google.maps.places.Autocomplete(autocompleteRef.current, {
                types: ['address'],
                componentRestrictions: { country: ['mx', 'ar', 'co', 'pe', 'cl', 've', 'ec', 'bo', 'py', 'uy', 'br', 'es', 'us'] }
            });

            autocomplete.addListener('place_changed', () => {
                const place = autocomplete.getPlace();
                
                if (place.geometry && place.geometry.location) {
                    const address = place.formatted_address || place.name || '';
                    handleInputChange('address', address);
                }
            });

            return () => {
                window.google.maps.event.clearInstanceListeners(autocomplete);
            };
        }
    }, [isGoogleMapsLoaded, formData.shippingMethod]);

    // Auto-inicializar mapa cuando aparece (solo si no existe ya)
    useEffect(() => {
        const hasCoordinates = !!(userCoordinates || (formData.lat && formData.lng));
        const hasAddress = !!(formData.address && formData.address.length > 5);
        const shouldShowMap = hasCoordinates || hasAddress;
        
        // Solo inicializar si no hay mapa ya creado
        if (shouldShowMap && isGoogleMapsLoaded && !map) {
            const lat = userCoordinates?.lat || formData.lat;
            const lng = userCoordinates?.lng || formData.lng;
            if (lat && lng) {
                console.log('🗺️ [Auto Init] Initializing map automatically');
                setTimeout(() => safeInitializeMap(lat, lng), 100);
            }
        }
    }, [userCoordinates, formData.lat, formData.lng, formData.address, isGoogleMapsLoaded, map]);

    const handleInputChange = (field: keyof CheckoutData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Si es el campo address, actualizar también addressText
        if (field === 'address') {
            setFormData(prev => ({ ...prev, addressText: value }));
        }
        
        // Si es el campo couponCode, limpiar errores y cupón aplicado
        if (field === 'couponCode') {
            setCouponError('');
            if (formData.appliedCoupon) {
                setFormData(prev => ({ ...prev, appliedCoupon: null }));
            }
        }
    };


    // Función para geocoding directo (texto → lat/lng)
    const handleDirectGeocoding = (addressText: string) => {
        if (!isGoogleMapsLoaded || !addressText.trim()) return;

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode(
            { address: addressText },
            (results, status) => {
                if (status === 'OK' && results && results[0]) {
                    const location = results[0].geometry.location;
                    const lat = location.lat();
                    const lng = location.lng();
                    
                    // Actualizar coordenadas en formData y userCoordinates
                    setFormData(prev => ({ 
                        ...prev, 
                        lat: lat, 
                        lng: lng,
                        // Opcionalmente normalizar la dirección
                        addressNormalized: results[0].formatted_address
                    }));
                    setUserCoordinates({ lat, lng });
                    
                    // Si hay mapa y marcador, actualizar posición
                    if (map && marker) {
                        const newPosition = new google.maps.LatLng(lat, lng);
                        map.setCenter(newPosition);
                        marker.setPosition(newPosition);
                    } else if (isGoogleMapsLoaded) {
                        // Inicializar mapa automáticamente
                        setTimeout(() => safeInitializeMap(lat, lng), 100);
                    }
                } else {
                    console.error('Geocoding failed:', status);
                    alert('No se pudo encontrar la dirección. Por favor verifica que esté correcta.');
                }
            }
        );
    };

    // Función para manejar Enter en el campo de dirección
    const handleAddressKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const addressText = (e.target as HTMLInputElement).value;
            if (addressText.trim()) {
                handleDirectGeocoding(addressText);
            }
        }
    };

    // Función para obtener ubicación del usuario
    const getUserLocation = () => {
        if (!navigator.geolocation) {
            alert('Tu navegador no soporta geolocalización. Por favor ingresa tu dirección manualmente.');
            return;
        }

        // Verificar si estamos en HTTPS (requerido para geolocalización en producción)
        if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
            alert('La geolocalización requiere conexión HTTPS. Por favor ingresa tu dirección manualmente.');
            return;
        }

        // Si Google Maps no está cargado, intentar cargar pero continuar sin mapa si falla
        if (!isGoogleMapsLoaded) {
            const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
            if (!apiKey) {
                // Si no hay API key, usar directamente geolocalización sin mapa
                getLocationWithoutMap();
                return;
            }
            
            setGettingLocation(true);
            const isMobileDevice = typeof window !== 'undefined' && window.innerWidth <= 768;
            
            // Usar método específico para móviles
            const loadMaps = isMobileDevice ? 
                googleMapsLoader.loadForMobile() : 
                googleMapsLoader.load();
                
            loadMaps
                .then(() => {
                    console.log('✅ Google Maps loaded for location', { isMobileDevice });
                    setIsGoogleMapsLoaded(true);
                    // Una vez cargado, obtener ubicación
                    getLocationAndShowMap();
                })
                .catch((error: Error) => {
                    console.error('❌ Failed to load Google Maps for location:', error);
                    
                    // Intento adicional para móviles antes del fallback
                    if (isMobileDevice) {
                        console.log('🔄 Retrying location load for mobile...');
                        setTimeout(() => {
                            googleMapsLoader.load().then(() => {
                                console.log('✅ Location retry successful');
                                setIsGoogleMapsLoaded(true);
                                getLocationAndShowMap();
                            }).catch(retryError => {
                                console.error('❌ Location retry failed, using fallback');
                                getLocationWithoutMap();
                            });
                        }, 1500);
                    } else {
                        // Continuar con geolocalización sin mapa
                        getLocationWithoutMap();
                    }
                });
        } else {
            // Si ya está cargado, obtener ubicación directamente
            getLocationAndShowMap();
        }
    };

    // Función para obtener ubicación sin mapa (fallback)
    const getLocationWithoutMap = () => {
        setGettingLocation(true);
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setGettingLocation(false);
                
                // Guardar coordenadas del usuario
                setUserCoordinates({ lat: latitude, lng: longitude });
                setFormData(prev => ({ ...prev, lat: latitude, lng: longitude }));
                
                // Inicializar mapa automáticamente cuando obtenemos ubicación
                if (isGoogleMapsLoaded) {
                    console.log('🗺️ [Geolocation] Auto-initializing map with user location');
                    setTimeout(() => safeInitializeMap(latitude, longitude), 200);
                }
                
                // Si Google Maps está disponible, hacer reverse geocoding
                if (isGoogleMapsLoaded) {
                    
                    // Inicializar el mapa después de un pequeño delay
                    setTimeout(() => safeInitializeMap(latitude, longitude), 100);
                    
                    const geocoder = new window.google.maps.Geocoder();
                    geocoder.geocode(
                        { location: { lat: latitude, lng: longitude } },
                        (results, status) => {
                            if (status === 'OK' && results && results[0]) {
                                const suggestedAddr = results[0].formatted_address;
                                // Proponer la dirección encontrada
                                setSuggestedAddress(suggestedAddr);
                                setShowAddressSuggestion(true);
                                setFormData(prev => ({ ...prev, addressNormalized: suggestedAddr }));
                                // alert('¡Ubicación obtenida! Se ha encontrado una dirección sugerida.');
                            }
                        }
                    );
                } else {
                    alert('¡Ubicación confirmada! El costo de envío se ha actualizado.');
                }
            },
            (error) => {
                setGettingLocation(false);
                console.error('Error getting location:', error);
                handleGeolocationError(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000, // Aumentar timeout a 15 segundos
                maximumAge: 300000 // 5 minutos
            }
        );
    };

    const getLocationAndShowMap = () => {
        setGettingLocation(true);
        
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setGettingLocation(false);
                
                // Guardar coordenadas del usuario
                setUserCoordinates({ lat: latitude, lng: longitude });
                setFormData(prev => ({ ...prev, lat: latitude, lng: longitude }));
                
                // El mapa aparecerá automáticamente cuando detecte coordenadas
                console.log('🗺️ [Location+Map] Coordinates saved, map will auto-show');
                setTimeout(() => safeInitializeMap(latitude, longitude), 100);
            },
            (error) => {
                setGettingLocation(false);
                console.error('Error getting location:', error);
                handleGeolocationError(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000, // Aumentar timeout a 15 segundos
                maximumAge: 300000 // 5 minutos
            }
        );
    };

    // Función centralizada para manejar errores de geolocalización
    const handleGeolocationError = (error: GeolocationPositionError) => {
        let message = '';
        switch(error.code) {
            case error.PERMISSION_DENIED:
                message = t('locationPermissionDenied');
                break;
            case error.POSITION_UNAVAILABLE:
                message = t('locationUnavailable');
                break;
            case error.TIMEOUT:
                message = t('locationTimeout');
                break;
            default:
                message = t('locationError');
                break;
        }
        alert(message);
    };

    // Función auxiliar para verificar que mapRef esté disponible antes de inicializar
    const safeInitializeMap = (lat: number, lng: number, maxRetries = 10) => {
        const checkMapRef = (retries = 0) => {
            if (mapRef.current) {
                initializeMap(lat, lng);
            } else if (retries < maxRetries) {
                setTimeout(() => checkMapRef(retries + 1), 50);
            } else {
                console.warn('⚠️ Map container not available after maximum retries');
            }
        };
        checkMapRef();
    };

    // Inicializar mapa con ubicación - Mejorado para móviles
    const initializeMap = (lat: number, lng: number) => {
        const hasMapRef = !!mapRef.current;
        const hasGoogleMaps = !!window.google?.maps;
        const isMobileDevice = typeof window !== 'undefined' && window.innerWidth <= 768;
        
        console.log('🗺️ [Map Init Debug]:', {
            hasMapRef,
            isGoogleMapsLoaded,
            hasGoogleMaps,
            isMobileDevice,
            coordinates: { lat, lng },
            mapRefElement: mapRef.current,
            userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'N/A'
        });

        if (!mapRef.current) {
            console.error('❌ Map container ref not available', {
                isMobileDevice,
                mapRefCurrent: mapRef.current,
                documentReady: document.readyState
            });
            return;
        }

        if (!hasGoogleMaps) {
            console.error('❌ Google Maps API not loaded', {
                isMobileDevice,
                windowGoogle: !!window.google,
                windowGoogleMaps: !!window.google?.maps,
                isGoogleMapsLoaded,
                userAgent: navigator.userAgent
            });
            
            // En móviles, intentar cargar Google Maps con método específico
            if (isMobileDevice) {
                console.log('🔄 Attempting to load Google Maps for mobile...');
                googleMapsLoader.loadForMobile().then(() => {
                    console.log('✅ Google Maps loaded for mobile, retrying map initialization...');
                    if (window.google?.maps) {
                        setTimeout(() => safeInitializeMap(lat, lng), 100);
                    }
                }).catch(error => {
                    console.error('❌ Failed to load Google Maps for mobile:', error);
                    // En lugar de alert, mostrar mensaje en el contenedor del mapa
                    if (mapRef.current) {
                        mapRef.current.innerHTML = `
                            <div style="
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                height: 100%;
                                background: #ffebee;
                                color: #c62828;
                                text-align: center;
                                padding: 20px;
                                border-radius: 8px;
                            ">
                                <div>
                                    <div style="font-size: 24px; margin-bottom: 8px;">⚠️</div>
                                    <div style="font-weight: 600; margin-bottom: 4px;">No se pudo cargar el mapa</div>
                                    <small>Verifica tu conexión a internet</small>
                                </div>
                            </div>
                        `;
                    }
                });
            }
            return;
        }

        console.log('✅ Initializing map at:', lat, lng);

        try {
            // Configuración SIMPLE del mapa
            const mapOptions = {
                center: { lat, lng },
                zoom: 15,
                mapTypeId: window.google.maps.MapTypeId.ROADMAP,
                zoomControl: true,
                mapTypeControl: false,
                scaleControl: false,
                streetViewControl: false,
                rotateControl: false,
                fullscreenControl: false
            };
            
            console.log('🗺️ [Map Creation] Creating map with options:', mapOptions);
            const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
            
            // Resize SIMPLE
            setTimeout(() => {
                window.google.maps.event.trigger(newMap, 'resize');
                newMap.setCenter({ lat, lng });
            }, 100);

            // Marcador personalizado (solo en móviles)
            const isMobileDevice = typeof window !== 'undefined' && window.innerWidth <= 768;
            
            const newMarker = new window.google.maps.Marker({
                position: { lat, lng },
                map: newMap,
                draggable: true,
                title: "Arrastra para ajustar tu ubicación exacta",
                // Icono personalizado solo para móviles
                icon: isMobileDevice ? {
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg xmlns="http://www.w3.org/2000/svg" width="36" height="48" viewBox="0 0 24 32" fill="none">
                            <path d="M12 0C5.373 0 0 5.373 0 12c0 12 12 20 12 20s12-8 12-20C24 5.373 18.627 0 12 0z" fill="#FF4444" stroke="#ffffff" stroke-width="2"/>
                            <circle cx="12" cy="12" r="6" fill="#ffffff"/>
                            <circle cx="12" cy="12" r="3" fill="#FF4444"/>
                        </svg>
                    `),
                    scaledSize: new window.google.maps.Size(36, 48),
                    anchor: new window.google.maps.Point(18, 48)
                } : undefined
            });

            // Listener para cuando se mueva el marcador
            newMarker.addListener('dragend', () => {
                const position = newMarker.getPosition();
                if (position) {
                    reverseGeocode(position.lat(), position.lng(), true); // fromUserAction = true
                }
            });

            // Listener para clicks en el mapa
            newMap.addListener('click', (event: google.maps.MapMouseEvent) => {
                if (event.latLng) {
                    newMarker.setPosition(event.latLng);
                    reverseGeocode(event.latLng.lat(), event.latLng.lng(), true); // fromUserAction = true
                }
            });



            setMap(newMap);
            setMarker(newMarker);

            // Obtener dirección inicial con un pequeño delay
            setTimeout(() => {
                reverseGeocode(lat, lng);
            }, 500);

        } catch (error) {
            console.error('Error initializing map:', error);
        }
    };

    // Convertir coordenadas a dirección (mejorado para mostrar sugerencias)
    const reverseGeocode = (lat: number, lng: number, fromUserAction: boolean = false) => {
        if (!isGoogleMapsLoaded) return;

        // Actualizar coordenadas del usuario y en formData
        setUserCoordinates({ lat, lng });
        setFormData(prev => ({ ...prev, lat, lng }));

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode(
            { location: { lat, lng } },
            (results, status) => {
                if (status === 'OK' && results && results[0]) {
                    const suggestedAddr = results[0].formatted_address;
                    
                    if (fromUserAction && formData.addressText.trim()) {
                        // Si viene de una acción del usuario (arrastrar pin) y ya hay texto,
                        // mostrar como sugerencia sin reemplazar
                        setSuggestedAddress(suggestedAddr);
                        setShowAddressSuggestion(true);
                        setFormData(prev => ({ ...prev, addressNormalized: suggestedAddr }));
                    } else {
                        // Si no hay texto del usuario o es la primera vez, usar directamente
                        handleInputChange('address', suggestedAddr);
                        setFormData(prev => ({ 
                            ...prev, 
                            addressText: suggestedAddr,
                            addressNormalized: suggestedAddr 
                        }));
                    }
                } else {
                    console.error('Geocoder failed:', status);
                }
            }
        );
    };

    // Función para aceptar la dirección sugerida
    const acceptSuggestedAddress = () => {
        if (suggestedAddress) {
            handleInputChange('address', suggestedAddress);
            setFormData(prev => ({ 
                ...prev, 
                addressText: suggestedAddress,
                addressNormalized: suggestedAddress 
            }));
            setShowAddressSuggestion(false);
            setSuggestedAddress('');
        }
    };

    // Función para rechazar la dirección sugerida
    const rejectSuggestedAddress = () => {
        setShowAddressSuggestion(false);
        setSuggestedAddress('');
    };

    const validateStep = (step: number): boolean => {
        switch (step) {
            case 1:
                return !!(formData.email && formData.fullName && formData.phone);
            case 2:
                // Para recojo en tienda necesita sucursal seleccionada
                if (formData.shippingMethod === 'pickup') {
                    return !!selectedLocation;
                }
                
                // Para envío a domicilio o express necesita dirección
                if (!formData.address) {
                    return false;
                }
                
                // Si está fuera de cobertura, verificar método de checkout
                if (isOutsideCoverage) {
                    const isWhatsAppCheckout = checkoutConfig?.checkout?.method === 'whatsapp';
                    // WhatsApp permite continuar fuera de cobertura, checkout tradicional no
                    return isWhatsAppCheckout;
                }
                
                return true;
            case 3:
                return !!(formData.paymentMethod); // Método de pago requerido
            default:
                return false;
        }
    };

    // Función para hacer scroll to top en móviles
    const scrollToTopOnMobile = () => {
        // Solo en dispositivos móviles
        if (typeof window !== 'undefined' && window.innerWidth <= 768) {
            // Buscar el contenedor del modal checkout
            const checkoutModal = document.querySelector('.nbd-checkout-modal');
            if (checkoutModal) {
                checkoutModal.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            }
        }
    };

    const nextStep = () => {
        if (validateStep(currentStep) && currentStep < 3) {
            setCurrentStep(currentStep + 1);
            // Scroll to top en móviles después de cambiar de paso
            setTimeout(() => scrollToTopOnMobile(), 100);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
            // Scroll to top en móviles después de cambiar de paso
            setTimeout(() => scrollToTopOnMobile(), 100);
        }
    };

    // Función para generar mensaje de WhatsApp
    const generateWhatsAppMessage = () => {
        const storeName = storeInfo?.storeName || 'Tienda';
        const whatsappPhone = storeInfo?.socialMedia?.whatsapp || storeInfo?.phone;
        
        let message = `¡Hola! Me interesa realizar un pedido desde ${storeName}:\n\n`;
        
        // Agregar productos
        message += `📦 *PRODUCTOS:*\n`;
        state.items.forEach((item, index) => {
            const itemTotal = (item.variant?.price || item.price) * item.quantity;
            message += `${index + 1}. ${item.name}`;
            if (item.variant) {
                message += ` (${item.variant.name})`;
            }
            message += `\n   Cantidad: ${item.quantity} x ${formatPrice(item.variant?.price || item.price, currency)} = ${formatPrice(itemTotal, currency)}\n`;
        });
        
        // Agregar información del cliente
        message += `\n👤 *DATOS DEL CLIENTE:*\n`;
        message += `Nombre: ${formData.fullName}\n`;
        message += `Email: ${formData.email}\n`;
        message += `Teléfono: ${formData.phone}\n`;
        
        // Agregar información de envío
        message += `\n🚚 *ENVÍO:*\n`;
        if (formData.shippingMethod === 'pickup') {
            message += `Método: Recojo en tienda\n`;
            if (selectedLocation) {
                message += `Sucursal: ${selectedLocation.name}\n`;
                if (selectedLocation.address) {
                    message += `Dirección: ${selectedLocation.address}\n`;
                }
            }
        } else {
            message += `Método: ${formData.shippingMethod === 'express' ? 'Envío express' : 'Envío estándar'}\n`;
            message += `Dirección: ${formData.address}\n`;
            if (formData.city) message += `Ciudad: ${formData.city}\n`;
        }
        
        // Agregar información de pago
        message += `\n💳 *PAGO:*\n`;
        const selectedMethod = getAvailablePaymentMethods().find(method => method.id === formData.paymentMethod);
        const paymentMethodName = selectedMethod?.name || formData.paymentMethod;
        message += `Método: ${paymentMethodName}\n`;
        
        // Agregar totales
        message += `\n💰 *RESUMEN:*\n`;
        message += `Subtotal: ${formatPrice(subtotal, currency)}\n`;
        
        // Mostrar envío según cobertura
        if (formData.shippingMethod === 'pickup') {
            message += `Envío: Recojo en tienda (gratis)\n`;
        } else if (isOutsideCoverage) {
            message += `Envío: A coordinar\n`;
        } else {
            message += `Envío: ${formatPrice(shipping, currency)}\n`;
        }
        
        if (discount > 0) {
            message += `Descuento: -${formatPrice(discount, currency)}\n`;
        }
        
        // Para total, si está fuera de cobertura, no incluir shipping en el cálculo automático
        const finalTotal = (formData.shippingMethod === 'pickup' || isOutsideCoverage) 
            ? subtotal - discount 
            : total;
            
        message += isOutsideCoverage 
            ? `*Subtotal: ${formatPrice(finalTotal, currency)}* (envío a coordinar)\n`
            : `*Total: ${formatPrice(finalTotal, currency)}*\n`;
        
        // Agregar notas si las hay
        if (formData.notes.trim()) {
            message += `\n📝 *NOTAS:*\n${formData.notes}\n`;
        }
        
        return { message, phone: whatsappPhone };
    };

    // Función para continuar con checkout después de advertencia de stock
    const continueCheckoutAfterWarning = async () => {
        console.log('🚀 [Stock Warning] Continuando checkout después de advertencia...');
        setIsSubmitting(true);
        await processCheckoutFlow();
    };

    // Función que contiene la lógica principal de checkout
    const processCheckoutFlow = async () => {
        try {
            // Verificar método de checkout
            const isWhatsAppCheckout = checkoutConfig?.checkout?.method === 'whatsapp';
            console.log('🔍 Método de checkout:', { 
                checkoutConfig, 
                method: checkoutConfig?.checkout?.method, 
                isWhatsAppCheckout 
            });
            
            // Preparar datos del pedido (formato universal)
            const orderData: OrderData = {
                customer: {
                    email: formData.email,
                    fullName: formData.fullName,
                    phone: formData.phone
                },
                shipping: {
                    method: formData.shippingMethod,
                    address: formData.address,
                    city: formData.city,
                    cost: shipping,
                    ...(selectedLocation && { pickupLocation: selectedLocation })
                },
                payment: {
                    method: formData.paymentMethod,
                    notes: formData.notes
                },
                items: state.items,
                totals: { subtotal, shipping, total },
                currency: currency,
                checkoutMethod: isWhatsAppCheckout ? 'whatsapp' : 'traditional',
                discount: discount,
                ...(formData.appliedCoupon && { appliedCoupon: formData.appliedCoupon })
            };

            console.log('[Checkout] Saving order to Firestore...', { method: orderData.checkoutMethod });

            // Guardar pedido en Firestore
            const orderDoc = await createOrder(storeId || '', orderData);
            const orderId = orderDoc?.id || null;
            
            if (orderId) {
                console.log('[Checkout] Order saved successfully:', orderId);
            } else {
                console.warn('[Checkout] Order not saved (Firebase unavailable), continuing with checkout...');
            }
            
            // Procesar según el método de checkout
            if (isWhatsAppCheckout) {
                // Para WhatsApp: usar nueva función con ID del pedido
                const { message, phone } = generateWhatsAppMessageWithId(orderData, orderId, storeInfo);

                if (phone) {
                    // Limpiar número de teléfono (quitar espacios, guiones, etc.)
                    const cleanPhone = phone.replace(/[^\d+]/g, '');
                    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

                    console.log('[WhatsApp] Redirecting to:', whatsappUrl);

                    // Detectar dispositivo móvil para optimizar la apertura de WhatsApp
                    const isMobileDevice = isMobile();
                    const isAndroid = /Android/i.test(navigator.userAgent);
                    const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

                    console.log('[WhatsApp] Device detection:', {
                        isMobileDevice,
                        isAndroid,
                        isIOS,
                        userAgent: navigator.userAgent
                    });

                    if (isMobileDevice) {
                        // En móviles, usar location.href para mejor integración con la app
                        console.log('[WhatsApp] Opening on mobile device');

                        try {
                            // Método principal: redirección directa
                            window.location.href = whatsappUrl;

                            // Para iOS, agregar método de fallback más robusto
                            if (isIOS) {
                                console.log('[WhatsApp] Applying iOS-specific optimizations');

                                // Intentar abrir con un esquema personalizado después de un delay
                                setTimeout(() => {
                                    // Crear un enlace invisible y hacer click
                                    const tempLink = document.createElement('a');
                                    tempLink.href = whatsappUrl;
                                    tempLink.style.display = 'none';
                                    tempLink.target = '_self'; // Usar _self en iOS para mejor integración
                                    document.body.appendChild(tempLink);
                                    tempLink.click();
                                    document.body.removeChild(tempLink);
                                }, 50);
                            }

                            // Para Android, verificar si WhatsApp está disponible
                            if (isAndroid) {
                                console.log('[WhatsApp] Applying Android-specific optimizations');

                                // Usar intent de Android si es posible
                                const androidIntent = `intent://send/?text=${encodeURIComponent(message)}&phone=${cleanPhone}#Intent;scheme=whatsapp;package=com.whatsapp;end`;

                                setTimeout(() => {
                                    try {
                                        window.location.href = androidIntent;
                                    } catch (e) {
                                        console.log('[WhatsApp] Android intent failed, using web fallback');
                                    }
                                }, 100);
                            }
                        } catch (error) {
                            console.error('[WhatsApp] Error opening on mobile:', error);
                            // Fallback: intentar window.open
                            window.open(whatsappUrl, '_blank');
                        }
                    } else {
                        // En desktop, usar window.open para abrir en nueva pestaña
                        console.log('[WhatsApp] Opening on desktop device');
                        const whatsappWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

                        // Verificar si se bloqueó el popup y mostrar enlace alternativo
                        if (!whatsappWindow || whatsappWindow.closed || typeof whatsappWindow.closed === 'undefined') {
                            console.log('[WhatsApp] Popup blocked, creating fallback link');

                            // Crear enlace de respaldo
                            const fallbackLink = document.createElement('a');
                            fallbackLink.href = whatsappUrl;
                            fallbackLink.target = '_blank';
                            fallbackLink.rel = 'noopener noreferrer';
                            fallbackLink.textContent = 'Abrir WhatsApp';

                            // Mostrar alerta con enlace
                            if (confirm('El navegador bloqueó la ventana de WhatsApp. ¿Deseas abrir WhatsApp manualmente?')) {
                                fallbackLink.click();
                            }
                        }
                    }

                    // Limpiar carrito después de un breve delay para que el usuario vea que se procesó
                    // En móviles, dar más tiempo para que la app se abra correctamente
                    const cleanupDelay = isMobileDevice ? 1500 : 1000;

                    setTimeout(() => {
                        clearCart();
                        setIsSubmitting(false);
                        onSuccess();
                        onClose();
                    }, cleanupDelay);
                } else {
                    // Si no hay teléfono configurado, mostrar error
                    console.error('[WhatsApp] No phone number configured:', { storeInfo, phone });
                    alert('⚠️ Error: No se ha configurado un número de WhatsApp para esta tienda.\n\nPor favor contacta al administrador para completar la configuración.');
                    setIsSubmitting(false);
                }
            } else {
                // Para checkout tradicional: mostrar modal de confirmación
                const checkoutPayload: OrderData = {
                    customer: {
                        email: formData.email,
                        fullName: formData.fullName,
                        phone: formData.phone
                    },
                    shipping: {
                        method: formData.shippingMethod,
                        address: formData.addressText || formData.address,
                        city: formData.city,
                        cost: shipping
                    },
                    payment: {
                        method: formData.paymentMethod,
                        notes: formData.notes
                    },
                    items: state.items,
                    totals: { subtotal, shipping, total },
                    currency: currency,
                    checkoutMethod: 'traditional'
                };
                
                console.log('Checkout tradicional:', checkoutPayload);
                
                // Mostrar modal de confirmación
                console.log('🚀 Mostrando modal de confirmación...');
                setIsSubmitting(false);
                
                // Limpiar carrito y mostrar modal de confirmación
                clearCart();
                
                // Llamar función para mostrar modal de confirmación
                if (onShowConfirmation) {
                    onShowConfirmation(checkoutPayload);
                } else {
                    // Fallback si no se pasa la función
                    onSuccess();
                    onClose();
                }
            }
            
        } catch (error) {
            console.error('[Checkout] Error durante el proceso:', error);
            // 🛡️ SEGURIDAD: No romper el flujo si falla el guardado
            alert('Hubo un problema al procesar el pedido. Tu pedido puede haberse guardado, por favor contacta a la tienda para confirmar.');
            setIsSubmitting(false);
        }
    };

    const handleSubmit = async () => {
        if (!validateStep(3)) return;
        
        setIsSubmitting(true);
        
        try {
            // 📊 STOCK VALIDATION con Feature Flag - Logging extendido (no afecta el flujo)
            try {
                console.log('📦 [Stock Validation] Iniciando validación con feature flags...');
                
                // Obtener configuración de stock para la tienda
                const stockConfig = await getStoreStockConfig(storeId || '');
                logStockConfig(storeId || 'unknown', stockConfig);
                
                // Verificar si debe ejecutarse la validación según feature flag
                const shouldValidate = shouldValidateStock(stockConfig.validation || { enabled: false, blockOnUnavailable: false, logOnly: true, showWarnings: false });
                
                console.log('🎛️ [Stock Validation] Feature flag status:', {
                    shouldValidate,
                    config: stockConfig.validation
                });
                
                // Ejecutar validación (actualmente siempre se ejecuta para logging)
                const stockValidation = await validateCartStock(state.items);
                logStockValidation(stockValidation);
                
                // Log adicional con información del feature flag
                console.log('📊 [Stock Validation] Resultado detallado con config:', {
                    totalItems: stockValidation.items.length,
                    allAvailable: stockValidation.allAvailable,
                    unavailableCount: stockValidation.unavailableItems.length,
                    itemsWithStock: stockValidation.items.filter(item => item.manageStock).length,
                    itemsWithoutStock: stockValidation.items.filter(item => !item.manageStock).length,
                    // Nueva información de feature flags
                    featureFlags: {
                        validationEnabled: stockConfig.validation?.enabled,
                        wouldBlock: stockConfig.validation?.blockOnUnavailable && !stockConfig.validation?.logOnly,
                        wouldShowWarning: stockConfig.validation?.showWarnings,
                        logOnly: stockConfig.validation?.logOnly
                    }
                });
                
                // 🚀 NUEVA LÓGICA: Mostrar advertencias según feature flag
                if (!stockValidation.allAvailable && shouldValidate) {
                    const shouldWarn = shouldShowWarnings(stockConfig.validation || { enabled: false, blockOnUnavailable: false, logOnly: true, showWarnings: false });
                    const shouldBlock = stockConfig.validation?.blockOnUnavailable && !stockConfig.validation?.logOnly;
                    
                    console.log('🚧 [Stock Validation] Acción a tomar:', {
                        shouldWarn,
                        shouldBlock,
                        action: shouldBlock ? 'BLOCK' : shouldWarn ? 'WARN' : 'LOG_ONLY',
                        unavailableItems: stockValidation.unavailableItems.length
                    });
                    
                    // Si debe mostrar advertencias, mostrar modal y return early
                    if (shouldWarn && stockValidation.unavailableItems.length > 0) {
                        console.log('⚠️ [Stock Validation] Mostrando modal de advertencia');
                        setStockWarningItems(stockValidation.unavailableItems);
                        setShowStockWarning(true);
                        setIsSubmitting(false); // Detener el loading
                        return; // No continuar con el checkout hasta que el usuario decida
                    }
                    
                    // Si debe bloquear completamente (futuro)
                    if (shouldBlock) {
                        console.log('🛑 [Stock Validation] Bloquearía checkout (no implementado aún)');
                        // FUTURO: Implementar bloqueo total
                    }
                }
                
            } catch (stockError) {
                console.warn('⚠️ [Stock Validation] Error en validación (continuando normal):', stockError);
            }
            
            // 💳 DETECCIÓN DE MÉTODO DE PAGO (solo logging por ahora)
            console.log('💳 [Payment Method] Método seleccionado:', formData.paymentMethod);
            
            if (formData.paymentMethod === 'mercadopago') {
                console.log('🔔 [MercadoPago] Usuario seleccionó MercadoPago!');
                console.log('🔔 [MercadoPago] Config disponible:', {
                    enabled: checkoutConfig?.payments?.mercadopago?.enabled,
                    publicKey: checkoutConfig?.payments?.mercadopago?.publicKey ? 'PRESENTE' : 'FALTANTE',
                    accessToken: checkoutConfig?.payments?.mercadopago?.accessToken ? 'PRESENTE' : 'FALTANTE',
                    environment: checkoutConfig?.payments?.mercadopago?.environment
                });
                
                // 🚀 BIFURCACIÓN: No continuar con flujo normal, ir a MercadoPago
                console.log('🔔 [MercadoPago] Iniciando flujo de pago MercadoPago (NO flujo normal)');
                
                // Validar configuración de MercadoPago
                const mpConfig = checkoutConfig?.payments?.mercadopago;
                if (!mpConfig) {
                    console.error('🔔 [MercadoPago] Error: No hay configuración disponible');
                    alert('Error: Configuración de MercadoPago no disponible');
                    setIsSubmitting(false);
                    return;
                }
                
                const validation = validateMercadoPagoConfig(mpConfig);
                if (validation !== true) {
                    console.error('🔔 [MercadoPago] Error de configuración:', validation);
                    alert(`Error de configuración MercadoPago: ${validation}`);
                    setIsSubmitting(false);
                    return;
                }
                
                try {
                    // Preparar datos del pedido para MercadoPago
                    console.log('🔔 [MercadoPago] Preparando datos del pedido...');
                    
                    const orderData: OrderData = {
                        items: state.items,
                        customer: {
                            fullName: formData.fullName || 'Cliente',
                            email: formData.email || '',
                            phone: formData.phone || ''
                        },
                        totals: {
                            subtotal,
                            shipping: shipping || 0,
                            total: total || subtotal + (shipping || 0)
                        },
                        currency: 'COP',
                        shipping: {
                            method: formData.shippingMethod as 'standard' | 'express' | 'pickup',
                            address: formData.address,
                            city: formData.city,
                            cost: shipping || 0,
                            ...(selectedLocation && { pickupLocation: selectedLocation })
                        },
                        payment: {
                            method: 'mercadopago',
                            notes: formData.notes
                        },
                        checkoutMethod: 'traditional' as const,
                        discount: discount || 0,
                        ...(formData.appliedCoupon && { appliedCoupon: formData.appliedCoupon })
                    };
                    
                    // Convertir a preferencia MercadoPago
                    console.log('🔔 [MercadoPago] Convirtiendo a preferencia MercadoPago...');
                    const preference = orderDataToPreference(orderData, mpConfig);
                    
                    // Crear preferencia en MercadoPago
                    console.log('🔔 [MercadoPago] Creando preferencia en MercadoPago...');
                    const preferenceResult = await createPreference(preference, mpConfig);
                    
                    // Obtener URL de inicialización
                    const initUrl = getInitPoint(preferenceResult, mpConfig.environment);
                    
                    console.log('🔔 [MercadoPago] Preferencia creada exitosamente:', {
                        preferenceId: preferenceResult.id,
                        initUrl: initUrl.substring(0, 50) + '...',
                        environment: mpConfig.environment
                    });
                    
                    // Redireccionar a MercadoPago
                    console.log('🔔 [MercadoPago] Redirigiendo a página de pago...');
                    window.location.href = initUrl;
                    
                } catch (error) {
                    console.error('🔔 [MercadoPago] Error al crear preferencia:', error);
                    alert('Error al procesar el pago con MercadoPago. Por favor intenta de nuevo.');
                    setIsSubmitting(false);
                }
                
                return; // ← IMPORTANTE: NO continuar con processCheckoutFlow()
            }
            
            // Solo ejecutar flujo normal si NO es MercadoPago
            console.log('💳 [Payment Method] Continuando con flujo tradicional...');
            await processCheckoutFlow();
            
        } catch (error) {
            console.error('[Checkout] Error durante handleSubmit:', error);
            alert('Hubo un problema al procesar el pedido. Por favor inténtalo de nuevo.');
            setIsSubmitting(false);
        }
    };


    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div className="nbd-checkout-backdrop" onClick={onClose}></div>
            
            {/* Modal de checkout */}
            <div className="nbd-checkout-modal">
                {/* Header */}
                <div className="nbd-checkout-header">
                    <div className="nbd-checkout-progress">
                        <div className="nbd-progress-steps">
                            {[1, 2, 3].map((step) => (
                                <div 
                                    key={step}
                                    className={`nbd-progress-step ${
                                        step === currentStep ? 'active' : 
                                        step < currentStep ? 'completed' : ''
                                    }`}
                                >
                                    <div className="nbd-step-circle">
                                        {step < currentStep ? (
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        ) : (
                                            <span>{step}</span>
                                        )}
                                    </div>
                                    <span className="nbd-step-label">
                                        {step === 1 && t('information')}
                                        {step === 2 && t('shipping')}
                                        {step === 3 && t('payment')}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="nbd-checkout-close"
                        aria-label={t('closeCheckout')}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="nbd-checkout-content">
                    <div className="nbd-checkout-main">
                        <div className="nbd-checkout-form">
                            {/* Paso 1: Información personal */}
                            {currentStep === 1 && (
                            <div className="nbd-checkout-step">
                                <h3 className="nbd-step-title">{t('contactInformation')}</h3>
                                <div className="nbd-form-grid">
                                    <div className="nbd-form-group nbd-form-group--full">
                                        <label className="nbd-form-label">{t('fullName')} *</label>
                                        <input
                                            type="text"
                                            className="nbd-form-input"
                                            value={formData.fullName}
                                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                                            placeholder={t('fullNamePlaceholder')}
                                            required
                                        />
                                    </div>
                                    <div className="nbd-form-group nbd-form-group--full">
                                        <label className="nbd-form-label">{t('email')} *</label>
                                        <input
                                            type="email"
                                            className="nbd-form-input"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            placeholder={t('emailPlaceholder')}
                                            required
                                        />
                                    </div>
                                    <div className="nbd-form-group nbd-form-group--full">
                                        <label className="nbd-form-label">{t('phone')} *</label>
                                        <input
                                            type="tel"
                                            className="nbd-form-input"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            placeholder={t('phonePlaceholder')}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Paso 2: Envío */}
                        {currentStep === 2 && (
                            <div className="nbd-checkout-step">
                                <h3 className="nbd-step-title">{t('shippingMethod')}</h3>
                                
                                {/* Opciones de envío */}
                                <div className="nbd-method-section">
                                    <div className="nbd-method-options">
                                        {/* Opción de recojo en tienda - solo si está habilitada */}
                                        {shippingConfig?.storePickup?.enabled && (
                                            <label className={`nbd-method-option ${formData.shippingMethod === 'pickup' ? 'selected' : ''}`}>
                                                <input
                                                    type="radio"
                                                    name="shipping"
                                                    value="pickup"
                                                    checked={formData.shippingMethod === 'pickup'}
                                                    onChange={(e) => handleInputChange('shippingMethod', e.target.value as any)}
                                                />
                                                <div className="nbd-method-content">
                                                    <div className="nbd-method-info">
                                                        <span className="nbd-method-name">{t('pickupInStore')}</span>
                                                        <span className="nbd-method-desc">
                                                            {selectedLocation?.preparationTime || 'Tiempo por calcular'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </label>
                                        )}
                                        <label className={`nbd-method-option ${formData.shippingMethod === 'standard' ? 'selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name="shipping"
                                                value="standard"
                                                checked={formData.shippingMethod === 'standard'}
                                                onChange={(e) => handleInputChange('shippingMethod', e.target.value as any)}
                                            />
                                            <div className="nbd-method-content">
                                                <div className="nbd-method-info">
                                                    <span className="nbd-method-name">{t('homeDelivery')}</span>
                                                    <span className="nbd-method-desc">Tiempo por calcular</span>
                                                </div>
                                            </div>
                                        </label>
                                        {/* Envío express - solo si está habilitado */}
                                        {shippingConfig?.localDelivery?.express?.enabled && (
                                            <label className={`nbd-method-option ${formData.shippingMethod === 'express' ? 'selected' : ''}`}>
                                                <input
                                                    type="radio"
                                                    name="shipping"
                                                    value="express"
                                                    checked={formData.shippingMethod === 'express'}
                                                    onChange={(e) => handleInputChange('shippingMethod', e.target.value as any)}
                                                />
                                                <div className="nbd-method-content">
                                                    <div className="nbd-method-info">
                                                        <span className="nbd-method-name">{t('expressShipping')}</span>
                                                        <span className="nbd-method-desc">
                                                            {shippingConfig.localDelivery.express.estimatedTime || t('businessDays1to2')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </label>
                                        )}
                                    </div>
                                </div>

                                {/* Selección de sucursal (solo si es recojo en tienda) */}
                                {formData.shippingMethod === 'pickup' && shippingConfig?.storePickup?.locations && (
                                    <div style={{ marginTop: 'var(--nbd-space-xl)' }}>
                                        <div className="nbd-form-group nbd-form-group--full">
                                            <label className="nbd-form-label">
                                                {shippingConfig.storePickup.locations.length > 1 ? 'Selecciona sucursal *' : 'Sucursal para recojo'}
                                            </label>
                                            {shippingConfig.storePickup.locations.length > 1 && !selectedLocation && (
                                                <p className="nbd-form-hint" style={{ 
                                                    fontSize: '12px', 
                                                    color: '#ef4444', 
                                                    marginTop: '4px',
                                                    marginBottom: '8px'
                                                }}>
                                                    Debes seleccionar una sucursal para continuar
                                                </p>
                                            )}
                                            
                                            <div className="nbd-locations-list" style={{ marginTop: 'var(--nbd-space-md)' }}>
                                                {shippingConfig.storePickup.locations.map((location) => (
                                                    <div 
                                                        key={location.id} 
                                                        className={`nbd-location-option ${selectedLocation?.id === location.id ? 'selected' : ''}`}
                                                        onClick={() => setSelectedLocation(location)}
                                                        style={{
                                                            border: '1px solid #e5e7eb',
                                                            borderRadius: '8px',
                                                            padding: '16px',
                                                            marginBottom: '12px',
                                                            cursor: 'pointer',
                                                            backgroundColor: selectedLocation?.id === location.id ? '#f9fafb' : 'white',
                                                            borderColor: selectedLocation?.id === location.id ? '#374151' : '#e5e7eb',
                                                            transition: 'all 0.2s ease'
                                                        }}
                                                    >
                                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                                                            {/* Radio button indicator */}
                                                            <div style={{ 
                                                                width: '16px', 
                                                                height: '16px', 
                                                                border: '2px solid #d1d5db',
                                                                borderRadius: '50%',
                                                                marginTop: '2px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                borderColor: selectedLocation?.id === location.id ? '#374151' : '#d1d5db'
                                                            }}>
                                                                {selectedLocation?.id === location.id && (
                                                                    <div style={{
                                                                        width: '8px',
                                                                        height: '8px',
                                                                        backgroundColor: '#374151',
                                                                        borderRadius: '50%'
                                                                    }}></div>
                                                                )}
                                                            </div>
                                                            
                                                            {/* Location info */}
                                                            <div style={{ flex: 1 }}>
                                                                <h4 style={{ 
                                                                    fontSize: '14px', 
                                                                    fontWeight: '500', 
                                                                    color: '#111827',
                                                                    margin: '0 0 4px 0'
                                                                }}>
                                                                    {location.name}
                                                                </h4>
                                                                
                                                                {location.address && (
                                                                    <p style={{ 
                                                                        fontSize: '13px', 
                                                                        color: '#6b7280',
                                                                        margin: '0 0 8px 0',
                                                                        lineHeight: '1.4'
                                                                    }}>
                                                                        {location.address}
                                                                    </p>
                                                                )}
                                                                
                                                                {location.preparationTime && (
                                                                    <p style={{ 
                                                                        fontSize: '12px', 
                                                                        color: '#6b7280',
                                                                        margin: '0 0 8px 0'
                                                                    }}>
                                                                        Listo en: {location.preparationTime}
                                                                    </p>
                                                                )}
                                                                
                                                                {location.schedules && location.schedules.length > 0 && (
                                                                    <div style={{ marginTop: '8px' }}>
                                                                        <p style={{ 
                                                                            fontSize: '12px', 
                                                                            color: '#6b7280',
                                                                            margin: '0 0 4px 0',
                                                                            fontWeight: '500'
                                                                        }}>
                                                                            Horarios:
                                                                        </p>
                                                                        <div style={{ fontSize: '11px', color: '#6b7280' }}>
                                                                            {location.schedules.map((schedule, index) => (
                                                                                <div 
                                                                                    key={index} 
                                                                                    style={{ 
                                                                                        display: 'flex', 
                                                                                        justifyContent: 'space-between',
                                                                                        alignItems: 'center',
                                                                                        marginBottom: '2px',
                                                                                        minHeight: '16px'
                                                                                    }}
                                                                                >
                                                                                    <span style={{ flex: '0 0 auto' }}>
                                                                                        {formatDayName(schedule.day)}:
                                                                                    </span>
                                                                                    <span style={{ 
                                                                                        flex: '1 1 auto', 
                                                                                        textAlign: 'right',
                                                                                        marginLeft: '8px'
                                                                                    }}>
                                                                                        {formatTime(schedule.openTime)} - {formatTime(schedule.closeTime)}
                                                                                    </span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Dirección (solo si no es recojo en tienda) */}
                                {formData.shippingMethod !== 'pickup' && (
                                    <div style={{ marginTop: 'var(--nbd-space-xl)' }}>
                                        <div className="nbd-form-group nbd-form-group--full">
                                            <div className="nbd-address-header">
                                                <label className="nbd-form-label">{t('shippingAddress')} *</label>
                                                <button
                                                    type="button"
                                                    onClick={getUserLocation}
                                                    disabled={gettingLocation}
                                                    className="nbd-location-btn"
                                                    title={t('getMyLocation')}
                                                >
                                                    {gettingLocation ? (
                                                        <>
                                                            <div className="nbd-location-spinner"></div>
                                                            {t('getting')}
                                                        </>
                                                                                                            ) : (
                                                            <>
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path 
                                                                        d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" 
                                                                        stroke="currentColor" 
                                                                        strokeWidth="2"
                                                                        fill="none"
                                                                    />
                                                                    <circle 
                                                                        cx="12" 
                                                                        cy="10" 
                                                                        r="3" 
                                                                        stroke="currentColor" 
                                                                        strokeWidth="2"
                                                                        fill="none"
                                                                    />
                                                                </svg>
                                                                {t('getMyLocation')}
                                                            </>
                                                        )}
                                                </button>
                                            </div>
                                            <div className="nbd-address-input-container">
                                                <input
                                                    ref={autocompleteRef}
                                                    type="text"
                                                    className="nbd-form-input nbd-address-input"
                                                    value={formData.address}
                                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                                    onKeyPress={handleAddressKeyPress}
                                                    placeholder={t('shippingAddressPlaceholder')}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => handleDirectGeocoding(formData.address)}
                                                    disabled={!formData.address.trim()}
                                                    className="nbd-search-btn"
                                                    title={t('searchAddress')}
                                                >
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                                                        <path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2"/>
                                                    </svg>
                                                </button>
                                            </div>



                                            {/* Sugerencia de dirección */}
                                            {showAddressSuggestion && suggestedAddress && (
                                                <div className="nbd-address-suggestion">
                                                    <div className="nbd-suggestion-content">
                                                        <div className="nbd-suggestion-icon">📍</div>
                                                        <div className="nbd-suggestion-text">
                                                            <p className="nbd-suggestion-label">{t('suggestedAddressLabel')}</p>
                                                            <p className="nbd-suggestion-address">{suggestedAddress}</p>
                                                        </div>
                                                    </div>
                                                    <div className="nbd-suggestion-actions">
                                                        <button
                                                            type="button"
                                                            onClick={acceptSuggestedAddress}
                                                            className="nbd-suggestion-btn nbd-suggestion-btn--accept"
                                                        >
                                                            Usar esta dirección
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={rejectSuggestedAddress}
                                                            className="nbd-suggestion-btn nbd-suggestion-btn--reject"
                                                        >
                                                            Mantener la mía
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                        </div>

                                        {/* Mapa interactivo - Simplificado: siempre visible cuando hay ubicación */}
                                        {(() => {
                                            const hasCoordinates = !!(userCoordinates || (formData.lat && formData.lng));
                                            const hasAddress = !!(formData.address && formData.address.length > 5);
                                            const shouldShowMap = hasCoordinates || hasAddress;
                                            const isMobileDevice = typeof window !== 'undefined' && window.innerWidth <= 768;
                                            
                                            console.log('🗺️ [Simple Map] Should show:', shouldShowMap, {
                                                userCoordinates,
                                                formData: { lat: formData.lat, lng: formData.lng, address: formData.address },
                                                hasCoordinates,
                                                hasAddress,
                                                isMobileDevice,
                                                isGoogleMapsLoaded,
                                                mapExists: !!map,
                                                mapRefExists: !!mapRef.current,
                                                windowWidth: typeof window !== 'undefined' ? window.innerWidth : 'N/A',
                                                userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'N/A'
                                            });
                                            
                                            if (!shouldShowMap) return null;
                                            
                                            return (
                                                <div className="nbd-map-container">
                                                    <div className="nbd-map-header">
                                                        <h4>📍 {t('yourLocation')}</h4>
                                                        <p>{t('dragMarker')}</p>
                                                        {isMobileDevice && !isGoogleMapsLoaded && (
                                                            <div className="nbd-mobile-map-status">
                                                                <small style={{ color: '#666', fontSize: '12px' }}>
                                                                    🔄 Cargando mapa para móvil...
                                                                </small>
                                                            </div>
                                                        )}
                                                        
                                                        {/* Mensaje de zona no cubierta */}
                                                        {isOutsideCoverage && (() => {
                                                            const isWhatsAppCheckout = checkoutConfig?.checkout?.method === 'whatsapp';
                                                            const canContinue = isWhatsAppCheckout;
                                                            
                                                            return (
                                                                <div style={{
                                                                    marginTop: '12px',
                                                                    padding: '12px',
                                                                    backgroundColor: canContinue ? '#fef3f2' : '#fef2f2',
                                                                    border: canContinue ? '1px solid #fed7d7' : '1px solid #fecaca',
                                                                    borderRadius: '8px'
                                                                }}>
                                                                    <div style={{
                                                                        display: 'flex',
                                                                        alignItems: 'flex-start',
                                                                        gap: '8px'
                                                                    }}>
                                                                        <span style={{ fontSize: '16px' }}>
                                                                            {canContinue ? '⚠️' : '🚫'}
                                                                        </span>
                                                                        <div>
                                                                            <div style={{ 
                                                                                color: canContinue ? '#dc2626' : '#dc2626', 
                                                                                fontSize: '14px',
                                                                                fontWeight: '500',
                                                                                marginBottom: '4px'
                                                                            }}>
                                                                                {shippingConfig?.localDelivery?.noCoverageMessage || "Lo sentimos, no hacemos entregas en tu zona"}
                                                                            </div>
                                                                            {canContinue ? (
                                                                                <div style={{ 
                                                                                    color: 'var(--nbd-success, #059669)', 
                                                                                    fontSize: '12px',
                                                                                    fontWeight: '500'
                                                                                }}>
                                                                                    ✅ Puedes continuar - Se coordinará por WhatsApp
                                                                                </div>
                                                                            ) : (
                                                                                <div style={{ 
                                                                                    color: '#dc2626', 
                                                                                    fontSize: '12px'
                                                                                }}>
                                                                                    ❌ No se puede procesar automáticamente
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })()}
                                                    </div>
                                                    <div ref={mapRef} className="nbd-map">
                                                        {isMobileDevice && !map && !isGoogleMapsLoaded && (
                                                            <div style={{
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                height: '100%',
                                                                background: '#f5f5f5',
                                                                color: '#666',
                                                                fontSize: '14px',
                                                                textAlign: 'center',
                                                                padding: '20px'
                                                            }}>
                                                                <div>
                                                                    <div>🗺️</div>
                                                                    <div>{t('loadingMap')}</div>
                                                                    <small>{t('checkConnection')}</small>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Paso 3: Pago */}
                        {currentStep === 3 && (
                            <div className="nbd-checkout-step">
                                <h3 className="nbd-step-title">{t('paymentMethod')}</h3>
                                
                                {/* Método de pago */}
                                <div className="nbd-method-section">
                                    <h4 className="nbd-method-title">{t('choosePayment')}</h4>
                                    <div className="nbd-method-options">
                                        {getAvailablePaymentMethods().map((method) => (
                                            <label key={method.id} className={`nbd-method-option ${formData.paymentMethod === method.id ? 'selected' : ''}`}>
                                                <input
                                                    type="radio"
                                                    name="payment"
                                                    value={method.id}
                                                    checked={formData.paymentMethod === method.id}
                                                    onChange={(e) => handleInputChange('paymentMethod', e.target.value as any)}
                                                />
                                                <div className="nbd-method-content">
                                                    <div className="nbd-method-info">
                                                        <span className="nbd-method-name">{method.name}</span>
                                                        <span className="nbd-method-desc">{method.description}</span>
                                                    </div>
                                                    <div className="nbd-method-icon">
                                                        {method.imageUrl ? (
                                                            <img 
                                                                src={method.imageUrl} 
                                                                alt={method.name}
                                                                style={{
                                                                    width: '32px',
                                                                    height: '32px',
                                                                    objectFit: 'contain'
                                                                }}
                                                                onError={(e) => {
                                                                    // Fallback si no carga la imagen
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.style.display = 'none';
                                                                    target.parentElement!.innerHTML = '<div style="width: 32px; height: 32px; background: #f3f4f6; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 16px;">💳</div>';
                                                                }}
                                                            />
                                                        ) : (
                                                            <BankIcon />
                                                        )}
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Cupón de descuento */}
                                <div className="nbd-form-group nbd-form-group--full">
                                    <label className="nbd-form-label">{t('discount')}</label>
                                    
                                    {!formData.appliedCoupon ? (
                                        <div>
                                            <div className="nbd-coupon-input-group">
                                                <input
                                                    type="text"
                                                    className="nbd-form-input nbd-coupon-input"
                                                    value={formData.couponCode}
                                                    onChange={(e) => handleInputChange('couponCode', e.target.value.toUpperCase())}
                                                    placeholder={t('discountPlaceholder')}
                                                    disabled={validatingCoupon}
                                                />
                                                <button
                                                    type="button"
                                                    className="nbd-btn nbd-btn--secondary nbd-coupon-apply-btn"
                                                    onClick={handleValidateCoupon}
                                                    disabled={validatingCoupon || !formData.couponCode.trim()}
                                                >
                                                    {validatingCoupon ? (isMobile() ? t('validatingShort') : t('validating')) : t('apply')}
                                                </button>
                                            </div>
                                            
                                            {couponError && (
                                                <div className="nbd-coupon-error">
                                                    {couponError}
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '12px',
                                            backgroundColor: '#f8f9fa',
                                            border: '1px solid #e9ecef',
                                            borderRadius: '6px',
                                            fontSize: '14px'
                                        }}>
                                            <span style={{ color: '#6c757d' }}>
                                                Cupón <strong style={{ color: '#495057' }}>{formData.appliedCoupon.code}</strong> aplicado
                                            </span>
                                            <button
                                                type="button"
                                                onClick={handleRemoveCoupon}
                                                style={{
                                                    background: 'none',
                                                    border: 'none',
                                                    color: '#6c757d',
                                                    fontSize: '13px',
                                                    cursor: 'pointer',
                                                    textDecoration: 'underline',
                                                    padding: '0'
                                                }}
                                            >
                                                Quitar
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Notas adicionales */}
                                <div className="nbd-form-group nbd-form-group--full" style={{ marginTop: '20px' }}>
                                    <label className="nbd-form-label">{t('additionalNotes')}</label>
                                    <textarea
                                        className="nbd-form-textarea"
                                        value={formData.notes}
                                        onChange={(e) => handleInputChange('notes', e.target.value)}
                                        placeholder={t('notesPlaceholder')}
                                        rows={3}
                                    />
                                </div>
                            </div>
                        )}
                        </div>

                        {/* Sidebar con resumen */}
                        <div className="nbd-checkout-sidebar">
                            <h4 className="nbd-summary-title">{t('orderSummary')}</h4>
                            
                            {/* Lista de productos */}
                            <div className="nbd-summary-items">
                                {state.items.map((item) => (
                                    <div key={item.id} className="nbd-summary-item">
                                        <div className="nbd-summary-item-image">
                                            {item.image ? (
                                                <img 
                                                    src={toCloudinarySquare(item.image, 60)} 
                                                    alt={item.name}
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="nbd-summary-item-placeholder">
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="1.5"/>
                                                        <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
                                                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" strokeWidth="1.5"/>
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="nbd-summary-item-info">
                                            <span className="nbd-summary-item-name">{item.name}</span>
                                            {item.variant && (
                                                <span className="nbd-summary-item-variant">{item.variant.name}</span>
                                            )}
                                            <span className="nbd-summary-item-qty">{t('quantity')} {item.quantity}</span>
                                        </div>
                                        <div className="nbd-summary-item-price">
                                            {formatPrice((item.variant?.price || item.price) * item.quantity, currency)}
                                        </div>
                                    </div>
                                ))}
                            </div>


                            {/* Totales */}
                            <div className="nbd-summary-totals">
                                <div className="nbd-summary-line">
                                    <span>{t('subtotal')}</span>
                                    <span>{formatPrice(subtotal, currency)}</span>
                                </div>
                                <div className="nbd-summary-line">
                                    <span>{t('shipping')}</span>
                                    <span>
                                        {(() => {
                                            if (formData.shippingMethod === 'pickup') {
                                                return formatPrice(0, currency);
                                            }
                                            
                                            if (!userCoordinates) {
                                                return t('provideLocation');
                                            }
                                            
                                            if (isOutsideCoverage) {
                                                const isWhatsAppCheckout = checkoutConfig?.checkout?.method === 'whatsapp';
                                                return isWhatsAppCheckout ? 'A coordinar' : '--';
                                            }
                                            
                                            return formatPrice(shipping, currency);
                                        })()}
                                    </span>
                                </div>
                                {formData.appliedCoupon && discount > 0 && (
                                    <div className="nbd-summary-line nbd-summary-discount">
                                        <span>
                                            Descuento ({formData.appliedCoupon.code})
                                        </span>
                                        <span className="nbd-discount-amount">
                                            -{formatPrice(discount, currency)}
                                        </span>
                                    </div>
                                )}
                                <div className="nbd-summary-line nbd-summary-total">
                                    <span>
                                        {isOutsideCoverage ? 'Subtotal' : t('total')}
                                        {isOutsideCoverage && (
                                            <small style={{ 
                                                display: 'block',
                                                fontSize: '11px',
                                                color: '#666',
                                                fontWeight: 'normal'
                                            }}>
                                                (envío a coordinar)
                                            </small>
                                        )}
                                    </span>
                                    <span>{formatPrice(total, currency)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer con navegación */}
                <div className="nbd-checkout-footer">
                    <div className="nbd-checkout-actions">
                        {currentStep > 1 && (
                            <button 
                                onClick={prevStep}
                                className="nbd-btn nbd-btn--ghost"
                                style={{ touchAction: 'manipulation' }}
                            >
                                ← {t('previous')}
                            </button>
                        )}
                        <div className="nbd-checkout-actions-right">
                            {currentStep < 3 ? (
                                <button 
                                    onClick={nextStep}
                                    disabled={!validateStep(currentStep)}
                                    className={`nbd-btn nbd-btn--primary ${!validateStep(currentStep) ? 'nbd-btn--disabled' : ''}`}
                                    style={{ touchAction: 'manipulation' }}
                                >
                                    {t('next')} →
                                </button>
                            ) : (
                                (() => {
                                    const isWhatsAppCheckout = checkoutConfig?.checkout?.method === 'whatsapp';
                                    return (
                                        <button 
                                            onClick={handleSubmit}
                                            disabled={isSubmitting || !validateStep(currentStep)}
                                            className={`nbd-btn nbd-checkout-submit ${(isSubmitting || !validateStep(currentStep)) ? 'nbd-btn--disabled' : ''} ${
                                                isWhatsAppCheckout ? 'nbd-btn--whatsapp' : 'nbd-btn--primary'
                                            }`}
                                            style={{
                                                touchAction: 'manipulation',
                                                ...(isWhatsAppCheckout ? {
                                                    backgroundColor: '#25D366',
                                                    borderColor: '#25D366',
                                                    color: 'white'
                                                } : {})
                                            }}
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <div className="nbd-loading-spinner"></div>
                                                    {isWhatsAppCheckout ? 'Enviando...' : 
                                                     formData.paymentMethod === 'mercadopago' ? 'Procesando pago...' : 
                                                     t('processing')}
                                                </>
                                            ) : (
                                                <>
                                                    {isWhatsAppCheckout && (
                                                        <svg 
                                                            width="20" 
                                                            height="20" 
                                                            viewBox="0 0 24 24" 
                                                            fill="currentColor"
                                                            style={{ marginRight: '8px' }}
                                                        >
                                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516"/>
                                                        </svg>
                                                    )}
                                                    {isWhatsAppCheckout ? 'Enviar por WhatsApp' : 
                                                     formData.paymentMethod === 'mercadopago' ? 'Ir al pago' : 
                                                     t('confirmOrder')}
                                                </>
                                            )}
                                        </button>
                                    );
                                })()
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de advertencia de stock - NO CONECTADO AÚN */}
            <StockWarningModal
                isOpen={showStockWarning}
                onClose={() => {
                    console.log('🔒 [Stock Warning] Modal cerrado por usuario');
                    setShowStockWarning(false);
                }}
                onContinue={() => {
                    console.log('✅ [Stock Warning] Usuario decidió continuar con checkout');
                    setShowStockWarning(false);
                    // Continuar con el checkout - llamar el resto de handleSubmit
                    continueCheckoutAfterWarning();
                }}
                unavailableItems={stockWarningItems}
                currency={currency}
            />

        </>
    );
}
