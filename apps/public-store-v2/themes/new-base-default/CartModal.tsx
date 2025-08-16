'use client';

import { useCart } from '../../lib/cart-context';
import { formatPrice } from '../../lib/currency';
import { toCloudinarySquare } from '../../lib/images';

export default function CartModal() {
    const { state, closeCart, updateQuantity, removeItem, clearCart } = useCart();

    if (!state.isOpen) return null;

    const handleQuantityChange = (itemId: string, newQuantity: number) => {
        if (newQuantity <= 0) {
            removeItem(itemId);
        } else {
            updateQuantity(itemId, newQuantity);
        }
    };

    const handleCheckout = () => {
        // Por ahora solo cerrar el carrito
        // TODO: Implementar checkout real
        closeCart();
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
                        Carrito de compras
                        {state.totalItems > 0 && (
                            <span className="nbd-cart-count">({state.totalItems})</span>
                        )}
                    </h2>
                    <button 
                        onClick={closeCart}
                        className="nbd-cart-close"
                        aria-label="Cerrar carrito"
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
                            <h3>Tu carrito está vacío</h3>
                            <p>Agrega productos para comenzar tu compra.</p>
                            <button 
                                onClick={closeCart}
                                className="nbd-btn nbd-btn--primary"
                            >
                                Seguir comprando
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
                                                    aria-label="Reducir cantidad"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                        <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                                    </svg>
                                                </button>
                                                <span className="nbd-quantity-display">{item.quantity}</span>
                                                <button 
                                                    onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                                    className="nbd-quantity-btn"
                                                    aria-label="Aumentar cantidad"
                                                >
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                        <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                                    </svg>
                                                </button>
                                            </div>
                                            
                                            {/* Botón eliminar */}
                                            <button 
                                                onClick={() => removeItem(item.id)}
                                                className="nbd-remove-item"
                                                aria-label="Eliminar producto"
                                            >
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                    <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    <line x1="10" y1="11" x2="10" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                                    <line x1="14" y1="11" x2="14" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                                </svg>
                                            </button>
                                        </div>

                                        {/* Total del item */}
                                        <div className="nbd-cart-item-total">
                                            {formatPrice((item.variant?.price || item.price) * item.quantity, item.currency)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer con resumen y acciones */}
                            <div className="nbd-cart-footer">
                                {/* Resumen del total */}
                                <div className="nbd-cart-summary">
                                    <div className="nbd-cart-subtotal">
                                        <span>Subtotal ({state.totalItems} {state.totalItems === 1 ? 'producto' : 'productos'})</span>
                                        <span className="nbd-cart-total-price">
                                            {formatPrice(state.totalPrice, state.items[0]?.currency || 'COP')}
                                        </span>
                                    </div>
                                    <p className="nbd-cart-shipping-note">
                                        Los gastos de envío se calcularán en el checkout
                                    </p>
                                </div>

                                {/* Acciones */}
                                <div className="nbd-cart-actions">
                                    <button 
                                        onClick={clearCart}
                                        className="nbd-btn nbd-btn--ghost nbd-cart-clear"
                                    >
                                        Vaciar carrito
                                    </button>
                                    <button 
                                        onClick={handleCheckout}
                                        className="nbd-btn nbd-btn--primary nbd-cart-checkout"
                                    >
                                        Proceder al checkout
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}
