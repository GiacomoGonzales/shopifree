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
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
            <div className="max-w-2xl w-full bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
                {/* Header de pendiente */}
                <div className="bg-gradient-to-r from-neutral-800 to-neutral-700 text-white p-8 text-center">
                    <div className="w-20 h-20 mx-auto bg-amber-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    </div>
                    <h1 className="text-3xl font-semibold mb-3">Pago Pendiente</h1>
                    <p className="text-neutral-200 text-lg">Tu pago está siendo procesado</p>
                </div>

                <div className="p-8">
                    {/* Mensaje explicativo */}
                    <div className="bg-neutral-50 rounded-xl p-6 mb-8">
                        <p className="text-neutral-700 text-center leading-relaxed">
                            Te notificaremos por correo electrónico cuando se complete la transacción. El tiempo de procesamiento depende del método de pago utilizado.
                        </p>
                    </div>

                    {/* Información del pago */}
                    {paymentData && (
                        <div className="bg-neutral-100 border border-neutral-200 rounded-xl p-6 mb-8">
                            <h3 className="font-semibold text-neutral-900 mb-4 flex items-center">
                                <div className="w-3 h-3 bg-amber-500 rounded-full mr-3"></div>
                                Información del Pago
                            </h3>
                            <div className="space-y-3 text-sm">
                                {paymentData.paymentId && (
                                    <div>
                                        <p className="text-neutral-600 mb-1">ID de Pago:</p>
                                        <p className="font-medium text-base">{paymentData.paymentId}</p>
                                    </div>
                                )}
                                {paymentData.external_reference && (
                                    <div>
                                        <p className="text-neutral-600 mb-1">Referencia:</p>
                                        <p className="font-medium text-base">{paymentData.external_reference}</p>
                                    </div>
                                )}
                                {paymentData.status && (
                                    <div>
                                        <p className="text-neutral-600 mb-1">Estado:</p>
                                        <p className="font-medium text-base text-amber-600">{paymentData.status}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Información sobre tiempos */}
                    <div className="bg-neutral-100 border border-neutral-200 rounded-xl p-6 mb-8">
                        <h4 className="font-semibold text-neutral-900 mb-4">Tiempos de Procesamiento</h4>
                        <div className="text-sm text-neutral-700 space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                                <p><span className="font-medium">Transferencias bancarias:</span> 1-2 días hábiles</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                                <p><span className="font-medium">PSE:</span> Hasta 1 día hábil</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                                <p><span className="font-medium">Efectivo:</span> Inmediato al pagar</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                                <p><span className="font-medium">Billeteras digitales:</span> Hasta 15 minutos</p>
                            </div>
                        </div>
                    </div>

                    {/* Información adicional */}
                    <div className="bg-neutral-100 border border-neutral-200 rounded-xl p-6 mb-8">
                        <h4 className="font-semibold text-neutral-900 mb-4">¿Qué sigue?</h4>
                        <div className="text-sm text-neutral-700 space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                                <p>Recibirás un correo cuando el pago se confirme</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                                <p>Prepararemos tu pedido una vez confirmado</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                                <p>Te notificaremos cuando esté listo para envío</p>
                            </div>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="space-y-4">
                        {/* Botones principales */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button
                                onClick={() => {
                                    const paymentRef = paymentData?.external_reference || 'pago pendiente';
                                    const message = `¡Hola! Tengo un pago pendiente (Referencia: ${paymentRef}). ¿Podrías ayudarme a consultar su estado?`;
                                    const whatsappUrl = `https://wa.me/51926258059?text=${encodeURIComponent(message)}`;
                                    window.open(whatsappUrl, '_blank');
                                }}
                                className="flex items-center justify-center gap-3 bg-amber-600 text-white py-4 px-6 rounded-xl font-medium hover:bg-amber-700 transition-colors shadow-sm"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.787"/>
                                </svg>
                                Contactar por WhatsApp
                            </button>

                            <button
                                onClick={handleCheckStatus}
                                className="flex items-center justify-center gap-3 bg-neutral-800 text-white py-4 px-6 rounded-xl font-medium hover:bg-neutral-900 transition-colors shadow-sm"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/>
                                </svg>
                                Consultar Estado
                            </button>
                        </div>

                        {/* Botón secundario */}
                        <button
                            onClick={handleContinue}
                            className="w-full bg-neutral-100 text-neutral-700 py-3 px-6 rounded-xl font-medium hover:bg-neutral-200 transition-colors border border-neutral-300"
                        >
                            Continuar Comprando
                        </button>

                        <div className="text-center">
                            <p className="text-sm text-neutral-500 leading-relaxed">
                                Si tienes dudas sobre tu pago, no dudes en contactarnos por WhatsApp.
                                <br />
                                Te mantendremos informado sobre el estado de tu transacción.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}