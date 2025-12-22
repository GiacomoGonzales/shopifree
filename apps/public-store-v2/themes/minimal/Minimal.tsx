"use client";

import { useEffect, useState, useMemo } from "react";
import "./minimal.css";
import { getStoreBasicInfo, StoreBasicInfo, applyStoreColors } from "../../lib/store";
import { getStoreProducts, PublicProduct } from "../../lib/products";
import { getStoreParentCategories, Category } from "../../lib/categories";
import { toCloudinarySquare } from "../../lib/images";
import { formatPrice } from "../../lib/currency";
import { useCart } from "../../lib/cart-context";
import { useStoreLanguage } from "../../lib/store-language-context";
import CartModal from "../new-base-default/CartModal";
import ProductQuickView from "../new-base-default/components/ProductQuickView";

type Props = {
    storeSubdomain: string;
    effectiveLocale: string;
    storeId?: string | null;
};

export default function Minimal({ storeSubdomain, effectiveLocale, storeId }: Props) {
    const { t } = useStoreLanguage();
    const { addItem, openCart, state: cartState } = useCart();

    const [loading, setLoading] = useState<boolean>(true);
    const [products, setProducts] = useState<PublicProduct[] | null>(null);
    const [storeInfo, setStoreInfo] = useState<StoreBasicInfo | null>(null);
    const [categories, setCategories] = useState<Category[] | null>(null);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [quickViewProduct, setQuickViewProduct] = useState<PublicProduct | null>(null);
    const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);

    // Load store data
    useEffect(() => {
        const loadData = async () => {
            if (!storeId) return;

            try {
                setLoading(true);
                const [info, prods, cats] = await Promise.all([
                    getStoreBasicInfo(storeId),
                    getStoreProducts(storeId),
                    getStoreParentCategories(storeId)
                ]);

                setStoreInfo(info);
                setProducts(prods);
                setCategories(cats);
            } catch (error) {
                console.error('Error loading store data:', error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [storeId]);

    // Apply store colors
    useEffect(() => {
        if (storeInfo?.primaryColor) {
            applyStoreColors(storeInfo.primaryColor, storeInfo.secondaryColor);
        }
    }, [storeInfo?.primaryColor, storeInfo?.secondaryColor]);

    // Filter products by category
    const filteredProducts = useMemo(() => {
        if (!products) return [];
        if (!activeCategory) return products;
        return products.filter(p => p.categoryId === activeCategory);
    }, [products, activeCategory]);

    // Handle add to cart
    const handleAddToCart = (product: PublicProduct) => {
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.mediaFiles?.[0]?.url || '',
            quantity: 1,
            urlSlug: product.urlSlug
        });
        openCart();
    };

    // Open quick view
    const handleQuickView = (product: PublicProduct) => {
        setQuickViewProduct(product);
        setIsQuickViewOpen(true);
    };

    // Generate WhatsApp link
    const getWhatsAppLink = () => {
        if (!storeInfo?.whatsappNumber) return null;
        const message = encodeURIComponent(`Hola! Vi tu catalogo ${storeInfo.storeName}`);
        return `https://wa.me/${storeInfo.whatsappNumber.replace(/\D/g, '')}?text=${message}`;
    };

    if (loading) {
        return (
            <div className="minimal-loading">
                <div className="minimal-loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="minimal-theme">
            {/* Header */}
            <header className="minimal-header">
                <div className="minimal-header-content">
                    <div className="minimal-logo">
                        {storeInfo?.logoUrl ? (
                            <img src={storeInfo.logoUrl} alt={storeInfo.storeName} />
                        ) : (
                            <span>{storeInfo?.storeName}</span>
                        )}
                    </div>
                    <button
                        className="minimal-cart-btn"
                        onClick={openCart}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
                            <line x1="3" y1="6" x2="21" y2="6"/>
                            <path d="M16 10a4 4 0 01-8 0"/>
                        </svg>
                        {cartState.itemCount > 0 && (
                            <span className="minimal-cart-count">{cartState.itemCount}</span>
                        )}
                    </button>
                </div>
            </header>

            {/* Hero */}
            <section className="minimal-hero">
                <h1>{storeInfo?.storeName}</h1>
                {storeInfo?.slogan && <p>{storeInfo.slogan}</p>}
            </section>

            {/* Categories */}
            {categories && categories.length > 0 && (
                <nav className="minimal-categories">
                    <button
                        className={`minimal-category-btn ${!activeCategory ? 'active' : ''}`}
                        onClick={() => setActiveCategory(null)}
                    >
                        Todo
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            className={`minimal-category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat.id)}
                        >
                            {cat.name}
                        </button>
                    ))}
                </nav>
            )}

            {/* Products Grid */}
            <main className="minimal-products">
                {filteredProducts.length === 0 ? (
                    <div className="minimal-empty">
                        <p>No hay productos disponibles</p>
                    </div>
                ) : (
                    <div className="minimal-grid">
                        {filteredProducts.map(product => (
                            <article
                                key={product.id}
                                className="minimal-product"
                                onClick={() => handleQuickView(product)}
                            >
                                <div className="minimal-product-image">
                                    {product.mediaFiles?.[0]?.url ? (
                                        <img
                                            src={toCloudinarySquare(product.mediaFiles[0].url, 400) || product.mediaFiles[0].url}
                                            alt={product.name}
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="minimal-product-placeholder">
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                                <circle cx="8.5" cy="8.5" r="1.5"/>
                                                <polyline points="21 15 16 10 5 21"/>
                                            </svg>
                                        </div>
                                    )}
                                </div>
                                <div className="minimal-product-info">
                                    <h3>{product.name}</h3>
                                    <p className="minimal-product-price">
                                        {formatPrice(product.price, storeInfo?.currency || 'USD')}
                                    </p>
                                </div>
                                <button
                                    className="minimal-add-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleAddToCart(product);
                                    }}
                                >
                                    +
                                </button>
                            </article>
                        ))}
                    </div>
                )}
            </main>

            {/* WhatsApp Button */}
            {getWhatsAppLink() && (
                <a
                    href={getWhatsAppLink()!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="minimal-whatsapp"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    <span>WhatsApp</span>
                </a>
            )}

            {/* Footer */}
            <footer className="minimal-footer">
                <p>&copy; {new Date().getFullYear()} {storeInfo?.storeName}</p>
                <a href="https://shopifree.app" target="_blank" rel="noopener noreferrer">
                    Creado con Shopifree
                </a>
            </footer>

            {/* Cart Modal */}
            <CartModal />

            {/* Product Quick View */}
            {quickViewProduct && (
                <ProductQuickView
                    product={quickViewProduct}
                    isOpen={isQuickViewOpen}
                    onClose={() => {
                        setIsQuickViewOpen(false);
                        setQuickViewProduct(null);
                    }}
                    storeInfo={storeInfo}
                    formatPrice={(price) => formatPrice(price, storeInfo?.currency || 'USD')}
                />
            )}
        </div>
    );
}
