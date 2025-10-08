import { PublicProduct } from '../../../lib/products'
import { AddToCartButton } from '../AddToCartButton'
import { usePromotions } from '../../../lib/hooks/usePromotions'
import { memo } from 'react'

export type ViewMode = 'expanded' | 'grid' | 'list'

// Componente memoizado para imágenes que evita re-renders innecesarios
const ProductImage = memo(({
  imageUrl,
  productName,
  toCloudinarySquare,
  additionalText
}: {
  imageUrl: string | undefined
  productName: string
  toCloudinarySquare: (url: string, size: number) => string
  additionalText: (key: string) => string
}) => {
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

  // Detectar iOS para aplicar configuración específica
  const isIOS = typeof window !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);

  return (
    <img
      src={src800 || imageUrl}
      alt={productName}
      className="nbd-product-img"
      loading={isIOS ? "eager" : "lazy"}
      decoding={isIOS ? "sync" : "async"}
      sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
      style={{
        opacity: 1,
        transition: 'none',
        WebkitTransition: 'none',
        transform: 'none',
        WebkitTransform: 'none',
        willChange: 'auto',
        backfaceVisibility: 'visible',
        WebkitBackfaceVisibility: 'visible'
      }}
    />
  );
}, (prevProps, nextProps) => {
  // Solo re-renderizar si la imagen URL cambia
  return prevProps.imageUrl === nextProps.imageUrl &&
         prevProps.productName === nextProps.productName;
});

ProductImage.displayName = 'ProductImage';

// Componente memoizado para badge que evita re-renders innecesarios
const ProductBadge = memo(({
  showBadge,
  badgeText
}: {
  showBadge: boolean
  badgeText: string
}) => {
  if (!showBadge) return null;

  return (
    <div
      className="nbd-product-badge"
      style={{
        opacity: 1,
        transition: 'none',
        WebkitTransition: 'none',
        willChange: 'auto'
      }}
    >
      {badgeText}
    </div>
  );
}, (prevProps, nextProps) => {
  // Solo re-renderizar si showBadge o badgeText cambian
  return prevProps.showBadge === nextProps.showBadge &&
         prevProps.badgeText === nextProps.badgeText;
});

ProductBadge.displayName = 'ProductBadge';

