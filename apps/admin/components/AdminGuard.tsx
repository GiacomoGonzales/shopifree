'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '../lib/admin-auth-context'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAdminAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      console.log('[AdminGuard] No admin user, redirecting to login')
      router.push('/login')
    }
  }, [user, loading, router])

  // Mostrar spinner mientras carga
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent"></div>
          <p className="mt-4 text-slate-400">Loading admin panel...</p>
        </div>
      </div>
    )
  }

  // Si no hay usuario, no mostrar nada (se redirigirá)
  if (!user) {
    return null
  }

  // Usuario autenticado y es admin
  return <>{children}</>
}
