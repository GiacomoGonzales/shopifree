interface Category {
  id: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
  parentCategoryId?: string
}

interface Product {
  id: string
  categoryId?: string
}

interface CategoriesSectionProps {
  categories: Category[]
  products: Product[]
  activeCategory?: string
  texts: {
    categoriesTitle: string
  }
  buildUrl: (path: string) => string
  toCloudinarySquare: (url: string, size: number) => string
}

export function CategoriesSection({
  categories,
  products,
  activeCategory,
  texts,
  buildUrl,
  toCloudinarySquare
}: CategoriesSectionProps) {
  // Preparar categorías para mostrar (priorizando padre sobre subcategorías)
  const allCategories = Array.isArray(categories) ? categories : []
  const parentCategories = allCategories.filter(c => !c.parentCategoryId)
  const subcategories = allCategories.filter(c => c.parentCategoryId)
  
  // Combinar y limitar a 10 máximo
  const categoriesToShow = [
    ...parentCategories,
    ...subcategories.filter(sub => 
      !parentCategories.some(parent => parent.id === sub.parentCategoryId) || 
      parentCategories.length < 5
    )
  ].slice(0, 10)

  // Solo mostrar si hay 3 o más categorías
  if (categoriesToShow.length < 3) return null

  // Determinar layout basado en cantidad
  const getLayoutClass = (count: number) => {
    if (count === 3) return 'nbd-mosaic-3'
    if (count === 4) return 'nbd-mosaic-4'
    if (count === 5) return 'nbd-mosaic-5'
    if (count === 6) return 'nbd-mosaic-6'
    return 'nbd-mosaic-many'
  }

  return (
    <section id="categorias" className="nbd-categories-mosaic">
      <div className="nbd-container">
        <div className="nbd-section-header">
          <h2 className="nbd-section-title">{texts.categoriesTitle}</h2>
        </div>
        
        <div className={`nbd-mosaic-grid ${getLayoutClass(categoriesToShow.length)}`}>
          {categoriesToShow.map((category, index) => {
            // Contar productos en esta categoría y sus subcategorías
            const subcategoryIds = categories?.filter(c => c.parentCategoryId === category.id).map(c => c.id) || []
            const allCategoryIds = [category.id, ...subcategoryIds]
            const productCount = products?.filter(p => allCategoryIds.includes(p.categoryId || '')).length || 0
            const isParent = !category.parentCategoryId
            const isFeatured = index < 2 // Primeras 2 categorías son destacadas
            
            return (
              <a
                key={category.id}
                href={buildUrl(`/categoria/${category.slug}`)}
                className={`nbd-mosaic-card ${activeCategory === category.slug ? 'nbd-mosaic-card--active' : ''} ${
                  isFeatured ? 'nbd-mosaic-card--featured' : ''
                } ${isParent ? 'nbd-mosaic-card--parent' : 'nbd-mosaic-card--sub'}`}
              >
                {/* Imagen de fondo */}
                <div className="nbd-mosaic-background">
                  {category.imageUrl ? (
                    <img
                      src={toCloudinarySquare(category.imageUrl, 800)}
                      alt={category.name}
                      className="nbd-mosaic-image"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        const parent = target.parentElement as HTMLElement
                        target.style.display = 'none'
                        if (parent) {
                          parent.classList.add('nbd-mosaic-fallback-active')
                        }
                      }}
                    />
                  ) : null}
                  
                  {/* Fallback pattern */}
                  <div className={`nbd-mosaic-fallback ${!category.imageUrl ? 'nbd-mosaic-fallback-active' : ''}`}>
                    <div className="nbd-mosaic-pattern">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                        <path d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11L4 7M12 11V21M4 7V17L12 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Overlay para legibilidad */}
                <div className="nbd-mosaic-overlay"></div>
                
                {/* Contenido */}
                <div className="nbd-mosaic-content">
                  <div className="nbd-mosaic-text">
                    <h3 className="nbd-mosaic-title">{category.name}</h3>
                    {category.description && (
                      <p className="nbd-mosaic-description">
                        {category.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="nbd-mosaic-arrow">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      </div>
    </section>
  )
}