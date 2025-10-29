"use client";

import { PublicProduct } from "../../../lib/products";
import { PublicCollection } from "../../../lib/collections";
import { useState, useRef, useEffect } from "react";
import { usePromotions } from "../../../lib/hooks/usePromotions";

interface CollectionProductsCarouselProps {
  collection: PublicCollection;
  products: PublicProduct[];
  loadingCartButton: string | null;
  handleAddToCart: (product: PublicProduct, finalPrice?: number) => Promise<void>;
  buildUrl: (path: string) => string;
  toCloudinarySquare: (url: string, size: number) => string;
  formatPrice: (price: number, currency?: string) => string;
  additionalText: (key: string) => string;
  storeInfo?: {
    currency?: string;
  };
  storeId?: string | null;
  onProductClick?: (product: PublicProduct) => void;
}

export function CollectionProductsCarousel({
  collection,
  products,
  loadingCartButton,
  handleAddToCart,
  buildUrl,
  toCloudinarySquare,
  formatPrice,
  additionalText,
  storeInfo,
  storeId,
  onProductClick
}: CollectionProductsCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Filtrar productos que pertenecen a esta colección
  const allCollectionProducts = products.filter(p => collection.productIds?.includes(p.id));
  // Mostrar máximo 7 productos en el carrusel
  const collectionProducts = allCollectionProducts.slice(0, 7);

  // Verificar estado de scroll
  const checkScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 1
    );
  };

  useEffect(() => {
    checkScrollButtons();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollButtons);
      window.addEventListener('resize', checkScrollButtons);
      return () => {
        container.removeEventListener('scroll', checkScrollButtons);
        window.removeEventListener('resize', checkScrollButtons);
      };
    }
  }, [collectionProducts.length]);

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    const targetScroll = container.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);

    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth'
    });
  };

  if (collectionProducts.length === 0) return null;

  return (
    <div className="collection-carousel-section">
      <div className="nbd-container">
        <div className="collection-carousel-header">
          <div>
            <h3 className="collection-carousel-title">{collection.title}</h3>
            {collection.description && (
              <p className="collection-carousel-description">{collection.description}</p>
            )}
          </div>
        </div>

        <div className="collection-carousel-wrapper">
        {canScrollLeft && (
          <button
            className="collection-carousel-nav collection-carousel-nav--left"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        <div
          ref={scrollContainerRef}
          className="collection-carousel-container"
        >
          {collectionProducts.map((product) => {
            const ProductCard = () => {
              const promotionData = usePromotions(storeId || null, product.id || '', product.price);

              const hasPromotion = promotionData.discount > 0;
              const finalPrice = hasPromotion ? promotionData.finalPrice : product.price;
              const originalPrice = product.price;
              const badgeStyle = hasPromotion ? promotionData.badgeStyle : 'none';

              return (
                <div key={product.id} className="collection-carousel-card">
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
                      {product.image || product.mediaFiles?.[0]?.url ? (
                        <img
                          src={toCloudinarySquare(product.image || product.mediaFiles?.[0]?.url || '', 800)}
                          alt={product.name}
                          className="nbd-product-img"
                          loading="lazy"
                        />
                      ) : (
                        <div className="nbd-product-placeholder">
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                            <path d="M4 16L4 18C4 19.1046 4.89543 20 6 20L18 20C19.1046 20 20 19.1046 20 18L20 16M16 12L12 16M12 16L8 12M12 16L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <span className="nbd-placeholder-text">{additionalText('noImage')}</span>
                        </div>
                      )}

                      {/* Badge de oferta */}
                      {badgeStyle !== 'none' && (
                        <div className={badgeStyle === 'ribbon' ? 'nbd-product-ribbon' : 'nbd-product-badge'}>
                          {additionalText('offer')}
                        </div>
                      )}

                      <button
                        className={`nbd-add-to-cart ${loadingCartButton === product.id ? 'nbd-add-to-cart--loading' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddToCart(product, finalPrice);
                        }}
                        disabled={loadingCartButton === product.id}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      </button>
                    </div>

                    <div className="nbd-product-content">
                      <h3 className="nbd-product-name">{product.name}</h3>
                      <div className="nbd-product-footer">
                        <div className="nbd-product-price">
                          {/* Precio actual primero */}
                          <span className="nbd-price-current">{formatPrice(finalPrice, storeInfo?.currency)}</span>
                          {/* Precio tachado al lado (solo si hay promoción) */}
                          {hasPromotion && (
                            <span className="nbd-price-original">{formatPrice(originalPrice, storeInfo?.currency)}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            };

            return <ProductCard key={product.id} />;
          })}

          {/* Tarjeta "Ver todos" al final */}
          <div className="collection-carousel-card">
            <a
              href={buildUrl(`/coleccion/${collection.slug}`)}
              className="collection-view-all-card"
            >
              <div className="collection-view-all-content">
                <div className="collection-view-all-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h4 className="collection-view-all-text">Ver todos</h4>
                <p className="collection-view-all-count">
                  {allCollectionProducts.length} {allCollectionProducts.length === 1 ? 'producto' : 'productos'}
                </p>
              </div>
            </a>
          </div>
        </div>

        {canScrollRight && (
          <button
            className="collection-carousel-nav collection-carousel-nav--right"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
      </div>
    </div>
  );
}