// Componente memoizado para precios que evita re-renders innecesarios
const ProductPrice = memo(({
  hasPromotion,
  finalPrice,
  originalPrice,
  formatPrice,
  currency
}: {
  hasPromotion: boolean
  finalPrice: number
  originalPrice: number
  formatPrice: (price: number, currency?: string) => string
  currency?: string
}) => {
  return (
    <div
      className="nbd-product-price"
      style={{
        opacity: 1,
        transition: 'none',
        WebkitTransition: 'none',
        willChange: 'auto'
      }}
    >
      {hasPromotion ? (
        <>
          <span className="nbd-price-current">{formatPrice(finalPrice, currency)}</span>
          <span className="nbd-price-original">{formatPrice(originalPrice, currency)}</span>
        </>
      ) : (
        <span className="nbd-price-current">{formatPrice(finalPrice, currency)}</span>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  // Solo re-renderizar si los precios o hasPromotion cambian
  return prevProps.hasPromotion === nextProps.hasPromotion &&
         prevProps.finalPrice === nextProps.finalPrice &&
         prevProps.originalPrice === nextProps.originalPrice &&
         prevProps.currency === nextProps.currency;
});

ProductPrice.displayName = 'ProductPrice';

// Componente memoizado para cada tarjeta de producto
const ProductCard = memo(({
  product,
  storeId,
  loadingCartButton,
  handleAddToCart,
  onProductClick,
  buildUrl,
  toCloudinarySquare,
  formatPrice,
  additionalText,
  currency
}: {
  product: PublicProduct
  storeId: string | null
  loadingCartButton: string | null
  handleAddToCart: (product: PublicProduct, finalPrice?: number) => Promise<void>
  onProductClick?: (product: PublicProduct) => void
  buildUrl: (path: string) => string
  toCloudinarySquare: (url: string, size: number) => string
  formatPrice: (price: number, currency?: string) => string
  additionalText: (key: string) => string
  currency?: string
}) => {
  const promotionData = usePromotions(storeId, product.id || '', product.price);

  // Usar solo sistema de promociones, eliminar comparePrice obsoleto
  const hasPromotion = promotionData.discount > 0;
  const finalPrice = hasPromotion ? promotionData.finalPrice : product.price;
  const originalPrice = product.price;
  const showBadge = hasPromotion && promotionData.hasDiscountBadge;

  return (
    <div
      className="nbd-product-card"
      onClick={(e) => {
        if (onProductClick) {
          e.preventDefault();
          e.stopPropagation();
          onProductClick(product);
        } else {
          window.location.href = buildUrl(`/producto/${product.slug || product.id}`);
        }
      }}
      style={{ cursor: 'pointer' }}
    >
      <div className="nbd-product-image">
        <ProductImage
          imageUrl={product.image || product.mediaFiles?.[0]?.url}
          productName={product.name}
          toCloudinarySquare={toCloudinarySquare}
          additionalText={additionalText}
        />

        <ProductBadge
          showBadge={showBadge}
          badgeText={additionalText('offer')}
        />

        <AddToCartButton
          productId={product.id}
          productName={product.name}
          isLoading={loadingCartButton === product.id}
          onClick={(e) => {
            e.stopPropagation();
            handleAddToCart(product, finalPrice);
          }}
        />
      </div>

      <div className="nbd-product-content">
        <h3 className="nbd-product-name">{product.name}</h3>

        <div className="nbd-product-footer">
          <ProductPrice
            hasPromotion={hasPromotion}
            finalPrice={finalPrice}
            originalPrice={originalPrice}
            formatPrice={formatPrice}
            currency={currency}
          />
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // Solo re-renderizar si cambian datos relevantes del producto o estado de carga
  return prevProps.product.id === nextProps.product.id &&
         prevProps.product.name === nextProps.product.name &&
         prevProps.product.price === nextProps.product.price &&
         prevProps.product.image === nextProps.product.image &&
         prevProps.loadingCartButton === nextProps.loadingCartButton &&
         prevProps.currency === nextProps.currency;
});

ProductCard.displayName = 'ProductCard';

interface ProductsGridProps {
  displayedProducts: PublicProduct[]
  filteredProducts: PublicProduct[]
  mobileViewMode: ViewMode
  loadingCartButton: string | null
  productsToShow: number
  hasMoreProducts: boolean

  // Event handlers
  handleAddToCart: (product: PublicProduct, finalPrice?: number) => Promise<void>
  loadMoreProducts: () => void
  onProductClick?: (product: PublicProduct) => void

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

export function ProductsGrid({
  displayedProducts,
  filteredProducts,
  mobileViewMode,
  loadingCartButton,
  productsToShow,
  hasMoreProducts,
  handleAddToCart,
  loadMoreProducts,
  onProductClick,
  buildUrl,
  toCloudinarySquare,
  formatPrice,
  additionalText,
  storeInfo,
  storeId
}: ProductsGridProps) {

  return (
    <>
      <div className={`nbd-products-grid nbd-mobile-${mobileViewMode}`}>
        {displayedProducts.length > 0 ? (
          displayedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              storeId={storeId || null}
              loadingCartButton={loadingCartButton}
              handleAddToCart={handleAddToCart}
              onProductClick={onProductClick}
              buildUrl={buildUrl}
              toCloudinarySquare={toCloudinarySquare}
              formatPrice={formatPrice}
              additionalText={additionalText}
              currency={storeInfo?.currency}
            />
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
          marginTop: 'var(--nbd-space-2xl)',
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