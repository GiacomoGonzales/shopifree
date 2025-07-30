'use client'

import Link from 'next/link'
import { Button, Input } from '@shopifree/ui'

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <Link href="/" className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Shopifree</h1>
            </Link>
            <Link href="/" className="text-gray-600 hover:text-gray-900">
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Contacto</h1>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Soporte general</h3>
                <p className="text-gray-600">support@shopifree.app</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ventas</h3>
                <p className="text-gray-600">sales@shopifree.app</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Soporte técnico</h3>
                <p className="text-gray-600">tech@shopifree.app</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Legal</h3>
                <p className="text-gray-600">legal@shopifree.app</p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Horarios de atención</h3>
                <p className="text-gray-600">Lunes a Viernes: 9:00 AM - 6:00 PM (GMT-5)</p>
                <p className="text-gray-600">Sábados: 10:00 AM - 2:00 PM (GMT-5)</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <div className="bg-gray-50 rounded-lg p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Envíanos un mensaje</h2>
              
              <form className="space-y-6">
                <Input
                  label="Nombre completo"
                  type="text"
                  required
                />

                <Input
                  label="Email"
                  type="email"
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asunto
                  </label>
                  <select className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm">
                    <option>Soporte general</option>
                    <option>Problema técnico</option>
                    <option>Consulta de ventas</option>
                    <option>Sugerencia</option>
                    <option>Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mensaje
                  </label>
                  <textarea 
                    rows={4}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Describe tu consulta o problema..."
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Enviar mensaje
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                  Responderemos tu mensaje en menos de 24 horas
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 