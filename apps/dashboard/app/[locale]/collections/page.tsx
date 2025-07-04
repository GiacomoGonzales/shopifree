'use client'

import DashboardLayout from '../../../components/DashboardLayout'

export default function CollectionsPage() {

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Colecciones</h1>
          <p className="text-gray-600 mt-2">Administra las colecciones de tu tienda</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Próximamente</h3>
            <p className="mt-1 text-sm text-gray-500">
              Esta funcionalidad estará disponible pronto.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 