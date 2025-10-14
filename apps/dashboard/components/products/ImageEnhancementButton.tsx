'use client'

import { useState, useEffect } from 'react'
import { collection, addDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore'
import { useAuth } from '../../lib/simple-auth-context'
import { getFirebaseDb } from '../../lib/firebase'

interface ImageEnhancementButtonProps {
  storeId: string
  productId: string
  imageUrl: string
  mediaFileId: string
  onSuccess?: (enhancedImageUrl: string) => void
  onError?: (error: string) => void
  disabled?: boolean
  className?: string
}

export function ImageEnhancementButton({
  storeId,
  productId,
  imageUrl,
  mediaFileId,
  onSuccess,
  onError,
  disabled = false,
  className = ''
}: ImageEnhancementButtonProps) {
  const { user } = useAuth()
  const [enhancing, setEnhancing] = useState(false)
  const [progress, setProgress] = useState<string>('')
  const [jobId, setJobId] = useState<string | null>(null)

  // Real-time listener for job status
  useEffect(() => {
    if (!jobId || !enhancing) return

    const db = getFirebaseDb()
    if (!db) return

    // Listen to job document changes in real-time
    const jobDocRef = doc(db, 'imageJobs', jobId)
    const unsubscribe = onSnapshot(jobDocRef, (docSnapshot) => {
      if (!docSnapshot.exists()) return

      const jobData = docSnapshot.data()
      const { status, enhancedImageUrl, error } = jobData

      console.log('Job status update:', status)

      if (status === 'COMPLETED') {
        setProgress('Completado')

        if (onSuccess && enhancedImageUrl) {
          onSuccess(enhancedImageUrl)
        }

        // Recargar la página después de 1 segundo
        setTimeout(() => {
          window.location.reload()
        }, 1000)
      } else if (status === 'FAILED') {
        setProgress('Error')

        const errorMessage = error || 'Error al mejorar la imagen'
        if (onError) {
          onError(errorMessage)
        } else {
          alert(`Error: ${errorMessage}`)
        }

        setTimeout(() => {
          setEnhancing(false)
          setJobId(null)
        }, 2000)
      } else if (status === 'PROCESSING') {
        setProgress('Procesando con IA...')
      } else if (status === 'PENDING') {
        setProgress('Esperando procesamiento...')
      }
    }, (error) => {
      console.error('Error listening to job status:', error)
    })

    return () => unsubscribe()
  }, [jobId, enhancing, onSuccess, onError])

  const handleEnhance = async () => {
    setEnhancing(true)
    setProgress('Creando job...')

    try {
      console.log('Starting image enhancement...')
      console.log('Parameters:', { storeId, productId, imageUrl, mediaFileId })

      // Verificar autenticación
      if (!user) {
        throw new Error('Usuario no autenticado')
      }

      // Obtener Firestore
      const db = getFirebaseDb()
      if (!db) {
        throw new Error('Firebase no disponible')
      }

      // Crear documento de job directamente en Firestore
      const imageJobsCollection = collection(db, 'imageJobs')
      const jobDocRef = await addDoc(imageJobsCollection, {
        userId: user.uid,
        storeId,
        productId,
        imageUrl,
        mediaFileId,
        status: 'PENDING',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })

      console.log('✅ Job created with ID:', jobDocRef.id)

      setJobId(jobDocRef.id)
      setProgress('Esperando procesamiento...')
      // El listener en tiempo real empezará automáticamente

    } catch (error: any) {
      console.error('Error starting enhancement:', error)

      const errorMessage = error.message || 'Error al iniciar mejora de imagen'
      setProgress('Error')

      if (onError) {
        onError(errorMessage)
      } else {
        alert(`Error: ${errorMessage}`)
      }

      setTimeout(() => {
        setEnhancing(false)
        setJobId(null)
        setProgress('')
      }, 2000)
    }
  }

  return (
    <button
      onClick={handleEnhance}
      disabled={enhancing || disabled}
      className={`
        inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium
        bg-white border border-gray-300 rounded-md
        text-gray-700 hover:bg-gray-50 hover:border-gray-400
        disabled:opacity-50 disabled:cursor-not-allowed
        transition-all duration-200
        ${className}
      `}
    >
      {enhancing ? (
        <>
          <svg className="animate-spin h-3.5 w-3.5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{progress}</span>
        </>
      ) : (
        <>
          <svg className="h-3.5 w-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Mejorar imagen</span>
        </>
      )}
    </button>
  )
}
