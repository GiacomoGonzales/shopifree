import Link from 'next/link'

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="mb-6">
            <Link 
              href="/" 
              className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
            >
              ← Volver al inicio
            </Link>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-6">Políticas de Envío</h1>

          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Métodos de Envío</h2>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Recojo en Tienda</h3>
              <p className="text-gray-600 mb-4">
                Puedes recoger tu pedido sin costo adicional en nuestra tienda física. 
                Una vez confirmado tu pedido, te notificaremos cuando esté listo para recojo.
              </p>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">Envío a Domicilio</h3>
              <p className="text-gray-600 mb-4">
                Realizamos envíos a domicilio dentro de nuestras zonas de cobertura. 
                El costo de envío se calcula automáticamente según tu ubicación.
              </p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tiempos de Entrega</h2>
            <div className="mb-6">
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li><strong>Lima Metropolitana:</strong> 1-2 días hábiles</li>
                <li><strong>Lima Provincias:</strong> 2-3 días hábiles</li>
                <li><strong>Otras provincias:</strong> 3-5 días hábiles</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Costos de Envío</h2>
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Los costos de envío varían según la zona de entrega y se calculan automáticamente 
                durante el proceso de checkout.
              </p>
              <p className="text-gray-600 mb-4">
                <strong>Envío Gratuito:</strong> Ofrecemos envío gratuito para pedidos que superen 
                el monto mínimo establecido. El monto se muestra durante el proceso de compra.
              </p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Horarios de Entrega</h2>
            <div className="mb-6">
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li><strong>Lunes a Viernes:</strong> 9:00 AM - 6:00 PM</li>
                <li><strong>Sábados:</strong> 9:00 AM - 2:00 PM</li>
                <li><strong>Domingos y Feriados:</strong> No realizamos entregas</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Seguimiento de Pedidos</h2>
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Una vez procesado tu pedido, recibirás una confirmación por email y/o WhatsApp. 
                Si tienes una cuenta registrada, podrás hacer seguimiento de tu pedido desde tu panel de usuario.
              </p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Restricciones de Entrega</h2>
            <div className="mb-6">
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Algunas zonas rurales o de difícil acceso pueden tener costos adicionales</li>
                <li>No realizamos entregas en domingos ni días feriados</li>
                <li>Los pedidos realizados después de las 6:00 PM se procesan al siguiente día hábil</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contacto</h2>
            <div className="mb-6">
              <p className="text-gray-600">
                Si tienes alguna consulta sobre tu envío, no dudes en contactarnos por WhatsApp 
                o a través de nuestros canales de atención al cliente.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 mt-8">
            <p className="text-sm text-gray-500">
              Última actualización: {new Date().toLocaleDateString('es-ES')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}