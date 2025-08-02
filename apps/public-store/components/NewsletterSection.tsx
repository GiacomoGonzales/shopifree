'use client'

import { useState } from 'react'
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore'
import { getFirebaseDb } from '../lib/firebase'

interface NewsletterSectionProps {
  storeId: string
  className?: string
}

export default function NewsletterSection({ storeId, className = '' }: NewsletterSectionProps) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim()) {
      setMessage('Por favor, introduce tu email')
      setIsSuccess(false)
      return
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setMessage('Por favor, introduce un email válido')
      setIsSuccess(false)
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      const db = getFirebaseDb()
      if (!db) {
        throw new Error('Firebase no está disponible')
      }

      const normalizedEmail = email.toLowerCase().trim()

      // Verificar si el email ya está suscrito
      const newsletterRef = collection(db, 'stores', storeId, 'newsletter')
      
      try {
        const existingQuery = query(
          newsletterRef,
          where('email', '==', normalizedEmail),
          where('status', '==', 'active')
        )
        
        const existingSnapshot = await getDocs(existingQuery)
        
        if (!existingSnapshot.empty) {
          setMessage('¡Ya estás suscrito! Gracias por ser parte de nuestra comunidad.')
          setIsSuccess(true)
          setEmail('')
          return
        }
      } catch (queryError) {
        console.log('Could not check for existing subscription, proceeding with creation:', queryError)
        // Si no podemos verificar duplicados, continuamos con la creación
      }

      // Crear nueva suscripción
      const subscriptionData = {
        email: normalizedEmail,
        storeId,
        subscribedAt: serverTimestamp(),
        status: 'active',
        source: 'home'
      }

      await addDoc(newsletterRef, subscriptionData)

      setMessage('¡Gracias por suscribirte! Pronto recibirás nuestras novedades exclusivas.')
      setIsSuccess(true)
      setEmail('')

      // Limpiar mensaje después de 5 segundos
      setTimeout(() => {
        setMessage('')
        setIsSuccess(false)
      }, 5000)

    } catch (error: any) {
      console.error('Error subscribing to newsletter:', error)
      
      let errorMessage = 'Hubo un error al procesar tu suscripción. Por favor, inténtalo de nuevo.'
      
      if (error.code === 'permission-denied') {
        errorMessage = 'Error de permisos. Las reglas de seguridad se están actualizando, intenta en unos segundos.'
      } else if (error.code === 'invalid-argument') {
        errorMessage = 'Datos inválidos. Verifica que el email sea correcto.'
      } else if (error.code === 'network-request-failed') {
        errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.'
      } else if (error.code === 'unavailable') {
        errorMessage = 'Servicio temporalmente no disponible. Intenta de nuevo en unos momentos.'
      } else if (error.message?.includes('Missing or insufficient permissions')) {
        errorMessage = 'Configurando permisos... Intenta de nuevo en unos segundos.'
      }
      
      setMessage(errorMessage)
      setIsSuccess(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className={`bg-neutral-50 border-y border-neutral-200 ${className}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 pt-20 pb-20">
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-light text-neutral-900">Mantente al día</h2>
          <p className="text-neutral-600 font-light">
            Suscríbete a nuestro newsletter y recibe las últimas novedades y ofertas exclusivas
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <form onSubmit={handleSubmit}>
            <div className="flex shadow-sm rounded-lg overflow-hidden border border-neutral-200">
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="flex-1 px-4 py-3 bg-white border-0 text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-0 font-light disabled:opacity-50"
                required
              />
              <button 
                type="submit"
                disabled={isSubmitting}
                className="px-2 sm:px-6 py-3 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors duration-200 font-medium text-xs sm:text-base whitespace-nowrap flex items-center justify-center min-w-[75px] sm:min-w-[120px] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span className="hidden sm:inline">Enviando...</span>
                  </div>
                ) : (
                  <>
                    <span className="hidden sm:inline">Suscribirse</span>
                    <span className="sm:hidden">Suscribir</span>
                  </>
                )}
              </button>
            </div>
          </form>
          
          {/* Mostrar resultado */}
          {message && (
            <div className={`mt-3 p-3 rounded-lg text-sm ${
              isSuccess 
                ? 'bg-green-50 text-green-800 border border-green-200' 
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          )}
          
          <p className="text-xs text-neutral-500 mt-3 font-light">
            No spam. Solo contenido de calidad y ofertas especiales.
          </p>
        </div>
      </div>
    </section>
  )
}