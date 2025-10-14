'use client'

import { useState } from 'react'

interface AITextImproverProps {
  type: 'name' | 'description' | 'seoTitle' | 'metaDescription' | 'urlSlug'
  currentText: string
  onImprovedText: (text: string) => void
  productName?: string
  productDescription?: string
  className?: string
}

export function AITextImprover({
  type,
  currentText,
  onImprovedText,
  productName,
  productDescription,
  className = ''
}: AITextImproverProps) {
  const [improving, setImproving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Determinar si puede mejorar/generar
  const canImprove = () => {
    if (type === 'name') {
      return currentText.trim().length >= 3
    } else if (type === 'description') {
      // Para descripción: puede generar si hay nombre, o mejorar si hay descripción
      return (currentText.trim().length > 0) || (productName && productName.trim().length >= 3)
    } else {
      // Para campos SEO: puede generar si hay nombre, o mejorar si hay contenido
      return (currentText.trim().length > 0) || (productName && productName.trim().length >= 3)
    }
  }

  // Determinar el texto del botón
  const getButtonText = () => {
    if (improving) return 'Mejorando...'

    if (type === 'name') {
      return 'Mejorar'
    } else if (type === 'description') {
      // Descripción
      if (currentText.trim().length > 0) {
        return 'Mejorar'
      } else {
        return 'Generar con IA'
      }
    } else if (type === 'seoTitle') {
      return currentText.trim().length > 0 ? 'Optimizar' : 'Generar'
    } else if (type === 'metaDescription') {
      return currentText.trim().length > 0 ? 'Optimizar' : 'Generar'
    } else if (type === 'urlSlug') {
      return currentText.trim().length > 0 ? 'Optimizar' : 'Generar'
    }

    return 'Mejorar'
  }

  const handleImprove = async () => {
    if (!canImprove()) {
      setError(type === 'name' ? 'Escribe al menos 3 caracteres' : 'Escribe un nombre primero')
      return
    }

    setImproving(true)
    setError(null)

    try {
      console.log('✨ Improving text with AI...')

      const response = await fetch('/api/ai/improve-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type,
          currentText,
          productName,
          productDescription
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to improve text')
      }

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Unknown error')
      }

      console.log('✅ Text improved successfully')
      onImprovedText(result.improvedText)

    } catch (err: any) {
      console.error('❌ Error improving text:', err)
      setError(err.message || 'Error al mejorar el texto')
    } finally {
      setImproving(false)
    }
  }

  return (
    <div className={`flex items-center justify-end ${className}`}>
      <button
        onClick={handleImprove}
        disabled={!canImprove() || improving}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-md transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-200 hover:border-gray-300 hover:shadow-sm"
        title={type === 'name' ? 'Mejorar nombre con IA' : currentText ? 'Mejorar descripción con IA' : 'Generar descripción con IA'}
      >
        {improving ? (
          <>
            <svg className="animate-spin h-3.5 w-3.5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Mejorando...</span>
          </>
        ) : (
          <>
            <svg className="h-3.5 w-3.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
            <span>{getButtonText()}</span>
          </>
        )}
      </button>

      {error && (
        <span className="text-[10px] text-red-600 ml-2">{error}</span>
      )}
    </div>
  )
}
