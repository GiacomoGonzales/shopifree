import { SubcategoriesSection } from '../../../components/shared'

interface Subcategory {
  id: string
  slug: string
  name: string
}

interface NewBaseDefaultSubcategoriesSectionProps {
  isOnCategoryPage: boolean
  currentCategory?: { name: string } | null
  subcategories: Subcategory[]
  selectedSubcategory: string | null
  setSelectedSubcategory: (slug: string | null) => void
}

export function NewBaseDefaultSubcategoriesSection({
  isOnCategoryPage,
  currentCategory,
  subcategories,
  selectedSubcategory,
  setSelectedSubcategory
}: NewBaseDefaultSubcategoriesSectionProps) {
  return (
    <SubcategoriesSection
      isOnCategoryPage={isOnCategoryPage}
      currentCategory={currentCategory}
      subcategories={subcategories}
      selectedSubcategory={selectedSubcategory}
      setSelectedSubcategory={setSelectedSubcategory}
    />
  )
}