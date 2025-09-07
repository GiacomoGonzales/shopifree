'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPendingPage() {
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

            console.log('⏳ [MercadoPago Pending] Parámetros recibidos:', {
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
            // updateOrderStatus(external_reference, 'pending');
        }
    }, []);

    const handleContinue = () => {
        // Regresar a la tienda
        router.push('/');
    };

    const handleCheckStatus = () => {
        // Aquí podrías implementar una consulta del estado del pago
        alert('Función de consulta de estado próximamente disponible');
    };

    return (
        <div className="min-h-screen bg-yellow-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
                {/* Icono de pendiente */}
                <div className="w-16 h-16 mx-auto bg-yellow-100 rounded-full flex items-center justify-center mb-6">
                    <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                </div>

                {/* Título */}
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                    Pago Pendiente
                </h1>

                {/* Mensaje */}
                <p className="text-gray-600 mb-6">
                    Tu pago está siendo procesado. Te notificaremos por correo electrónico cuando se complete la transacción.
                </p>

                {/* Información del pago */}
                {paymentData && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                        <h3 className="font-semibold text-gray-900 mb-2">Información del Pago:</h3>
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

                {/* Información sobre tiempos */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <h4 className="font-semibold text-blue-900 mb-2">Tiempos de Procesamiento:</h4>
                    <ul className="text-sm text-blue-800 space-y-1 text-left">
                        <li>• <strong>Transferencias bancarias:</strong> 1-2 días hábiles</li>
                        <li>• <strong>PSE:</strong> Hasta 1 día hábil</li>
                        <li>• <strong>Efectivo:</strong> Inmediato al pagar</li>
                        <li>• <strong>Nequi/Daviplata:</strong> Hasta 15 minutos</li>
                    </ul>
                </div>

                {/* Botones de acción */}
                <div className="space-y-3">
                    <button
                        onClick={handleCheckStatus}
                        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Consultar Estado
                    </button>
                    
                    <button
                        onClick={handleContinue}
                        className="w-full bg-gray-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                    >
                        Continuar Comprando
                    </button>
                </div>

                {/* Información adicional */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">¿Qué sigue?</h4>
                    <div className="text-xs text-gray-600 space-y-1">
                        <p>• Recibirás un correo cuando el pago se confirme</p>
                        <p>• Prepararemos tu pedido una vez confirmado</p>
                        <p>• Te notificaremos cuando esté listo para envío</p>
                    </div>
                </div>
            </div>
        </div>
    );
}