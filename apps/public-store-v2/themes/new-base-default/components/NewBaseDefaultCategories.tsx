import { CategoriesSection } from '../../../components/shared'

interface NewBaseDefaultCategoriesProps {
  categories: any[]
  products: any[]
  activeCategory?: string
  t: (key: string) => string
  buildUrl: (path: string) => string
  toCloudinarySquare: (url: string, size: number) => string
}

export function NewBaseDefaultCategories({
  categories,
  products,
  activeCategory,
  t,
  buildUrl,
  toCloudinarySquare
}: NewBaseDefaultCategoriesProps) {
  const texts = {
    categoriesTitle: t('categories')
  }

  return (
    <CategoriesSection
      categories={categories}
      products={products}
      activeCategory={activeCategory}
      texts={texts}
      buildUrl={buildUrl}
      toCloudinarySquare={toCloudinarySquare}
    />
  )
}