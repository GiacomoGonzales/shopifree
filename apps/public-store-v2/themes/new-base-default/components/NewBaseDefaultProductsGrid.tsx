import { ProductsGrid, ViewMode } from '../../../components/shared'
import { PublicProduct } from '../../../lib/products'

interface NewBaseDefaultProductsGridProps {
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
  storeId?: string | null
}

export function NewBaseDefaultProductsGrid({
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
  storeInfo,
  storeId
}: NewBaseDefaultProductsGridProps) {
  return (
    <ProductsGrid
      displayedProducts={displayedProducts}
      filteredProducts={filteredProducts}
      mobileViewMode={mobileViewMode}
      loadingCartButton={loadingCartButton}
      productsToShow={productsToShow}
      hasMoreProducts={hasMoreProducts}
      handleAddToCart={handleAddToCart}
      loadMoreProducts={loadMoreProducts}
      buildUrl={buildUrl}
      toCloudinarySquare={toCloudinarySquare}
      formatPrice={formatPrice}
      additionalText={additionalText}
      storeInfo={storeInfo}
      storeId={storeId}
    />
  )
}