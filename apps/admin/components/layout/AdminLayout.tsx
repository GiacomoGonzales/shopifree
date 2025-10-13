'use client'

import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'
import AdminGuard from '../AdminGuard'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-900">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main content area */}
        <div className="pl-64">
          {/* Header */}
          <AdminHeader />

          {/* Page content */}
          <main className="p-8">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  )
}
