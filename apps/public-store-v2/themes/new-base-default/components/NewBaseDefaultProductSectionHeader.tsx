import { ProductSectionHeader } from '../../../components/shared'

interface NewBaseDefaultProductSectionHeaderProps {
  isOnCategoryPage: boolean
  isOnCollectionPage: boolean
  isOnBrandPage: boolean
  activeCategory: string | null
  categories?: Array<{
    slug: string
    name: string
  }>
  t: (key: string) => string
}

export function NewBaseDefaultProductSectionHeader({
  isOnCategoryPage,
  isOnCollectionPage,
  isOnBrandPage,
  activeCategory,
  categories,
  t
}: NewBaseDefaultProductSectionHeaderProps) {
  return (
    <ProductSectionHeader
      isOnCategoryPage={isOnCategoryPage}
      isOnCollectionPage={isOnCollectionPage}
      isOnBrandPage={isOnBrandPage}
      activeCategory={activeCategory}
      categories={categories}
      t={t}
    />
  )
}