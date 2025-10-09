'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '../../../lib/simple-auth-context'
import DashboardLayout from '../../../components/DashboardLayout'
import { Toast } from '../../../components/shared/Toast'
import { useToast } from '../../../lib/hooks/useToast'

export default function AccountPage() {
  const { user, userData } = useAuth()
  const t = useTranslations('settings.account')
  const { toast, showToast, hideToast } = useToast()
  const [saving, setSaving] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [phone, setPhone] = useState('')
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [changingPassword, setChangingPassword] = useState(false)
  const [creatingPassword, setCreatingPassword] = useState(false)

  // Verificar si el usuario tiene contraseña (no es OAuth)
  const hasPassword = user?.providerData?.some(provider => provider.providerId === 'password')

  // Sincronizar estado local cuando userData cambia
  useEffect(() => {
    if (userData?.displayName) {
      setDisplayName(userData.displayName as string)
    }
    if (userData?.phone) {
      setPhone(userData.phone as string)
    }
  }, [userData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      // TODO: Implementar actualización de datos
      showToast('Cambios guardados exitosamente', 'success')
    } catch (error) {
      showToast('Error al guardar los cambios', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)

    // Validaciones
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('Todos los campos son requeridos')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('La nueva contraseña debe tener al menos 6 caracteres')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden')
      return
    }

    setChangingPassword(true)

    try {
      const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } = await import('firebase/auth')

      if (!user || !user.email) {
        throw new Error('Usuario no autenticado')
      }

      // Re-autenticar al usuario con la contraseña actual
      const credential = EmailAuthProvider.credential(user.email, passwordData.currentPassword)
      await reauthenticateWithCredential(user, credential)

      // Cambiar la contraseña
      await updatePassword(user, passwordData.newPassword)

      // Limpiar formulario y cerrar modal
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswordModal(false)
      showToast('Contraseña actualizada exitosamente', 'success')
    } catch (error: any) {
      console.error('Error al cambiar contraseña:', error)

      if (error.code === 'auth/wrong-password') {
        setPasswordError('La contraseña actual es incorrecta')
      } else if (error.code === 'auth/too-many-requests') {
        setPasswordError('Demasiados intentos. Intenta más tarde')
      } else {
        setPasswordError('Error al cambiar la contraseña. Intenta de nuevo')
      }
    } finally {
      setChangingPassword(false)
    }
  }

  const handleCreatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError(null)

    // Validaciones (solo para crear, no necesitamos contraseña actual)
    if (!passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('Todos los campos son requeridos')
      return
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('La contraseña debe tener al menos 6 caracteres')
      return
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Las contraseñas no coinciden')
      return
    }

    setCreatingPassword(true)

    try {
      const { linkWithCredential, EmailAuthProvider } = await import('firebase/auth')

      if (!user || !user.email) {
        throw new Error('Usuario no autenticado')
      }

      // Crear credencial de email/password
      const credential = EmailAuthProvider.credential(user.email, passwordData.newPassword)

      // Vincular credencial con la cuenta existente
      await linkWithCredential(user, credential)

      // Limpiar formulario y cerrar modal
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setShowPasswordModal(false)
      showToast('Contraseña creada exitosamente. Ahora puedes iniciar sesión con email y contraseña.', 'success')
    } catch (error: any) {
      console.error('Error al crear contraseña:', error)

      if (error.code === 'auth/provider-already-linked') {
        setPasswordError('Ya tienes una contraseña configurada')
      } else if (error.code === 'auth/credential-already-in-use') {
        setPasswordError('Este email ya está en uso con contraseña')
      } else {
        setPasswordError('Error al crear la contraseña. Intenta de nuevo')
      }
    } finally {
      setCreatingPassword(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">{t('title')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('subtitle')}</p>

          <div className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Información personal */}
              <div className="lg:col-span-2">
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      {t('personalInfo.title')}
                    </h3>
                    
                    <form className="space-y-4" onSubmit={handleSubmit}>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          {t('personalInfo.email.label')}
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={user?.email || ''}
                          disabled
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 sm:text-sm"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          {t('personalInfo.email.hint')}
                        </p>
                      </div>
                      
                      <div>
                        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                          {t('personalInfo.displayName.label')}
                        </label>
                        <input
                          type="text"
                          name="displayName"
                          id="displayName"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-600 focus:border-gray-600 sm:text-sm"
                          placeholder={t('personalInfo.displayName.placeholder')}
                        />
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                          {t('personalInfo.phone.label')}
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-600 focus:border-gray-600 sm:text-sm"
                          placeholder={t('personalInfo.phone.placeholder')}
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={saving}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 disabled:opacity-50"
                        >
                          {t('actions.saveChanges')}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {/* Información de la cuenta */}
              <div className="lg:col-span-1">
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      {t('accountInfo.title')}
                    </h3>
                    
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">{t('accountInfo.status.label')}</dt>
                        <dd className="text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {t('accountInfo.status.active')}
                          </span>
                        </dd>
                      </div>
                      
                      <div>
                        <dt className="text-sm font-medium text-gray-500">{t('accountInfo.registrationDate.label')}</dt>
                        <dd className="text-sm text-gray-900">
                          {user?.metadata?.creationTime ? 
                            new Date(user.metadata.creationTime).toLocaleDateString() : 
                            t('accountInfo.registrationDate.notAvailable')
                          }
                        </dd>
                      </div>
                      
                      <div>
                        <dt className="text-sm font-medium text-gray-500">{t('accountInfo.lastLogin.label')}</dt>
                        <dd className="text-sm text-gray-900">
                          {user?.metadata?.lastSignInTime ? 
                            new Date(user.metadata.lastSignInTime).toLocaleDateString() : 
                            t('accountInfo.lastLogin.notAvailable')
                          }
                        </dd>
                      </div>
                      
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Método de inicio de sesión</dt>
                        <dd className="text-sm text-gray-900">
                          {user?.providerData?.map(provider => {
                            const providerName = provider.providerId === 'password' ? 'Email/Contraseña' :
                                               provider.providerId === 'google.com' ? 'Google' :
                                               provider.providerId === 'facebook.com' ? 'Facebook' :
                                               provider.providerId
                            return (
                              <span key={provider.providerId} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {providerName}
                              </span>
                            )
                          })}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-sm font-medium text-gray-500">{t('accountInfo.userId.label')}</dt>
                        <dd className="text-sm text-gray-900 font-mono text-xs">
                          {user?.uid}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* Acciones de cuenta */}
                <div className="mt-6 bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      {t('actions.title')}
                    </h3>
                    
                    <div className="space-y-3">
                      {hasPassword ? (
                        <button
                          type="button"
                          onClick={() => setShowPasswordModal(true)}
                          className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
                        >
                          {t('actions.changePassword')}
                        </button>
                      ) : (
                        <>
                          <div className="rounded-md bg-blue-50 p-3">
                            <p className="text-sm text-blue-700 mb-2">
                              Iniciaste sesión con un proveedor externo. Puedes crear una contraseña para tener ambos métodos de inicio de sesión.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowPasswordModal(true)}
                            className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
                          >
                            Crear Contraseña
                          </button>
                        </>
                      )}

                      <button
                        type="button"
                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        {t('actions.deleteAccount')}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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

      {/* Modal de cambio de contraseña */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => {
                setShowPasswordModal(false)
                setPasswordError(null)
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
              }}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {hasPassword ? 'Cambiar Contraseña' : 'Crear Contraseña'}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {hasPassword
                    ? 'Ingresa tu contraseña actual y la nueva contraseña'
                    : 'Crea una contraseña para poder iniciar sesión con email y contraseña'
                  }
                </p>
              </div>

              <form onSubmit={hasPassword ? handlePasswordChange : handleCreatePassword} className="space-y-4">
                {hasPassword && (
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                      Contraseña actual
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-600 focus:border-gray-600 sm:text-sm"
                      required
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                    {hasPassword ? 'Nueva contraseña' : 'Contraseña'}
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-600 focus:border-gray-600 sm:text-sm"
                    required
                    minLength={6}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Mínimo 6 caracteres
                  </p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Confirmar contraseña
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-600 focus:border-gray-600 sm:text-sm"
                    required
                  />
                </div>

                {passwordError && (
                  <div className="rounded-md bg-red-50 p-3">
                    <p className="text-sm text-red-800">{passwordError}</p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordModal(false)
                      setPasswordError(null)
                      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={changingPassword || creatingPassword}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 disabled:opacity-50"
                  >
                    {hasPassword
                      ? (changingPassword ? 'Cambiando...' : 'Cambiar Contraseña')
                      : (creatingPassword ? 'Creando...' : 'Crear Contraseña')
                    }
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
} 