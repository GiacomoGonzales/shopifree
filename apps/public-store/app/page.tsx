'use client'

import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()

  // Redirect to landing page or show a default message
  if (typeof window !== 'undefined') {
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Shopifree
        </h1>
        <p className="text-gray-600">
          Redirecting to the main site...
        </p>
      </div>
    </div>
  )
} 