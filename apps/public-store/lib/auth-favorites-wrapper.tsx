'use client'

import { ReactNode } from 'react'
import { StoreAuthProvider } from './store-auth-context'
import { FavoritesProvider } from './favorites-context'

interface AuthFavoritesWrapperProps {
  children: ReactNode
  storeId: string
}

export function AuthFavoritesWrapper({ children, storeId }: AuthFavoritesWrapperProps) {
  return (
    <StoreAuthProvider storeId={storeId}>
      <FavoritesProvider storeId={storeId} userId={null}>
        {children}
      </FavoritesProvider>
    </StoreAuthProvider>
  )
} 