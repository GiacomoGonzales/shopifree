interface Subcategory {
  id: string
  slug: string
  name: string
}

interface SubcategoriesSectionProps {
  isOnCategoryPage: boolean
  currentCategory?: { name: string } | null
  subcategories: Subcategory[]
  selectedSubcategory: string | null
  setSelectedSubcategory: (slug: string | null) => void
}

export function SubcategoriesSection({
  isOnCategoryPage,
  currentCategory,
  subcategories,
  selectedSubcategory,
  setSelectedSubcategory
}: SubcategoriesSectionProps) {
  
  // Solo renderizar si estamos en página de categoría, hay categoría actual y hay subcategorías
  const shouldRender = isOnCategoryPage && currentCategory && subcategories.length > 0;
  
  if (!shouldRender) return null;

  return (
    <section className="nbd-subcategories-section">
      <div className="nbd-container">
        <div className="nbd-subcategories-grid">
          {/* Botón "Todas" para mostrar todos los productos */}
          <button
            onClick={() => setSelectedSubcategory(null)}
            className={`nbd-subcategory-button ${!selectedSubcategory ? 'nbd-subcategory-button--active' : ''}`}
          >
            <span className="nbd-subcategory-name">Todas</span>
          </button>
          
          {/* Botones de subcategorías */}
          {subcategories.map((subcategory) => (
            <button
              key={subcategory.id}
              onClick={() => setSelectedSubcategory(subcategory.slug)}
              className={`nbd-subcategory-button ${selectedSubcategory === subcategory.slug ? 'nbd-subcategory-button--active' : ''}`}
            >
              <span className="nbd-subcategory-name">{subcategory.name}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}