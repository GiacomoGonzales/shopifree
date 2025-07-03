'use client'

import { useAuth } from '../../../lib/simple-auth-context'
import DashboardLayout from '../../../components/DashboardLayout'

export default function AccountPage() {
  const { user, userData } = useAuth()

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Información personal */}
              <div className="lg:col-span-2">
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Información Personal
                    </h3>
                    
                    <form className="space-y-4">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          Email
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
                          El email no se puede cambiar
                        </p>
                      </div>
                      
                      <div>
                        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                          Nombre completo
                        </label>
                        <input
                          type="text"
                          name="displayName"
                          id="displayName"
                          value={userData?.displayName || ''}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-600 focus:border-gray-600 sm:text-sm"
                          placeholder="Tu nombre completo"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          value={userData?.phone || ''}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-600 focus:border-gray-600 sm:text-sm"
                          placeholder="+1234567890"
                        />
                      </div>
                      
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
                        >
                          Guardar Cambios
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
                      Información de Cuenta
                    </h3>
                    
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Estado</dt>
                        <dd className="text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Activa
                          </span>
                        </dd>
                      </div>
                      
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Fecha de registro</dt>
                        <dd className="text-sm text-gray-900">
                          {user?.metadata?.creationTime ? 
                            new Date(user.metadata.creationTime).toLocaleDateString('es-ES') : 
                            'No disponible'
                          }
                        </dd>
                      </div>
                      
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Último acceso</dt>
                        <dd className="text-sm text-gray-900">
                          {user?.metadata?.lastSignInTime ? 
                            new Date(user.metadata.lastSignInTime).toLocaleDateString('es-ES') : 
                            'No disponible'
                          }
                        </dd>
                      </div>
                      
                      <div>
                        <dt className="text-sm font-medium text-gray-500">ID de usuario</dt>
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
                      Acciones de Cuenta
                    </h3>
                    
                    <div className="space-y-3">
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
                      >
                        Cambiar Contraseña
                      </button>
                      
                      <button
                        type="button"
                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Eliminar Cuenta
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 