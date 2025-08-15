"use client";

import { useEffect, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import "./new-base-default.css";
import { getStoreIdBySubdomain, getStoreBasicInfo, StoreBasicInfo } from "../../lib/store";
import { getStoreProducts, PublicProduct } from "../../lib/products";
import { getStoreCategories, Category } from "../../lib/categories";
import { getStoreBrands, PublicBrand } from "../../lib/brands";
import { toCloudinarySquare } from "../../lib/images";
import Header from "./Header";
import Footer from "./Footer";

type Props = {
    storeSubdomain: string;
};

export default function NewBaseDefault({ storeSubdomain }: Props) {
    const t = useTranslations('common');

    const [storeId, setStoreId] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [products, setProducts] = useState<PublicProduct[] | null>(null);
    const [storeInfo, setStoreInfo] = useState<StoreBasicInfo | null>(null);
    const [categories, setCategories] = useState<Category[] | null>(null);
    const [brands, setBrands] = useState<PublicBrand[] | null>(null);
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [selectedParentCategory, setSelectedParentCategory] = useState<string | null>(null);

    // Cargar datos de la tienda
    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const id = await getStoreIdBySubdomain(storeSubdomain);
                if (!alive) return;
                setStoreId(id);
                if (id) {
                    const [items, info, cats, brandList] = await Promise.all([
                        getStoreProducts(id),
                        getStoreBasicInfo(id),
                        getStoreCategories(id),
                        getStoreBrands(id)
                    ]);
                    if (!alive) return;
                    setProducts(items);
                    setStoreInfo(info);
                    setCategories(cats);
                    setBrands(brandList);
                    

                }
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => {
            alive = false;
        };
    }, [storeSubdomain]);

    // Categorías organizadas
    const topCategories = useMemo(() => 
        (Array.isArray(categories) ? categories.filter(c => !c.parentCategoryId) : []), 
        [categories]
    );

    // Productos filtrados
    const filteredProducts = useMemo(() => {
        const hasProducts = Array.isArray(products) && products.length > 0;
        if (!hasProducts) return [];

        let base = [...products];

        // Filtrar por categoría
        if (activeCategory && activeCategory !== 'todos') {
            const cat = categories?.find(c => c.slug === activeCategory);
            if (cat) {
                base = base.filter(p => p.categoryId === cat.id);
            }
        }

        return base;
    }, [products, categories, activeCategory]);

    if (loading) {
        return (
            <div data-theme="new-base-default" className="nbd-theme">
                <div className="nbd-loading">
                    <div className="nbd-loading-content">
                        <div className="nbd-spinner"></div>
                        <p className="nbd-loading-text">{t('loading')}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div data-theme="new-base-default" className="nbd-theme">
            <Header storeInfo={storeInfo} categories={categories} storeSubdomain={storeSubdomain} />
            
            {/* Hero Section Moderno */}
            <section className="nbd-hero">
                <div className="nbd-hero-container">
                    <div className="nbd-hero-content">
                        <div className="nbd-hero-text">
                            <h1 className="nbd-hero-title">
                                {storeInfo?.storeName || storeSubdomain}
                            </h1>
                            {storeInfo?.description && (
                                <p className="nbd-hero-description">
                                    {storeInfo.description}
                                </p>
                            )}
                            <div className="nbd-hero-actions">
                                <a href="#productos" className="nbd-btn nbd-btn--primary">
                                    <span>Explorar productos</span>
                                    <svg className="nbd-btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </a>
                                <a href="#categorias" className="nbd-btn nbd-btn--secondary">
                                    Ver categorías
                                </a>
                            </div>
                        </div>
                        
                        <div className="nbd-hero-visual">
                            {storeInfo?.heroImageUrl ? (
                                <div className="nbd-hero-image">
                                    <img
                                        src={toCloudinarySquare(storeInfo.heroImageUrl, 1200)}
                                        alt={storeInfo.storeName || 'Hero'}
                                        className="nbd-hero-img"
                                    />
                                    <div className="nbd-hero-image-overlay"></div>
                                </div>
                            ) : (
                                <div className="nbd-hero-placeholder">
                                    <div className="nbd-placeholder-grid">
                                        <div className="nbd-placeholder-item"></div>
                                        <div className="nbd-placeholder-item"></div>
                                        <div className="nbd-placeholder-item"></div>
                                        <div className="nbd-placeholder-item"></div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            {/* Sección de categorías */}
            <section id="categorias" className="nbd-categories">
                <div className="nbd-container">
                    <div className="nbd-section-header">
                        <h2 className="nbd-section-title">Explora por categoría</h2>
                        <p className="nbd-section-subtitle">Encuentra exactamente lo que buscas</p>
                    </div>
                    
                    <div className="nbd-categories-grid">
                        <button
                            className={`nbd-category-card ${!activeCategory ? 'nbd-category-card--active' : ''}`}
                            onClick={() => setActiveCategory(null)}
                        >
                            <div className="nbd-category-icon">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M3 7V5C3 3.89543 3.89543 3 5 3H7M3 7L3 12M3 7H21M21 7V5C21 3.89543 20.1046 3 19 3H17M21 7V12M3 12V19C3 20.1046 3.89543 21 5 21H7M3 12H21M21 12V19C21 20.1046 20.1046 21 19 21H17M7 3V21M17 3V21" stroke="currentColor" strokeWidth="2"/>
                                </svg>
                            </div>
                            <h3 className="nbd-category-name">Todos</h3>
                            <p className="nbd-category-count">{products?.length || 0} productos</p>
                        </button>
                        
                        {topCategories.map((category) => (
                            <button
                                key={category.id}
                                className={`nbd-category-card ${activeCategory === category.slug ? 'nbd-category-card--active' : ''}`}
                                onClick={() => setActiveCategory(category.slug)}
                            >
                                <div className="nbd-category-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M20 7L12 3L4 7M20 7L12 11M20 7V17L12 21M12 11L4 7M12 11V21M4 7V17L12 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                </div>
                                <h3 className="nbd-category-name">{category.name}</h3>
                                <p className="nbd-category-count">
                                    {products?.filter(p => p.categoryId === category.id).length || 0} productos
                                </p>
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Sección de productos */}
            <section id="productos" className="nbd-products">
                <div className="nbd-container">
                    <div className="nbd-section-header">
                        <h2 className="nbd-section-title">
                            {activeCategory ? 
                                `${categories?.find(c => c.slug === activeCategory)?.name || 'Productos'}` : 
                                'Nuestros productos'
                            }
                        </h2>
                        <p className="nbd-section-subtitle">
                            {filteredProducts.length} productos disponibles
                        </p>
                    </div>

                    <div className="nbd-products-grid">
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <div key={product.id} className="nbd-product-card">
                                    <div className="nbd-product-image">
                                        {(() => {
                                            const imageUrl = product.image || product.mediaFiles?.[0]?.url;
                                            // Usar 800px para pantallas retina (se mostrará como 400px pero nítido)
                                            const processedUrl = imageUrl ? toCloudinarySquare(imageUrl, 800) : null;
                                            
                                            // Generar diferentes tamaños para srcset
                                            const src400 = toCloudinarySquare(imageUrl, 400);
                                            const src800 = processedUrl; // Ya es 800px
                                            const src1200 = toCloudinarySquare(imageUrl, 1200);
                                            
                                            return processedUrl ? (
                                                <img
                                                    src={processedUrl}
                                                    srcSet={`${src400} 400w, ${src800} 800w, ${src1200} 1200w`}
                                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                    alt={product.name}
                                                    className="nbd-product-img"
                                                    loading="lazy"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        const placeholder = e.currentTarget.parentElement?.querySelector('.nbd-product-placeholder-hidden');
                                                        if (placeholder) {
                                                            (placeholder as HTMLElement).style.display = 'flex';
                                                        }
                                                    }}
                                                />
                                            ) : null;
                                        })()}
                                        
                                        <div className="nbd-product-placeholder nbd-product-placeholder-hidden" style={{ display: 'none' }}>
                                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                                <path d="M4 16L4 18C4 19.1046 4.89543 20 6 20L18 20C19.1046 20 20 19.1046 20 18L20 16M16 12L12 16M12 16L8 12M12 16L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                            <span className="nbd-placeholder-text">Sin imagen</span>
                                        </div>
                                        
                                        {!product.image && !product.mediaFiles?.[0]?.url && (
                                            <div className="nbd-product-placeholder">
                                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                                    <path d="M4 16L4 18C4 19.1046 4.89543 20 6 20L18 20C19.1046 20 20 19.1046 20 18L20 16M16 12L12 16M12 16L8 12M12 16L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                                <span className="nbd-placeholder-text">Sin imagen</span>
                                            </div>
                                        )}
                                        
                                        {product.comparePrice && product.comparePrice > product.price && (
                                            <div className="nbd-product-badge">
                                                Oferta
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="nbd-product-content">
                                        <h3 className="nbd-product-name">{product.name}</h3>
                                        {product.description && (
                                            <p className="nbd-product-description">{product.description}</p>
                                        )}
                                        
                                        <div className="nbd-product-footer">
                                            <div className="nbd-product-price">
                                                {product.comparePrice && product.comparePrice > product.price ? (
                                                    <>
                                                        <span className="nbd-price-current">${product.price}</span>
                                                        <span className="nbd-price-original">${product.comparePrice}</span>
                                                    </>
                                                ) : (
                                                    <span className="nbd-price-current">${product.price}</span>
                                                )}
                                            </div>
                                            
                                            <button className="nbd-add-to-cart">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                                    <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V16A2 2 0 0115 18H9A2 2 0 017 16V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                </svg>
                                            </button>
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
                                <h3 className="nbd-empty-title">No hay productos en esta categoría</h3>
                                <p className="nbd-empty-description">Explora otras categorías o vuelve más tarde</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <Footer storeInfo={storeInfo} categories={categories} storeSubdomain={storeSubdomain} />
        </div>
    );
}
