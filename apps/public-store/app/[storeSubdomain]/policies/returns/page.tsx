import Link from 'next/link'

export default function ReturnsPolicyPage() {
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

          <h1 className="text-3xl font-bold text-gray-900 mb-6">Políticas de Devoluciones</h1>

          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Condiciones Generales</h2>
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Aceptamos devoluciones dentro de los 30 días posteriores a la recepción 
                de tu pedido, siempre que se cumplan las condiciones establecidas en esta política.
              </p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Productos Elegibles para Devolución</h2>
            <div className="mb-6">
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Productos en su estado original, sin usar y con todas las etiquetas</li>
                <li>Productos que no hayan sido alterados o dañados por el uso</li>
                <li>Productos en su empaque original</li>
                <li>Productos que incluyan todos los accesorios y documentación original</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Productos NO Elegibles</h2>
            <div className="mb-6">
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Productos personalizados o hechos bajo pedido</li>
                <li>Productos de higiene personal por razones de seguridad</li>
                <li>Productos perecederos o con fecha de vencimiento</li>
                <li>Productos digitales o descargables</li>
                <li>Productos dañados por mal uso o desgaste normal</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Proceso de Devolución</h2>
            <div className="mb-6">
              <ol className="list-decimal list-inside space-y-3 text-gray-600">
                <li>
                  <strong>Contactar Atención al Cliente:</strong> Envía un mensaje por WhatsApp 
                  o email indicando el número de pedido y el motivo de la devolución.
                </li>
                <li>
                  <strong>Autorización:</strong> Nuestro equipo evaluará tu solicitud y te 
                  proporcionará un número de autorización de devolución (RMA).
                </li>
                <li>
                  <strong>Empaque:</strong> Empaca cuidadosamente el producto en su caja original 
                  con todos los accesorios incluidos.
                </li>
                <li>
                  <strong>Envío:</strong> Envía el producto a nuestra dirección usando el método 
                  de envío que te indiquemos.
                </li>
              </ol>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Opciones de Reembolso</h2>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Reembolso Completo</h3>
              <p className="text-gray-600 mb-4">
                Para productos defectuosos o errores de nuestra parte, ofrecemos reembolso 
                completo incluyendo los costos de envío.
              </p>
              
              <h3 className="text-lg font-medium text-gray-900 mb-2">Cambio por Otro Producto</h3>
              <p className="text-gray-600 mb-4">
                Puedes solicitar el cambio por otro producto de igual o mayor valor. 
                Si hay diferencia de precio, se cobrará o reembolsará según corresponda.
              </p>

              <h3 className="text-lg font-medium text-gray-900 mb-2">Crédito en Tienda</h3>
              <p className="text-gray-600 mb-4">
                Ofrecemos crédito en tienda válido por 1 año para futuras compras.
              </p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Tiempos de Procesamiento</h2>
            <div className="mb-6">
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li><strong>Procesamiento:</strong> 3-5 días hábiles después de recibir el producto</li>
                <li><strong>Reembolso:</strong> 5-10 días hábiles adicionales para reflejar en tu cuenta</li>
                <li><strong>Cambios:</strong> 7-14 días hábiles para envío del nuevo producto</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Costos de Devolución</h2>
            <div className="mb-6">
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                <li>Los costos de envío de devolución corren por cuenta del cliente, excepto en casos de productos defectuosos</li>
                <li>Recomendamos usar un servicio de envío con seguimiento y seguro</li>
                <li>No nos hacemos responsables por productos perdidos durante el envío de devolución</li>
              </ul>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Garantía</h2>
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Todos nuestros productos cuentan con garantía contra defectos de fabricación 
                según los términos establecidos por cada fabricante.
              </p>
              <p className="text-gray-600">
                Para hacer válida la garantía, conserva tu comprobante de compra y contacta 
                a nuestro servicio de atención al cliente.
              </p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Excepciones</h2>
            <div className="mb-6">
              <p className="text-gray-600">
                Nos reservamos el derecho de rechazar devoluciones que no cumplan con 
                nuestras políticas o que muestren signos de uso excesivo o daño intencional.
              </p>
            </div>

            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contacto</h2>
            <div className="mb-6">
              <p className="text-gray-600">
                Para iniciar una devolución o resolver cualquier duda, contáctanos por WhatsApp 
                o a través de nuestros canales oficiales de atención al cliente.
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