import { PageHeaders } from '../../../components/shared'

interface NewBaseDefaultPageHeadersProps {
  // Page type flags
  isOnCategoryPage: boolean
  isOnCollectionPage: boolean
  isOnBrandPage: boolean
  
  // Current entities
  currentCategory?: {
    name: string
    description?: string
  } | null
  currentCollection?: {
    title: string
    description?: string
  } | null
  currentBrand?: {
    name: string
    description?: string
  } | null
  
  // Utils
  buildUrl: (path: string) => string
  t: (key: string) => string
}

export function NewBaseDefaultPageHeaders({
  isOnCategoryPage,
  isOnCollectionPage,
  isOnBrandPage,
  currentCategory,
  currentCollection,
  currentBrand,
  buildUrl,
  t
}: NewBaseDefaultPageHeadersProps) {
  return (
    <PageHeaders
      isOnCategoryPage={isOnCategoryPage}
      isOnCollectionPage={isOnCollectionPage}
      isOnBrandPage={isOnBrandPage}
      currentCategory={currentCategory}
      currentCollection={currentCollection}
      currentBrand={currentBrand}
      buildUrl={buildUrl}
      t={t}
    />
  )
}