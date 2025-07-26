'use client'

import { useEffect } from 'react'
import { useNewsletter } from '../../lib/hooks/useNewsletter'
import { NewsletterSubscription } from '../../lib/newsletter'

interface NewsletterFormProps {
  storeId: string
  source: NewsletterSubscription['source']
  variant?: 'default' | 'compact' | 'hero'
  className?: string
}

const Icons = {
  CheckCircle: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
    </svg>
  ),
  ExclamationCircle: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  ),
  Loading: () => (
    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
    </svg>
  ),
  Send: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  )
}

export default function NewsletterForm({ 
  storeId, 
  source, 
  variant = 'default',
  className = ''
}: NewsletterFormProps) {
  const { email, setEmail, isSubmitting, result, subscribe, reset } = useNewsletter(storeId)

  // Auto-limpiar mensaje después de 5 segundos
  useEffect(() => {
    if (result) {
      const timer = setTimeout(() => {
        reset()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [result, reset])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await subscribe(source)
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'compact':
        return {
          container: 'space-y-2',
          input: 'input-boutique text-sm',
          button: 'btn-boutique-primary text-sm px-4 py-2',
          message: 'text-xs mt-2'
        }
      case 'hero':
        return {
          container: 'space-y-4',
          input: 'input-boutique text-lg px-6 py-4',
          button: 'btn-boutique-primary text-lg px-8 py-4',
          message: 'text-sm mt-3'
        }
      default:
        return {
          container: 'space-y-3',
          input: 'input-boutique',
          button: 'btn-boutique-primary w-full',
          message: 'text-sm mt-2'
        }
    }
  }

  const classes = getVariantClasses()

  return (
    <div className={`newsletter-form-elegant ${className}`}>
      <form onSubmit={handleSubmit} className={classes.container}>
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className={classes.input}
            disabled={isSubmitting}
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting || !email.trim()}
          className={`${classes.button} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2`}
        >
          {isSubmitting ? (
            <>
              <Icons.Loading />
              <span>Suscribiendo...</span>
            </>
          ) : (
            <>
              <Icons.Send />
              <span>
                {variant === 'hero' ? 'Suscribirse a la Newsletter' : 'Suscribirse'}
              </span>
            </>
          )}
        </button>
      </form>

      {/* Mensaje de resultado */}
      {result && (
        <div 
          className={`${classes.message} flex items-center space-x-2 transition-all duration-300 ${
            result.success 
              ? 'text-green-600' 
              : 'text-red-600'
          }`}
        >
          {result.success ? <Icons.CheckCircle /> : <Icons.ExclamationCircle />}
          <span className="font-light">{result.message}</span>
        </div>
      )}

      {/* Texto de privacidad para variant hero */}
      {variant === 'hero' && !result && (
        <p 
          className="text-xs mt-4 font-light text-sans text-center" 
          style={{ color: 'rgb(var(--theme-neutral-medium))' }}
        >
          Contenido exclusivo, sin spam. Solo elegancia y calidad.
        </p>
      )}
    </div>
  )
} 