'use client'

import { ReactNode } from 'react'
import AuthGuard from '../components/AuthGuard'

interface ProtectedRouteProps {
  children: ReactNode
  fallback?: ReactNode
  requireUserDocument?: boolean
}

/**
 * Wrapper component for protected routes
 * Ensures user is authenticated and has a valid Firestore document
 */
export default function ProtectedRoute({ 
  children, 
  fallback, 
  requireUserDocument = true 
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
    requireUserDocument?: boolean
  }
) {
  const AuthenticatedComponent = (props: P) => {
    return (
      <ProtectedRoute 
        fallback={options?.fallback}
        requireUserDocument={options?.requireUserDocument}
      >
        <WrappedComponent {...props} />
      </ProtectedRoute>
    )
  }

  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`
  
  return AuthenticatedComponent
} 