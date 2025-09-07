'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function CheckoutFailurePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [paymentData, setPaymentData] = useState<any>(null);

    useEffect(() => {
        // Capturar parámetros de MercadoPago
        const paymentId = searchParams.get('payment_id');
        const status = searchParams.get('status');
        const external_reference = searchParams.get('external_reference');
        const preference_id = searchParams.get('preference_id');

        console.log('❌ [MercadoPago Failure] Parámetros recibidos:', {
            paymentId,
            status,
            external_reference,
            preference_id,
            allParams: Object.fromEntries(searchParams.entries())
        });

        setPaymentData({
            paymentId,
            status,
            external_reference,
            preference_id
        });

        // Aquí podrías hacer una llamada para actualizar el estado del pedido
        // updateOrderStatus(external_reference, 'failed');
        
    }, [searchParams]);

    const handleRetry = () => {
        // Regresar al checkout para intentar de nuevo
        router.back();
    };

    const handleContinue = () => {
        // Regresar a la tienda
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                {/* Icono de error */}
                <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </div>

                {/* Título */}
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Pago No Completado
                </h1>

                {/* Mensaje */}
                <p className="text-gray-600 mb-6">
                    Lo sentimos, no pudimos procesar tu pago. Esto puede deberse a fondos insuficientes, datos incorretos o un problema temporal.
                </p>

                {/* Información del pago */}
                {paymentData && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                        <h3 className="font-semibold text-gray-900 mb-2">Información del Intento:</h3>
                        {paymentData.paymentId && (
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">ID de Pago:</span> {paymentData.paymentId}
                            </p>
                        )}
                        {paymentData.external_reference && (
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Referencia:</span> {paymentData.external_reference}
                            </p>
                        )}
                        {paymentData.status && (
                            <p className="text-sm text-gray-600">
                                <span className="font-medium">Estado:</span> {paymentData.status}
                            </p>
                        )}
                    </div>
                )}

                {/* Botones de acción */}
                <div className="space-y-3">
                    <button
                        onClick={handleRetry}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Intentar de Nuevo
                    </button>
                    
                    <button
                        onClick={handleContinue}
                        className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                    >
                        Volver a la Tienda
                    </button>
                </div>

                {/* Información adicional */}
                <div className="mt-6 text-xs text-gray-500">
                    <p>Si el problema persiste:</p>
                    <ul className="mt-2 space-y-1">
                        <li>• Verifica los datos de tu tarjeta</li>
                        <li>• Asegúrate de tener fondos suficientes</li>
                        <li>• Contacta a tu banco si es necesario</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}