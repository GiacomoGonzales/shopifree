'use client'

import { useState } from 'react'
import { useStoreAuth } from '../../../lib/store-auth-context'

interface AuthModalProps {
  onClose: () => void
  storeName: string
}

export default function AuthModal({ onClose, storeName }: AuthModalProps) {
  const { login, register, resetPassword, error, loading, clearError } = useStoreAuth()
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
    } catch (error) {
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
    } catch (error) {
      // El error se maneja en el contexto
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await resetPassword(formData.email)
      setResetEmailSent(true)
    } catch (error) {
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
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900">
              {mode === 'login' && 'Iniciar Sesión'}
              {mode === 'register' && 'Crear Cuenta'}
              {mode === 'reset' && 'Recuperar Contraseña'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-800">{error}</p>
              {error.includes('ya está registrado') && (
                <div className="mt-2 space-x-2">
                  <button
                    onClick={() => switchMode('login')}
                    className="text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Iniciar Sesión
                  </button>
                  <span className="text-red-400">|</span>
                  <button
                    onClick={() => switchMode('reset')}
                    className="text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Recuperar Contraseña
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Formulario de Login */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-neutral-900 text-white py-2 px-4 rounded-md hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={() => switchMode('reset')}
                  className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  ¿Olvidaste tu contraseña?
                </button>
                <div className="text-sm text-gray-600">
                  ¿No tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className="text-neutral-900 hover:text-neutral-700 font-medium transition-colors"
                  >
                    Crear cuenta
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Formulario de Registro */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono (opcional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  minLength={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent"
                />
              </div>
              {formData.password !== formData.confirmPassword && formData.confirmPassword && (
                <p className="text-sm text-red-600">Las contraseñas no coinciden</p>
              )}
              <button
                type="submit"
                disabled={loading || formData.password !== formData.confirmPassword}
                className="w-full bg-neutral-900 text-white py-2 px-4 rounded-md hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
              </button>
              <div className="text-center">
                <div className="text-sm text-gray-600">
                  ¿Ya tienes cuenta?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="text-neutral-900 hover:text-neutral-700 font-medium transition-colors"
                  >
                    Iniciar sesión
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* Formulario de Recuperación de Contraseña */}
          {mode === 'reset' && (
            <div>
              {resetEmailSent ? (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Email enviado</h3>
                  <p className="text-sm text-gray-600">
                    Te hemos enviado un enlace para restablecer tu contraseña a{' '}
                    <span className="font-medium">{formData.email}</span>
                  </p>
                  <button
                    onClick={() => switchMode('login')}
                    className="text-neutral-900 hover:text-neutral-700 font-medium transition-colors"
                  >
                    Volver al inicio de sesión
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <p className="text-sm text-gray-600 mb-4">
                    Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-neutral-900 text-white py-2 px-4 rounded-md hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {loading ? 'Enviando...' : 'Enviar enlace'}
                  </button>
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => switchMode('login')}
                      className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                    >
                      Volver al inicio de sesión
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              Al crear una cuenta, aceptas nuestros términos de servicio y política de privacidad de {storeName}.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 