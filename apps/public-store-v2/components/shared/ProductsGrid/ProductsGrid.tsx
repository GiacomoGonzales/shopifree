import { PublicProduct } from '../../../lib/products'
import { AddToCartButton } from '../AddToCartButton'
import { ProgressiveImage } from '../ProgressiveImage'

export type ViewMode = 'expanded' | 'grid' | 'list'

interface ProductsGridProps {
  displayedProducts: PublicProduct[]
  filteredProducts: PublicProduct[]
  mobileViewMode: ViewMode
  loadingCartButton: string | null
  productsToShow: number
  hasMoreProducts: boolean
  
  // Event handlers
  handleAddToCart: (product: PublicProduct) => Promise<void>
  loadMoreProducts: () => void
  
  // Utils
  buildUrl: (path: string) => string
  toCloudinarySquare: (url: string, size: number) => string
  formatPrice: (price: number, currency?: string) => string
  additionalText: (key: string) => string
  
  // Store info
  storeInfo?: {
    currency?: string
  }
}

export function ProductsGrid({
  displayedProducts,
  filteredProducts,
  mobileViewMode,
  loadingCartButton,
  productsToShow,
  hasMoreProducts,
  handleAddToCart,
  loadMoreProducts,
  buildUrl,
  toCloudinarySquare,
  formatPrice,
  additionalText,
  storeInfo
}: ProductsGridProps) {
  
  return (
    <>
      <div className={`nbd-products-grid nbd-mobile-${mobileViewMode}`}>
        {displayedProducts.length > 0 ? (
          displayedProducts.map((product) => (
            <div 
              key={product.id} 
              className="nbd-product-card"
              onClick={() => {
                window.location.href = buildUrl(`/producto/${product.slug || product.id}`);
              }}
              style={{ cursor: 'pointer' }}
            >
              <div className="nbd-product-image">
                {(() => {
                  const imageUrl = product.image || product.mediaFiles?.[0]?.url;

                  if (!imageUrl) {
                    return (
                      <div className="nbd-product-placeholder w-full h-full flex flex-col items-center justify-center gap-sm">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                          <path d="M4 16L4 18C4 19.1046 4.89543 20 6 20L18 20C19.1046 20 20 19.1046 20 18L20 16M16 12L12 16M12 16L8 12M12 16L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="nbd-placeholder-text">{additionalText('noImage')}</span>
                      </div>
                    );
                  }

                  const src800 = toCloudinarySquare(imageUrl, 800);

                  return (
                    <ProgressiveImage
                      src={src800 || imageUrl}
                      alt={product.name}
                      className="progressive-image--product"
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                  );
                })()}

                {product.comparePrice && product.comparePrice > product.price && (
                  <div className="nbd-product-badge">
                    {additionalText('offer')}
                  </div>
                )}
              </div>
              
              <div className="nbd-product-content">
                <h3 className="nbd-product-name">{product.name}</h3>
                
                <div className="nbd-product-footer">
                  <div className="nbd-product-price">
                    {product.comparePrice && product.comparePrice > product.price ? (
                      <>
                        <span className="nbd-price-current">{formatPrice(product.price, storeInfo?.currency)}</span>
                        <span className="nbd-price-original">{formatPrice(product.comparePrice, storeInfo?.currency)}</span>
                      </>
                    ) : (
                      <span className="nbd-price-current">{formatPrice(product.price, storeInfo?.currency)}</span>
                    )}
                  </div>
                  
                  <AddToCartButton
                    productId={product.id}
                    productName={product.name}
                    isLoading={loadingCartButton === product.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToCart(product);
                    }}
                  />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="nbd-empty-state">
            <div className="nbd-empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path d="M20 7L12 3L4 7L12 11L20 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4 7V17L12 21L20 17V7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h3 className="nbd-empty-title">{additionalText('noProductsCategory')}</h3>
            <p className="nbd-empty-description">{additionalText('exploreOther')}</p>
          </div>
        )}
      </div>

      {/* Botón "Cargar más" */}
      {hasMoreProducts && (
        <div style={{ 
          textAlign: 'center', 
          marginTop: 'var(--nbd-space-4xl)', 
          marginBottom: 'var(--nbd-space-2xl)' 
        }}>
          <button 
            onClick={loadMoreProducts}
            className="nbd-btn nbd-btn--secondary"
            style={{
              minWidth: '200px',
              transition: 'all var(--nbd-transition-base)'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span>{additionalText('loadMore')} ({Math.min(8, filteredProducts.length - productsToShow)})</span>
          </button>
          <p style={{
            fontSize: 'var(--nbd-font-size-sm)',
            color: 'var(--nbd-neutral-600)',
            marginTop: 'var(--nbd-space-md)',
            marginBottom: '0'
          }}>
            {additionalText('showing')} {displayedProducts.length} {additionalText('of')} {filteredProducts.length} {additionalText('products')}
          </p>
        </div>
      )}
    </>
  )
}