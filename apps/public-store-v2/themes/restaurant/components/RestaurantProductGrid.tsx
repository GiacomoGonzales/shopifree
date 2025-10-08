"use client";

import { PublicProduct } from "../../../lib/products";
import { StoreBasicInfo } from "../../../lib/store";
import { usePromotions } from "../../../lib/hooks/usePromotions";

type Props = {
    products: PublicProduct[];
    onAddToCart: (product: PublicProduct) => void;
    formatPrice: (price: number, currency?: string) => string;
    toCloudinarySquare: (url: string, size: number) => string;
    storeInfo: StoreBasicInfo | null;
    storeId?: string | null;
};

function ProductCard({ product, onAddToCart, formatPrice, toCloudinarySquare, storeInfo, storeId }: {
    product: PublicProduct;
    onAddToCart: (product: PublicProduct) => void;
    formatPrice: (price: number, currency?: string) => string;
    toCloudinarySquare: (url: string, size: number) => string;
    storeInfo: StoreBasicInfo | null;
    storeId?: string | null;
}) {
    const promotionsData = usePromotions(storeId || null, product.id || '', product.price);

    return (
        <div className="restaurant-product-card">
            {/* Imagen del producto */}
            {product.image ? (
                <div className="restaurant-product-image">
                    <img
                        src={toCloudinarySquare(product.image, 400)}
                        alt={product.name}
                        loading="lazy"
                    />
                    {promotionsData.discount > 0 && (
                        <div className="restaurant-product-badge">
                            -{promotionsData.discount}%
                        </div>
                    )}
                </div>
            ) : (
                <div className="restaurant-product-image-placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <circle cx="9" cy="9" r="2"/>
                        <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                    </svg>
                </div>
            )}

            {/* Info del producto */}
            <div className="restaurant-product-info">
                <h3 className="restaurant-product-name">{product.name}</h3>

                {product.description && (
                    <p className="restaurant-product-description">
                        {product.description.replace(/<[^>]*>/g, '').substring(0, 80)}
                        {product.description.length > 80 ? '...' : ''}
                    </p>
                )}

                <div className="restaurant-product-footer">
                    <div className="restaurant-product-price">
                        {promotionsData.discount > 0 ? (
                            <>
                                <span className="restaurant-product-price-original">
                                    {formatPrice(promotionsData.originalPrice, storeInfo?.currency)}
                                </span>
                                <span className="restaurant-product-price-final">
                                    {formatPrice(promotionsData.finalPrice, storeInfo?.currency)}
                                </span>
                            </>
                        ) : (
                            <span className="restaurant-product-price-final">
                                {formatPrice(product.price, storeInfo?.currency)}
                            </span>
                        )}
                    </div>

                    <button
                        className="restaurant-add-btn"
                        onClick={() => onAddToCart(product)}
                        aria-label={`Agregar ${product.name} al carrito`}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function RestaurantProductGrid({ products, onAddToCart, formatPrice, toCloudinarySquare, storeInfo, storeId }: Props) {
    if (!products || products.length === 0) {
        return (
            <div className="restaurant-empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20 7L12 3L4 7L12 11L20 7Z"/>
                    <path d="M4 7V17L12 21L20 17V7"/>
                </svg>
                <h3>No hay productos disponibles</h3>
                <p>Selecciona otra categoría</p>
            </div>
        );
    }

    return (
        <div className="restaurant-product-grid">
            {products.map(product => (
                <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                    formatPrice={formatPrice}
                    toCloudinarySquare={toCloudinarySquare}
                    storeInfo={storeInfo}
                    storeId={storeId}
                />
            ))}
        </div>
    );
}
