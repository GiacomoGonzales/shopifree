'use client';

import { useState, useEffect } from 'react';
import { useCart, CartItem } from '../../lib/cart-context';
import { formatPrice } from '../../lib/currency';
import { toCloudinarySquare } from '../../lib/images';
import { useStoreLanguage } from '../../lib/store-language-context';
import { StoreBasicInfo } from '../../lib/store';

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
}

export default function CheckoutModal({ isOpen, onClose, onSuccess, storeInfo }: CheckoutModalProps) {
    const { state, clearCart } = useCart();
    const { t } = useStoreLanguage();
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
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
    
    // Calcular costos
    const subtotal = state.totalPrice;
    const shipping = formData.shippingMethod === 'express' ? 15000 : 
                    formData.shippingMethod === 'pickup' ? 0 : 8000;
    const total = subtotal + shipping;

    // Reset al abrir
    useEffect(() => {
        if (isOpen) {
            setCurrentStep(1);
            setIsSubmitting(false);
        }
    }, [isOpen]);

    const handleInputChange = (field: keyof CheckoutData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const validateStep = (step: number): boolean => {
        switch (step) {
            case 1:
                return !!(formData.email && formData.firstName && formData.lastName && formData.phone);
            case 2:
                return !!(formData.address && formData.city);
            case 3:
                return true; // Métodos de envío y pago siempre válidos (tienen defaults)
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
                                        {step === 2 && 'Dirección'}
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

                        {/* Paso 2: Dirección */}
                        {currentStep === 2 && (
                            <div className="nbd-checkout-step">
                                <h3 className="nbd-step-title">Dirección de envío</h3>
                                <div className="nbd-form-grid">
                                    <div className="nbd-form-group nbd-form-group--full">
                                        <label className="nbd-form-label">Dirección *</label>
                                        <input
                                            type="text"
                                            className="nbd-form-input"
                                            value={formData.address}
                                            onChange={(e) => handleInputChange('address', e.target.value)}
                                            placeholder="Calle 123 #45-67"
                                            required
                                        />
                                    </div>
                                    <div className="nbd-form-group">
                                        <label className="nbd-form-label">Ciudad *</label>
                                        <input
                                            type="text"
                                            className="nbd-form-input"
                                            value={formData.city}
                                            onChange={(e) => handleInputChange('city', e.target.value)}
                                            placeholder="Bogotá"
                                            required
                                        />
                                    </div>
                                    <div className="nbd-form-group">
                                        <label className="nbd-form-label">Código postal</label>
                                        <input
                                            type="text"
                                            className="nbd-form-input"
                                            value={formData.zipCode}
                                            onChange={(e) => handleInputChange('zipCode', e.target.value)}
                                            placeholder="110111"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Paso 3: Métodos */}
                        {currentStep === 3 && (
                            <div className="nbd-checkout-step">
                                <h3 className="nbd-step-title">Entrega y pago</h3>
                                
                                {/* Método de envío */}
                                <div className="nbd-method-section">
                                    <h4 className="nbd-method-title">Método de entrega</h4>
                                    <div className="nbd-method-options">
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
                                                    <span className="nbd-method-name">Envío estándar</span>
                                                    <span className="nbd-method-desc">3-5 días hábiles</span>
                                                </div>
                                                <span className="nbd-method-price">{formatPrice(8000, currency)}</span>
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
                                                    <span className="nbd-method-name">Envío express</span>
                                                    <span className="nbd-method-desc">1-2 días hábiles</span>
                                                </div>
                                                <span className="nbd-method-price">{formatPrice(15000, currency)}</span>
                                            </div>
                                        </label>
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
                                                    <span className="nbd-method-name">Recoger en tienda</span>
                                                    <span className="nbd-method-desc">Disponible hoy</span>
                                                </div>
                                                <span className="nbd-method-price">Gratis</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>

                                {/* Método de pago */}
                                <div className="nbd-method-section">
                                    <h4 className="nbd-method-title">Método de pago</h4>
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
                                        {shipping === 0 ? 'Gratis' : formatPrice(shipping, currency)}
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
