"use client";

import { PublicProduct } from "../../../lib/products";
import { PublicCollection } from "../../../lib/collections";
import { usePromotions } from "../../../lib/hooks/usePromotions";
import { useRef } from "react";

type Props = {
    collection: PublicCollection;
    products: PublicProduct[];
    onProductClick: (product: PublicProduct) => void;
    onViewAll: (collectionSlug: string) => void;
    formatPrice: (price: number, currency?: string) => string;
    toCloudinarySquare: (url: string, size: number) => string;
    storeInfo: any;
    storeId?: string | null;
    maxProducts?: number;
};

function ProductCarouselCard({
    product,
    onProductClick,
    formatPrice,
    toCloudinarySquare,
    storeInfo,
    storeId
}: {
    product: PublicProduct;
    onProductClick: (product: PublicProduct) => void;
    formatPrice: (price: number, currency?: string) => string;
    toCloudinarySquare: (url: string, size: number) => string;
    storeInfo: any;
    storeId?: string | null;
}) {
    const promotionsData = usePromotions(storeId || null, product.id || '', product.price);
    const hasPromotion = promotionsData.discount > 0;
    const finalPrice = hasPromotion ? promotionsData.finalPrice : product.price;

    return (
        <div
            className="restaurant-carousel-card"
            onClick={() => onProductClick(product)}
        >
            {/* Imagen */}
            <div className="restaurant-carousel-card-image">
                {product.image ? (
                    <img
                        src={toCloudinarySquare(product.image, 400)}
                        alt={product.name}
                        loading="lazy"
                    />
                ) : (
                    <div className="restaurant-carousel-card-placeholder">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                            <circle cx="9" cy="9" r="2"/>
                            <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                        </svg>
                    </div>
                )}
                {hasPromotion && (
                    <div className="restaurant-carousel-badge">
                        OFERTA
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="restaurant-carousel-card-content">
                <h4 className="restaurant-carousel-card-name">{product.name}</h4>
                <div className="restaurant-carousel-card-price">
                    {hasPromotion ? (
                        <>
                            <span className="restaurant-carousel-price-original">
                                {formatPrice(promotionsData.originalPrice, storeInfo?.currency)}
                            </span>
                            <span className="restaurant-carousel-price-final">
                                {formatPrice(finalPrice, storeInfo?.currency)}
                            </span>
                        </>
                    ) : (
                        <span className="restaurant-carousel-price-final">
                            {formatPrice(product.price, storeInfo?.currency)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}

function ViewAllCard({ onViewAll }: { onViewAll: () => void }) {
    return (
        <div
            className="restaurant-carousel-card restaurant-carousel-card--view-all"
            onClick={onViewAll}
        >
            <div className="restaurant-carousel-view-all-content">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 8l4 4-4 4M8 12h8"/>
                </svg>
                <span>Ver todos</span>
            </div>
        </div>
    );
}

export default function RestaurantCollectionCarousel({
    collection,
    products,
    onProductClick,
    onViewAll,
    formatPrice,
    toCloudinarySquare,
    storeInfo,
    storeId,
    maxProducts = 10
}: Props) {
    const carouselRef = useRef<HTMLDivElement>(null);

    // Productos de esta colección (limitados)
    const collectionProducts = products
        .filter(p => collection.productIds?.includes(p.id || ''))
        .slice(0, maxProducts);

    // No mostrar si no hay productos
    if (collectionProducts.length === 0) return null;

    const scroll = (direction: 'left' | 'right') => {
        if (carouselRef.current) {
            const scrollAmount = 300;
            carouselRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <section className="restaurant-category-carousel" data-collection-slug={collection.slug}>
            <div className="restaurant-carousel-header">
                <h3 className="restaurant-carousel-title">{collection.title}</h3>
                {collection.description && (
                    <p className="restaurant-carousel-description">{collection.description}</p>
                )}
            </div>

            <div className="restaurant-carousel-wrapper">
                {/* Botón anterior */}
                <button
                    className="restaurant-carousel-nav restaurant-carousel-nav--prev"
                    onClick={() => scroll('left')}
                    aria-label="Anterior"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 18l-6-6 6-6"/>
                    </svg>
                </button>

                {/* Carrusel de productos */}
                <div className="restaurant-carousel-container" ref={carouselRef}>
                    <div className="restaurant-carousel-track">
                        {collectionProducts.map(product => (
                            <ProductCarouselCard
                                key={product.id}
                                product={product}
                                onProductClick={onProductClick}
                                formatPrice={formatPrice}
                                toCloudinarySquare={toCloudinarySquare}
                                storeInfo={storeInfo}
                                storeId={storeId}
                            />
                        ))}

                        {/* Tarjeta "Ver todos" */}
                        <ViewAllCard onViewAll={() => onViewAll(collection.slug)} />
                    </div>
                </div>

                {/* Botón siguiente */}
                <button
                    className="restaurant-carousel-nav restaurant-carousel-nav--next"
                    onClick={() => scroll('right')}
                    aria-label="Siguiente"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6"/>
                    </svg>
                </button>
            </div>
        </section>
    );
}
