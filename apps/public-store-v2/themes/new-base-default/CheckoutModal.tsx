'use client';

import { useState, useEffect, useRef } from 'react';
import { useCart, CartItem } from '../../lib/cart-context';
import { formatPrice } from '../../lib/currency';
import { toCloudinarySquare } from '../../lib/images';
import { useStoreLanguage } from '../../lib/store-language-context';
import { StoreBasicInfo } from '../../lib/store';
import { googleMapsLoader } from '../../lib/google-maps';
import { 
    getStoreDeliveryZones, 
    calculateShippingCost, 
    DeliveryZone,
    findDeliveryZoneForCoordinates 
} from '../../lib/delivery-zones';

interface CheckoutData {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    city: string;
    zipCode: string;
    shippingMethod: 'standard' | 'express' | 'pickup';
    paymentMethod: 'cash' | 'transfer' | 'card';
    notes: string;
}

interface CheckoutModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    storeInfo?: StoreBasicInfo | null;
    storeId?: string;
}

export default function CheckoutModal({ isOpen, onClose, onSuccess, storeInfo, storeId }: CheckoutModalProps) {
    

    const { state, clearCart } = useCart();
    const { t } = useStoreLanguage();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
    const autocompleteRef = useRef<HTMLInputElement>(null);
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [marker, setMarker] = useState<google.maps.Marker | null>(null);
    const [showMap, setShowMap] = useState(false);
    const [gettingLocation, setGettingLocation] = useState(false);
    const [userCoordinates, setUserCoordinates] = useState<{lat: number; lng: number} | null>(null);
    const [deliveryZones, setDeliveryZones] = useState<DeliveryZone[]>([]);
    const [loadingZones, setLoadingZones] = useState(false);
    const [shippingCost, setShippingCost] = useState(0);
    const [formData, setFormData] = useState<CheckoutData>({
        email: '',
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        city: '',
        zipCode: '',
        shippingMethod: 'standard',
        paymentMethod: 'cash',
        notes: ''
    });

    // Obtener moneda de la tienda
    const currency = storeInfo?.currency || 'PEN';
    
    // Calcular costos usando zonas de entrega
    const subtotal = state.totalPrice;
    const shipping = formData.shippingMethod === 'pickup' ? 0 : shippingCost;
    const total = subtotal + shipping;

    // Calcular y actualizar costo de envío
    useEffect(() => {
        if (formData.shippingMethod === 'pickup') {
            setShippingCost(0);
            return;
        }

        // Calcular costo si hay coordenadas (con o sin zonas configuradas)
        if (userCoordinates) {
            const calculatedShipping = calculateShippingCost(userCoordinates, deliveryZones, formData.shippingMethod);
            setShippingCost(calculatedShipping);
        } else {
            setShippingCost(0);
        }
    }, [userCoordinates, deliveryZones, formData.shippingMethod]);

    // Reset al abrir/cerrar
    useEffect(() => {
        if (isOpen) {
            setCurrentStep(1);
            setIsSubmitting(false);
        } else {
            // Limpiar estados al cerrar
            setShowMap(false);
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

    // Cargar Google Maps API usando el loader centralizado (igual que en dashboard)
    useEffect(() => {
        if (isOpen && currentStep === 2 && formData.shippingMethod !== 'pickup') {
            // Verificar si hay API key configurada
            const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
            if (!apiKey) {
                setIsGoogleMapsLoaded(false);
                return;
            }
            
            googleMapsLoader.load()
                .then(() => {
                    setIsGoogleMapsLoaded(true);
                })
                .catch((error: Error) => {
                    // No mostrar error en consola si es problema de configuración
                    setIsGoogleMapsLoaded(false);
                });
        }
    }, [isOpen, currentStep, formData.shippingMethod]);

    // Cleanup del mapa al cerrar el modal o cambiar de método de envío
    useEffect(() => {
        if (!isOpen || formData.shippingMethod === 'pickup') {
            setShowMap(false);
            setMap(null);
            setMarker(null);
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

    const handleInputChange = (field: keyof CheckoutData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
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
            googleMapsLoader.load()
                .then(() => {
                    setIsGoogleMapsLoaded(true);
                    // Una vez cargado, obtener ubicación
                    getLocationAndShowMap();
                })
                .catch((error: Error) => {
                    // Continuar con geolocalización sin mapa
                    getLocationWithoutMap();
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
                
                // Mostrar confirmación simple al usuario
                alert('¡Ubicación confirmada! El costo de envío se ha actualizado.');
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
                setShowMap(true);
                
                // Guardar coordenadas del usuario
                setUserCoordinates({ lat: latitude, lng: longitude });
                
                // Usar setTimeout para asegurar que el DOM esté listo
                setTimeout(() => {
                    initializeMap(latitude, longitude);
                }, 100);
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
                message = 'Debes permitir el acceso a la ubicación para usar esta función. Revisa la configuración de tu navegador.';
                break;
            case error.POSITION_UNAVAILABLE:
                message = 'La información de ubicación no está disponible. Por favor ingresa tu dirección manualmente.';
                break;
            case error.TIMEOUT:
                message = 'Se agotó el tiempo para obtener la ubicación. Intenta de nuevo o ingresa tu dirección manualmente.';
                break;
            default:
                message = 'Ocurrió un error al obtener la ubicación. Por favor ingresa tu dirección manualmente.';
                break;
        }
        alert(message);
    };

    // Inicializar mapa con ubicación
    const initializeMap = (lat: number, lng: number) => {
        if (!mapRef.current || !isGoogleMapsLoaded || !window.google?.maps) {
            console.log('Map initialization skipped:', {
                hasMapRef: !!mapRef.current,
                isGoogleMapsLoaded,
                hasGoogleMaps: !!window.google?.maps
            });
            return;
        }

        console.log('Initializing map at:', lat, lng);

        try {
            const newMap = new window.google.maps.Map(mapRef.current, {
                center: { lat, lng },
                zoom: 16,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                styles: [
                    {
                        featureType: "poi",
                        elementType: "labels",
                        stylers: [{ visibility: "off" }]
                    }
                ]
            });

            const newMarker = new window.google.maps.Marker({
                position: { lat, lng },
                map: newMap,
                draggable: true,
                title: "Arrastra para ajustar tu ubicación exacta"
            });

            // Listener para cuando se mueva el marcador
            newMarker.addListener('dragend', () => {
                const position = newMarker.getPosition();
                if (position) {
                    reverseGeocode(position.lat(), position.lng());
                }
            });

            // Listener para clicks en el mapa
            newMap.addListener('click', (event: google.maps.MapMouseEvent) => {
                if (event.latLng) {
                    newMarker.setPosition(event.latLng);
                    reverseGeocode(event.latLng.lat(), event.latLng.lng());
                }
            });

            // Listener para cuando el mapa esté completamente cargado
            newMap.addListener('idle', () => {
                console.log('Map fully loaded and ready');
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

    // Convertir coordenadas a dirección
    const reverseGeocode = (lat: number, lng: number) => {
        if (!isGoogleMapsLoaded) return;

        // Actualizar coordenadas del usuario
        setUserCoordinates({ lat, lng });

        const geocoder = new window.google.maps.Geocoder();
        geocoder.geocode(
            { location: { lat, lng } },
            (results, status) => {
                if (status === 'OK' && results && results[0]) {
                    const address = results[0].formatted_address;
                    handleInputChange('address', address);
                } else {
                    console.error('Geocoder failed:', status);
                }
            }
        );
    };

    const validateStep = (step: number): boolean => {
        switch (step) {
            case 1:
                return !!(formData.email && formData.firstName && formData.lastName && formData.phone);
            case 2:
                // Para recojo en tienda no necesita dirección
                if (formData.shippingMethod === 'pickup') {
                    return true;
                }
                // Para envío a domicilio o express necesita dirección
                return !!formData.address;
            case 3:
                return !!(formData.paymentMethod); // Método de pago requerido
            default:
                return false;
        }
    };

    const nextStep = () => {
        if (validateStep(currentStep) && currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = async () => {
        if (!validateStep(3)) return;
        
        setIsSubmitting(true);
        
        // Simular proceso de checkout
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Aquí iría la integración real con el sistema de checkout
        console.log('Datos del checkout:', {
            formData,
            items: state.items,
            totals: { subtotal, shipping, total }
        });
        
        clearCart();
        setIsSubmitting(false);
        onSuccess();
        onClose();
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
                                        {step === 1 && 'Información'}
                                        {step === 2 && 'Envío'}
                                        {step === 3 && 'Pago'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="nbd-checkout-close"
                        aria-label="Cerrar checkout"
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
                                <h3 className="nbd-step-title">Información de contacto</h3>
                                <div className="nbd-form-grid">
                                    <div className="nbd-form-group nbd-form-group--full">
                                        <label className="nbd-form-label">Email *</label>
                                        <input
                                            type="email"
                                            className="nbd-form-input"
                                            value={formData.email}
                                            onChange={(e) => handleInputChange('email', e.target.value)}
                                            placeholder="tu@email.com"
                                            required
                                        />
                                    </div>
                                    <div className="nbd-form-group">
                                        <label className="nbd-form-label">Nombre *</label>
                                        <input
                                            type="text"
                                            className="nbd-form-input"
                                            value={formData.firstName}
                                            onChange={(e) => handleInputChange('firstName', e.target.value)}
                                            placeholder="Juan"
                                            required
                                        />
                                    </div>
                                    <div className="nbd-form-group">
                                        <label className="nbd-form-label">Apellido *</label>
                                        <input
                                            type="text"
                                            className="nbd-form-input"
                                            value={formData.lastName}
                                            onChange={(e) => handleInputChange('lastName', e.target.value)}
                                            placeholder="Pérez"
                                            required
                                        />
                                    </div>
                                    <div className="nbd-form-group nbd-form-group--full">
                                        <label className="nbd-form-label">Teléfono *</label>
                                        <input
                                            type="tel"
                                            className="nbd-form-input"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange('phone', e.target.value)}
                                            placeholder="+57 300 123 4567"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Paso 2: Envío */}
                        {currentStep === 2 && (
                            <div className="nbd-checkout-step">
                                <h3 className="nbd-step-title">Método de envío</h3>
                                
                                {/* Opciones de envío */}
                                <div className="nbd-method-section">
                                    <div className="nbd-method-options">
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
                                                    <span className="nbd-method-name">Recojo en tienda</span>
                                                    <span className="nbd-method-desc">Disponible hoy</span>
                                                </div>
                                                <span className="nbd-method-price">Gratis</span>
                                            </div>
                                        </label>
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
                                                    <span className="nbd-method-name">Envío a domicilio</span>
                                                    <span className="nbd-method-desc">3-5 días hábiles</span>
                                                </div>
                                                <span className="nbd-method-price">
                                                    {userCoordinates && deliveryZones.length > 0 ? (
                                                        formData.shippingMethod === 'standard' && shippingCost > 0 ? 
                                                            formatPrice(shippingCost, currency) : 
                                                            userCoordinates ? 'Gratis' : 'Calculando...'
                                                    ) : (
                                                        loadingZones ? 'Cargando...' : 'Usar ubicación'
                                                    )}
                                                </span>
                                            </div>
                                        </label>
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
                                                    <span className="nbd-method-name">Envío Express</span>
                                                    <span className="nbd-method-desc">1-2 días hábiles</span>
                                                </div>

                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Dirección (solo si no es recojo en tienda) */}
                                {formData.shippingMethod !== 'pickup' && (
                                    <div style={{ marginTop: 'var(--nbd-space-xl)' }}>
                                        <div className="nbd-form-group nbd-form-group--full">
                                            <div className="nbd-address-header">
                                                <label className="nbd-form-label">Dirección de envío *</label>
                                                <button
                                                    type="button"
                                                    onClick={getUserLocation}
                                                    disabled={gettingLocation}
                                                    className="nbd-location-btn"
                                                    title="Obtener mi ubicación actual"
                                                >
                                                    {gettingLocation ? (
                                                        <>
                                                            <div className="nbd-location-spinner"></div>
                                                            Obteniendo...
                                                        </>
                                                                                                            ) : (
                                                            <>
                                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <path 
                                                                        d="M21 10C21 17L12 23L3 10C3 5.02944 7.02944 1 12 1C16.9706 1 21 5.02944 21 10Z" 
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
                                                                Usar mi ubicación
                                                            </>
                                                        )}
                                                </button>
                                            </div>
                                            <input
                                                ref={autocompleteRef}
                                                type="text"
                                                className="nbd-form-input"
                                                value={formData.address}
                                                onChange={(e) => handleInputChange('address', e.target.value)}
                                                placeholder="Escribe tu dirección completa..."
                                                required
                                            />

                                        </div>

                                        {/* Mapa interactivo */}
                                        {showMap && (
                                            <div className="nbd-map-container">
                                                <div className="nbd-map-header">
                                                    <h4>📍 Ajusta tu ubicación exacta</h4>
                                                    <p>Arrastra el marcador o haz clic en el mapa para marcar tu ubicación precisa</p>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowMap(false)}
                                                        className="nbd-map-close"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                                <div ref={mapRef} className="nbd-map"></div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Paso 3: Pago */}
                        {currentStep === 3 && (
                            <div className="nbd-checkout-step">
                                <h3 className="nbd-step-title">Método de pago</h3>
                                
                                {/* Método de pago */}
                                <div className="nbd-method-section">
                                    <h4 className="nbd-method-title">Elige cómo quieres pagar</h4>
                                    <div className="nbd-method-options">
                                        <label className={`nbd-method-option ${formData.paymentMethod === 'cash' ? 'selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name="payment"
                                                value="cash"
                                                checked={formData.paymentMethod === 'cash'}
                                                onChange={(e) => handleInputChange('paymentMethod', e.target.value as any)}
                                            />
                                            <div className="nbd-method-content">
                                                <div className="nbd-method-info">
                                                    <span className="nbd-method-name">Pago en efectivo</span>
                                                    <span className="nbd-method-desc">Contraentrega</span>
                                                </div>
                                                <div className="nbd-method-icon">💵</div>
                                            </div>
                                        </label>
                                        <label className={`nbd-method-option ${formData.paymentMethod === 'transfer' ? 'selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name="payment"
                                                value="transfer"
                                                checked={formData.paymentMethod === 'transfer'}
                                                onChange={(e) => handleInputChange('paymentMethod', e.target.value as any)}
                                            />
                                            <div className="nbd-method-content">
                                                <div className="nbd-method-info">
                                                    <span className="nbd-method-name">Transferencia bancaria</span>
                                                    <span className="nbd-method-desc">Envío datos por WhatsApp</span>
                                                </div>
                                                <div className="nbd-method-icon">🏦</div>
                                            </div>
                                        </label>
                                        <label className={`nbd-method-option ${formData.paymentMethod === 'card' ? 'selected' : ''}`}>
                                            <input
                                                type="radio"
                                                name="payment"
                                                value="card"
                                                checked={formData.paymentMethod === 'card'}
                                                onChange={(e) => handleInputChange('paymentMethod', e.target.value as any)}
                                            />
                                            <div className="nbd-method-content">
                                                <div className="nbd-method-info">
                                                    <span className="nbd-method-name">Tarjeta de crédito</span>
                                                    <span className="nbd-method-desc">Visa, Mastercard</span>
                                                </div>
                                                <div className="nbd-method-icon">💳</div>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Notas adicionales */}
                                <div className="nbd-form-group nbd-form-group--full">
                                    <label className="nbd-form-label">Notas adicionales (opcional)</label>
                                    <textarea
                                        className="nbd-form-textarea"
                                        value={formData.notes}
                                        onChange={(e) => handleInputChange('notes', e.target.value)}
                                        placeholder="Instrucciones especiales, horario de entrega, etc."
                                        rows={3}
                                    />
                                </div>
                            </div>
                        )}
                        </div>

                        {/* Sidebar con resumen */}
                        <div className="nbd-checkout-sidebar">
                            <h4 className="nbd-summary-title">Resumen del pedido</h4>
                            
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
                                            <span className="nbd-summary-item-qty">Cantidad: {item.quantity}</span>
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
                                    <span>Subtotal</span>
                                    <span>{formatPrice(subtotal, currency)}</span>
                                </div>
                                <div className="nbd-summary-line">
                                    <span>Envío</span>
                                    <span>
                                        {formData.shippingMethod === 'pickup' ? 'Gratis' : 
                                         userCoordinates ? formatPrice(shipping, currency) : 
                                         'Proporciona tu ubicación'}
                                    </span>
                                </div>
                                <div className="nbd-summary-line nbd-summary-total">
                                    <span>Total</span>
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
                            >
                                ← Anterior
                            </button>
                        )}
                        <div className="nbd-checkout-actions-right">
                            {currentStep < 3 ? (
                                <button 
                                    onClick={nextStep}
                                    disabled={!validateStep(currentStep)}
                                    className={`nbd-btn nbd-btn--primary ${!validateStep(currentStep) ? 'nbd-btn--disabled' : ''}`}
                                >
                                    Siguiente →
                                </button>
                            ) : (
                                <button 
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || !validateStep(currentStep)}
                                    className={`nbd-btn nbd-btn--primary nbd-checkout-submit ${(isSubmitting || !validateStep(currentStep)) ? 'nbd-btn--disabled' : ''}`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="nbd-loading-spinner"></div>
                                            Procesando...
                                        </>
                                    ) : (
                                        'Confirmar pedido'
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
