import { Metadata } from 'next'
import FavoritesClientPage from './FavoritesClientPage'

export const metadata: Metadata = {
  title: 'Favoritos',
  description: 'Tus productos favoritos',
}

export default function FavoritesPage() {
  return <FavoritesClientPage />
} 