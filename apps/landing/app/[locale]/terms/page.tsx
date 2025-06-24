'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function TermsPage() {
  const t = useTranslations('home')

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Shopifree</h1>
            </Link>
            <Link href="/" className="text-indigo-600 hover:text-indigo-500">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Términos y Condiciones</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            Última actualización: Diciembre 2024
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Aceptación de términos</h2>
            <p className="text-gray-700 mb-4">
              Al acceder y utilizar Shopifree, aceptas estar sujeto a estos términos y condiciones de uso.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Descripción del servicio</h2>
            <p className="text-gray-700 mb-4">
              Shopifree es una plataforma que permite a los usuarios crear y gestionar tiendas online. Proporcionamos herramientas para:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Crear y personalizar tiendas virtuales</li>
              <li>Gestionar productos e inventario</li>
              <li>Procesar pedidos y pagos</li>
              <li>Analizar rendimiento de ventas</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Responsabilidades del usuario</h2>
            <p className="text-gray-700 mb-4">
              Como usuario de Shopifree, te comprometes a:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Proporcionar información precisa y actualizada</li>
              <li>Mantener la seguridad de tu cuenta</li>
              <li>Cumplir con todas las leyes aplicables</li>
              <li>No utilizar el servicio para actividades ilegales</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Limitación de responsabilidad</h2>
            <p className="text-gray-700 mb-4">
              Shopifree se proporciona "tal como es" sin garantías de ningún tipo. No seremos responsables por daños directos, indirectos, incidentales o consecuentes.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Modificaciones</h2>
            <p className="text-gray-700 mb-4">
              Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán efectivos inmediatamente después de su publicación.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Contacto</h2>
            <p className="text-gray-700 mb-4">
              Para preguntas sobre estos términos, contáctanos en:
            </p>
            <p className="text-gray-700">
              Email: legal@shopifree.app
            </p>
          </section>
        </div>
      </main>
    </div>
  )
} 