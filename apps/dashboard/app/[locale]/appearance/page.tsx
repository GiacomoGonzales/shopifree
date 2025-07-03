'use client'

import DashboardLayout from '../../../components/DashboardLayout'

export default function AppearancePage() {

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Apariencia</h1>
          <p className="text-gray-600 mt-2">Personaliza la apariencia de tu tienda</p>
        </div>
        
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
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