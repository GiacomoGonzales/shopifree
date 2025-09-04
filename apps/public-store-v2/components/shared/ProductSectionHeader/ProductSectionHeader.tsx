interface ProductSectionHeaderProps {
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

export function ProductSectionHeader({
  isOnCategoryPage,
  isOnCollectionPage,
  isOnBrandPage,
  activeCategory,
  categories,
  t
}: ProductSectionHeaderProps) {
  
  // Solo mostrar header de productos en home, no en páginas de categoría, colección o marca
  const shouldShow = !isOnCategoryPage && !isOnCollectionPage && !isOnBrandPage
  
  if (!shouldShow) return null

  const title = activeCategory
    ? categories?.find(c => c.slug === activeCategory)?.name || t('products')
    : t('products')

  return (
    <div className="nbd-section-header">
      <h2 className="nbd-section-title">{title}</h2>
    </div>
  )
}