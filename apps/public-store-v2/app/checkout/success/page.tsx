'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateAndConsumeToken, ConfirmationToken } from '../../../lib/confirmation-tokens';
import { formatPrice } from '../../../lib/currency';
import { StoreBasicInfo } from '../../../lib/store';
import { useCart } from '../../../lib/cart-context';
import { createOrder } from '../../../lib/orders';

interface OrderConfirmationPageState {
  step: 'loading' | 'success' | 'error' | 'expired';
  token: ConfirmationToken | null;
  error?: string;
  mercadoPagoData?: {
    paymentId: string;
    status: string;
    orderId: string;
  };
}

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const { clearCart } = useCart();
  const [state, setState] = useState<OrderConfirmationPageState>({
    step: 'loading',
    token: null
  });

  useEffect(() => {
    // Limpiar carrito cuando se carga la página de éxito
    clearCart();
    console.log('🛒 Carrito limpiado después de confirmación exitosa');
  }, [clearCart]);

  useEffect(() => {
    // Solo ejecutar del lado del cliente
    if (typeof window !== 'undefined') {
      // Obtener parámetros de URL
      const urlParams = new URLSearchParams(window.location.search);
      const tokenId = urlParams.get('token');

      // 🔔 DETECCIÓN DE RETORNO DE MERCADOPAGO
      const collectionId = urlParams.get('collection_id') || urlParams.get('payment_id');
      const collectionStatus = urlParams.get('collection_status') || urlParams.get('status');
      const preferenceId = urlParams.get('preference_id');

      // Si viene de MercadoPago
      if (collectionId && (collectionStatus === 'approved' || collectionStatus === 'pending')) {
        console.log('🔔 [MercadoPago] Retorno detectado:', {
          paymentId: collectionId,
          status: collectionStatus,
          preferenceId
        });

        // Recuperar datos del pedido desde localStorage
        const pendingOrderStr = localStorage.getItem('pendingMercadoPagoOrder');

        if (!pendingOrderStr) {
          console.error('🔔 [MercadoPago] No se encontraron datos del pedido pendiente');
          setState({
            step: 'error',
            token: null,
            error: 'No se encontraron datos del pedido. Por favor contacta con la tienda.'
          });
          return;
        }

        // Procesar el pedido de MercadoPago
        const loadingTimeout = setTimeout(async () => {
          try {
            const pendingOrder = JSON.parse(pendingOrderStr);
            console.log('🔔 [MercadoPago] Creando pedido en Firestore...');

            const orderDoc = await createOrder(pendingOrder.storeId, pendingOrder.orderData, {
              isPaid: collectionStatus === 'approved',
              paidAmount: collectionStatus === 'approved' ? pendingOrder.orderData.totals.total : 0,
              paymentType: 'online_payment',
              transactionId: collectionId
            });

            if (orderDoc?.id) {
              console.log('✅ [MercadoPago] Pedido creado exitosamente:', orderDoc.id);

              // Limpiar localStorage
              localStorage.removeItem('pendingMercadoPagoOrder');

              // Crear token de confirmación simulado para mostrar el resumen
              const mockToken: ConfirmationToken = {
                id: `mp_${Date.now()}`,
                orderId: orderDoc.id,
                orderData: pendingOrder.orderData,
                expiresAt: Date.now() + (5 * 60 * 1000), // 5 minutos
                createdAt: Date.now(),
                used: false,
                paymentMethod: 'mercadopago',
                storeId: pendingOrder.storeId
              };

              setState({
                step: 'success',
                token: mockToken,
                mercadoPagoData: {
                  paymentId: collectionId,
                  status: collectionStatus,
                  orderId: orderDoc.id
                }
              });
            } else {
              throw new Error('No se pudo obtener ID del pedido');
            }
          } catch (error) {
            console.error('🔔 [MercadoPago] Error creando pedido:', error);
            setState({
              step: 'error',
              token: null,
              error: 'Error al procesar el pedido. Por favor contacta con la tienda.'
            });
          }
        }, 2500);

        return () => clearTimeout(loadingTimeout);
      }

      // FLUJO NORMAL CON TOKEN (checkout tradicional)
      if (!tokenId) {
        console.warn('🎫 No se proporcionó token de confirmación');
        setState({
          step: 'error',
          token: null,
          error: 'Token de confirmación no encontrado'
        });
        return;
      }

      console.log('🎫 Validando token de confirmación:', tokenId);

      // Simular loading por 2.5 segundos (como el modal original)
      const loadingTimeout = setTimeout(() => {
        const tokenData = validateAndConsumeToken(tokenId);

        if (!tokenData) {
          console.warn('🎫 Token inválido o expirado');
          setState({
            step: 'expired',
            token: null,
            error: 'Token de confirmación inválido o expirado'
          });
          return;
        }

        console.log('✅ Token válido - mostrando confirmación:', tokenData.orderId);
        setState({
          step: 'success',
          token: tokenData
        });
      }, 2500);

      return () => clearTimeout(loadingTimeout);
    }
  }, []);

  const handleGoHome = () => {
    const pathname = window.location.pathname;
    const host = window.location.hostname;
    const port = window.location.port;

    let homeUrl;

    // Si estamos en localhost con puerto, incluir el store ID
    if ((host === 'localhost' || host.endsWith('localhost')) && port) {
      const pathParts = pathname.split('/').filter(part => part.length > 0);
      if (pathParts.length > 0) {
        const storeId = pathParts[0];
        homeUrl = `/${storeId}`;
      } else {
        homeUrl = '/';
      }
    } else {
      // Producción: subdominio o dominio personalizado
      homeUrl = '/';
    }

    console.log('🏠 [handleGoHome]', {
      currentPath: pathname,
      host: `${host}:${port}`,
      homeUrl
    });

    window.location.href = homeUrl;
  };

  // Estado de loading
  if (state.step === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Spinner de carga */}
          <div className="w-16 h-16 mx-auto mb-6 relative">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
          </div>

          <h1 className="text-xl font-semibold text-gray-900 mb-2">
            ¡Espera un momento!
          </h1>
          <p className="text-gray-600 text-sm">
            Estamos procesando tu pedido...
          </p>

          {/* Progreso visual */}
          <div className="mt-6 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full animate-pulse" style={{width: '70%'}}></div>
          </div>
        </div>
      </div>
    );
  }

  // Estados de error
  if (state.step === 'error' || state.step === 'expired') {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>

          <h1 className="text-xl font-semibold text-gray-900 mb-4">
            {state.step === 'expired' ? 'Enlace Expirado' : 'Error de Confirmación'}
          </h1>

          <p className="text-gray-600 mb-6">
            {state.error || 'No se pudo validar la confirmación del pedido.'}
          </p>

          <button
            onClick={handleGoHome}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Volver a la Tienda
          </button>
        </div>
      </div>
    );
  }

  // Estado de éxito
  const { token } = state;
  const { orderData } = token!;
  const currency = orderData.currency || 'COP';
  const orderId = token!.orderId.slice(-6).toUpperCase();

  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg overflow-hidden">

        {/* Header de éxito */}
        <div className="bg-green-600 text-white p-6 text-center">
          <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">¡Pedido Confirmado!</h1>
          <p className="opacity-90">Tu pedido ha sido procesado correctamente</p>
        </div>

        <div className="p-6">
          {/* Información del pedido */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <span className="w-2 h-2 bg-green-600 rounded-full mr-2"></span>
              Pedido #{orderId}
            </h3>

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Cliente:</p>
                <p className="font-medium">{orderData.customer.fullName}</p>
                <p className="text-gray-600">{orderData.customer.email}</p>
                <p className="text-gray-600">{orderData.customer.phone}</p>
              </div>
              <div>
                <p className="text-gray-600">Método de envío:</p>
                <p className="font-medium">{orderData.shipping.method}</p>
                {orderData.shipping.address && (
                  <p className="text-gray-600 text-xs mt-1">{orderData.shipping.address}</p>
                )}
              </div>
            </div>
          </div>

          {/* Productos */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Productos:</h4>
            <div className="space-y-2">
              {orderData.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{item.name}</p>
                    {item.variant?.name && (
                      <p className="text-xs text-gray-500">{item.variant.name}</p>
                    )}
                  </div>
                  <div className="text-right text-sm">
                    <span className="text-gray-600">{item.quantity}x</span>
                    <span className="font-medium ml-2">
                      {formatPrice((item.variant?.price || item.price) * item.quantity, currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totales */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatPrice(orderData.totals.subtotal, currency)}</span>
              </div>
              {orderData.totals.shipping > 0 && (
                <div className="flex justify-between">
                  <span>Envío:</span>
                  <span>{formatPrice(orderData.totals.shipping, currency)}</span>
                </div>
              )}
              {orderData.discount && orderData.discount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Descuento{orderData.appliedCoupon?.code ? ` (${orderData.appliedCoupon.code})` : ''}:</span>
                  <span>-{formatPrice(orderData.discount, currency)}</span>
                </div>
              )}
              {orderData.loyaltyDiscount && orderData.loyaltyDiscount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Descuento puntos ({orderData.loyaltyPointsRedeemed} pts):</span>
                  <span>-{formatPrice(orderData.loyaltyDiscount, currency)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>{formatPrice(orderData.totals.total, currency)}</span>
              </div>
              {orderData.loyaltyPointsEarned && orderData.loyaltyPointsEarned > 0 && (
                <div className="flex justify-between text-green-600 text-sm pt-2 border-t">
                  <span>🎁 Puntos acumulados con esta compra:</span>
                  <span className="font-semibold">+{orderData.loyaltyPointsEarned} pts</span>
                </div>
              )}
            </div>
          </div>

          {/* Información de pago */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h4 className="font-semibold text-blue-900 mb-2">Método de pago:</h4>
            <p className="text-blue-800">{orderData.payment.method}</p>
            {orderData.payment.notes && (
              <p className="text-blue-700 text-sm mt-1">Notas: {orderData.payment.notes}</p>
            )}
          </div>

          {/* Acciones */}
          <div className="space-y-3">
            <button
              onClick={handleGoHome}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Continuar Comprando
            </button>

            <p className="text-center text-xs text-gray-500">
              Recibirás un correo electrónico con los detalles de tu pedido
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}