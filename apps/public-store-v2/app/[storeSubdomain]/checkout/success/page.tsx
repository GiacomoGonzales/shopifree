'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { validateAndConsumeToken, ConfirmationToken } from '../../../../lib/confirmation-tokens';
import { formatPrice } from '../../../../lib/currency';
import { StoreBasicInfo, getStoreInfoBySubdomain } from '../../../../lib/store';
import { buildStoreUrl } from '../../../../lib/url-utils';
import { translateShippingMethod, translatePaymentMethod, generateConfirmationWhatsAppMessage } from '../../../../lib/orders';
import { useStoreLanguage } from '../../../../lib/store-language-context';

interface OrderConfirmationPageState {
  step: 'loading' | 'success' | 'error' | 'expired';
  token: ConfirmationToken | null;
  error?: string;
  // Nuevos campos para MercadoPago
  paymentType?: 'manual' | 'mercadopago';
  mercadopagoData?: {
    payment_id: string;
    status: string;
    external_reference?: string;
    preference_id?: string;
  };
}

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const { language } = useStoreLanguage();
  const [state, setState] = useState<OrderConfirmationPageState>({
    step: 'loading',
    token: null
  });
  const [storeInfo, setStoreInfo] = useState<StoreBasicInfo | null>(null);

  // Traducciones
  const texts: Record<string, Record<string, string>> = {
    es: {
      'processing': 'Procesando',
      'preparingOrder': 'Preparando tu pedido',
      'confirmingPayment': 'Confirmando tu pago',
      'orderConfirmed': '¡Pedido Confirmado!',
      'orderProcessed': 'Tu pedido ha sido procesado correctamente',
      'paymentConfirmed': '¡Pago Confirmado!',
      'paymentProcessed': 'Tu pago ha sido procesado exitosamente',
      'orderSummary': 'Resumen del Pedido',
      'customer': 'Cliente:',
      'shippingMethod': 'Método de envío:',
      'paymentMethod': 'Método de pago:',
      'notes': 'Notas:',
      'paymentInfo': 'Información del Pago',
      'paymentId': 'ID de Pago:',
      'status': 'Estado:',
      'reference': 'Referencia:',
      'contactWhatsApp': 'Contactar por WhatsApp',
      'backToStore': 'Volver a la Tienda',
      'whatsappNotConfigured': 'WhatsApp no está configurado para esta tienda',
      'linkExpired': 'Enlace Expirado',
      'confirmationError': 'Error de Confirmación',
      'couldNotValidate': 'No se pudo validar la confirmación del pedido.'
    },
    en: {
      'processing': 'Processing',
      'preparingOrder': 'Preparing your order',
      'confirmingPayment': 'Confirming your payment',
      'orderConfirmed': 'Order Confirmed!',
      'orderProcessed': 'Your order has been processed successfully',
      'paymentConfirmed': 'Payment Confirmed!',
      'paymentProcessed': 'Your payment has been processed successfully',
      'orderSummary': 'Order Summary',
      'customer': 'Customer:',
      'shippingMethod': 'Shipping method:',
      'paymentMethod': 'Payment method:',
      'notes': 'Notes:',
      'paymentInfo': 'Payment Information',
      'paymentId': 'Payment ID:',
      'status': 'Status:',
      'reference': 'Reference:',
      'contactWhatsApp': 'Contact via WhatsApp',
      'backToStore': 'Back to Store',
      'whatsappNotConfigured': 'WhatsApp is not configured for this store',
      'linkExpired': 'Link Expired',
      'confirmationError': 'Confirmation Error',
      'couldNotValidate': 'Could not validate the order confirmation.'
    },
    pt: {
      'processing': 'Processando',
      'preparingOrder': 'Preparando seu pedido',
      'confirmingPayment': 'Confirmando seu pagamento',
      'orderConfirmed': 'Pedido Confirmado!',
      'orderProcessed': 'Seu pedido foi processado com sucesso',
      'paymentConfirmed': 'Pagamento Confirmado!',
      'paymentProcessed': 'Seu pagamento foi processado com sucesso',
      'orderSummary': 'Resumo do Pedido',
      'customer': 'Cliente:',
      'shippingMethod': 'Método de envio:',
      'paymentMethod': 'Método de pagamento:',
      'notes': 'Notas:',
      'paymentInfo': 'Informações do Pagamento',
      'paymentId': 'ID do Pagamento:',
      'status': 'Status:',
      'reference': 'Referência:',
      'contactWhatsApp': 'Contatar via WhatsApp',
      'backToStore': 'Voltar à Loja',
      'whatsappNotConfigured': 'WhatsApp não está configurado para esta loja',
      'linkExpired': 'Link Expirado',
      'confirmationError': 'Erro de Confirmação',
      'couldNotValidate': 'Não foi possível validar a confirmação do pedido.'
    }
  };

  const t = (key: string) => texts[language]?.[key] || texts['es']?.[key] || key;

  // Obtener información de la tienda
  useEffect(() => {
    const loadStoreInfo = async () => {
      const storeSubdomain = params.storeSubdomain as string;
      if (storeSubdomain) {
        try {
          const store = await getStoreInfoBySubdomain(storeSubdomain);
          setStoreInfo(store);
        } catch (error) {
          console.error('Error loading store info:', error);
        }
      }
    };
    loadStoreInfo();
  }, [params.storeSubdomain]);

  useEffect(() => {
    const tokenId = searchParams.get('token');
    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');
    const externalReference = searchParams.get('external_reference');
    const preferenceId = searchParams.get('preference_id');

    // 🔍 Detectar tipo de pago basado en parámetros
    if (tokenId) {
      // ✅ Flujo manual (actual) - tiene token
      console.log('🎫 Detectado flujo manual con token:', tokenId);
      handleManualPaymentFlow(tokenId);
    } else if (paymentId && status) {
      // ✅ Flujo MercadoPago - tiene payment_id y status
      console.log('💳 Detectado flujo MercadoPago:', { paymentId, status, externalReference });
      handleMercadoPagoFlow({
        payment_id: paymentId,
        status,
        external_reference: externalReference || undefined,
        preference_id: preferenceId || undefined
      });
    } else {
      // ❌ No hay parámetros válidos
      console.warn('❌ No se detectaron parámetros válidos');
      setState({
        step: 'error',
        token: null,
        error: 'No se encontraron parámetros de confirmación válidos'
      });
    }
  }, [searchParams]);

  // 🎫 Maneja el flujo de pagos manuales (actual)
  const handleManualPaymentFlow = (tokenId: string) => {
    console.log('🎫 Procesando flujo manual con token:', tokenId);

    // Simular loading por 3 segundos para una mejor UX
    const loadingTimeout = setTimeout(() => {
      const tokenData = validateAndConsumeToken(tokenId);

      if (!tokenData) {
        console.warn('🎫 Token inválido o expirado');
        setState({
          step: 'expired',
          token: null,
          error: 'Token de confirmación inválido o expirado',
          paymentType: 'manual'
        });
        return;
      }

      console.log('✅ Token válido - mostrando confirmación:', tokenData.orderId);
      setState({
        step: 'success',
        token: tokenData,
        paymentType: 'manual'
      });
    }, 3000);

    // Cleanup timeout si el componente se desmonta
    return () => clearTimeout(loadingTimeout);
  };

  // 💳 Maneja el flujo de MercadoPago (nuevo)
  const handleMercadoPagoFlow = (mercadopagoData: NonNullable<OrderConfirmationPageState['mercadopagoData']>) => {
    console.log('💳 Procesando flujo MercadoPago:', mercadopagoData);
    console.log('💳 Status recibido:', `"${mercadopagoData.status}"`, 'Length:', mercadopagoData.status.length);

    // Simular loading por 2.5 segundos para consistencia
    const loadingTimeout = setTimeout(() => {
      const status = mercadopagoData.status.toLowerCase().trim();
      console.log('💳 Status procesado:', `"${status}"`);

      // Verificar si el pago fue exitoso (más tolerante)
      if (status === 'approved' || status === 'approve' || status === 'success') {
        console.log('✅ Pago MercadoPago aprobado');
        setState({
          step: 'success',
          token: null, // No hay token en MercadoPago
          paymentType: 'mercadopago',
          mercadopagoData
        });
      } else if (status === 'pending' || status === 'in_process') {
        console.log('⏳ Pago MercadoPago pendiente - redirigiendo...');
        // Usar buildStoreUrl para redirección correcta
        const pendingUrl = window.location.origin + buildStoreUrl('/checkout/pending',
          `payment_id=${mercadopagoData.payment_id}&status=${mercadopagoData.status}`);
        console.log('🔄 Redirigiendo a:', pendingUrl);
        window.location.href = pendingUrl;
      } else {
        console.log('❌ Pago MercadoPago fallido o cancelado - redirigiendo...');
        // Usar buildStoreUrl para redirección correcta
        const failureUrl = window.location.origin + buildStoreUrl('/checkout/failure',
          `payment_id=${mercadopagoData.payment_id}&status=${mercadopagoData.status}`);
        console.log('🔄 Redirigiendo a:', failureUrl);
        window.location.href = failureUrl;
      }
    }, 2500);

    return () => clearTimeout(loadingTimeout);
  };

  const handleGoHome = () => {
    router.push('/');
  };

  // Renderizado principal basado en el estado
  if (state.step === 'loading') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          {/* Spinner moderno */}
          <div className="relative w-20 h-20 mx-auto mb-8">
            <div className="absolute inset-0 rounded-full border-3 border-neutral-200"></div>
            <div className="absolute inset-0 rounded-full border-3 border-neutral-800 border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 rounded-full border-2 border-neutral-300 border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>

          {/* Texto de carga */}
          <h1 className="text-2xl font-medium text-neutral-900 mb-3">
            {t('processing')}
          </h1>
          <p className="text-neutral-600 text-base mb-8">
            {state.paymentType === 'mercadopago' ? t('confirmingPayment') : t('preparingOrder')}
          </p>

          {/* Barra de progreso */}
          <div className="w-full bg-neutral-200 rounded-full h-2 mb-4">
            <div className="bg-neutral-800 h-2 rounded-full animate-pulse" style={{
              width: '0%',
              animation: 'progressBar 3s ease-out forwards'
            }}></div>
          </div>

          <style jsx>{`
            @keyframes progressBar {
              0% { width: 0%; }
              30% { width: 40%; }
              70% { width: 80%; }
              100% { width: 100%; }
            }
          `}</style>

        </div>
      </div>
    );
  }

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
{t('backToStore')}
          </button>
        </div>
      </div>
    );
  }

  // Estado de éxito - renderizado inteligente
  const { token, paymentType, mercadopagoData } = state;

  if (paymentType === 'manual' && token) {
    // ✅ Flujo manual - mostrar datos del token
    const { orderData } = token;
    const currency = orderData.currency || 'COP';
    // 🆕 Usar orderNumber si está disponible, sino usar últimos 6 caracteres del ID
    const displayOrderNumber = token.orderNumber ? `${token.orderNumber}` : token.orderId.slice(-6).toUpperCase();
    const orderId = displayOrderNumber;

    return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">

        {/* Header de éxito */}
        <div className="bg-gradient-to-r from-neutral-800 to-neutral-700 text-white p-8 text-center">
          <div className="w-20 h-20 mx-auto bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h1 className="text-3xl font-semibold mb-3">{t('orderConfirmed')}</h1>
          <p className="text-neutral-200 text-lg">{t('orderProcessed')}</p>
        </div>

        <div className="p-6">
          {/* Información del pedido */}
          <div className="bg-neutral-50 rounded-xl p-6 mb-8">
            <h3 className="font-semibold text-neutral-900 mb-4 flex items-center">
              <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></div>
              Pedido #{orderId}
            </h3>

            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">{t('customer')}</p>
                <p className="font-medium">{orderData.customer.fullName}</p>
                <p className="text-gray-600">{orderData.customer.email}</p>
                <p className="text-gray-600">{orderData.customer.phone}</p>
              </div>
              <div>
                <p className="text-gray-600">{t('shippingMethod')}</p>
                <p className="font-medium">{translateShippingMethod(orderData.shipping.method, language)}</p>
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
          <div className="bg-neutral-50 rounded-xl p-6 mb-8">
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
                <div className="flex justify-between text-emerald-600">
                  <span>Descuento{orderData.appliedCoupon?.code ? ` (${orderData.appliedCoupon.code})` : ''}:</span>
                  <span>-{formatPrice(orderData.discount, currency)}</span>
                </div>
              )}
              {orderData.loyaltyDiscount && orderData.loyaltyDiscount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Descuento puntos ({orderData.loyaltyPointsRedeemed} pts):</span>
                  <span>-{formatPrice(orderData.loyaltyDiscount, currency)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-semibold text-lg">
                <span>Total:</span>
                <span>{formatPrice(orderData.totals.total, currency)}</span>
              </div>
            </div>
          </div>

          {/* Información de pago */}
          <div className="bg-neutral-100 border border-neutral-200 rounded-xl p-6 mb-8">
            <h4 className="font-semibold text-neutral-900 mb-3">{t('paymentMethod')}</h4>
            <p className="text-neutral-700 text-lg">{translatePaymentMethod(orderData.payment.method, language)}</p>
            {orderData.payment.notes && (
              <p className="text-neutral-600 text-sm mt-2">{t('notes')} {orderData.payment.notes}</p>
            )}
          </div>

          {/* Acciones */}
          <div className="space-y-4">
            {/* Botones principales */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => {
                  if (storeInfo?.socialMedia?.whatsapp) {
                    const message = generateConfirmationWhatsAppMessage(orderData, orderId, false, undefined, language); // false = pago pendiente
                    const cleanPhone = storeInfo.socialMedia.whatsapp.replace(/[^\d+]/g, '');
                    const phoneNumber = cleanPhone.startsWith('+') ? cleanPhone.substring(1) : cleanPhone;
                    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                    window.open(whatsappUrl, '_blank');
                  } else {
                    alert(t('whatsappNotConfigured'));
                  }
                }}
                className="flex items-center justify-center gap-3 bg-emerald-600 text-white py-4 px-6 rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787"/>
                </svg>
{t('contactWhatsApp')}
              </button>

              <button
                onClick={handleGoHome}
                className="flex items-center justify-center gap-3 bg-neutral-800 text-white py-4 px-6 rounded-xl font-medium hover:bg-neutral-900 transition-colors shadow-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v1H8V5z"/>
                </svg>
    {t('backToStore')}
              </button>
            </div>

            <div className="text-center">
              <p className="text-sm text-neutral-500 leading-relaxed">
                Recibirás un correo electrónico con los detalles de tu pedido.
                <br />
                Si tienes alguna pregunta, no dudes en contactarnos por WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    );
  }

  if (paymentType === 'mercadopago' && mercadopagoData) {
    // ✅ Flujo MercadoPago - mostrar datos de MercadoPago
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">

          {/* Header de éxito */}
          <div className="bg-gradient-to-r from-neutral-800 to-neutral-700 text-white p-8 text-center">
            <div className="w-20 h-20 mx-auto bg-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-semibold mb-3">¡Pago Aprobado!</h1>
            <p className="text-neutral-200 text-lg">Tu pago con MercadoPago fue procesado exitosamente</p>
          </div>

          <div className="p-6">
            {/* Información del pago MercadoPago */}
            <div className="bg-neutral-50 rounded-xl p-6 mb-8">
              <h3 className="font-semibold text-neutral-900 mb-4 flex items-center">
                <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3"></div>
                Pago MercadoPago
              </h3>

              <div className="grid md:grid-cols-2 gap-6 text-sm">
                <div>
                  <p className="text-neutral-600 mb-1">ID de Pago:</p>
                  <p className="font-medium text-base">{mercadopagoData.payment_id}</p>
                </div>
                <div>
                  <p className="text-neutral-600 mb-1">Estado:</p>
                  <p className="font-medium text-base text-emerald-600">{mercadopagoData.status}</p>
                </div>
                {mercadopagoData.external_reference && (
                  <div className="col-span-full">
                    <p className="text-neutral-600 mb-1">Referencia:</p>
                    <p className="font-medium text-base">{mercadopagoData.external_reference}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-neutral-100 border border-neutral-200 rounded-xl p-6 mb-8">
              <h4 className="font-semibold text-neutral-900 mb-4">¿Qué sigue?</h4>
              <div className="text-sm text-neutral-700 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Recibirás un correo de confirmación de MercadoPago</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Prepararemos tu pedido para envío</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                  <p>Te notificaremos cuando esté listo</p>
                </div>
              </div>
            </div>

            {/* Acciones */}
            <div className="space-y-4">
              {/* Botones principales */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    if (storeInfo?.socialMedia?.whatsapp) {
                      // Para MercadoPago usamos mensaje simplificado ya que no tenemos orderData completo
                      const orderId = mercadopagoData.external_reference?.replace('order-', '') || mercadopagoData.payment_id;
                      const message = `¡Hola! Acabo de completar un pedido con pago online:\n\nPEDIDO #${orderId.slice(-6).toUpperCase()}\nID de Pago: ${mercadopagoData.payment_id}\nEstado: ✅ PAGADO (MercadoPago)\n\n¿Podrías confirmarme los detalles del pedido y tiempos de entrega?`;
                      const cleanPhone = storeInfo.socialMedia.whatsapp.replace(/[^\d+]/g, '');
                      const phoneNumber = cleanPhone.startsWith('+') ? cleanPhone.substring(1) : cleanPhone;
                      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                      window.open(whatsappUrl, '_blank');
                    } else {
                      alert(t('whatsappNotConfigured'));
                    }
                  }}
                  className="flex items-center justify-center gap-3 bg-emerald-600 text-white py-4 px-6 rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-sm"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787"/>
                  </svg>
  {t('contactWhatsApp')}
                </button>

                <button
                  onClick={handleGoHome}
                  className="flex items-center justify-center gap-3 bg-neutral-800 text-white py-4 px-6 rounded-xl font-medium hover:bg-neutral-900 transition-colors shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5a2 2 0 012-2h4a2 2 0 012 2v1H8V5z"/>
                  </svg>
      {t('backToStore')}
                </button>
              </div>

              <div className="text-center">
                <p className="text-sm text-neutral-500 leading-relaxed">
                  Gracias por usar MercadoPago para tu pago.
                  <br />
                  Si tienes alguna pregunta, no dudes en contactarnos por WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ❌ Estado inconsistente
  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <div className="text-center p-8">
        <p className="text-gray-600">Error: Estado de confirmación inconsistente</p>
        <button
          onClick={handleGoHome}
          className="mt-4 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Volver a la Tienda
        </button>
      </div>
    </div>
  );
}
