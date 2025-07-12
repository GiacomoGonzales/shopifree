import { Metadata } from 'next'
import CategoryClientPage from './CategoryClientPage'

export const metadata: Metadata = {
  title: 'Categoría',
  description: 'Productos por categoría',
}

interface CategoryPageProps {
  params: {
    storeSubdomain: string
    categorySlug: string
  }
}

export default function CategoryPage({ params }: CategoryPageProps) {
  return <CategoryClientPage categorySlug={params.categorySlug} />
} 