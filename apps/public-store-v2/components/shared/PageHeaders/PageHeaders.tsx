interface PageHeadersProps {
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

export function PageHeaders({
  isOnCategoryPage,
  isOnCollectionPage,
  isOnBrandPage,
  currentCategory,
  currentCollection,
  currentBrand,
  buildUrl,
  t
}: PageHeadersProps) {
  
  const renderBreadcrumbs = (currentName: string) => (
    <nav className="nbd-category-breadcrumbs">
      <a href={buildUrl('')} className="nbd-breadcrumb-link">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        {t('home')}
      </a>
      <span className="nbd-breadcrumbs-sep">/</span>
      <span className="nbd-breadcrumb-current">{currentName}</span>
    </nav>
  )

  return (
    <>
      {/* Si estamos en una página de categoría, mostrar header limpio */}
      {isOnCategoryPage && currentCategory && (
        <div className="nbd-category-page-header">
          <div className="nbd-container">
            <h1 className="nbd-category-title">{currentCategory.name}</h1>
            {currentCategory.description && (
              <p className="nbd-category-description">{currentCategory.description}</p>
            )}
            {renderBreadcrumbs(currentCategory.name)}
          </div>
        </div>
      )}

      {/* Si estamos en una página de colección, mostrar header limpio */}
      {isOnCollectionPage && currentCollection && (
        <div className="nbd-category-page-header">
          <div className="nbd-container">
            <h1 className="nbd-category-title">{currentCollection.title}</h1>
            {currentCollection.description && (
              <p className="nbd-category-description">{currentCollection.description}</p>
            )}
            {renderBreadcrumbs(currentCollection.title)}
          </div>
        </div>
      )}

      {/* Si estamos en una página de marca, mostrar header limpio */}
      {isOnBrandPage && currentBrand && (
        <div className="nbd-category-page-header">
          <div className="nbd-container">
            <h1 className="nbd-category-title">{currentBrand.name}</h1>
            {currentBrand.description && (
              <p className="nbd-category-description">{currentBrand.description}</p>
            )}
            {renderBreadcrumbs(currentBrand.name)}
          </div>
        </div>
      )}
    </>
  )
}