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
    const [mobileViewMode, setMobileViewMode] = useState<'expanded' | 'grid' | 'list'>('grid');

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
                    
                    console.log("Categorías cargadas:", cats);
                    console.log("Categorías padre:", cats?.filter(c => !c.parentCategoryId));
                    

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

            {/* Sección de categorías con mosaico inteligente */}
            {(() => {
                // Preparar categorías para mostrar (priorizando padre sobre subcategorías)
                const allCategories = Array.isArray(categories) ? categories : [];
                const parentCategories = allCategories.filter(c => !c.parentCategoryId);
                const subcategories = allCategories.filter(c => c.parentCategoryId);
                
                // Combinar y limitar a 10 máximo
                const categoriesToShow = [
                    ...parentCategories,
                    ...subcategories.filter(sub => 
                        !parentCategories.some(parent => parent.id === sub.parentCategoryId) || 
                        parentCategories.length < 5
                    )
                ].slice(0, 10);

                // Solo mostrar si hay 3 o más categorías
                if (categoriesToShow.length < 3) return null;

                // Determinar layout basado en cantidad
                const getLayoutClass = (count: number) => {
                    if (count === 3) return 'nbd-mosaic-3';
                    if (count === 4) return 'nbd-mosaic-4';
                    if (count === 5) return 'nbd-mosaic-5';
                    if (count === 6) return 'nbd-mosaic-6';
                    return 'nbd-mosaic-many';
                };

                return (
                    <section id="categorias" className="nbd-categories-mosaic">
                <div className="nbd-container">
                    <div className="nbd-section-header">
                                <h2 className="nbd-section-title">Explora nuestras categorías</h2>
                                <p className="nbd-section-subtitle">
                                    Descubre nuestra variedad de productos organizados especialmente para ti
                                </p>
                            </div>
                            
                            <div className={`nbd-mosaic-grid ${getLayoutClass(categoriesToShow.length)}`}>
                                {categoriesToShow.map((category, index) => {
                                    const productCount = products?.filter(p => p.categoryId === category.id).length || 0;
                                    const isParent = !category.parentCategoryId;
                                    const isFeatured = index < 2; // Primeras 2 categorías son destacadas
                                    
                                    return (
                                        <button
                                            key={category.id}
                                            className={`nbd-mosaic-card ${activeCategory === category.slug ? 'nbd-mosaic-card--active' : ''} ${
                                                isFeatured ? 'nbd-mosaic-card--featured' : ''
                                            } ${isParent ? 'nbd-mosaic-card--parent' : 'nbd-mosaic-card--sub'}`}
                                            onClick={() => setActiveCategory(category.slug)}
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
                                                            const target = e.target as HTMLImageElement;
                                                            const parent = target.parentElement as HTMLElement;
                                                            target.style.display = 'none';
                                                            if (parent) {
                                                                parent.classList.add('nbd-mosaic-fallback-active');
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
                                                    <p className="nbd-mosaic-count">
                                                        {productCount} {productCount === 1 ? 'producto' : 'productos'}
                                                    </p>
                                                </div>
                                                
                                                <div className="nbd-mosaic-arrow">
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                        <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                                    </svg>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                    </div>
                    
                            {/* Botón "Ver todos" */}
                            <div className="nbd-mosaic-footer">
                                                        <button
                                    className={`nbd-view-all-btn ${!activeCategory ? 'nbd-view-all-btn--active' : ''}`}
                            onClick={() => setActiveCategory(null)}
                        >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M3 7V5C3 3.89543 3.89543 3 5 3H7M3 7L3 12M3 7H21M21 7V5C21 3.89543 20.1046 3 19 3H17M21 7V12M3 12V19C3 20.1046 3.89543 21 5 21H7M3 12H21M21 12V19C21 20.1046 20.1046 21 19 21H17M7 3V21M17 3V21" stroke="currentColor" strokeWidth="2"/>
                                    </svg>
                                    <span>Ver todos los productos</span>
                                </button>
                            </div>
                            
                            {/* Indicador de scroll para móvil */}
                            <div className="nbd-categories-scroll-hint">
                                Desliza para ver más categorías
                            </div>
                        </div>
                    </section>
                );
            })()}

            {/* Sección de Newsletter */}
            <section className="nbd-newsletter">
                <div className="nbd-container">
                    <div className="nbd-newsletter-content">
                        <div className="nbd-newsletter-text">
                            <div className="nbd-newsletter-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                                    <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </div>
                            <h2 className="nbd-newsletter-title">
                                Mantente al día con nuestras ofertas
                            </h2>
                            <p className="nbd-newsletter-description">
                                Suscríbete a nuestro newsletter y recibe las últimas novedades, ofertas exclusivas y descuentos especiales directamente en tu correo.
                            </p>
                        </div>
                        
                        <div className="nbd-newsletter-form-wrapper">
                            <form className="nbd-newsletter-form" onSubmit={(e) => {
                                e.preventDefault();
                                const form = e.target as HTMLFormElement;
                                const email = (form.elements.namedItem('email') as HTMLInputElement).value;
                                
                                if (email) {
                                    // Simulación de suscripción exitosa
                                    const button = form.querySelector('.nbd-newsletter-submit') as HTMLButtonElement;
                                    const originalText = button.innerHTML;
                                    button.innerHTML = `
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                        <span>¡Suscrito!</span>
                                    `;
                                    button.disabled = true;
                                    button.style.background = 'var(--nbd-success)';
                                    
                                    setTimeout(() => {
                                        button.innerHTML = originalText;
                                        button.disabled = false;
                                        button.style.background = '';
                                        form.reset();
                                    }, 3000);
                                }
                            }}>
                                <div className="nbd-newsletter-input-group">
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="tu@email.com"
                                        className="nbd-newsletter-input"
                                        required
                                    />
                                    <button type="submit" className="nbd-newsletter-submit">
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                            <path d="M7 17L17 7M17 7H7M17 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                        <span>Suscribirse</span>
                                    </button>
                                </div>
                                <p className="nbd-newsletter-privacy">
                                    Al suscribirte, aceptas recibir emails promocionales. Puedes darte de baja en cualquier momento.
                                </p>
                            </form>
                        </div>
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

                    {/* Controles de productos */}
                    <div className="nbd-product-controls">
                        
                        {/* Filtros */}
                        <button className="nbd-control-btn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M3 6h18M7 12h10M11 18h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                            </svg>
                            <span>Filtros</span>
                        </button>

                        {/* Ordenar */}
                        <button className="nbd-control-btn">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                <path d="M3 7h3m0 0l3-3m-3 3l3 3M3 17h9m0 0l3-3m-3 3l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>Ordenar</span>
                        </button>

                        {/* Vista */}
                        <button 
                            className="nbd-control-btn nbd-view-btn"
                            onClick={() => {
                                setMobileViewMode(prev => {
                                    if (prev === 'expanded') return 'grid';
                                    if (prev === 'grid') return 'list';
                                    return 'expanded';
                                });
                            }}
                            title={`Vista actual: ${
                                mobileViewMode === 'grid' ? '2 por fila' : 
                                mobileViewMode === 'expanded' ? 'Expandida' : 
                                'Lista'
                            }`}
                        >
                            {mobileViewMode === 'expanded' && (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <rect x="3" y="3" width="18" height="18" stroke="currentColor" strokeWidth="1.5" rx="2"/>
                                </svg>
                            )}
                            {mobileViewMode === 'grid' && (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.5" rx="1"/>
                                    <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.5" rx="1"/>
                                    <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="1.5" rx="1"/>
                                    <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="1.5" rx="1"/>
                                </svg>
                            )}
                            {mobileViewMode === 'list' && (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                </svg>
                            )}
                            <span>Vista</span>
                        </button>
                    </div>

                    <div className={`nbd-products-grid nbd-mobile-${mobileViewMode}`}>
                        {filteredProducts.length > 0 ? (
                            filteredProducts.map((product) => (
                                <div key={product.id} className="nbd-product-card">
                                    <div className="nbd-product-image">
                                        {(() => {
                                            const imageUrl = product.image || product.mediaFiles?.[0]?.url;
                                            
                                            if (!imageUrl) return null;
                                            
                                            // Generar diferentes tamaños optimizados para móvil y retina
                                            const src600 = toCloudinarySquare(imageUrl, 600);   // Para móvil normal
                                            const src800 = toCloudinarySquare(imageUrl, 800);   // Para móvil retina
                                            const src1200 = toCloudinarySquare(imageUrl, 1200); // Para tablet retina
                                            const src1600 = toCloudinarySquare(imageUrl, 1600); // Para desktop retina
                                            
                                            return (
                                                <img
                                                    src={src800}
                                                    srcSet={`${src600} 600w, ${src800} 800w, ${src1200} 1200w, ${src1600} 1600w`}
                                                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                                                    alt={product.name}
                                                    className="nbd-product-img"
                                                    loading="lazy"
                                                    decoding="async"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        const placeholder = e.currentTarget.parentElement?.querySelector('.nbd-product-placeholder-hidden');
                                                        if (placeholder) {
                                                            (placeholder as HTMLElement).style.display = 'flex';
                                                        }
                                                    }}
                                                />
                                            );
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
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
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
