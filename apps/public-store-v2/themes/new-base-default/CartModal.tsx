'use client';

import { useState, useEffect } from 'react';
import { useCart, CartItem } from '../../lib/cart-context';
import { formatPrice } from '../../lib/currency';
import { toCloudinarySquare } from '../../lib/images';
import { StoreBasicInfo } from '../../lib/store';
import CheckoutModal from './CheckoutModal';
import ConfirmationModal from './ConfirmationModal';
import { OrderData } from '../../lib/orders';
import { useStoreLanguage } from '../../lib/store-language-context';
import { generateConfirmationToken } from '../../lib/confirmation-tokens';

/**
 * Construye URL respetando la estructura de la tienda
 * - Localhost con puerto (ej: localhost:3004): /store-name/path?params
 * - Producción (subdominio/dominio): /path?params
 */
function buildStoreUrl(path: string, queryParams?: string): string {
    if (typeof window === 'undefined') return path;

    const pathname = window.location.pathname;
    const host = window.location.hostname;
    const port = window.location.port;

    let baseUrl: string;

    // Si estamos en localhost con puerto, incluir el store ID del path actual
    if ((host === 'localhost' || host.endsWith('localhost')) && port) {
        const pathParts = pathname.split('/').filter(part => part.length > 0);

        if (pathParts.length > 0) {
            // El primer segmento es el store ID (ej: "lunara")
            const storeId = pathParts[0];
            baseUrl = `/${storeId}${path}`;
        } else {
            baseUrl = path;
        }
    } else {
        // Producción: subdominio o dominio personalizado
        baseUrl = path;
    }

    // Agregar query parameters si existen
    if (queryParams) {
        const separator = baseUrl.includes('?') ? '&' : '?';
        baseUrl += separator + queryParams;
    }

    console.log('🔗 [buildStoreUrl]', {
        input: path,
        queryParams,
        currentPath: pathname,
        host: `${host}:${port}`,
        result: baseUrl
    });

    return baseUrl;
}

interface CartModalProps {
    storeInfo?: StoreBasicInfo | null;
    storeId?: string;
}

