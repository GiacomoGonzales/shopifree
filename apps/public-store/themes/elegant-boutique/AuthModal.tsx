'use client'

import { useState } from 'react'
import { useStoreAuth } from '../../lib/store-auth-context'

interface ElegantAuthModalProps {
  onClose: () => void
  storeName: string
}

export default function ElegantAuthModal({ onClose, storeName }: ElegantAuthModalProps) {
  const { login, loginWithGoogle, register, resetPassword, error, loading, clearError } = useStoreAuth()
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    phone: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [resetEmailSent, setResetEmailSent] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) clearError()
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(formData.email, formData.password)
      onClose()
    } catch {
      // El error se maneja en el contexto
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      // Aquí podrías mostrar un error local
      return
    }

    try {
      await register(formData.email, formData.password, {
        displayName: formData.displayName,
        phone: formData.phone
      })
      onClose()
    } catch {
      // El error se maneja en el contexto
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await resetPassword(formData.email)
      setResetEmailSent(true)
    } catch {
      // El error se maneja en el contexto
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle()
      onClose()
    } catch {
      // El error se maneja en el contexto
    }
  }

  const switchMode = (newMode: 'login' | 'register' | 'reset') => {
    setMode(newMode)
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      displayName: '',
      phone: ''
    })
    setResetEmailSent(false)
    clearError()
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay */}
        <div
          className="fixed inset-0 transition-opacity"
          style={{ backgroundColor: 'rgba(var(--theme-neutral-dark), 0.75)' }}
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-md p-8 my-8 overflow-hidden text-left align-middle transition-all transform shadow-xl rounded-sm" style={{ backgroundColor: 'rgb(var(--theme-neutral-light))' }}>
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-light text-serif" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                {mode === 'login' && 'Iniciar Sesión'}
                {mode === 'register' && 'Crear Cuenta'}
                {mode === 'reset' && 'Recuperar Contraseña'}
              </h3>
              <p className="text-sm text-sans mt-1" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                {mode === 'login' && 'Accede a tu cuenta'}
                {mode === 'register' && 'Únete a nuestra comunidad'}
                {mode === 'reset' && 'Te enviaremos un enlace de recuperación'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="hover-elegant p-2"
              style={{ color: 'rgb(var(--theme-neutral-medium))' }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Separador decorativo */}
          <div className="separator-elegant mb-6"></div>

          {/* Mensaje de error */}
          {error && (
            <div className="mb-6 p-4 rounded-sm" style={{ 
              backgroundColor: 'rgb(var(--theme-error) / 0.1)', 
              border: '1px solid rgb(var(--theme-error) / 0.2)' 
            }}>
              <p className="text-sm text-sans" style={{ color: 'rgb(var(--theme-error))' }}>
                {error}
              </p>
              {error.includes('ya está registrado') && (
                <div className="mt-3 space-x-2">
                  <button
                    onClick={() => switchMode('login')}
                    className="text-sm text-sans hover-elegant underline"
                    style={{ color: 'rgb(var(--theme-error))' }}
                  >
                    Iniciar Sesión
                  </button>
                  <span style={{ color: 'rgb(var(--theme-error) / 0.5)' }}>|</span>
                  <button
                    onClick={() => switchMode('reset')}
                    className="text-sm text-sans hover-elegant underline"
                    style={{ color: 'rgb(var(--theme-error))' }}
                  >
                    Recuperar Contraseña
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Formulario de Login */}
          {mode === 'login' && (
            <div className="space-y-6">
              {/* Botón de Google */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 border rounded-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  borderColor: `rgb(var(--theme-primary) / 0.2)`,
                  backgroundColor: `rgb(var(--theme-neutral-light))`,
                  color: `rgb(var(--theme-neutral-dark))`,
                  fontFamily: `var(--theme-font-body)`,
                  letterSpacing: '0.025em',
                  transition: `var(--theme-transition)`
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = `rgb(var(--theme-secondary))`
                    e.currentTarget.style.borderColor = `rgb(var(--theme-primary) / 0.3)`
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = `var(--theme-shadow-sm)`
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = `rgb(var(--theme-neutral-light))`
                    e.currentTarget.style.borderColor = `rgb(var(--theme-primary) / 0.2)`
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {loading ? 'Iniciando sesión...' : 'Continuar con Google'}
              </button>

              {/* Separador decorativo */}
              <div className="relative">
                <div 
                  className="absolute inset-0 flex items-center"
                  style={{ borderTop: `1px solid rgb(var(--theme-primary) / 0.1)` }}
                />
                <div className="relative flex justify-center text-sm">
                  <span 
                    className="bg-transparent px-4 text-xs font-light"
                    style={{
                      color: `rgb(var(--theme-neutral-medium))`,
                      fontFamily: `var(--theme-font-body)`,
                      backgroundColor: `rgb(var(--theme-neutral-light))`
                    }}
                  >
                    o continúa con email
                  </span>
                </div>
              </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-sans mb-2" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="input-boutique"
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-sans mb-2" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="input-boutique pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 hover-elegant"
                    style={{ color: 'rgb(var(--theme-neutral-medium))' }}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 11-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="btn-boutique-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
              <div className="text-center space-y-3">
                <button
                  type="button"
                  onClick={() => switchMode('reset')}
                  className="text-sm text-sans hover-elegant"
                  style={{ color: 'rgb(var(--theme-accent))' }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
                <div className="text-sm text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                  ¿No tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className="font-medium hover-elegant"
                    style={{ color: 'rgb(var(--theme-accent))' }}
                  >
                    Crear cuenta
                  </button>
                </div>
              </div>
            </form>
            </div>
          )}

          {/* Formulario de Registro */}
          {mode === 'register' && (
            <div className="space-y-6">
              {/* Botón de Google */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-6 py-3 border rounded-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  borderColor: `rgb(var(--theme-primary) / 0.2)`,
                  backgroundColor: `rgb(var(--theme-neutral-light))`,
                  color: `rgb(var(--theme-neutral-dark))`,
                  fontFamily: `var(--theme-font-body)`,
                  letterSpacing: '0.025em',
                  transition: `var(--theme-transition)`
                }}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = `rgb(var(--theme-secondary))`
                    e.currentTarget.style.borderColor = `rgb(var(--theme-primary) / 0.3)`
                    e.currentTarget.style.transform = 'translateY(-1px)'
                    e.currentTarget.style.boxShadow = `var(--theme-shadow-sm)`
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.currentTarget.style.backgroundColor = `rgb(var(--theme-neutral-light))`
                    e.currentTarget.style.borderColor = `rgb(var(--theme-primary) / 0.2)`
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }
                }}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {loading ? 'Creando cuenta...' : 'Continuar con Google'}
              </button>

              {/* Separador decorativo */}
              <div className="relative">
                <div 
                  className="absolute inset-0 flex items-center"
                  style={{ borderTop: `1px solid rgb(var(--theme-primary) / 0.1)` }}
                />
                <div className="relative flex justify-center text-sm">
                  <span 
                    className="bg-transparent px-4 text-xs font-light"
                    style={{
                      color: `rgb(var(--theme-neutral-medium))`,
                      fontFamily: `var(--theme-font-body)`,
                      backgroundColor: `rgb(var(--theme-neutral-light))`
                    }}
                  >
                    o regístrate con email
                  </span>
                </div>
              </div>

            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-sans mb-2" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                  Nombre completo
                </label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  required
                  className="input-boutique"
                  placeholder="Tu nombre completo"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-sans mb-2" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="input-boutique"
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-sans mb-2" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                  Teléfono <span className="text-xs" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>(opcional)</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="input-boutique"
                  placeholder="+1 234 567 8900"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-sans mb-2" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                  Contraseña
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  className="input-boutique"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-sans mb-2" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                  Confirmar contraseña
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  className="input-boutique"
                  placeholder="••••••••"
                />
              </div>
              {formData.password !== formData.confirmPassword && formData.confirmPassword && (
                <p className="text-sm text-sans" style={{ color: 'rgb(var(--theme-error))' }}>
                  Las contraseñas no coinciden
                </p>
              )}
              <button
                type="submit"
                disabled={loading || formData.password !== formData.confirmPassword}
                className="btn-boutique-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </button>
              <div className="text-center">
                <div className="text-sm text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                  ¿Ya tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="font-medium hover-elegant"
                    style={{ color: 'rgb(var(--theme-accent))' }}
                  >
                    Iniciar sesión
                  </button>
                </div>
              </div>
            </form>
            </div>
          )}

          {/* Formulario de Recuperación de Contraseña */}
          {mode === 'reset' && (
            <div>
              {resetEmailSent ? (
                <div className="text-center space-y-6">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
                    style={{ backgroundColor: 'rgb(var(--theme-success) / 0.1)' }}
                  >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} style={{ color: 'rgb(var(--theme-success))' }}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-serif mb-2" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                      Email enviado
                    </h3>
                    <p className="text-sm text-sans mb-6" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                      Te hemos enviado un enlace para restablecer tu contraseña a{' '}
                      <span className="font-medium" style={{ color: 'rgb(var(--theme-accent))' }}>
                        {formData.email}
                      </span>
                    </p>
                  </div>
                  <button
                    onClick={() => switchMode('login')}
                    className="btn-boutique-secondary"
                  >
                    Volver al inicio de sesión
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-sans mb-2" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="input-boutique"
                      placeholder="tu@email.com"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-boutique-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
                  </button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="text-sm text-sans hover-elegant"
                      style={{ color: 'rgb(var(--theme-accent))' }}
                    >
                      ← Volver al inicio de sesión
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Footer del modal */}
          <div className="mt-8 pt-6 text-center" style={{ borderTop: '1px solid rgb(var(--theme-primary) / 0.1)' }}>
            <p className="text-xs text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
              Al crear una cuenta, aceptas nuestros términos de servicio y política de privacidad de{' '}
              <span className="font-medium" style={{ color: 'rgb(var(--theme-accent))' }}>
                {storeName}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 