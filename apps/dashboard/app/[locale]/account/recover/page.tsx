'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../../lib/simple-auth-context'
import { getAccountDeletionInfo, restoreUserAndStore } from '../../../../lib/user'
import { Toast } from '../../../../components/shared/Toast'
import { useToast } from '../../../../lib/hooks/useToast'

export default function RecoverAccountPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { toast, showToast, hideToast } = useToast()
  const [loading, setLoading] = useState(true)
  const [deletionInfo, setDeletionInfo] = useState<any>(null)
  const [restoring, setRestoring] = useState(false)

  useEffect(() => {
    const checkDeletionStatus = async () => {
      // Esperar a que auth termine de cargar
      if (authLoading) {
        return
      }

      // Si no hay usuario después de cargar, redirigir a login
      if (!user?.uid) {
        router.push('/login')
        return
      }

      try {
        const info = await getAccountDeletionInfo(user.uid)

        if (!info || !info.isDeleted) {
          // Cuenta no está eliminada, redirigir al dashboard
          router.push('/es')
          return
        }

        if (info.daysRemaining && info.daysRemaining <= 0) {
          // Período de gracia expirado
          showToast('El período de recuperación ha expirado. Contacta a soporte.', 'error')
          setLoading(false)
          return
        }

        setDeletionInfo(info)
      } catch (error) {
        console.error('Error checking deletion status:', error)
        showToast('Error al verificar el estado de la cuenta', 'error')
      } finally {
        setLoading(false)
      }
    }

    checkDeletionStatus()
  }, [user, router, authLoading])

  const handleRestore = async () => {
    if (!user?.uid) return

    setRestoring(true)

    try {
      await restoreUserAndStore(user.uid)

      showToast('¡Cuenta restaurada exitosamente!', 'success')

      // Redirigir al dashboard después de 1.5 segundos
      setTimeout(() => {
        window.location.href = '/es'
      }, 1500)
    } catch (error) {
      console.error('Error restoring account:', error)
      showToast('Error al restaurar la cuenta. Intenta de nuevo.', 'error')
    } finally {
      setRestoring(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="mt-4 text-gray-600">Verificando estado de la cuenta...</p>
        </div>
      </div>
    )
  }

  if (!deletionInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">No se pudo cargar la información de la cuenta.</p>
          <button
            onClick={() => router.push('/login')}
            className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 p-8">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 text-center mb-2">Cuenta Marcada para Eliminación</h1>
          <p className="text-gray-600 text-center">Aún estás a tiempo de recuperar tu cuenta</p>
        </div>

        <div className="p-8">
          {/* Información de eliminación */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6 border border-gray-100">
            <h3 className="font-medium text-gray-900 mb-4 text-sm uppercase tracking-wide">
              Información de Eliminación
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-sm text-gray-600">Fecha de eliminación</span>
                <span className="text-sm font-medium text-gray-900">
                  {deletionInfo.deletedAt ? new Date(deletionInfo.deletedAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'No disponible'}
                </span>
              </div>

              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-sm text-gray-600">Eliminación permanente programada</span>
                <span className="text-sm font-medium text-gray-900">
                  {deletionInfo.scheduledDeletionDate ? new Date(deletionInfo.scheduledDeletionDate).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  }) : 'No disponible'}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2">
                <span className="text-sm font-medium text-gray-900">Días restantes para recuperar</span>
                <span className="text-2xl font-bold text-gray-900">
                  {deletionInfo.daysRemaining}
                </span>
              </div>
            </div>
          </div>

          {/* Información importante */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6">
            <h4 className="font-medium text-gray-900 mb-3 text-sm">
              ¿Qué sucederá al recuperar tu cuenta?
            </h4>
            <ul className="text-gray-600 text-sm space-y-2">
              <li className="flex items-start">
                <svg className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Tu cuenta de usuario será completamente restaurada
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Tu tienda volverá a estar activa y accesible
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Todos tus productos, pedidos y configuraciones permanecerán intactos
              </li>
              <li className="flex items-start">
                <svg className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
                Podrás acceder al dashboard inmediatamente
              </li>
            </ul>
          </div>

          {/* Acciones */}
          <div className="space-y-3">
            <button
              onClick={handleRestore}
              disabled={restoring}
              className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {restoring ? (
                <>
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Restaurando cuenta...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  Recuperar Mi Cuenta
                </>
              )}
            </button>

            <button
              onClick={() => {
                const auth = require('../../../../lib/firebase').getFirebaseAuth()
                if (auth) {
                  auth.signOut()
                }
                router.push('/login')
              }}
              className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cerrar Sesión
            </button>

            <p className="text-center text-xs text-gray-500 pt-2">
              Si no recuperas tu cuenta en {deletionInfo.daysRemaining} día{deletionInfo.daysRemaining !== 1 ? 's' : ''}, todos tus datos serán eliminados permanentemente.
            </p>
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  )
}
