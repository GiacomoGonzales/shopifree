'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutSuccessPage() {
    const router = useRouter();
    const [paymentData, setPaymentData] = useState<any>(null);

    useEffect(() => {
        // Solo ejecutar del lado del cliente
        if (typeof window !== 'undefined') {
            // Capturar parámetros de MercadoPago
            const urlParams = new URLSearchParams(window.location.search);
            const paymentId = urlParams.get('payment_id');
            const status = urlParams.get('status');
            const external_reference = urlParams.get('external_reference');
            const preference_id = urlParams.get('preference_id');

            console.log('🎉 [MercadoPago Success] Parámetros recibidos:', {
                paymentId,
                status,
                external_reference,
                preference_id
            });

            setPaymentData({
                paymentId,
                status,
                external_reference,
                preference_id
            });

            // Aquí podrías hacer una llamada para actualizar el estado del pedido
            // updateOrderStatus(external_reference, 'paid');
        }
    }, []);

    const handleContinue = () => {
        // Regresar a la tienda o página principal
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-green-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                {/* Icono de éxito */}
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>

                {/* Título */}
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    ¡Pago Exitoso!
                </h1>

                {/* Mensaje */}
                <p className="text-gray-600 mb-6">
                    Tu pago ha sido procesado correctamente. Recibirás un correo electrónico con los detalles de tu pedido.
                </p>

                {/* Información del pago */}
                {paymentData && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                        <h3 className="font-semibold text-gray-900 mb-2">Detalles del Pago:</h3>
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

                {/* Botón para continuar */}
                <button
                    onClick={handleContinue}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                    Continuar Comprando
                </button>

                {/* Información adicional */}
                <p className="text-xs text-gray-500 mt-4">
                    Si tienes alguna pregunta sobre tu pedido, contáctanos.
                </p>
            </div>
        </div>
    );
}