export default function CartModal({ storeInfo, storeId }: CartModalProps) {
    const { state, closeCart, updateQuantity, removeItem, clearCart } = useCart();
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    // Estados para modal de confirmación
    const [showConfirmationModal, setShowConfirmationModal] = useState(false);
    const [orderDataForConfirmation, setOrderDataForConfirmation] = useState<OrderData | null>(null);

    // 🎁 Estados para programa de lealtad
    const [loyaltyProgram, setLoyaltyProgram] = useState<{
        active: boolean;
        pointsPerCurrency: number;
        minPurchaseAmount: number;
    } | null>(null);

    // 📦 Estados para reglas de pedidos (pedido mínimo, envío gratuito)
    const [orderRules, setOrderRules] = useState<{
        minimumOrderValue: number;
        enableMinimumOrder: boolean;
        freeShippingThreshold: number;
        enableFreeShipping: boolean;
        customMessage: string;
        enableCustomMessage: boolean;
    } | null>(null);

    // Hook de idioma para traducciones
    const { language } = useStoreLanguage();

    // Helper para textos adicionales
    const additionalText = (key: string) => {
        const texts: Record<string, Record<string, string>> = {
            es: {
                'shoppingCart': 'Carrito de Compras',
                'close': 'Cerrar carrito',
                'emptyCart': 'Tu carrito está vacío',
                'addProducts': 'Agrega productos para comenzar a comprar',
                'reduceQuantity': 'Reducir cantidad',
                'increaseQuantity': 'Aumentar cantidad',
                'removeProduct': 'Eliminar producto',
                'subtotal': 'Subtotal',
                'products': 'productos',
                'incompleteProducts': 'Algunos productos necesitan opciones completas',
                'proceedToCheckout': 'Proceder al Pago',
                'options': 'opciones',
                'completeThe': 'Completa las',
                'continueShopping': 'Continuar Comprando',
                'shippingCalculated': 'Envío calculado al finalizar',
                'minimumOrderRequired': 'El pedido mínimo es',
                'addMore': 'Agrega más productos',
                'freeShippingProgress': 'Te faltan',
                'forFreeShipping': 'para envío gratis',
                'freeShippingUnlocked': '¡Tienes envío gratis!'
            },
            en: {
                'shoppingCart': 'Shopping Cart',
                'close': 'Close cart',
                'emptyCart': 'Your cart is empty',
                'addProducts': 'Add products to start shopping',
                'reduceQuantity': 'Reduce quantity',
                'increaseQuantity': 'Increase quantity',
                'removeProduct': 'Remove product',
                'subtotal': 'Subtotal',
                'products': 'products',
                'incompleteProducts': 'Some products need complete options',
                'proceedToCheckout': 'Proceed to Checkout',
                'options': 'options',
                'completeThe': 'Complete the',
                'continueShopping': 'Continue Shopping',
                'shippingCalculated': 'Shipping calculated at checkout',
                'minimumOrderRequired': 'Minimum order is',
                'addMore': 'Add more products',
                'freeShippingProgress': 'You need',
                'forFreeShipping': 'more for free shipping',
                'freeShippingUnlocked': 'You have free shipping!'
            },
            pt: {
                'shoppingCart': 'Carrinho de Compras',
                'close': 'Fechar carrinho',
                'emptyCart': 'Seu carrinho está vazio',
                'addProducts': 'Adicione produtos para começar a comprar',
                'reduceQuantity': 'Reduzir quantidade',
                'increaseQuantity': 'Aumentar quantidade',
                'removeProduct': 'Remover produto',
                'subtotal': 'Subtotal',
                'products': 'produtos',
                'incompleteProducts': 'Alguns produtos precisam de opções completas',
                'proceedToCheckout': 'Proceder ao Pagamento',
                'options': 'opções',
                'completeThe': 'Complete as',
                'continueShopping': 'Continuar Comprando',
                'shippingCalculated': 'Frete calculado no checkout',
                'minimumOrderRequired': 'Pedido mínimo é',
                'addMore': 'Adicione mais produtos',
                'freeShippingProgress': 'Você precisa de',
                'forFreeShipping': 'mais para frete grátis',
                'freeShippingUnlocked': 'Você tem frete grátis!'
            }
        };
        return texts[language]?.[key] || texts['es']?.[key] || key;
    };
    
    // Detectar si hay productos incompletos
    const hasIncompleteItems = state.items.some(item => item.incomplete);

    // Detectar si no alcanza el pedido mínimo
    const minimumOrderNotMet = orderRules?.enableMinimumOrder && state.totalPrice < orderRules.minimumOrderValue;

    // 🎁 Consultar configuración del programa de lealtad
    useEffect(() => {
        const fetchLoyaltyProgram = async () => {
            if (!storeId) return;

            try {
                console.log('[Cart Loyalty] 🎁 Fetching loyalty program configuration');
                const response = await fetch(`/api/loyalty/program?storeId=${storeId}`);
                const data = await response.json();

                if (data.success && data.active) {
                    console.log('[Cart Loyalty] ✅ Program active:', data.program);
                    setLoyaltyProgram({
                        active: true,
                        pointsPerCurrency: data.program.pointsPerCurrency,
                        minPurchaseAmount: data.program.minPurchaseAmount
                    });
                } else {
                    console.log('[Cart Loyalty] ℹ️  Program inactive');
                    setLoyaltyProgram(null);
                }
            } catch (error) {
                console.error('[Cart Loyalty] ❌ Error fetching program:', error);
                setLoyaltyProgram(null);
            }
        };

        fetchLoyaltyProgram();
    }, [storeId]);

    // 📦 Consultar reglas de pedidos (pedido mínimo, envío gratuito)
    useEffect(() => {
        const fetchOrderRules = async () => {
            if (!storeId) return;

            try {
                console.log('[Cart OrderRules] 📦 Fetching order rules configuration');
                const { getFirebaseDb } = await import('../../lib/firebase');
                const { doc, getDoc } = await import('firebase/firestore');

                const db = getFirebaseDb();
                if (!db) {
                    console.log('[Cart OrderRules] ℹ️  Firebase not available');
                    return;
                }

                const storeRef = doc(db, 'stores', storeId);
                const storeDoc = await getDoc(storeRef);

                if (storeDoc.exists()) {
                    const storeData = storeDoc.data();
                    if (storeData.orderRules) {
                        console.log('[Cart OrderRules] ✅ Rules found:', storeData.orderRules);
                        setOrderRules(storeData.orderRules);
                    } else {
                        console.log('[Cart OrderRules] ℹ️  No rules configured');
                        setOrderRules(null);
                    }
                } else {
                    console.log('[Cart OrderRules] ⚠️  Store not found');
                    setOrderRules(null);
                }
            } catch (error) {
                console.error('[Cart OrderRules] ❌ Error fetching rules:', error);
                setOrderRules(null);
            }
        };

        fetchOrderRules();
    }, [storeId]);

    // Función para obtener las opciones faltantes de un producto
    const getMissingOptions = (item: CartItem) => {
        return item.missingVariants || [additionalText('options')];
    };

    // 🚀 NUEVA FUNCIÓN: Construir URLs de producto sin prefijo de idioma
    const buildProductUrl = (slug: string) => {
        if (typeof window === 'undefined') return `/producto/${slug}`;
        
        const pathname = window.location.pathname;
        const currentHostname = window.location.hostname;
        
        // Detectar si estamos en un dominio personalizado
        const isCustomDomain = !currentHostname.endsWith('shopifree.app') && !currentHostname.endsWith('localhost') && currentHostname !== 'localhost';
        
        if (isCustomDomain) {
            // En dominio personalizado: URL directa sin subdominio ni locale
            return `/producto/${slug}`;
        } else {
            // En dominio de plataforma: verificar si ya estamos en el subdominio correcto
            // Extraer subdominio del pathname actual o del hostname
            const pathParts = pathname.split('/');
            const storeSubdomain = pathParts[1]; // [0]='', [1]=subdomain
            const expectedSubdomain = `${storeSubdomain}.shopifree.app`;
            
            if (currentHostname === expectedSubdomain) {
                // Ya estamos en el subdominio correcto, no agregar el subdominio al path
                return `/producto/${slug}`;
            } else {
                // Estamos en un contexto diferente, incluir el subdominio
                return `/${storeSubdomain}/producto/${slug}`;
            }
        }
    };

    // 🚀 NUEVA FUNCIÓN: Ir al home sin prefijo de idioma
    const goToHome = () => {
        if (typeof window === 'undefined') return;
        
        const pathname = window.location.pathname;
        
        // Detectar si estamos en un dominio personalizado
        const host = window.location.hostname;
        const isCustomDomain = !host.endsWith('shopifree.app') && !host.endsWith('localhost') && host !== 'localhost';
        
        let homeUrl;
        if (isCustomDomain) {
            // En dominio personalizado: root
            homeUrl = '/';
        } else {
            // En dominio de plataforma: incluir subdominio sin locale
            const pathParts = pathname.split('/');
            const storeSubdomain = pathParts[1]; // [0]='', [1]=subdomain
            homeUrl = `/${storeSubdomain}`;
        }
        
        // Cerrar carrito y navegar
        closeCart();
        window.location.href = homeUrl;
    };

    if (!state.isOpen) return null;

    const handleQuantityChange = (itemId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeItem(itemId);
        } else {
            updateQuantity(itemId, newQuantity);
        }
    };

    const handleCheckout = () => {
        if (hasIncompleteItems) {
            return; // No permitir checkout si hay productos incompletos
        }
        if (minimumOrderNotMet) {
            return; // No permitir checkout si no alcanza el pedido mínimo
        }
        setIsCheckoutOpen(true);
    };

    const handleCheckoutClose = () => {
        setIsCheckoutOpen(false);
    };

    const handleCheckoutSuccess = () => {
        // Aquí se podría mostrar un mensaje de éxito
        console.log('¡Pedido completado exitosamente!');
        closeCart();
    };

    // Función para redirigir a página de confirmación (llamada desde CheckoutModal)
    const showConfirmationModalWithData = (orderData: OrderData) => {
        console.log('📧 CartModal recibió datos para confirmación - redirigiendo a página:', orderData);

        try {
            // Generar token único para esta confirmación
            const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
            const token = generateConfirmationToken(orderData, orderId, storeId || 'default')

            console.log('🎫 Token de confirmación generado:', { token, orderId })

            // Construir URL de confirmación respetando la estructura de la tienda
            const confirmationUrl = buildStoreUrl('/checkout/success', `token=${token}`)

            console.log('🔄 Redirigiendo directamente a confirmación (sin cerrar modales):', confirmationUrl)

            // NO limpiar carrito aquí - mantener productos visibles hasta que se complete la navegación
            // El carrito se limpiará después cuando el usuario vuelva o en la página de éxito

            // Redireccionar inmediatamente - los modales se "cerrarán" con el cambio de página
            window.location.href = confirmationUrl

        } catch (error) {
            console.error('❌ Error generando token de confirmación:', error)

            // Fallback: mostrar modal tradicional si falla
            setOrderDataForConfirmation(orderData)
            setIsCheckoutOpen(false)
            setShowConfirmationModal(true)
        }
    };

    // Función para manejar el cierre del modal de confirmación
    const handleConfirmationModalClose = () => {
        setShowConfirmationModal(false);
        setOrderDataForConfirmation(null);
        closeCart(); // Cerrar todo el cart modal
    };

    return (
        <>
            {/* Backdrop */}
            <div className="nbd-cart-backdrop" onClick={closeCart}></div>
            
            {/* Modal del carrito */}
            <div className="nbd-cart-modal">
                {/* Header del carrito */}
                <div className="nbd-cart-header">
                    <h2 className="nbd-cart-title">
                        {additionalText('shoppingCart')}
                        {state.totalItems > 0 && (
                            <span className="nbd-cart-count">({state.totalItems})</span>
                        )}
                    </h2>
                    <button 
                        onClick={closeCart}
                        className="nbd-cart-close"
                        aria-label={additionalText('close')}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>

                {/* Contenido del carrito */}
                <div className="nbd-cart-content">
                    {state.items.length === 0 ? (
                        <div className="nbd-cart-empty">
                            <div className="nbd-cart-empty-icon">
                                <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                                    <path d="M6 2L3 6v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6l-3-4H6z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                    <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="1.5"/>
                                    <path d="M16 10c0 2.21-1.79 4-4 4s-4-1.79-4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <h3>{additionalText('emptyCart')}</h3>
                            <p>{additionalText('addProducts')}</p>
                            <button 
                                onClick={closeCart}
                                className="nbd-btn nbd-btn--primary"
                            >
                                {additionalText('continueShopping')}
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Lista de productos */}
                            <div className="nbd-cart-items">
                                {state.items.map((item) => (
                                    <div key={item.id} className="nbd-cart-item">
                                        {/* Imagen del producto */}
                                        <div className="nbd-cart-item-image">
                                            {item.image ? (
                                                <img 
                                                    src={toCloudinarySquare(item.image, 100)} 
                                                    alt={item.name}
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="nbd-cart-item-placeholder">
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="1.5"/>
                                                        <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" strokeWidth="1.5"/>
                                                        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" stroke="currentColor" strokeWidth="1.5"/>
                                                    </svg>
                                                </div>
                                            )}
                                        </div>

                                        {/* Información del producto */}
                                        <div className="nbd-cart-item-info">
                                            <h4 className="nbd-cart-item-name">{item.name}</h4>
                                            {item.variant && (
                                                <p className="nbd-cart-item-variant">{item.variant.name}</p>
                                            )}
                                            {/* Modificadores seleccionados */}
                                            {item.modifiers && item.modifiers.length > 0 && (
                                                <div className="nbd-cart-item-modifiers">
                                                    {item.modifiers.map((group, groupIndex) => (
                                                        <div key={groupIndex} className="nbd-cart-modifier-group">
                                                            <span className="nbd-cart-modifier-group-name">{group.groupName}:</span>
                                                            {group.options.map((option, optionIndex) => (
                                                                <span key={optionIndex} className="nbd-cart-modifier-option">
                                                                    {option.name}
                                                                    {option.quantity > 1 && (
                                                                        <span className="nbd-cart-modifier-qty"> x{option.quantity}</span>
                                                                    )}
                                                                    {option.price !== 0 && (
                                                                        <span className="nbd-cart-modifier-price">
                                                                            {' '}({option.price > 0 ? '+' : ''}{formatPrice(option.price * option.quantity, item.currency)})
                                                                        </span>
                                                                    )}
                                                                    {optionIndex < group.options.length - 1 && ', '}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                            {item.incomplete && (
                                                <div className="nbd-cart-item-incomplete">
                                                    <span className="nbd-incomplete-message">
                                                        ⚠ Seleccionar {getMissingOptions(item).join(', ')} -
                                                        <a
                                                            href={buildProductUrl(item.slug)}
                                                            className="nbd-complete-options-link"
                                                            onClick={() => closeCart()}
                                                        >
                                                            modificar
                                                        </a>
                                                    </span>
                                                </div>
                                            )}
                                            <div className="nbd-cart-item-price">
                                                {formatPrice(item.variant?.price || item.price, item.currency)}
                                            </div>
                                        </div>

                                        {/* Controles de cantidad */}
                                        <div className="nbd-cart-item-controls">
                                            <div className="nbd-quantity-control">
                                                <button 
                                                    onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                    className="nbd-quantity-btn"
                                                    disabled={item.quantity <= 1}
                                                    aria-label={additionalText('reduceQuantity')}
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                        <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                                    </svg>
                                                </button>
                                                <span className="nbd-quantity-display">{item.quantity}</span>
                                                <button 
                                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                    className="nbd-quantity-btn"
                                                    aria-label={additionalText('increaseQuantity')}
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Total del item */}
                                        <div className="nbd-cart-item-total">
                                            {formatPrice((item.variant?.price || item.price) * item.quantity, item.currency)}
                                        </div>

                                        {/* Botón eliminar */}
                                        <button 
                                            onClick={() => removeItem(item.id)}
                                            className="nbd-remove-item"
                                            aria-label={additionalText('removeProduct')}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                                <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Footer con resumen y acciones */}
                            <div className="nbd-cart-footer">
                                {/* Resumen del total */}
                                <div className="nbd-cart-summary">
                                    <div className="nbd-cart-subtotal">
                                        <span>{additionalText('subtotal')} ({state.totalItems} {additionalText('products')})</span>
                                        <span className="nbd-cart-total-price">
                                            {formatPrice(state.totalPrice, state.items[0]?.currency || 'COP')}
                                        </span>
                                    </div>

                                    {/* Barra de progreso para envío gratuito */}
                                    {orderRules?.enableFreeShipping && (
                                        <div style={{
                                            marginTop: '12px',
                                            padding: '12px',
                                            backgroundColor: state.totalPrice >= orderRules.freeShippingThreshold ? '#d1fae5' : '#f3f4f6',
                                            borderRadius: '8px',
                                            border: `1px solid ${state.totalPrice >= orderRules.freeShippingThreshold ? '#10b981' : '#e5e7eb'}`
                                        }}>
                                            {state.totalPrice >= orderRules.freeShippingThreshold ? (
                                                // Ya alcanzó el envío gratuito
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    color: '#10b981',
                                                    fontWeight: '600',
                                                    fontSize: '14px'
                                                }}>
                                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                        <polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                    {additionalText('freeShippingUnlocked')}
                                                </div>
                                            ) : (
                                                // Aún no alcanza el envío gratuito
                                                <>
                                                    <div style={{
                                                        fontSize: '13px',
                                                        color: '#6b7280',
                                                        marginBottom: '8px',
                                                        fontWeight: '500'
                                                    }}>
                                                        {additionalText('freeShippingProgress')} {formatPrice(orderRules.freeShippingThreshold - state.totalPrice, state.items[0]?.currency || 'COP')} {additionalText('forFreeShipping')}
                                                    </div>
                                                    <div style={{
                                                        width: '100%',
                                                        height: '8px',
                                                        backgroundColor: '#e5e7eb',
                                                        borderRadius: '999px',
                                                        overflow: 'hidden'
                                                    }}>
                                                        <div style={{
                                                            width: `${Math.min((state.totalPrice / orderRules.freeShippingThreshold) * 100, 100)}%`,
                                                            height: '100%',
                                                            backgroundColor: '#10b981',
                                                            transition: 'width 0.3s ease',
                                                            borderRadius: '999px'
                                                        }} />
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {hasIncompleteItems ? (
                                        <div className="nbd-cart-incomplete-warning">
                                            <p className="nbd-incomplete-warning-text">
                                                ⚠ {additionalText('incompleteProducts')}
                                            </p>
                                        </div>
                                    ) : (
                                        <>
                                            <p className="nbd-cart-shipping-note">
                                                {additionalText('shippingCalculated')}
                                            </p>
                                            {/* Mensaje de puntos a acumular */}
                                            {loyaltyProgram?.active && state.totalPrice >= loyaltyProgram.minPurchaseAmount && (
                                                <p className="nbd-cart-shipping-note" style={{
                                                    color: '#10b981',
                                                    marginTop: '4px'
                                                }}>
                                                    Acumularás {Math.floor(state.totalPrice * loyaltyProgram.pointsPerCurrency)} puntos al finalizar la compra
                                                </p>
                                            )}
                                            {/* Mensaje de pedido mínimo */}
                                            {minimumOrderNotMet && (
                                                <p className="nbd-cart-shipping-note" style={{
                                                    color: '#b91c1c',
                                                    marginTop: '4px',
                                                    fontWeight: '500'
                                                }}>
                                                    ⚠ {additionalText('minimumOrderRequired')} {formatPrice(orderRules?.minimumOrderValue || 0, state.items[0]?.currency || 'COP')}. {additionalText('addMore')}.
                                                </p>
                                            )}
                                        </>
                                    )}
                                </div>

                                {/* Acciones */}
                                <div className="nbd-cart-actions">
                                    <button 
                                        onClick={closeCart}
                                        className="nbd-btn nbd-btn--secondary"
                                    >
                                        {additionalText('continueShopping')}
                                    </button>
                                    <button
                                        onClick={handleCheckout}
                                        className={`nbd-btn nbd-btn--primary nbd-cart-checkout ${(hasIncompleteItems || minimumOrderNotMet) ? 'nbd-btn--disabled' : ''}`}
                                        disabled={hasIncompleteItems || minimumOrderNotMet}
                                    >
                                        {hasIncompleteItems
                                            ? `${additionalText('completeThe')} ${additionalText('options')}`
                                            : additionalText('proceedToCheckout')
                                        }
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Modal de checkout */}
            <CheckoutModal 
                isOpen={isCheckoutOpen}
                onClose={handleCheckoutClose}
                onSuccess={handleCheckoutSuccess}
                storeInfo={storeInfo}
                storeId={storeId}
                onShowConfirmation={showConfirmationModalWithData}
            />

            {/* Modal de confirmación */}
            {storeInfo && (
                <ConfirmationModal
                    isOpen={showConfirmationModal}
                    onClose={handleConfirmationModalClose}
                    orderData={orderDataForConfirmation}
                    storeInfo={storeInfo}
                />
            )}
        </>
    );
}
