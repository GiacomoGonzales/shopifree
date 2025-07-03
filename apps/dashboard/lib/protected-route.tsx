'use client'

import { ReactNode } from 'react'
import AuthGuard from '../components/AuthGuard'

interface ProtectedRouteProps {
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Wrapper component for protected routes
 * Ensures user is authenticated and has a valid Firestore document
 */
export default function ProtectedRoute({ 
  children, 
  fallback 
}: ProtectedRouteProps) {
  return (
    <AuthGuard fallback={fallback}>
      {children}
    </AuthGuard>
  )
}

/**
 * HOC for protecting page components
 * Usage: export default withAuth(YourPageComponent)
 */
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options?: {
    fallback?: ReactNode
  }
) {
  const AuthenticatedComponent = (props: P) => {
    return (
      <ProtectedRoute 
        fallback={options?.fallback}
      >
        <WrappedComponent {...props} />
      </ProtectedRoute>
    )
  }

  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`
  
  return AuthenticatedComponent
} 