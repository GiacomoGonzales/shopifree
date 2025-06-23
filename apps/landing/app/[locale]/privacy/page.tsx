import { useTranslations } from 'next-intl'
import Link from 'next/link'

export default function PrivacyPage() {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Políticas de Privacidad</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-gray-600 mb-6">
            Última actualización: Diciembre 2024
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Información que recopilamos</h2>
            <p className="text-gray-700 mb-4">
              En Shopifree, recopilamos información que nos proporcionas directamente cuando:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Creas una cuenta</li>
              <li>Utilizas nuestros servicios</li>
              <li>Te comunicas con nosotros</li>
              <li>Participas en encuestas o promociones</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Cómo utilizamos tu información</h2>
            <p className="text-gray-700 mb-4">
              Utilizamos la información recopilada para:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Proporcionar y mantener nuestros servicios</li>
              <li>Procesar transacciones</li>
              <li>Enviarte comunicaciones importantes</li>
              <li>Mejorar nuestros servicios</li>
              <li>Cumplir con obligaciones legales</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Compartir información</h2>
            <p className="text-gray-700 mb-4">
              No vendemos, intercambiamos ni transferimos tu información personal a terceros, excepto en los casos descritos en esta política.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Seguridad de datos</h2>
            <p className="text-gray-700 mb-4">
              Implementamos medidas de seguridad apropiadas para proteger tu información personal contra acceso no autorizado, alteración, divulgación o destrucción.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Contacto</h2>
            <p className="text-gray-700 mb-4">
              Si tienes preguntas sobre esta política de privacidad, contáctanos en:
            </p>
            <p className="text-gray-700">
              Email: privacy@shopifree.app
            </p>
          </section>
        </div>
      </main>
    </div>
  )
} 