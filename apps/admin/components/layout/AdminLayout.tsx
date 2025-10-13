'use client'

import { useState } from 'react'
import AdminSidebar from './AdminSidebar'
import AdminHeader from './AdminHeader'
import AdminGuard from '../AdminGuard'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <AdminGuard>
      <div className="min-h-screen bg-slate-900">
        {/* Sidebar */}
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main content area */}
        <div className="lg:pl-64">
          {/* Header */}
          <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

          {/* Page content */}
          <main className="p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  )
}
